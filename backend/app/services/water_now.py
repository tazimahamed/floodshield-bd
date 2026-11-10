"""Water now: unusual water in every upazila on the latest Sentinel-1 radar pictures (last 12 days).

Same method as the flood history and the model's training labels (s1_floods.flood_mask): the newest pictures are
compared with the dry season, permanent water is masked, and water that is normal for this time of year in other
years (haors, seasonal wetlands) is not counted. Radar sees through clouds. This is what the satellite saw, not a
forecast, and it shows water spreading over land, not the height of the river.
"""

import json
import logging
import urllib.request
from datetime import date, datetime, timedelta, timezone

import ee
from sqlalchemy import select

from app.core.config import settings
from app.db.models import Node
from app.db.session import SessionLocal
from app.services import s1_floods
from app.services.s1_floods import METHOD, SCALE_M, _upazila_fcs, init_ee

log = logging.getLogger(__name__)
OUT = settings.data_dir / "water_now.json"
TILES = settings.data_dir / "water_now"     # the map picture, in 12 tiles (one picture of all Bangladesh is too big for Earth Engine)
DAYS = 12                                   # a Sentinel-1 pass covers all of Bangladesh within about 12 days
BOX = [88.0, 20.55, 92.75, 26.65]           # west, south, east, north: the PNG overlay
EPOCH = date(2015, 1, 1)
GRID = (3, 4)                               # columns, rows
TRIM_M = 2000                               # Sentinel-1 scenes are noisy at their edges: cut this much off each one


_S1_PLAIN = s1_floods._s1  # kept before flood_mask below swaps it, so the trimmed version can call it


def _s1(start, end, region, orbit):
    """Sentinel-1 scenes with their noisy edges trimmed; without this, scene borders show up as thin lines of 'water'."""
    return _S1_PLAIN(start, end, region, orbit).map(lambda im: im.clip(im.geometry().buffer(-TRIM_M)))


def flood_mask(ev, region):
    """s1_floods.flood_mask (the method of the flood history and training labels) on edge-trimmed scenes."""
    s1_floods._s1 = _s1
    try:
        return s1_floods.flood_mask(ev, region)
    finally:
        s1_floods._s1 = _S1_PLAIN


def _window(today: date) -> dict:
    # the "same window in other years" comparison works within one calendar year, so the window starts on 1 Jan at the earliest
    start = max(today - timedelta(days=DAYS), date(today.year, 1, 1))
    ref = today.year - 1 if today.month < 4 else today.year
    return {"id": "water_now", "pre": (f"{ref}-02-01", f"{ref}-03-31"), "post": (start.isoformat(), (today + timedelta(days=1)).isoformat())}


def build(today: date | None = None) -> dict:
    today = today or date.today()
    ev = _window(today)
    init_ee()
    out = {}
    with SessionLocal() as db:
        names = {i: (n, d) for i, n, d in db.execute(select(Node.id, Node.name, Node.district).where(Node.node_type == "upazila"))}
        for division, fc in _upazila_fcs(db).items():
            region = fc.geometry().bounds()
            mask, pre_n, post_n = flood_mask(ev, region)
            if not pre_n.getInfo() or not post_n.getInfo():
                log.info("water now %s: no recent satellite pass", division)
                continue
            # the day of the newest radar picture over each upazila
            days = _s1(*ev["post"], region, "DESCENDING").map(
                lambda im: ee.Image.constant(ee.Date(im.get("system:time_start")).difference(ee.Date(EPOCH.isoformat()), "day"))
                .toInt().rename("day").updateMask(im.mask().select(0)))
            last = days.max()
            area = mask.select("abnormal").multiply(ee.Image.pixelArea()).rename("abnormal")
            # sum and max of both bands: abnormal_sum (m²) and day_max (newest picture) are the ones used
            res = area.addBands(last).reduceRegions(
                collection=fc, reducer=ee.Reducer.sum().combine(ee.Reducer.max(), sharedInputs=True), scale=SCALE_M, tileScale=16)
            res = res.map(lambda f: f.set("area_m2", f.geometry().area(100)).setGeometry(None))
            for f in res.getInfo()["features"]:
                p = f["properties"]
                a = p["area_m2"] or 0
                ab = p.get("abnormal_sum") or 0.0
                day = p.get("day_max")
                if day is None:  # no picture over this upazila in the window
                    continue
                out[p["node_id"]] = {"frac": round(ab / a, 4) if a else 0.0, "km2": round(ab / 1e6, 2),
                                     "last_day": (EPOCH + timedelta(days=int(day))).isoformat()}
            log.info("water now %s: %d upazilas", division, len(out))
    # a picture of the unusual water for the map, tile by tile; patches narrower than about 200 m (speckle) are left out
    TILES.mkdir(parents=True, exist_ok=True)
    tiles = []
    cw, rh = (BOX[2] - BOX[0]) / GRID[0], (BOX[3] - BOX[1]) / GRID[1]
    for r in range(GRID[1]):
        for c in range(GRID[0]):
            w, s = BOX[0] + c * cw, BOX[1] + r * rh
            box = ee.Geometry.Rectangle([w, s, w + cw, s + rh])
            mask, _, _ = flood_mask(ev, box)
            img = (mask.select("abnormal").reproject(crs="EPSG:4326", scale=100)
                   .focal_min(100, "circle", "meters").focal_max(100, "circle", "meters"))
            url = img.selfMask().visualize(palette=["1d8cf8"]).getThumbURL({"region": box, "dimensions": 600, "format": "png"})
            name = f"t{r}{c}.png"
            (TILES / name).write_bytes(urllib.request.urlopen(url, timeout=600).read())
            tiles.append({"file": name, "bounds": [[s, w], [s + rh, w + cw]]})
    flooded = [i for i, v in out.items() if v["frac"] >= 0.05]
    data = {
        "computed_at": datetime.now(timezone.utc).isoformat(), "window": [ev["post"][0], today.isoformat()],
        "method": METHOD, "flood_rule": 0.05, "mapped": len(out),
        "latest_picture": max((v["last_day"] for v in out.values()), default=None),
        "upazilas_flooded": len(flooded),
        "top": [{"id": i, "name": names.get(i, ("?", ""))[0], "district": names.get(i, ("?", ""))[1],
                 "pct": round(out[i]["frac"] * 100, 1), "last_day": out[i]["last_day"]}
                for i in sorted(out, key=lambda i: -out[i]["frac"])[:10]],
        "tiles": tiles,
        "upazilas": out,
    }
    OUT.write_text(json.dumps(data, ensure_ascii=False), encoding="utf-8")
    log.info("Water now: %d upazilas mapped, %d with unusual water over 5%%", len(out), len(flooded))
    return data


def load() -> dict | None:
    return json.loads(OUT.read_text(encoding="utf-8")) if OUT.exists() else None


def refresh() -> None:
    try:
        build()
    except Exception:
        log.exception("Water-now build failed")


def needs_build(max_age_hours: int = 24) -> bool:
    if not OUT.exists() or not TILES.exists():
        return True
    return datetime.now(timezone.utc).timestamp() - OUT.stat().st_mtime > max_age_hours * 3600
