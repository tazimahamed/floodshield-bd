import logging
import threading
from datetime import datetime, timedelta, timezone
from contextlib import asynccontextmanager
from pathlib import Path

import httpx
from apscheduler.schedulers.background import BackgroundScheduler
from fastapi import FastAPI, Request
from sqlalchemy import func, select
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from app.api.routes import health_payload, router
from app.core.config import settings
from app.core.ratelimit import RateLimiter
from app.ml.features import graph_tables
from app.ml.forecast import safe_run_forecast
from app.services.alerts import dispatch_alerts, poll_updates
from app.services.tts import warm as warm_voice
from app.services.era5 import refresh_recent
from app.db.models import DailyOutlook, IngestRun
from app.db.session import SessionLocal
from app.services.ingest import SOURCE as INGEST_SOURCE, run_gfs_ingest
from app.services import hazard_alerts, landslide, model_calendar, water_now
from app.services.ops import notify_admin, ping
from app.services.outlook import refresh_outlook

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
# httpx logs every request URL at INFO, and Telegram URLs contain the bot token
for _name in ("httpx", "httpx2", "httpcore", "apscheduler.executors.default"):
    logging.getLogger(_name).setLevel(logging.WARNING)
WEB_DIR = Path(__file__).parent / "web"
log = logging.getLogger(__name__)


SCHED: BackgroundScheduler | None = None
RETRY_MIN = 60
OUTLOOK_HOURS = 24  # heat and waves are daily values: once a day keeps Open-Meteo use well under the free 10,000 calls
_CYCLE = threading.Lock()  # the 6-hourly job and an hourly retry must never run (and spend the quota) together
_RL = {"told": False}  # whether the admin already heard about the current rate-limit outage


def _is_rate_limit(e: Exception) -> bool:
    return isinstance(e, httpx.HTTPStatusError) and e.response is not None and e.response.status_code == 429


def gfs_then_flood_forecast() -> None:
    if not _CYCLE.acquire(blocking=False):
        log.info("A forecast cycle is already running; this one is skipped")
        return
    try:
        _forecast_cycle()
    finally:
        _CYCLE.release()


def outlook_then_heat() -> None:
    """The daily heat/sea outlook, then heatwave alerts from it (BMD classes, moderate and up)."""
    refresh_outlook()
    if settings.telegram_bot_token:
        hazard_alerts.safe(hazard_alerts.dispatch_heat)()


def _forecast_cycle() -> None:
    try:
        run_gfs_ingest()
        safe_run_forecast()
        dispatch_alerts()
        ping(settings.healthchecks_forecast_url)
        if _RL["told"]:
            notify_admin("Forecast cycle is working again: the Open-Meteo limit has reset.")
        _RL["told"] = False
    except Exception as e:
        log.exception("Forecast cycle failed")
        ping(settings.healthchecks_forecast_url, failed=True)
        if _is_rate_limit(e) and SCHED is not None:
            # Open-Meteo's free daily quota ran out: try again later instead of waiting a full cycle
            at = datetime.now(timezone.utc) + timedelta(minutes=RETRY_MIN)
            SCHED.add_job(gfs_then_flood_forecast, "date", run_date=at, id="gfs_retry", replace_existing=True)
            if not _RL["told"]:  # one message per outage, not one per hourly retry
                notify_admin(f"Forecast cycle skipped: Open-Meteo request limit reached (429). "
                             f"The site keeps showing the last forecast. Retrying every {RETRY_MIN} min "
                             f"from {(at + timedelta(hours=6)):%H:%M} Dhaka time.")
                _RL["told"] = True
        else:
            notify_admin(f"Forecast cycle failed: {type(e).__name__}")


def _first_run(last: datetime | None, hours: float | None = None) -> datetime:
    """Run at once only if the last good run is older than one cycle; a restart must not spend the API quota again."""
    now = datetime.now(timezone.utc)
    if last is None:
        return now
    if last.tzinfo is None:
        last = last.replace(tzinfo=timezone.utc)
    return max(now, last + timedelta(hours=hours or settings.ingest_interval_hours))


def _last_gfs_ok() -> datetime | None:
    try:
        with SessionLocal() as db:
            # the columns come back without a zone in the database's Dhaka time, so ask for UTC explicitly
            return db.scalar(select(func.timezone("UTC", func.max(IngestRun.finished_at))).where(
                IngestRun.source == INGEST_SOURCE, IngestRun.status == "done"))
    except Exception:
        log.exception("Could not read the last ingest time")
        return None


def _last_outlook_ok() -> datetime | None:
    try:
        with SessionLocal() as db:
            return db.scalar(select(func.timezone("UTC", func.max(DailyOutlook.issued_at))))
    except Exception:  # table not created yet on a fresh database
        return None


