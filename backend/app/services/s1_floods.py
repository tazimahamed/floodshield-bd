"""P2: historical flood extent from Sentinel-1 SAR (Google Earth Engine), aggregated per upazila.

Method: UN-SPIDER Recommended Practice for SAR flood mapping (change detection).
  - Sentinel-1 GRD IW, VH, same orbit direction before and during the event
  - focal-mean speckle filter (50 m), ratio during/before (dB) > 1.25 = newly flooded
  - masks: JRC Global Surface Water occurrence > 80 % (permanent water), slope > 5 %
    (HydroSHEDS 3s DEM)
  - "abnormal" flood compares the event with the same calendar window in other years
    (2017-2024, Sentinel-1 itself, so monsoon clouds do not matter): pixels that are wet
    every monsoon, like the haors, are not counted as flood
The labels feed model training in P4. Each run stores the event windows and threshold.
"""

import json
import logging
from datetime import date, datetime, timezone

import ee
from sqlalchemy import delete, func, select

from app.core.config import settings
from app.db.models import FloodEvent, FloodLabel, Node
from app.db.session import SessionLocal

log = logging.getLogger(__name__)
METHOD = ("UN-SPIDER S1 change detection, VH, ratio > 1.25, JRC GSW > 80% and slope > 5% masked; "
          "abnormal = also ratio > 1.25 vs the same window in other years 2017-2024")
NORMAL_YEARS = range(2017, 2025)
RATIO_THRESHOLD = 1.25
SCALE_M = 60  # 30 m times out interactively once the multi-year baseline is added

# Documented major floods (FFWC annual reports, ReliefWeb). Pre-flood reference = dry season same year.
EVENTS = [
    {"id": "bd_2019_jul", "name": "Jamuna/Brahmaputra monsoon flood, July 2019",
     "pre": ("2019-02-01", "2019-03-31"), "post": ("2019-07-12", "2019-07-28")},
    {"id": "bd_2020_jul", "name": "Prolonged monsoon flood, July 2020",
     "pre": ("2020-02-01", "2020-03-31"), "post": ("2020-07-10", "2020-07-31")},
    {"id": "sylhet_2022_jun", "name": "Sylhet-Sunamganj flash flood, June 2022",
     "pre": ("2022-02-01", "2022-03-31"), "post": ("2022-06-16", "2022-06-28")},
    {"id": "sylhet_2024_jun", "name": "Sylhet flood, June 2024",
     "pre": ("2024-02-01", "2024-03-31"), "post": ("2024-06-18", "2024-07-05")},
    {"id": "east_2024_aug", "name": "Feni-Noakhali-Cumilla flood, August 2024",
     "pre": ("2024-02-01", "2024-03-31"), "post": ("2024-08-21", "2024-09-02")},
]


def init_ee() -> None:
    ee.Initialize(project=settings.ee_project)


def _s1(start: str, end: str, region, orbit: str):
    return (ee.ImageCollection("COPERNICUS/S1_GRD")
            .filter(ee.Filter.eq("instrumentMode", "IW"))
            .filter(ee.Filter.listContains("transmitterReceiverPolarisation", "VH"))
            .filter(ee.Filter.eq("orbitProperties_pass", orbit))
            .filterBounds(region).filterDate(start, end).select("VH"))


def flood_mask(event: dict, region):
    """Newly flooded pixels for one event (1 = flooded), plus the S1 scene counts used."""
    orbit = "DESCENDING"
    pre_c, post_c = _s1(*event["pre"], region, orbit), _s1(*event["post"], region, orbit)
    pre = pre_c.median().focal_mean(50, "circle", "meters")
    post = post_c.min().focal_mean(50, "circle", "meters")  # min = wettest observation in window
    flooded = post.divide(pre).gt(RATIO_THRESHOLD)
    permanent = ee.Image("JRC/GSW1_4/GlobalSurfaceWater").select("occurrence").gt(80)
    slope = ee.Terrain.slope(ee.Image("WWF/HydroSHEDS/03VFDEM"))
    flooded = flooded.where(permanent, 0).updateMask(slope.lt(5)).unmask(0)
    # normal monsoon state: wettest observation of the same window, median over the other years
    year = int(event["post"][0][:4])
    mins = [_s1(event["post"][0].replace(str(year), str(y), 1), event["post"][1].replace(str(year), str(y), 1),
                region, orbit).min() for y in NORMAL_YEARS if y != year]
    # a year with no scene in this window gives a band-less image; drop it
    mins = ee.ImageCollection(mins).map(lambda i: i.set("n_bands", i.bandNames().size()))
    normal = mins.filter(ee.Filter.gt("n_bands", 0)).median().focal_mean(50, "circle", "meters")
    abnormal = flooded.And(post.divide(normal).gt(RATIO_THRESHOLD)).unmask(0)
    return flooded.rename("total").addBands(abnormal.rename("abnormal")), pre_c.size(), post_c.size()


def _upazila_fcs(db) -> dict[str, ee.FeatureCollection]:
    """Upazilas as one Earth Engine collection per division (one request each avoids timeouts)."""
    rows = db.execute(select(Node.id, Node.division,
                             func.ST_AsGeoJSON(func.ST_SimplifyPreserveTopology(Node.geom, 0.002)))
                      .where(Node.node_type == "upazila")).all()
    by_div: dict[str, list] = {}
    for i, d, g in rows:
        by_div.setdefault(d, []).append(ee.Feature(json.loads(g), {"node_id": i}))
    return {d: ee.FeatureCollection(f) for d, f in by_div.items()}


def run_event(event: dict) -> int:
    """Map one event and store flooded km2 / fraction for every upazila. Returns rows stored."""
    init_ee()
    with SessionLocal() as db:
        info = []
        for division, fc in _upazila_fcs(db).items():
            mask, n_pre, n_post = flood_mask(event, fc.geometry().bounds())
            area = mask.multiply(ee.Image.pixelArea())
            result = area.reduceRegions(collection=fc, reducer=ee.Reducer.sum(), scale=SCALE_M, tileScale=16)
            result = result.map(lambda f: f.set("area_m2", f.geometry().area(100)).setGeometry(None))
            info += result.getInfo()["features"]
            log.info("%s %s done", event["id"], division)
        n_pre, n_post = n_pre.getInfo(), n_post.getInfo()  # scene counts of the last division

        db.execute(delete(FloodLabel).where(FloodLabel.event_id == event["id"]))
        db.merge(FloodEvent(
            id=event["id"], name=event["name"],
            pre_start=date.fromisoformat(event["pre"][0]), pre_end=date.fromisoformat(event["pre"][1]),
            post_start=date.fromisoformat(event["post"][0]), post_end=date.fromisoformat(event["post"][1]),
            method=METHOD, n_pre_scenes=n_pre, n_post_scenes=n_post,
            computed_at=datetime.now(timezone.utc),
        ))
        for f in info:
            p = f["properties"]
            total, abnormal, a = p.get("total") or 0.0, p.get("abnormal") or 0.0, p["area_m2"]
            db.add(FloodLabel(event_id=event["id"], node_id=p["node_id"],
                              flooded_km2=round(total / 1e6, 3),
                              flooded_frac=round(total / a, 4) if a else 0.0,
                              abnormal_km2=round(abnormal / 1e6, 3),
                              abnormal_frac=round(abnormal / a, 4) if a else 0.0))
        db.commit()
        log.info("%s: %d upazilas, %d pre / %d post scenes", event["id"], len(info), n_pre, n_post)
        return len(info)
