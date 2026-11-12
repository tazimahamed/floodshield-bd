import gzip
import json
import re
from threading import Lock
from datetime import date, timedelta

from fastapi import APIRouter, HTTPException, Query, Request, Response
from fastapi.encoders import jsonable_encoder
from fastapi.responses import FileResponse
from geoalchemy2 import Geography, Geometry
from sqlalchemy import func, select, text

from app.db.models import Asset, Cyclone, CycloneExposure, CyclonePoint, Edge, Era5Daily, FloodEvent, FloodForecast, FloodForecastRun, FloodLabel, HealthFacility, IngestRun, ModelVersion, Node, RainForecast, River
from app.db.session import SessionLocal
from app.services.alerts import is_stale
from app.services.impact import impact
from app.services.outlook import heat_level, node_outlook

router = APIRouter(prefix="/api/v1")


def _latest_run(db, source: str = "open-meteo-gfs") -> IngestRun | None:
    return db.scalars(
        select(IngestRun).where(IngestRun.source == source, IngestRun.status == "done")
        .order_by(IngestRun.finished_at.desc()).limit(1)
    ).first()


_json_cache: dict[tuple, tuple[object, bytes, bytes]] = {}
_json_lock = Lock()


def _cached_json(request: Request, key: tuple, stamp: object, build) -> Response:
    """Big map responses, built once per forecast run and sent pre-compressed, so a rush of
    visitors during a flood does not mean re-reading every polygon from the database each time."""
    hit = _json_cache.get(key)
    if not hit or hit[0] != stamp:
        with _json_lock:
            hit = _json_cache.get(key)
            if not hit or hit[0] != stamp:
                raw = json.dumps(jsonable_encoder(build()), ensure_ascii=False).encode()
                hit = _json_cache[key] = (stamp, raw, gzip.compress(raw, 6))
    if "gzip" in request.headers.get("accept-encoding", ""):
        return Response(hit[2], media_type="application/json", headers={"Content-Encoding": "gzip", "Vary": "Accept-Encoding"})
    return Response(hit[1], media_type="application/json", headers={"Vary": "Accept-Encoding"})


def _run_stamp() -> tuple:
    with SessionLocal() as db:
        run, frun = _latest_run(db), _latest_flood_run(db)
        return (run.id if run else None, frun.id if frun else None)


@router.get("/upazilas")
def upazilas(request: Request, division: str | None = Query(None)):
    return _cached_json(request, ("upazilas", division), _run_stamp(), lambda: _upazilas(division))