def era5_refresh() -> None:
    try:
        refresh_recent()
        ping(settings.healthchecks_era5_url)
    except Exception as e:
        log.exception("ERA5 refresh failed")
        ping(settings.healthchecks_era5_url, failed=True)
        notify_admin(f"ERA5 refresh failed: {type(e).__name__}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    global SCHED
    scheduler = SCHED = BackgroundScheduler(timezone="UTC")
    # first run right after start only when the stored forecast is older than one cycle
    gfs_at, outlook_at = _first_run(_last_gfs_ok()), _first_run(_last_outlook_ok(), OUTLOOK_HOURS)
    log.info("Next forecast run %s UTC, next outlook %s UTC", f"{gfs_at:%H:%M}", f"{outlook_at:%H:%M}")
    scheduler.add_job(gfs_then_flood_forecast, "interval", hours=settings.ingest_interval_hours,
                      id="gfs_ingest", max_instances=1, coalesce=True, next_run_time=gfs_at)
    scheduler.add_job(graph_tables, id="warm_graph")  # build the upstream graph cache in the background
    if settings.telegram_bot_token:
        scheduler.add_job(poll_updates, "interval", seconds=5, id="telegram_poll", max_instances=1, coalesce=True)
        # cyclone alerts: GDACS is checked every 30 minutes (its answer is cached for 30 minutes anyway)
        scheduler.add_job(hazard_alerts.safe(hazard_alerts.dispatch_storms), "interval", minutes=30, id="storm_alerts",
                          max_instances=1, coalesce=True)
        scheduler.add_job(warm_voice, id="warm_voice")  # load the Bangla voice model before the first message
    scheduler.add_job(outlook_then_heat, "interval", hours=OUTLOOK_HOURS, id="outlook", max_instances=1,
                      coalesce=True, next_run_time=outlook_at)
    # how the model did over the last 12 months: daily after the ERA5 refresh, and at startup if the file is missing or old
    first = {"next_run_time": datetime.now(timezone.utc) + timedelta(minutes=3)} if model_calendar.needs_build() else {}
    scheduler.add_job(model_calendar.refresh, "cron", hour=4, minute=30, id="model_calendar", max_instances=1, coalesce=True, **first)
    # unusual water on the latest satellite pictures: daily at 07:30 Dhaka time, and soon after startup if missing or old
    wn = {"next_run_time": datetime.now(timezone.utc) + timedelta(minutes=6)} if water_now.needs_build() else {}
    scheduler.add_job(water_now.refresh, "cron", hour=1, minute=30, id="water_now", max_instances=1, coalesce=True, **wn)
    # NASA LHASA landslide nowcast: the day's file usually appears around 05:00 UTC; NASA serves it best-effort
    ls = {"next_run_time": datetime.now(timezone.utc) + timedelta(minutes=9)} if landslide.needs_build() else {}
    scheduler.add_job(landslide.refresh, "cron", hour=6, minute=15, id="landslide", max_instances=1, coalesce=True, **ls)
    # also at startup: a machine that was off at 03:00 would otherwise fall behind until forecasts fail
    scheduler.add_job(era5_refresh, "cron", hour=3, id="era5_refresh", max_instances=1, coalesce=True,
                      next_run_time=datetime.now(timezone.utc))
    scheduler.start()
    yield
    scheduler.shutdown(wait=False)


app = FastAPI(title="FloodShield BD", version="0.1.0", lifespan=lifespan)
app.add_middleware(GZipMiddleware, minimum_size=2048)  # GeoJSON and the rain timeline compress ~8x
app.include_router(router)
visitor_limit = RateLimiter(settings.rate_limit_per_minute)


@app.middleware("http")
async def rate_limit(request: Request, call_next):
    path = request.url.path
    if settings.rate_limit_per_minute and not path.startswith("/static") and path != "/health":
        if not visitor_limit.allow(request.client.host if request.client else "?"):
            return JSONResponse({"detail": "Too many requests, please wait a minute."}, status_code=429,
                                headers={"Retry-After": "60"})
    return await call_next(request)


@app.get("/health")
def health():
    try:
        return health_payload()
    except Exception as e:
        return JSONResponse({"status": "error", "detail": str(e)}, status_code=503)


app.mount("/static", StaticFiles(directory=WEB_DIR / "static"), name="static")


@app.get("/", include_in_schema=False)
def index():
    return FileResponse(WEB_DIR / "index.html")


@app.get("/about", include_in_schema=False)
def about_page():
    return FileResponse(WEB_DIR / "about.html")


@app.get("/model", include_in_schema=False)
def model_page():
    return FileResponse(WEB_DIR / "model.html")


@app.get("/upazila/{node_id}", include_in_schema=False)
def upazila_page(node_id: str):
    return FileResponse(WEB_DIR / "report.html")


@app.get("/upazila/{district}/{name}", include_in_schema=False)
def upazila_page_slug(district: str, name: str):
    return FileResponse(WEB_DIR / "report.html")
