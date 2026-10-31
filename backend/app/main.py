import logging
from contextlib import asynccontextmanager
from pathlib import Path

from apscheduler.schedulers.background import BackgroundScheduler
from fastapi import FastAPI
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from app.api.routes import health_payload, router
from app.core.config import settings
from app.services.ingest import run_gfs_ingest

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
WEB_DIR = Path(__file__).parent / "web"


@asynccontextmanager
async def lifespan(app: FastAPI):
    scheduler = BackgroundScheduler(timezone="UTC")
    scheduler.add_job(run_gfs_ingest, "interval", hours=settings.ingest_interval_hours,
                      id="gfs_ingest", max_instances=1, coalesce=True)
    scheduler.start()
    yield
    scheduler.shutdown(wait=False)


app = FastAPI(title="FloodShield BD", version="0.1.0", lifespan=lifespan)
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
