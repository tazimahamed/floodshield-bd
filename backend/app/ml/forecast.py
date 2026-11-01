"""Live flood forecast: the latest trained model + ERA5-Land history + the latest NOAA GFS run.

Daily inputs are ERA5-Land up to its last published day (~1 week behind), then GFS
(Open-Meteo past days + forecast) after that, so there is no gap in the 30-day history.
Soil moisture comes from the last ERA5-Land day.
"""

import logging
from datetime import datetime, timedelta, timezone

import joblib
import pandas as pd
from sqlalchemy import func, select

from app.db.models import Era5Daily, FloodForecast, FloodForecastRun, IngestRun, RainForecast
from app.db.session import SessionLocal
from app.ml.features import FORECAST_DAYS, features_at, graph_tables, load_daily
from app.ml.train import MODEL_DIR

log = logging.getLogger(__name__)
HIGH, MEDIUM = 0.5, 0.25  # P(flooded) thresholds for the risk level shown to users
VALID_DAYS = 15  # the labels describe flooding over 15-day windows


def risk_level(prob: float) -> str:
    return "high" if prob >= HIGH else "medium" if prob >= MEDIUM else "low"


def load_model():
    version = (MODEL_DIR / "latest.txt").read_text().strip()
    return joblib.load(MODEL_DIR / f"{version}.joblib")


def _gfs_daily(db, run_id: int) -> pd.DataFrame:
    """GFS hourly precipitation of one run summed to UTC days: DataFrame[day x node_id]."""
    out = {}
    for node_id, hourly in db.execute(select(RainForecast.node_id, RainForecast.hourly)
                                      .where(RainForecast.ingest_run_id == run_id)).all():
        s = pd.Series(hourly["precipitation"], index=pd.to_datetime(hourly["time"]), dtype=float)
        out[node_id] = s.resample("D").sum(min_count=1)
    return pd.DataFrame(out).sort_index()


def run_forecast() -> int:
    model = load_model()
    with SessionLocal() as db:
        rain_run = db.scalars(select(IngestRun).where(IngestRun.source == "open-meteo-gfs", IngestRun.status == "done")
                              .order_by(IngestRun.finished_at.desc()).limit(1)).first()
        if not rain_run:
            raise RuntimeError("No GFS rain run yet")
        era5_last = db.scalar(select(func.max(Era5Daily.day)))
        t0 = pd.Timestamp(rain_run.model_run_time.astimezone(timezone.utc).date())

        daily = load_daily((t0 - timedelta(days=32)).date(), era5_last)
        gfs = _gfs_daily(db, rain_run.id)
        after = gfs.loc[pd.Timestamp(era5_last) + timedelta(days=1): t0 + timedelta(days=FORECAST_DAYS - 1)]
        missing = pd.date_range(pd.Timestamp(era5_last) + timedelta(days=1), t0 + timedelta(days=FORECAST_DAYS - 1))
        if len(after.index.intersection(missing)) < len(missing):
            raise RuntimeError(f"Gap between ERA5-Land ({era5_last}) and GFS history ({gfs.index.min().date()})")
        daily["precip_mm"] = pd.concat([daily["precip_mm"], after]).sort_index()

        static, weights = graph_tables()
        f = features_at(t0, daily, static, weights)[model["info"]["features"]]
        frac = model["reg"].predict(f).clip(0, 1)
        prob = model["clf"].predict_proba(f)[:, 1]

        run = FloodForecastRun(
            issued_at=datetime.now(timezone.utc), reference_day=t0.date(),
            valid_until=(t0 + timedelta(days=VALID_DAYS - 1)).date(),
            model_version=model["info"]["version"], rain_run_id=rain_run.id, era5_last_day=era5_last,
            meta={"metrics": model["info"]["metrics"]["model"],
                  "baseline": model["info"]["metrics"]["climatology_baseline"],
                  "flood_frac": model["info"]["flood_frac"], "thresholds": {"high": HIGH, "medium": MEDIUM}})
        db.add(run)
        db.flush()
        db.add_all(FloodForecast(run_id=run.id, node_id=n, flood_frac=round(float(a), 4),
                                 flood_prob=round(float(p), 4), risk=risk_level(p))
                   for n, a, p in zip(f.index, frac, prob))
        db.commit()
        log.info("flood forecast %d: model %s, rain run %d", run.id, run.model_version, rain_run.id)
        return run.id


def safe_run_forecast() -> None:
    """Scheduler entry point: a missing model just means no forecast yet."""
    if not (MODEL_DIR / "latest.txt").exists():
        log.info("No trained flood model yet; skipping flood forecast")
        return
    run_forecast()
