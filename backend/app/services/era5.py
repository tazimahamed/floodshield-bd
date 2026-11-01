"""P3: ERA5-Land daily history (ECMWF, via Google Earth Engine ECMWF/ERA5_LAND/DAILY_AGGR)
as area means over every upazila and upstream basin. These are the model's past-weather inputs.

One request = one month for all nodes: the month's days are stacked into bands so the
result is ~1250 features (well under Earth Engine's interactive limits).
"""

import json
import logging
from datetime import date

import ee
from sqlalchemy import func, select
from sqlalchemy.dialects.postgresql import insert

from app.db.models import Era5Daily, IngestRun, Node
from app.db.session import SessionLocal
from app.services.s1_floods import init_ee

log = logging.getLogger(__name__)
COLLECTION = "ECMWF/ERA5_LAND/DAILY_AGGR"
SOURCE = "era5-land-daily"
BANDS = {  # ERA5 band -> (column, multiplier)
    "total_precipitation_sum": ("precip_mm", 1000.0),
    "runoff_sum": ("runoff_mm", 1000.0),
    "volumetric_soil_water_layer_1": ("soil_water_1", 1.0),
    "volumetric_soil_water_layer_2": ("soil_water_2", 1.0),
}
SCALE_M = 11132  # native 0.1 degree


def _nodes_fc(db) -> ee.FeatureCollection:
    rows = db.execute(select(Node.id, func.ST_AsGeoJSON(func.ST_SimplifyPreserveTopology(Node.geom, 0.01)))
                      .where(Node.node_type.in_(("upazila", "basin")))).all()
    return ee.FeatureCollection([ee.Feature(json.loads(g), {"node_id": i}) for i, g in rows])


def _month(fc, year: int, month: int) -> list[dict]:
    start = ee.Date.fromYMD(year, month, 1)
    col = ee.ImageCollection(COLLECTION).filterDate(start, start.advance(1, "month")).select(list(BANDS))
    days = col.aggregate_array("system:index").getInfo()  # e.g. "20240801"
    if not days:
        return []
    stacked = col.toBands()  # bands named "<index>_<band>"
    out = stacked.reduceRegions(collection=fc, reducer=ee.Reducer.mean(), scale=SCALE_M, tileScale=4)
    rows = []
    for f in out.getInfo()["features"]:
        p = f["properties"]
        for d in days:
            row = {"node_id": p["node_id"], "day": date(int(d[:4]), int(d[4:6]), int(d[6:8]))}
            for band, (col_name, mult) in BANDS.items():
                v = p.get(f"{d}_{band}")
                row[col_name] = None if v is None else round(v * mult, 4)
            rows.append(row)
    return rows


def backfill(first_year: int, last_year: int, months: range = range(1, 13)) -> int:
    """Load ERA5-Land daily values for every node, month by month. Re-running overwrites."""
    init_ee()
    total = 0
    with SessionLocal() as db:
        run = IngestRun(source=SOURCE, status="running",
                        meta={"collection": COLLECTION, "years": [first_year, last_year]})
        db.add(run)
        db.commit()
        fc = _nodes_fc(db)
        try:
            for y in range(first_year, last_year + 1):
                for m in months:
                    rows = _month(fc, y, m)
                    if not rows:
                        continue
                    for i in range(0, len(rows), 5000):
                        chunk = insert(Era5Daily).values(rows[i:i + 5000])
                        db.execute(chunk.on_conflict_do_update(
                            index_elements=["node_id", "day"],
                            set_={c: chunk.excluded[c] for c, _ in BANDS.values()}))
                    db.commit()
                    total += len(rows)
                    log.info("ERA5-Land %d-%02d: %d rows", y, m, len(rows))
                    print(f"{y}-{m:02d} {len(rows)} rows", flush=True)
            run.status, run.n_nodes = "done", total
        except Exception as e:
            run.status, run.error = "failed", str(e)[:2000]
            raise
        finally:
            run.finished_at = func.now()
            db.commit()
    return total


def refresh_recent() -> int:
    """Daily job: reload the current and previous month so newly published ERA5-Land days arrive."""
    today = date.today()
    prev = date(today.year - (today.month == 1), (today.month - 2) % 12 + 1, 1)
    n = backfill(prev.year, prev.year, range(prev.month, prev.month + 1))
    return n + backfill(today.year, today.year, range(today.month, today.month + 1))
