import json

from fastapi import APIRouter, HTTPException, Query
from sqlalchemy import func, select, text

from app.db.models import IngestRun, Node, RainForecast
from app.db.session import SessionLocal

router = APIRouter(prefix="/api/v1")


def _latest_run(db, source: str = "open-meteo-gfs") -> IngestRun | None:
    return db.scalars(
        select(IngestRun).where(IngestRun.source == source, IngestRun.status == "done")
        .order_by(IngestRun.finished_at.desc()).limit(1)
    ).first()


@router.get("/upazilas")
def upazilas(division: str | None = Query(None)):
    """Upazila polygons as GeoJSON, joined with the latest real rainfall forecast (if any)."""
    with SessionLocal() as db:
        run = _latest_run(db)
        q = (
            select(Node, func.ST_AsGeoJSON(func.ST_SimplifyPreserveTopology(Node.geom, 0.003)), RainForecast)
            .outerjoin(RainForecast, (RainForecast.node_id == Node.id) & (RainForecast.ingest_run_id == (run.id if run else -1)))
            .where(Node.node_type == "upazila")
        )
        if division:
            q = q.where(Node.division == division)
        features = []
        for node, geom, rf in db.execute(q).all():
            features.append({
                "type": "Feature",
                "geometry": json.loads(geom),
                "properties": {
                    "id": node.id, "name": node.name, "district": node.district, "division": node.division,
                    "rain_past_72h_mm": rf.rain_past_72h_mm if rf else None,
                    "rain_24h_mm": rf.rain_24h_mm if rf else None,
                    "rain_48h_mm": rf.rain_48h_mm if rf else None,
                    "rain_72h_mm": rf.rain_72h_mm if rf else None,
                },
            })
        return {
            "type": "FeatureCollection",
            "features": features,
            "rain_run": None if not run else {
                "id": run.id, "source": "NOAA GFS via Open-Meteo",
                "issued_at": run.model_run_time.isoformat(), "sha256": run.sha256,
            },
            "flood_forecast_run": None,
        }


@router.get("/nodes/{node_id}/rain")
def node_rain(node_id: str):
    with SessionLocal() as db:
        node = db.get(Node, node_id)
        if not node:
            raise HTTPException(404, "Unknown node")
        run = _latest_run(db)
        rf = run and db.scalars(select(RainForecast).where(
            RainForecast.ingest_run_id == run.id, RainForecast.node_id == node_id)).first()
        if not rf:
            raise HTTPException(404, "No rainfall run yet for this node")
        return {"node": node.name, "district": node.district, "division": node.division,
                "issued_at": rf.issued_at.isoformat(), "run_id": run.id, "hourly": rf.hourly}


@router.get("/divisions")
def divisions():
    with SessionLocal() as db:
        rows = db.execute(select(Node.division, func.count()).where(Node.node_type == "upazila")
                          .group_by(Node.division).order_by(Node.division)).all()
        return [{"name": d, "upazilas": n} for d, n in rows]


@router.get("/ingest/status")
def ingest_status(limit: int = 20):
    with SessionLocal() as db:
        runs = db.scalars(select(IngestRun).order_by(IngestRun.id.desc()).limit(limit)).all()
        return [{
            "id": r.id, "source": r.source, "status": r.status, "n_nodes": r.n_nodes,
            "started_at": r.started_at.isoformat() if r.started_at else None,
            "finished_at": r.finished_at.isoformat() if r.finished_at else None,
            "raw_path": r.raw_path, "sha256": r.sha256, "error": r.error,
        } for r in runs]


@router.get("/flood-forecast")
def flood_forecast():
    # No model has been trained yet (Phase P4). We say so instead of inventing numbers.
    raise HTTPException(404, "No flood forecast run yet: model training (Phase P4) has not happened.")


def health_payload() -> dict:
    with SessionLocal() as db:
        db.execute(text("select 1"))
        run = _latest_run(db)
        n = db.scalar(select(func.count()).select_from(Node))
        return {"status": "ok", "database": "ok", "nodes": n,
                "latest_rain_run": run.model_run_time.isoformat() if run else None}
