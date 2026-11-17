"""In how many monsoons (2017-2025) each place had water on the land, from Sentinel-1 radar.

Per year: the flood_mask method of the flood history (app/services/s1_floods.py), with the whole monsoon as one
window: the wettest radar picture of 1 Jun - 31 Oct against the dry season (Feb-Mar), ratio > 1.25, permanent water
(JRC > 80%) left out. Years without pictures over the area are left out. The yearly masks are added up and smoothed
(90 m median against radar speckle), so each ~60 m square gets 0-9. Slopes over 5% are outside the method (255), so
hills are never called "never flooded". app/services/flood_freq.py makes one picture per upazila from this.

Earth Engine computes it as a batch task into an asset (too heavy for an interactive request), then the map pictures
are cut from the asset in 12 tiles, the same grid as the daily satellite water map.

Usage (inside the app container):  python /srv/scripts/flood_frequency.py [--tiles-only]
"""

import json
import sys
import time
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))
sys.path.insert(0, "/srv/backend")

import ee  # noqa: E402

from app.core.config import settings  # noqa: E402
from app.services import s1_floods  # noqa: E402

YEARS = range(2017, 2026)
BOX = [88.0, 20.55, 92.75, 26.65]  # west, south, east, north (same as the satellite water map)
GRID = (3, 4)
SCALE = 60
OUT = settings.data_dir / "flood_freq"
ASSET = f"projects/{settings.ee_project}/assets/flood_freq_2017_2025"
# colours by number of monsoons with unusual water; 0 = none in 9 monsoons, 255 = slope (outside the method)
# warm colours for danger (blue stays for water): green = none in 9 monsoons, yellow -> red = more often
PALETTE = {0: "cfe8c4", 1: "fde68a", 2: "fcd34d", 3: "fdba74", 4: "fb923c", 5: "f97316", 6: "ef4444", 7: "dc2626", 8: "b91c1c", 9: "991b1b"}


def usable_years(region) -> list[int]:
    """Years with Sentinel-1 pictures over the region in both the dry season and the monsoon (others are left out)."""
    ok = []
    for y in YEARS:
        pre = s1_floods._s1(f"{y}-02-01", f"{y}-03-31", region, "DESCENDING").size()
        post = s1_floods._s1(f"{y}-06-01", f"{y}-10-31", region, "DESCENDING").size()
        ok.append(ee.Algorithms.If(pre.gt(0).And(post.gt(0)), y, 0))
    return [y for y in ee.List(ok).getInfo() if y]


def image(region, years=None) -> ee.Image:
    yearly = []
    permanent = ee.Image("JRC/GSW1_4/GlobalSurfaceWater").select("occurrence").gt(80)
    for y in (years if years is not None else usable_years(region)):
        # the "total" part of s1_floods.flood_mask only (its "unusual" part needs 8 more years of pictures and runs out
        # of memory over big areas): any water on land in the monsoon that was dry in the dry season. "Unusual" water
        # alone also hid places like Sylhet town, where water stands almost every year (even 2022 was not unusual there)
        # worked at 60 m (the map's own scale): reading the 10 m radar pixels runs out of memory over big upazilas
        pre = (s1_floods._s1(f"{y}-02-01", f"{y}-03-31", region, "DESCENDING").median()
               .reproject(crs="EPSG:4326", scale=SCALE).focal_mean(60, "circle", "meters"))
        post = (s1_floods._s1(f"{y}-06-01", f"{y}-10-31", region, "DESCENDING").min()
                .reproject(crs="EPSG:4326", scale=SCALE).focal_mean(60, "circle", "meters"))
        wet = post.divide(pre).gt(s1_floods.RATIO_THRESHOLD).where(permanent, 0).unmask(0)
        yearly.append(wet.toUint8())
    # radar speckle leaves single scattered pixels: a 90 m median keeps patches and drops the specks
    count = ee.ImageCollection(yearly).sum().focalMedian(90, "circle", "meters").round().toUint8()
    slope = ee.Terrain.slope(ee.Image("WWF/HydroSHEDS/03VFDEM"))
    return count.where(slope.gte(5), 255).rename("years").clip(region)


def export() -> None:
    region = ee.Geometry.Rectangle(BOX)
    try:
        ee.data.deleteAsset(ASSET)
    except Exception:
        pass
    task = ee.batch.Export.image.toAsset(image=image(region), description="flood_freq_2017_2025", assetId=ASSET,
                                         region=region, scale=SCALE, crs="EPSG:4326", maxPixels=1e10)
    task.start()
    print("export started", task.id, flush=True)
    while True:
        st = task.status()
        if st["state"] in ("COMPLETED", "FAILED", "CANCELLED"):
            print("export", st["state"], st.get("error_message", ""), flush=True)
            if st["state"] != "COMPLETED":
                raise SystemExit(1)
            return
        time.sleep(60)


def tiles() -> None:
    img = ee.Image(ASSET)
    OUT.mkdir(parents=True, exist_ok=True)
    keys = sorted(PALETTE)
    # classes 0..9 as their colours; slopes (255) left transparent
    vis = img.updateMask(img.neq(255)).visualize(min=0, max=9, palette=[PALETTE[k] for k in keys])
    out = []
    cw, rh = (BOX[2] - BOX[0]) / GRID[0], (BOX[3] - BOX[1]) / GRID[1]
    for r in range(GRID[1]):
        for c in range(GRID[0]):
            w, s = BOX[0] + c * cw, BOX[1] + r * rh
            box = ee.Geometry.Rectangle([w, s, w + cw, s + rh])
            url = vis.getThumbURL({"region": box, "dimensions": 1600, "format": "png"})
            name = f"t{r}{c}.png"
            (OUT / name).write_bytes(urllib.request.urlopen(url, timeout=900).read())
            out.append({"file": name, "bounds": [[s, w], [s + rh, w + cw]]})
            print("tile", name, flush=True)
    meta = {"computed_at": datetime.now(timezone.utc).isoformat(), "years": [YEARS[0], YEARS[-1]], "scale_m": SCALE,
            "palette": PALETTE, "tiles": out,
            "method": "Sentinel-1 per monsoon (1 Jun - 31 Oct) vs dry season, permanent water masked, unusual = wetter than the "
                      "median of the same season in other years (s1_floods.flood_mask); count of years 0-9; slopes > 5% left out"}
    (OUT / "meta.json").write_text(json.dumps(meta, indent=1), encoding="utf-8")
    print("tiles done", flush=True)


if __name__ == "__main__":
    s1_floods.init_ee()
    if "--tiles-only" not in sys.argv:
        export()
    tiles()
