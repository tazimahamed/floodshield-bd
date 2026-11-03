"""Cyclone history for Bangladesh from NOAA IBTrACS v04r01 (North Indian basin).

IBTrACS merges the official best tracks; for this basin the WMO agency is the IMD Regional
Specialised Meteorological Centre, New Delhi, so WMO_WIND is IMD's 3-minute mean wind (knots).
Only `main` tracks are used; storms marked PROVISIONAL in IBTrACS are kept but flagged.

A storm is included when its track came within NEAR_KM of Bangladesh. For every upazila within
EXPOSURE_KM of the track we store the closest distance and the IMD wind at the nearest fix.
"""

import hashlib
import logging
from datetime import datetime, timezone

import httpx
import pandas as pd
from geoalchemy2.shape import from_shape
from shapely.geometry import LineString
from sqlalchemy import delete, text

from app.core.config import settings
from app.db.models import Cyclone, CyclonePoint, IngestRun
from app.db.session import SessionLocal, engine

log = logging.getLogger(__name__)
URL = ("https://www.ncei.noaa.gov/data/international-best-track-archive-for-climate-stewardship-ibtracs/"
       "v04r01/access/csv/ibtracs.NI.list.v04r01.csv")
RAW = settings.data_dir / "raw" / "ibtracs" / "ibtracs.NI.list.v04r01.csv"
SOURCE = "noaa-ibtracs"
FIRST_SEASON = 1960  # satellite era; earlier tracks in this basin are sparse
NEAR_KM = 300
EXPOSURE_KM = 150
# Sentinel-1 maps after landfall are NOT linked: in the coastal tidal / shrimp-farm belt
# (e.g. Shyamnagar, Koyra after Amphan) water is already present, so change detection misses the
# surge flooding and would understate the damage. Keep empty until a method that works there exists.
FLOOD_MAPS: dict = {}

# IMD classification by 3-minute mean wind (knots)
IMD_CLASSES = [(120, "Super Cyclonic Storm"), (90, "Extremely Severe Cyclonic Storm"),
               (64, "Very Severe Cyclonic Storm"), (48, "Severe Cyclonic Storm"), (34, "Cyclonic Storm"),
               (28, "Deep Depression"), (17, "Depression")]


def imd_class(kt: float | None) -> str | None:
    if kt is None or pd.isna(kt):
        return None
    return next((name for lo, name in IMD_CLASSES if kt >= lo), "Low Pressure Area")


def landfall(s: pd.DataFrame):
    """First coast crossing. IBTrACS LANDFALL is the minimum distance to land between a fix and the
    next one, so LANDFALL == 0 on a fix that is still over sea (DIST2LAND > 0) means the storm crosses
    the coast before the next fix; we place the crossing by linear interpolation of DIST2LAND."""
    rows = s.reset_index(drop=True)
    for i in range(len(rows) - 1):
        a, b = rows.iloc[i], rows.iloc[i + 1]
        # only crossings around the Bay of Bengal / Arabian Sea count (Bulbul 2019 began as Matmo
        # in the Pacific and first crossed Vietnam)
        if a.LANDFALL == 0 and a.DIST2LAND > 0 and b.DIST2LAND == 0 and 78 <= a.LON <= 100:
            # distance to the coast over the length of the step, assuming steady motion between fixes
            step_km = _km(a.LAT, a.LON, b.LAT, b.LON)
            f = min(1.0, a.DIST2LAND / step_km) if step_km > 0 else 1.0
            t = a.time + (b.time - a.time) * f
            return t, round(float(a.LAT + (b.LAT - a.LAT) * f), 2), round(float(a.LON + (b.LON - a.LON) * f), 2)
    first = rows[(rows.DIST2LAND == 0) & rows.LON.between(78, 100)]
    if len(first):  # formed over land or crossing not resolved: first fix over land
        r = first.iloc[0]
        return r.time, float(r.LAT), float(r.LON)
    return None, None, None


def _km(lat1, lon1, lat2, lon2) -> float:
    import math
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp, dl = p2 - p1, math.radians(lon2 - lon1)
    h = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 6371 * 2 * math.asin(math.sqrt(h))


def download() -> str:
    RAW.parent.mkdir(parents=True, exist_ok=True)
    with httpx.Client(timeout=600, follow_redirects=True) as c:
        r = c.get(URL)
        r.raise_for_status()
        RAW.write_bytes(r.content)
    return hashlib.sha256(RAW.read_bytes()).hexdigest()