def _upazilas(division: str | None):
    """Upazila polygons as GeoJSON, joined with the latest real rainfall forecast (if any)."""
    with SessionLocal() as db:
        run = _latest_run(db)
        frun = _latest_flood_run(db)
        q = (
            select(Node, func.ST_AsGeoJSON(func.ST_SimplifyPreserveTopology(Node.geom, 0.003)), RainForecast, FloodForecast)
            .outerjoin(RainForecast, (RainForecast.node_id == Node.id) & (RainForecast.ingest_run_id == (run.id if run else -1)))
            .outerjoin(FloodForecast, (FloodForecast.node_id == Node.id) & (FloodForecast.run_id == (frun.id if frun else -1)))
            .where(Node.node_type == "upazila")
        )
        if division:
            q = q.where(Node.division == division)
        features = []
        for node, geom, rf, ff in db.execute(q).all():
            features.append({
                "type": "Feature",
                "geometry": json.loads(geom),
                "properties": {
                    "id": node.id, "name": node.name, "district": node.district, "division": node.division,
                    "rain_past_72h_mm": rf.rain_past_72h_mm if rf else None,
                    "rain_24h_mm": rf.rain_24h_mm if rf else None,
                    "rain_48h_mm": rf.rain_48h_mm if rf else None,
                    "rain_72h_mm": rf.rain_72h_mm if rf else None,
                    "flood_prob": ff.flood_prob if ff else None,
                    "flood_frac": ff.flood_frac if ff else None,
                    "frac_p10": ff.frac_p10 if ff else None,
                    "frac_p90": ff.frac_p90 if ff else None,
                    "flood_risk": ff.risk if ff else None,
                },
            })
        return {
            "type": "FeatureCollection",
            "features": features,
            "rain_run": None if not run else {
                "id": run.id, "source": "NOAA GFS via Open-Meteo",
                "issued_at": run.model_run_time.isoformat(), "sha256": run.sha256,
            },
            "flood_forecast_run": _flood_run_info(frun) if frun else None,
            # when the newest forecast is too old to show, say when it was made instead of "no forecast"
            "forecast_stale_since": _stale_since(db) if not frun else None,
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


RISK_ORDER = {"low": 0, "medium": 1, "high": 2}


@router.get("/nodes/{node_id}/assets")
def node_assets(node_id: str):
    """OSM critical assets inside one upazila (GeoJSON points)."""
    with SessionLocal() as db:
        rows = db.execute(select(Asset, func.ST_X(Asset.geom), func.ST_Y(Asset.geom))
                          .where(Asset.node_id == node_id).order_by(Asset.kind, Asset.name)).all()
        return {"type": "FeatureCollection", "source": "OpenStreetMap contributors (ODbL)", "features": [{
            "type": "Feature", "geometry": {"type": "Point", "coordinates": [x, y]},
            "properties": {"id": a.id, "kind": a.kind, "name": a.name, "name_bn": a.name_bn},
        } for a, x, y in rows]}


@router.get("/assets/at-risk")
def assets_at_risk(min_risk: str = Query("medium", pattern="^(low|medium|high)$")):
    """Direct and ripple impact for every upazila at or above `min_risk` in the latest flood forecast."""
    with SessionLocal() as db:
        run = _latest_flood_run(db)
        if not run:
            raise HTTPException(404, "No flood forecast run yet")
        levels = [k for k, v in RISK_ORDER.items() if v >= RISK_ORDER[min_risk]]
        ids = list(db.scalars(select(FloodForecast.node_id).where(FloodForecast.run_id == run.id,
                                                                  FloodForecast.risk.in_(levels))))
    return {"forecast_run": run.id, "min_risk": min_risk, "upazilas": ids, **impact(ids)}


@router.get("/simulate/ripple")
def simulate_ripple(ids: str = Query(..., description="Comma-separated upazila ids assumed flooded")):
    """What-if: impact if these upazilas flood (independent of the forecast)."""
    node_ids = [i for i in ids.split(",") if i]
    if len(node_ids) > 544:
        raise HTTPException(400, "Too many upazilas")
    with SessionLocal() as db:
        known = set(db.scalars(select(Node.id).where(Node.id.in_(node_ids), Node.node_type == "upazila")))
    if unknown := [i for i in node_ids if i not in known]:
        raise HTTPException(404, f"Unknown upazila ids: {unknown[:5]}")
    return impact(node_ids)


@router.get("/upazila-slug/{district}/{name}")
def upazila_by_slug(district: str, name: str):
    from app.services.report import node_from_slug

    nid = node_from_slug(district.lower(), name.lower())
    if not nid:
        raise HTTPException(404, "Unknown upazila")
    return {"id": nid}


@router.get("/nodes/{node_id}/report.csv")
def node_report_csv(node_id: str):
    """Every mapped monsoon window for one upazila, as CSV (for people who want the numbers)."""
    import csv
    import io

    from fastapi.responses import Response

    from app.services.report import upazila_report

    r = upazila_report(node_id)
    if not r:
        raise HTTPException(404, "Unknown upazila")
    buf = io.StringIO()
    cols = ["start", "end", "flooded", "flooded_pct", "flooded_km2", "all_water_pct", "rain_local_7d_before",
            "rain_local_15d_before", "rain_up_15d_before", "rain_local_during", "rain_up_during"]
    w = csv.DictWriter(buf, fieldnames=cols, extrasaction="ignore")
    w.writeheader()
    w.writerows(r["history"])
    name = r["slug"].replace("/", "_")
    return Response(buf.getvalue(), media_type="text/csv",
                    headers={"Content-Disposition": f'attachment; filename="floodshield_{name}.csv"'})


@router.get("/nodes/{node_id}/shape")
def node_shape(node_id: str):
    """Simplified outline of one upazila (for the report's mini map)."""
    with SessionLocal() as db:
        g = db.scalar(select(func.ST_AsGeoJSON(func.ST_SimplifyPreserveTopology(Node.geom, 0.001)))
                      .where(Node.id == node_id))
        if not g:
            raise HTTPException(404, "Unknown upazila")
        return {"type": "Feature", "geometry": json.loads(g), "properties": {}}


@router.get("/nodes/{node_id}/rivers")
def node_rivers(node_id: str, min_upland_km2: float = 100):
    """HydroRIVERS reaches that cross this upazila (plus 2 km around it), for the report's 3D map."""
    with SessionLocal() as db:
        node = db.get(Node, node_id)
        if not node:
            raise HTTPException(404, "Unknown upazila")
        area = func.ST_Buffer(Node.geom.cast(Geography), 2000).cast(Geometry)
        clip = select(area).where(Node.id == node_id).scalar_subquery()
        rows = db.execute(select(River, func.ST_AsGeoJSON(func.ST_Intersection(River.geom, clip)))
                          .where(River.upland_skm >= min_upland_km2, func.ST_Intersects(River.geom, clip))).all()
        return {"type": "FeatureCollection", "features": [{
            "type": "Feature", "geometry": json.loads(g),
            "properties": {"upland_km2": r.upland_skm, "discharge_m3s": r.dis_av_cms, "order": r.ord_stra},
        } for r, g in rows if g], "source": "HydroRIVERS v1.0 (Lehner & Grill 2013, HydroSHEDS)"}


@router.get("/nodes/{node_id}/report")
def node_report(node_id: str):
    """Flood history of one upazila (Sentinel-1, 2017-2025) with the rain before each window."""
    from app.services.report import upazila_report

    r = upazila_report(node_id)
    if not r:
        raise HTTPException(404, "Unknown upazila")
    return r


@router.get("/nodes/{node_id}/hospitals")
def node_hospitals(node_id: str):
    """Government hospitals in this upazila from the official DGHS Facility Registry, only those whose
    registry coordinates fall inside this upazila AND whose registry upazila name matches it."""
    with SessionLocal() as db:
        rows = db.execute(select(HealthFacility, func.ST_X(HealthFacility.geom), func.ST_Y(HealthFacility.geom))
                          .where(HealthFacility.node_id == node_id, HealthFacility.verified)
                          .order_by(HealthFacility.beds.desc().nullslast(), HealthFacility.name)).all()
        run = db.scalars(select(IngestRun).where(IngestRun.source == "dghs-facility-registry", IngestRun.status == "done")
                         .order_by(IngestRun.id.desc()).limit(1)).first()
        return {
            "source": "DGHS Facility Registry (Ministry of Health and Family Welfare)",
            "source_url": "https://hrm.dghs.gov.bd/public/facility-registry",
            "fetched_at": run.finished_at.isoformat() if run else None,
            "hospitals": [{
                "id": h.id, "name": h.name, "name_bn": h.name_bn, "type": h.facility_type, "beds": h.beds,
                "mobile": h.mobile, "lat": y, "lon": x, "dghs_updated_at": h.dghs_updated_at,
                "profile_url": f"https://hrm.dghs.gov.bd/public/facility-registry/facilities/{h.id}/profile",
            } for h, x, y in rows],
        }


KT_TO_KMH = 1.852


def _cyclone_info(cy: Cyclone) -> dict:
    return {
        "sid": cy.sid, "name": cy.name, "season": cy.season,
        "start": cy.start_time.isoformat(), "end": cy.end_time.isoformat(),
        "max_wind_kt": cy.max_wind_kt, "max_wind_kmh": round(cy.max_wind_kt * KT_TO_KMH) if cy.max_wind_kt else None,
        "max_wind_jtwc_kt": cy.max_wind_jtwc_kt, "min_pres_hpa": cy.min_pres_hpa, "category": cy.category,
        "landfall_time": cy.landfall_time.isoformat() if cy.landfall_time else None,
        "landfall_lat": cy.landfall_lat, "landfall_lon": cy.landfall_lon,
        "closest_bd_km": round(cy.closest_bd_km), "provisional": cy.provisional, "flood_event_id": cy.flood_event_id,
    }


@router.get("/cyclones")
def cyclones(min_wind_kt: float = 34, named_only: bool = False):
    """Cyclones that came within 300 km of Bangladesh since 1960 (NOAA IBTrACS; IMD winds)."""
    with SessionLocal() as db:
        q = select(Cyclone).where((Cyclone.max_wind_kt >= min_wind_kt) | (Cyclone.max_wind_jtwc_kt >= min_wind_kt)
                                  | (Cyclone.name != "Unnamed") if not named_only else Cyclone.name != "Unnamed")
        rows = db.scalars(q.order_by(Cyclone.start_time.desc())).all()
        return {"source": "NOAA IBTrACS v04r01 (IMD New Delhi best track)", "cyclones": [_cyclone_info(c) for c in rows]}


@router.get("/cyclones/active")
def cyclones_active(event: int | None = None, episode: int | None = None):
    """Tropical cyclones active now near Bangladesh (GDACS, track forecast from JTWC). Not BMD's signal."""
    from app.services.active_storms import active

    return active(event, episode)


@router.get("/cyclones/{sid}")
def cyclone_detail(sid: str):
    """Track (6-hourly fixes) and the upazilas within 150 km of it."""
    with SessionLocal() as db:
        cy = db.get(Cyclone, sid)
        if not cy:
            raise HTTPException(404, "Unknown cyclone")
        pts = db.scalars(select(CyclonePoint).where(CyclonePoint.sid == sid).order_by(CyclonePoint.time)).all()
        exp = db.execute(select(CycloneExposure.node_id, CycloneExposure.min_km, CycloneExposure.wind_kt_near)
                         .where(CycloneExposure.sid == sid)).all()
        place = None
        if cy.landfall_lat is not None:  # nearest upazila to the coast crossing, if it is in Bangladesh
            place = db.execute(text("""
                select name, district, st_distance(geom::geography, st_setsrid(st_point(:lon, :lat), 4326)::geography) / 1000 km
                from nodes where node_type = 'upazila'
                order by geom <-> st_setsrid(st_point(:lon, :lat), 4326) limit 1"""),
                {"lat": cy.landfall_lat, "lon": cy.landfall_lon}).mappings().first()
        return {**_cyclone_info(cy),
                "landfall_place": None if not place or place["km"] > 40 else
                {"upazila": place["name"], "district": place["district"], "km": round(place["km"])},
                "points": [{"time": p.time.isoformat(), "lat": p.lat, "lon": p.lon, "wind_kt": p.wind_kt,
                            "pres_hpa": p.pres_hpa} for p in pts],
                "upazilas": {n: {"min_km": round(km, 1), "wind_kt": w} for n, km, w in exp}}


@router.get("/nodes/{node_id}/cyclones")
def node_cyclones(node_id: str):
    """Every cyclone since 1960 whose track passed within 150 km of this upazila."""
    with SessionLocal() as db:
        rows = db.execute(select(Cyclone, CycloneExposure.min_km, CycloneExposure.wind_kt_near)
                          .join(CycloneExposure, CycloneExposure.sid == Cyclone.sid)
                          .where(CycloneExposure.node_id == node_id).order_by(Cyclone.start_time.desc())).all()
        items = [{**_cyclone_info(c), "min_km": round(km, 1), "wind_kt_near": w} for c, km, w in rows]
        return {"source": "NOAA IBTrACS v04r01 (IMD New Delhi best track)", "within_150km": len(items),
                "within_50km": sum(i["min_km"] <= 50 for i in items), "cyclones": items}


@router.get("/nodes/{node_id}/cyclone-directions")
def node_cyclone_directions(node_id: str):
    """Which way past cyclones were coming from when they passed closest to this upazila (within 150 km, since 1960).
    History only: it does not say where a future storm will go."""
    import math

    with SessionLocal() as db:
        c = db.execute(text("select st_x(st_centroid(geom)), st_y(st_centroid(geom)) from nodes where id = :n"), {"n": node_id}).first()
        if not c:
            raise HTTPException(404, "Unknown node")
        lon0, lat0 = c
        sids = [x for (x,) in db.execute(select(CycloneExposure.sid).where(CycloneExposure.node_id == node_id))]
        counts, used = [0] * 8, 0
        if sids:
            tracks: dict[str, list] = {}
            for p in db.scalars(select(CyclonePoint).where(CyclonePoint.sid.in_(sids)).order_by(CyclonePoint.sid, CyclonePoint.time)):
                tracks.setdefault(p.sid, []).append((p.lon, p.lat))
            k = math.cos(math.radians(lat0))
            for pts in tracks.values():
                if len(pts) < 2:
                    continue
                i = min(range(len(pts)), key=lambda j: ((pts[j][0] - lon0) * k) ** 2 + (pts[j][1] - lat0) ** 2)
                a, b = pts[max(0, i - 1)], pts[min(len(pts) - 1, i + 1)]
                dx, dy = (b[0] - a[0]) * k, b[1] - a[1]
                if dx == 0 and dy == 0:
                    continue
                toward = math.degrees(math.atan2(dx, dy)) % 360   # the way the storm was moving
                counts[round(((toward + 180) % 360) / 45) % 8] += 1  # the side it came from
                used += 1
        return {"source": "NOAA IBTrACS v04r01 (IMD New Delhi best track)", "storms": used,
                "from": dict(zip(["N", "NE", "E", "SE", "S", "SW", "W", "NW"], counts))}


@router.get("/hindcast")
def hindcast_day(day: date = Query(...)):
    """Model output for a past day (ERA5-Land inputs), plus what Sentinel-1 actually saw in the
    15-day window containing that day, when one was mapped."""
    from app.ml.forecast import hindcast, risk_level

    with SessionLocal() as db:
        era5_last = db.scalar(select(func.max(Era5Daily.day)))
        first = db.scalar(select(func.min(Era5Daily.day))) + timedelta(days=31)
        last = era5_last - timedelta(days=2)
        if not first <= day <= last:
            raise HTTPException(400, f"Pick a day between {first} and {last} (ERA5-Land history).")
        event = db.scalars(select(FloodEvent).where(FloodEvent.post_start <= day, FloodEvent.post_end >= day)
                           .order_by(FloodEvent.id.like("auto_%"), FloodEvent.post_start.desc()).limit(1)).first()
        observed = {}
        if event:
            observed = dict(db.execute(select(FloodLabel.node_id, FloodLabel.abnormal_frac)
                                       .where(FloodLabel.event_id == event.id)).all())
    version, pred = hindcast(day)
    return {
        "day": day.isoformat(), "model_version": version, "range": [first.isoformat(), last.isoformat()],
        "inputs": "ERA5-Land reanalysis for the past 30 days and the next 3 days (perfect rain forecast)",
        "observed_event": None if not event else {
            "id": event.id, "name": event.name, "start": event.post_start.isoformat(), "end": event.post_end.isoformat()},
        "upazilas": {n: {"flood_prob": round(float(r.prob), 4), "flood_frac": round(float(r.frac), 4),
                         "flood_risk": risk_level(r.prob), "observed_frac": observed.get(n)}
                     for n, r in pred.iterrows()},
    }


@router.get("/models")
def model_versions():
    """Model card data: every trained flood model with its leave-one-year-out scores."""
    with SessionLocal() as db:
        return [{"version": m.version, "trained_at": m.trained_at.isoformat(), "active": m.is_active,
                 "metrics": m.metrics, **m.info}
                for m in db.scalars(select(ModelVersion).order_by(ModelVersion.trained_at.desc())).all()]


@router.get("/water-now")
def water_now_view():
    """Unusual water in every upazila on the latest Sentinel-1 pictures (last 12 days), plus the map tiles."""
    from app.services.water_now import load

    data = load()
    if not data:
        raise HTTPException(503, "The latest satellite water map is being made; try again in a few minutes.")
    return data


@router.get("/water-now/{name}")
def water_now_tile(name: str):
    from app.services.water_now import TILES

    if not re.fullmatch(r"t\d\d\.png", name) or not (TILES / name).exists():
        raise HTTPException(404, "No such tile")
    return FileResponse(TILES / name, media_type="image/png", headers={"Cache-Control": "public, max-age=3600"})


@router.get("/nodes/{node_id}/why")
def why(node_id: str):
    """The 3 biggest reasons (TreeSHAP groups) behind this upazila's risk in the latest forecast run.
    The run id is included so the page can check it explains the same forecast it shows."""
    from app.ml.explain import load

    data = load()
    with SessionLocal() as db:
        run = _latest_flood_run(db)
    if not data or not run or data.get("run_id") != run.id:
        raise HTTPException(503, "The explanation for the latest forecast is not ready yet.")
    hit = data["upazilas"].get(node_id)
    if hit is None:
        raise HTTPException(404, "No explanation for this upazila")
    return {"run_id": data["run_id"], "model_version": data["model_version"], **hit}


@router.get("/model/calendar")
def model_calendar_view():
    """Last 12 months, fortnight by fortnight: floods the model caught, missed, and its false alarms."""
    from app.services.model_calendar import load

    data = load()
    if not data:
        raise HTTPException(503, "The model calendar is being built; try again in a few minutes.")
    return data


_outline_cache: dict = {}


@router.get("/nodes/{node_id}/outlook")
def outlook(node_id: str):
    with SessionLocal() as db:
        rows = node_outlook(db, node_id)
        return [{"day": r.day.isoformat(), "tmax_c": r.tmax_c, "wind_kmh": r.wind_kmh, "wave_m": r.wave_m,
                 "heat": heat_level(r.tmax_c)} for r in rows]


@router.get("/country-outline")
def country_outline():
    """Bangladesh outline (union of the upazilas), for the map mask and border."""
    if not _outline_cache:
        with SessionLocal() as db:
            g = db.scalar(text("""select st_asgeojson(st_simplifypreservetopology(st_collectionextract(
                st_union(st_makevalid(st_snaptogrid(geom, 0.0005))), 3), 0.004), 4)
                from nodes where node_type = 'upazila'"""))
        _outline_cache["geojson"] = {"type": "Feature", "geometry": json.loads(g), "properties": {}}
    return _outline_cache["geojson"]


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


def _stale_since(db) -> str | None:
    run = db.scalars(select(FloodForecastRun).order_by(FloodForecastRun.id.desc()).limit(1)).first()
    return run.issued_at.isoformat() if run else None


def _latest_flood_run(db) -> FloodForecastRun | None:
    """The forecast to show. A stale one counts as none, so an old risk never reads as today's."""
    run = db.scalars(select(FloodForecastRun).order_by(FloodForecastRun.id.desc()).limit(1)).first()
    return None if run and is_stale(run) else run


def _flood_run_info(r: FloodForecastRun) -> dict:
    return {"id": r.id, "issued_at": r.issued_at.isoformat(), "reference_day": r.reference_day.isoformat(),
            "valid_until": r.valid_until.isoformat(), "model_version": r.model_version,
            "rain_run_id": r.rain_run_id, "era5_last_day": r.era5_last_day.isoformat(), **r.meta}


@router.get("/flood-forecast")
def flood_forecast(request: Request):
    return _cached_json(request, ("flood-forecast",), _run_stamp(), _flood_forecast)


def _flood_forecast():
    """Latest model forecast per upazila. 404 (with the reason) until a model has been trained."""
    with SessionLocal() as db:
        run = _latest_flood_run(db)
        if not run:
            raise HTTPException(404, "No flood forecast run yet: the model has not been trained.")
        rows = db.execute(select(FloodForecast, Node.name, Node.district).join(Node, Node.id == FloodForecast.node_id)
                          .where(FloodForecast.run_id == run.id).order_by(FloodForecast.flood_prob.desc())).all()
        return {"run": _flood_run_info(run), "upazilas": [{
            "id": f.node_id, "name": n, "district": d, "flood_frac": f.flood_frac,
            "frac_p10": f.frac_p10, "frac_p90": f.frac_p90,
            "flood_prob": f.flood_prob, "risk": f.risk} for f, n, d in rows]}


def health_payload() -> dict:
    with SessionLocal() as db:
        db.execute(text("select 1"))
        run = _latest_run(db)
        counts = dict(db.execute(select(Node.node_type, func.count()).group_by(Node.node_type)).all())
        edges = db.scalar(select(func.count()).select_from(Edge))
        return {"status": "ok", "database": "ok", "nodes": sum(counts.values()), "node_types": counts,
                "edges": edges,
                "latest_rain_run": run.model_run_time.isoformat() if run else None}
