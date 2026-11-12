"""Landslide chance now: NASA LHASA version 2 nowcast, read for Bangladesh only.

LHASA (Stanley et al. 2021, Front. Earth Sci. 9:640043; product doi 10.5067/8VKQDQFFOTS3) gives the probability of a
landslide in each ~1 km square from recent satellite rain (IMERG), slope, geology and other factors. NASA publishes a
global GeoTIFF about once a day on a best-effort basis (https://portal.nccs.nasa.gov/datashare/landslides/). The file
is tiled, so only the Bangladesh window is read over HTTP (a few MB of the ~140 MB file).

NASA defines no hazard levels for version 2. The paper tested the model at a probability of 0.12 "solely for
comparison", so the site shows the probability itself and marks 12% only as that reference, never as an official
warning level. Flat land (slope under about 10 degrees) has no value: LHASA does not predict landslides there.
This has not been checked against landslides in Bangladesh by us; it is supporting information.
"""

import json
import logging
import re
import struct
import urllib.request
import zlib
from datetime import datetime, timezone

import numpy as np
from sqlalchemy import func, select

from app.core.config import settings
from app.db.models import Node
from app.db.session import SessionLocal

log = logging.getLogger(__name__)
BASE = "https://portal.nccs.nasa.gov/datashare/landslides/nrt/hazard/tif/"
OUT = settings.data_dir / "landslide_now.json"
PNG = settings.data_dir / "landslide_now.png"
BOX = (88.0, 20.5, 92.8, 26.7)  # west, south, east, north
RES = 1 / 120                   # 30 arc-seconds
REF = 0.12                      # the paper's comparison threshold (not a NASA warning level)


def _newest() -> str:
    with urllib.request.urlopen(BASE, timeout=60) as r:
        names = sorted(set(re.findall(r"(\d{8}T\d{4})\.tif", r.read().decode("utf-8", "replace"))))
    if not names:
        raise RuntimeError("No LHASA files listed")
    return names[-1]


def _read(name: str) -> np.ndarray:
    """The Bangladesh window, north at the top, NaN where LHASA gives no value."""
    import rasterio
    from rasterio.windows import Window

    with rasterio.open(f"/vsicurl/{BASE}{name}.tif") as s:
        t = s.transform
        if abs(t.a - RES) > 1e-9 or abs(t.e - RES) > 1e-9 or t.c != -180.0:
            raise RuntimeError(f"Unexpected LHASA grid {t}")  # the file's rows run south to north
        c0 = round((BOX[0] - t.c) / RES); c1 = round((BOX[2] - t.c) / RES)
        r0 = round((BOX[1] - t.f) / RES); r1 = round((BOX[3] - t.f) / RES)
        a = s.read(1, window=Window(c0, r0, c1 - c0, r1 - r0)).astype("float32")
    a[(a < 0) | (a > 1)] = np.nan
    return a[::-1]  # north up


def _png(a: np.ndarray) -> bytes:
    """RGBA picture: under 5% faint yellow, 5-12% orange, 12% and more red; no value = transparent."""
    h, w = a.shape
    px = np.zeros((h, w, 4), np.uint8)
    for lo, hi, rgba in ((0.0, 0.05, (250, 220, 90, 70)), (0.05, REF, (245, 140, 30, 170)), (REF, 1.01, (215, 40, 30, 220))):
        px[(a >= lo) & (a < hi)] = rgba
    raw = b"".join(b"\x00" + px[y].tobytes() for y in range(h))

    def chunk(t, d):
        return struct.pack(">I", len(d)) + t + d + struct.pack(">I", zlib.crc32(t + d) & 0xFFFFFFFF)
    return (b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", struct.pack(">IIBBBBB", w, h, 8, 6, 0, 0, 0))
            + chunk(b"IDAT", zlib.compress(raw, 9)) + chunk(b"IEND", b""))


def _per_upazila(a: np.ndarray) -> dict:
    from rasterio.features import rasterize
    from rasterio.transform import from_origin
    from shapely.geometry import shape

    with SessionLocal() as db:
        rows = db.execute(select(Node.id, Node.name, Node.district, func.ST_AsGeoJSON(Node.geom))
                          .where(Node.node_type == "upazila")).all()
    h, w = a.shape
    tr = from_origin(BOX[0], BOX[3], RES, RES)
    ids = rasterize(((shape(json.loads(g)), k + 1) for k, (_, _, _, g) in enumerate(rows)),
                    out_shape=(h, w), transform=tr, fill=0, dtype="int32", all_touched=True)
    out = {}
    for k, (nid, name, district, _) in enumerate(rows):
        v = a[ids == k + 1]
        v = v[np.isfinite(v)]
        if len(v) == 0:
            continue
        out[nid] = {"name": name, "district": district, "max": round(float(v.max()), 4),
                    "cells": int(len(v)), "over_ref": int((v >= REF).sum())}
    return out


def build() -> dict:
    name = _newest()
    a = _read(name)
    ups = _per_upazila(a)
    day = f"{name[:4]}-{name[4:6]}-{name[6:8]}"
    top = sorted(({"id": k, **v} for k, v in ups.items()), key=lambda r: -r["max"])[:10]
    data = {"file": name, "day": day, "computed_at": datetime.now(timezone.utc).isoformat(), "ref": REF,
            "bounds": [[BOX[1], BOX[0]], [BOX[3], BOX[2]]], "upazilas_with_value": len(ups),
            "upazilas_over_ref": sum(1 for v in ups.values() if v["over_ref"]), "top": top, "upazilas": ups,
            "source": "NASA LHASA v2 nowcast (Stanley et al. 2021), portal.nccs.nasa.gov/datashare/landslides"}
    PNG.write_bytes(_png(a))
    tmp = OUT.with_suffix(".tmp")
    tmp.write_text(json.dumps(data, ensure_ascii=False), encoding="utf-8")
    tmp.replace(OUT)
    log.info("Landslide now: %s, %d upazilas with a value, %d at or over %.2f", name, len(ups), data["upazilas_over_ref"], REF)
    return data


def load() -> dict | None:
    try:
        return json.loads(OUT.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return None


def refresh() -> None:
    try:
        build()
    except Exception:
        log.exception("Landslide-now build failed (NASA serves these files best-effort)")


def needs_build(max_age_hours: int = 24) -> bool:
    return not OUT.exists() or datetime.now(timezone.utc).timestamp() - OUT.stat().st_mtime > max_age_hours * 3600