def load_cyclones(fetch: bool = True) -> dict:
    sha = download() if fetch else hashlib.sha256(RAW.read_bytes()).hexdigest()
    d = pd.read_csv(RAW, skiprows=[1], low_memory=False, keep_default_na=False)
    d = d[(d.SEASON.astype(int) >= FIRST_SEASON) & d.TRACK_TYPE.isin(["main", "PROVISIONAL"])]
    for col in ("LAT", "LON", "WMO_WIND", "WMO_PRES", "DIST2LAND", "LANDFALL", "USA_WIND"):
        d[col] = pd.to_numeric(d[col], errors="coerce")
    d["time"] = pd.to_datetime(d.ISO_TIME).dt.tz_localize("UTC")

    with SessionLocal() as db:
        run = IngestRun(source=SOURCE, status="running", meta={"url": URL, "first_season": FIRST_SEASON})
        db.add(run)
        db.commit()
        db.execute(delete(CyclonePoint))
        db.execute(delete(Cyclone))
        n = 0
        for sid, s in d.groupby("SID"):
            s = s.sort_values("time")
            if len(s) < 2:
                continue
            line = LineString(list(zip(s.LON, s.LAT)))
            raw_name = s.NAME.iloc[0].split(":")[0]
            name = "Unnamed" if raw_name in ("UNNAMED", "NOT_NAMED", "") else raw_name.title()
            season = int(s.SEASON.iloc[0])
            lf_time, lf_lat, lf_lon = landfall(s)
            wind = s.WMO_WIND.max()
            db.add(Cyclone(
                sid=sid, name=name, season=season, start_time=s.time.iloc[0], end_time=s.time.iloc[-1],
                max_wind_kt=None if pd.isna(wind) else float(wind),
                max_wind_jtwc_kt=None if pd.isna(s.USA_WIND.max()) else float(s.USA_WIND.max()),
                min_pres_hpa=None if pd.isna(s.WMO_PRES.min()) else float(s.WMO_PRES.min()),
                category=imd_class(wind),
                landfall_time=lf_time, landfall_lat=lf_lat, landfall_lon=lf_lon,
                closest_bd_km=1e9, provisional=bool((s.TRACK_TYPE == "PROVISIONAL").any()),
                flood_event_id=FLOOD_MAPS.get((name.upper(), season)),
                track=from_shape(line, srid=4326)))
            db.add_all(CyclonePoint(sid=sid, time=r.time, lat=float(r.LAT), lon=float(r.LON),
                                    wind_kt=None if pd.isna(r.WMO_WIND) else float(r.WMO_WIND),
                                    pres_hpa=None if pd.isna(r.WMO_PRES) else float(r.WMO_PRES))
                       for r in s.itertuples())
            n += 1
        db.commit()

        with engine.begin() as c:
            # distance to Bangladesh; drop storms that never came within NEAR_KM
            c.execute(text("""
                with bd as (select st_union(st_makevalid(st_snaptogrid(geom, 0.0005))) g from nodes where node_type = 'upazila')
                update cyclones set closest_bd_km = st_distance(track::geography, (select g from bd)::geography) / 1000"""))
            c.execute(text("delete from cyclones where closest_bd_km > :km"), {"km": NEAR_KM})
            c.execute(text("delete from cyclone_exposure"))
            c.execute(text("""
                insert into cyclone_exposure (sid, node_id, min_km, wind_kt_near)
                select cy.sid, n.id,
                       st_distance(cy.track::geography, st_setsrid(st_point(n.point_lon, n.point_lat), 4326)::geography) / 1000,
                       (select p.wind_kt from cyclone_points p where p.sid = cy.sid and p.wind_kt is not null
                          and st_dwithin(st_setsrid(st_point(p.lon, p.lat), 4326)::geography,
                                         st_setsrid(st_point(n.point_lon, n.point_lat), 4326)::geography, :m)
                        order by st_setsrid(st_point(p.lon, p.lat), 4326)::geography <->
                                 st_setsrid(st_point(n.point_lon, n.point_lat), 4326)::geography limit 1)
                from cyclones cy join nodes n on n.node_type = 'upazila'
                 and st_dwithin(cy.track::geography, st_setsrid(st_point(n.point_lon, n.point_lat), 4326)::geography, :m)
            """), {"m": EXPOSURE_KM * 1000})
            kept = c.execute(text("select count(*) from cyclones")).scalar()
            exposures = c.execute(text("select count(*) from cyclone_exposure")).scalar()

        run = db.get(IngestRun, run.id)
        run.status, run.n_nodes, run.sha256 = "done", kept, sha
        run.raw_path = str(RAW.relative_to(settings.data_dir.parent))
        run.finished_at = datetime.now(timezone.utc)
        db.commit()
    return {"storms_since_1960": n, "near_bangladesh": kept, "upazila_exposures": exposures}
