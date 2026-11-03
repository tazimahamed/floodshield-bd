import logging
from datetime import datetime, timezone
from contextlib import asynccontextmanager
from pathlib import Path

from apscheduler.schedulers.background import BackgroundScheduler
from fastapi import FastAPI
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from app.api.routes import health_payload, router
from app.core.config import settings
from app.ml.features import graph_tables
from app.ml.forecast import safe_run_forecast
from app.services.alerts import dispatch_alerts, poll_updates
from app.services.tts import warm as warm_voice
from app.services.era5 import refresh_recent
from app.services.ingest import run_gfs_ingest

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
WEB_DIR = Path(__file__).parent / "web"
log = logging.getLogger(__name__)


def gfs_then_flood_forecast() -> None:
    run_gfs_ingest()
    try:
        safe_run_forecast()
        dispatch_alerts()
    except Exception:
        log.exception("Flood forecast or alerts failed")


@asynccontextmanager
async def lifespan(app: FastAPI):
    scheduler = BackgroundScheduler(timezone="UTC")
    # first run right after start, so a restarted server never shows an old forecast
    scheduler.add_job(gfs_then_flood_forecast, "interval", hours=settings.ingest_interval_hours,
                      id="gfs_ingest", max_instances=1, coalesce=True, next_run_time=datetime.now(timezone.utc))
    scheduler.add_job(graph_tables, id="warm_graph")  # build the upstream graph cache in the background
    if settings.telegram_bot_token:
        scheduler.add_job(poll_updates, "interval", seconds=5, id="telegram_poll", max_instances=1, coalesce=True)
        scheduler.add_job(warm_voice, id="warm_voice")  # load the Bangla voice model before the first message
    scheduler.add_job(refresh_recent, "cron", hour=3, id="era5_refresh", max_instances=1, coalesce=True)
    scheduler.start()
    yield
    scheduler.shutdown(wait=False)


app = FastAPI(title="FloodShield BD", version="0.1.0", lifespan=lifespan)
app.add_middleware(GZipMiddleware, minimum_size=2048)  # GeoJSON and the rain timeline compress ~8x
app.include_router(router)


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


@app.get("/upazila/{node_id}", include_in_schema=False)
def upazila_page(node_id: str):
    return FileResponse(WEB_DIR / "report.html")
