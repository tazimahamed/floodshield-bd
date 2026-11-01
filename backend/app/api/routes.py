import json
from datetime import date

from fastapi import APIRouter, HTTPException, Query
from sqlalchemy import func, select, text

from app.db.models import Edge, Era5Daily, FloodEvent, FloodLabel, IngestRun, Node, RainForecast, River
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


UPSTREAM_SQL = text("""
    with recursive up(id) as (
        select dst from edges where src = :node and edge_type = 'in_basin'
        union
        select e.src from edges e join up on e.dst = up.id where e.edge_type = 'drains_to'
    )
    select n.id, n.division, coalesce(n.bd_share, 0) as bd_share, st_area(n.geom::geography) / 1e6 as km2,
           r.rain_24h_mm, r.rain_72h_mm, r.rain_past_72h_mm
    from up join nodes n on n.id = up.id
    left join rain_forecasts r on r.node_id = n.id and r.ingest_run_id = :run
""")


@router.get("/basins")
def basins():
    """HydroBASINS level-7 basins draining into Bangladesh, with latest GFS rainfall."""
    with SessionLocal() as db:
        run = _latest_run(db)
        rows = db.execute(
            select(Node, func.ST_AsGeoJSON(func.ST_SimplifyPreserveTopology(Node.geom, 0.01)), RainForecast)
            .outerjoin(RainForecast, (RainForecast.node_id == Node.id) & (RainForecast.ingest_run_id == (run.id if run else -1)))
            .where(Node.node_type == "basin")
        ).all()
        downstream = dict(db.execute(select(Edge.src, Edge.dst).where(Edge.edge_type == "drains_to")).all())
        return {"type": "FeatureCollection", "features": [{
            "type": "Feature", "geometry": json.loads(g),
            "properties": {
                "id": n.id, "name": n.name, "region": n.division, "drains_to": downstream.get(n.id),
                "rain_past_72h_mm": rf.rain_past_72h_mm if rf else None,
                "rain_24h_mm": rf.rain_24h_mm if rf else None,
                "rain_48h_mm": rf.rain_48h_mm if rf else None,
                "rain_72h_mm": rf.rain_72h_mm if rf else None,
            },
        } for n, g, rf in rows], "source": rows[0][0].source if rows else None}


@router.get("/rivers")
def rivers(min_upland_km2: float = 5000):
    """Major HydroRIVERS reaches (upstream area >= min_upland_km2)."""
    with SessionLocal() as db:
        rows = db.execute(select(River, func.ST_AsGeoJSON(func.ST_Simplify(River.geom, 0.005)))
                          .where(River.upland_skm >= min_upland_km2)).all()
        return {"type": "FeatureCollection", "features": [{
            "type": "Feature", "geometry": json.loads(g),
            "properties": {"id": r.id, "upland_km2": r.upland_skm, "discharge_m3s": r.dis_av_cms,
                           "order": r.ord_stra, "basin": r.basin_id},
        } for r, g in rows], "source": "HydroRIVERS v1.0 (Lehner & Grill 2013, HydroSHEDS)"}


@router.get("/nodes/{node_id}/upstream")
def node_upstream(node_id: str):
    """Every basin whose water reaches this upazila, and the rain forecast over that catchment."""
    with SessionLocal() as db:
        if not db.get(Node, node_id):
            raise HTTPException(404, "Unknown node")
        run = _latest_run(db)
        rows = db.execute(UPSTREAM_SQL, {"node": node_id, "run": run.id if run else -1}).all()
        area = sum(r.km2 for r in rows)

        def mean(field):
            got = [(getattr(r, field), r.km2) for r in rows if getattr(r, field) is not None]
            w = sum(a for _, a in got)
            return round(sum(v * a for v, a in got) / w, 1) if w else None

        return {
            "node": node_id, "basins": [r.id for r in rows], "n_basins": len(rows),
            "catchment_km2": round(area), "outside_bd_km2": round(sum(r.km2 * (1 - r.bd_share) for r in rows)),
            "rain_24h_mm": mean("rain_24h_mm"), "rain_72h_mm": mean("rain_72h_mm"),
            "rain_past_72h_mm": mean("rain_past_72h_mm"),
        }


@router.get("/flood-events")
def flood_events():
    """Historical floods mapped from Sentinel-1 (training labels, P2)."""
    with SessionLocal() as db:
        totals = {e: (t, a) for e, t, a in db.execute(
            select(FloodLabel.event_id, func.sum(FloodLabel.flooded_km2), func.sum(FloodLabel.abnormal_km2))
            .group_by(FloodLabel.event_id)).all()}
        return [{
            "id": e.id, "name": e.name, "post_start": e.post_start.isoformat(), "post_end": e.post_end.isoformat(),
            "pre_start": e.pre_start.isoformat(), "pre_end": e.pre_end.isoformat(),
            "n_pre_scenes": e.n_pre_scenes, "n_post_scenes": e.n_post_scenes, "method": e.method,
            "flooded_km2": round((totals.get(e.id) or (0, 0))[0] or 0),
            "abnormal_km2": round((totals.get(e.id) or (0, 0))[1] or 0), "computed_at": e.computed_at.isoformat(),
        } for e in db.scalars(select(FloodEvent).order_by(FloodEvent.post_start)).all()]


@router.get("/flood-events/{event_id}")
def flood_event_labels(event_id: str):
    with SessionLocal() as db:
        if not db.get(FloodEvent, event_id):
            raise HTTPException(404, "Unknown flood event")
        rows = db.execute(select(FloodLabel.node_id, FloodLabel.flooded_km2, FloodLabel.flooded_frac,
                                 FloodLabel.abnormal_km2, FloodLabel.abnormal_frac)
                          .where(FloodLabel.event_id == event_id)).all()
        return {n: {"km2": k, "frac": f, "abnormal_km2": ak, "abnormal_frac": af} for n, k, f, ak, af in rows}


@router.get("/nodes/{node_id}/history")
def node_history(node_id: str, start: date = Query(...), end: date = Query(...)):
    """ERA5-Land daily rainfall, runoff and soil moisture for one node (P3)."""
    if (end - start).days > 3660:
        raise HTTPException(400, "Range too long (max 10 years)")
    with SessionLocal() as db:
        if not db.get(Node, node_id):
            raise HTTPException(404, "Unknown node")
        rows = db.scalars(select(Era5Daily).where(Era5Daily.node_id == node_id, Era5Daily.day.between(start, end))
                          .order_by(Era5Daily.day)).all()
        return {"node": node_id, "source": "ERA5-Land daily (ECMWF, via Google Earth Engine)", "days": [{
            "day": r.day.isoformat(), "precip_mm": r.precip_mm, "runoff_mm": r.runoff_mm,
            "soil_water_1": r.soil_water_1, "soil_water_2": r.soil_water_2,
        } for r in rows]}


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
        counts = dict(db.execute(select(Node.node_type, func.count()).group_by(Node.node_type)).all())
        edges = db.scalar(select(func.count()).select_from(Edge))
        return {"status": "ok", "database": "ok", "nodes": sum(counts.values()), "node_types": counts,
                "edges": edges,
                "latest_rain_run": run.model_run_time.isoformat() if run else None}
