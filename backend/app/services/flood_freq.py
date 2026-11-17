"""Where water stands in the monsoon, upazila by upazila: in how many monsoons (2017-2025) each ~60 m square had
water that was not there in the dry season, from Sentinel-1 radar (scripts/flood_frequency.py has the method).

Made on first request for an upazila (about 10-20 s on Earth Engine) and kept as a picture, so later visits are
instant; a background job also fills them in ahead of time. Years without radar pictures over the area are left out,
and the number of years used is stored with each picture.
"""

import json
import logging
import sys
import threading
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

from sqlalchemy import func, select

from app.core.config import settings
from app.db.models import Node
from app.db.session import SessionLocal

log = logging.getLogger(__name__)
OUT = settings.data_dir / "flood_freq_upz"
PAD = 0.03  # degrees around the upazila, so the picture also shows its edges
_locks: dict[str, threading.Lock] = {}
_guard = threading.Lock()


def _ff():
    for p in (Path("/srv/scripts"), Path(__file__).resolve().parents[3] / "scripts"):
        if (p / "flood_frequency.py").exists() and str(p) not in sys.path:
            sys.path.insert(0, str(p))
    import flood_frequency  # noqa: E402
    return flood_frequency


def paths(node_id: str) -> tuple[Path, Path]:
    safe = "".join(ch for ch in node_id if ch.isalnum() or ch == "_")
    return OUT / f"{safe}.png", OUT / f"{safe}.json"


def get(node_id: str) -> dict:
    png, meta = paths(node_id)
    if meta.exists() and png.exists():
        return json.loads(meta.read_text(encoding="utf-8"))
    with _guard:
        lock = _locks.setdefault(node_id, threading.Lock())
    with lock:  # two visitors at once: the second waits for the first picture instead of making another
        if meta.exists() and png.exists():
            return json.loads(meta.read_text(encoding="utf-8"))
        return build(node_id)


def build(node_id: str) -> dict:
    import ee

    from app.services import s1_floods

    ff = _ff()
    with SessionLocal() as db:
        b = db.execute(select(func.ST_XMin(Node.geom), func.ST_YMin(Node.geom), func.ST_XMax(Node.geom), func.ST_YMax(Node.geom))
                       .where(Node.id == node_id)).first()
    if not b:
        raise KeyError(node_id)
    box = [b[0] - PAD, b[1] - PAD, b[2] + PAD, b[3] + PAD]
    s1_floods.init_ee()
    region = ee.Geometry.Rectangle(box)
    years = ff.usable_years(region)
    if not years:
        raise RuntimeError("No radar pictures over this area")
    img = ff.image(region, years)
    keys = sorted(ff.PALETTE)
    vis = img.updateMask(img.neq(255)).visualize(min=0, max=9, palette=[ff.PALETTE[k] for k in keys])
    url = vis.getThumbURL({"region": region, "dimensions": 1400, "format": "png"})
    OUT.mkdir(parents=True, exist_ok=True)
    png, meta = paths(node_id)
    png.write_bytes(urllib.request.urlopen(url, timeout=600).read())
    data = {"node_id": node_id, "bounds": [[box[1], box[0]], [box[3], box[2]]], "years": years, "n_years": len(years),
            "palette": ff.PALETTE, "computed_at": datetime.now(timezone.utc).isoformat(),
            "method": "Sentinel-1 VH, wettest picture of 1 Jun-31 Oct vs the dry season (Feb-Mar), ratio > 1.25; JRC permanent "
                      "water (>80%) left out; count of monsoons with water, 90 m median; slopes > 5% left out (value 255)"}
    meta.write_text(json.dumps(data), encoding="utf-8")
    log.info("flood frequency picture for %s: %d years", node_id, len(years))
    return data


def fill_all() -> None:
    """Make the pictures ahead of time, one upazila after another (skips ones already made)."""
    with SessionLocal() as db:
        ids = db.scalars(select(Node.id).where(Node.node_type == "upazila").order_by(Node.id)).all()
    for i in ids:
        try:
            get(i)
        except Exception:
            log.exception("flood frequency picture for %s failed", i)
