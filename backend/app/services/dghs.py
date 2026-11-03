"""Government hospitals from the official DGHS Facility Registry (public API, Ministry of Health
and Family Welfare): https://hrm.dghs.gov.bd/public/facility-registry

Each facility is checked before it is used:
  - it must be active and have coordinates inside Bangladesh;
  - its coordinates must fall in an upazila polygon (BBS boundaries);
  - that upazila must match the upazila DGHS itself records for it (name comparison), else the
    record is kept but marked unverified and is never shown to people.
"""

import difflib
import hashlib
import json
import logging
import time
from datetime import datetime, timezone

import httpx
from geoalchemy2.shape import from_shape
from shapely.geometry import Point
from sqlalchemy import delete, text

from app.core.config import settings
from app.db.models import HealthFacility, IngestRun
from app.db.session import SessionLocal, engine
from app.services.places import norm

log = logging.getLogger(__name__)
API = "https://hrm.dghs.gov.bd/public/facilities/json"
SOURCE = "dghs-facility-registry"
# government hospitals that treat patients (not offices, clinics or private facilities)
TYPES = {29: "Upazila Health Complex", 28: "District/General Hospital", 24: "50-bed Hospital",
         25: "31-bed Hospital", 26: "20-bed Hospital", 27: "10-bed Hospital", 73: "25-bed Hospital",
         74: "30-bed Hospital", 75: "300-500 bed Hospital", 72: "District Level Hospital", 94: "General Hospital",
         5: "Medical College Hospital", 3: "Medical University Hospital", 41: "City Corporation / Municipality Hospital"}


def _fetch_type(client: httpx.Client, type_id: int) -> list[dict]:
    items, page = [], 1
    while True:
        r = client.get(API, params={"facility_type_id": type_id, "page": page})
        r.raise_for_status()
        d = r.json()["data"]
        items += d["items"]
        if page >= d["last_page"]:
            return items
        page += 1
        time.sleep(0.5)  # be gentle with a government server


def _same_upazila(dghs_name: str | None, ours: str | None) -> bool:
    if not dghs_name or not ours:
        return False
    a, b = norm(dghs_name), norm(ours)
    return a == b or a in b or b in a or difflib.SequenceMatcher(None, a, b).ratio() >= 0.8


def load_hospitals() -> dict:
    with SessionLocal() as db:
        run = IngestRun(source=SOURCE, status="running", meta={"url": API, "types": TYPES})
        db.add(run)
        db.commit()
        try:
            raw = []
            with httpx.Client(timeout=90, headers={"User-Agent": "FloodShieldBD/0.1 (flood early warning research)"}) as c:
                for tid in TYPES:
                    raw += _fetch_type(c, tid)
                    log.info("DGHS type %s: %d so far", tid, len(raw))
            blob = json.dumps(raw, ensure_ascii=False).encode()
            raw_dir = settings.data_dir / "raw" / "dghs"
            raw_dir.mkdir(parents=True, exist_ok=True)
            path = raw_dir / f"hospitals_{datetime.now(timezone.utc):%Y%m%dT%H%MZ}.json"
            path.write_bytes(blob)

            db.execute(delete(HealthFacility))
            for f in raw:
                lat, lon = f.get("latitude"), f.get("longitude")
                ok_coord = lat is not None and lon is not None and 20.5 <= float(lat) <= 26.7 and 88.0 <= float(lon) <= 92.7
                db.add(HealthFacility(
                    id=f["id"], code=f.get("code"), name=f["name"], name_bn=f.get("name_bn"),
                    facility_type=f.get("facility_type_name"), is_active=f.get("is_active") in (1, "1", True, "Yes"),
                    beds=f.get("latest_bed_count") or f.get("approved_bed_number"),
                    has_emergency=f.get("has_emergency"), mobile=f.get("mobile_1"),
                    dghs_division=f.get("division_name"), dghs_district=f.get("district_name"),
                    dghs_upazila=f.get("upazila_name"),
                    geom=from_shape(Point(float(lon), float(lat)), srid=4326) if ok_coord else None,
                    dghs_updated_at=f.get("updated_at"), verified=False,
                ))
            db.flush()
            run.status, run.n_nodes = "done", len(raw)
            run.raw_path = str(path.relative_to(settings.data_dir.parent))
            run.sha256 = hashlib.sha256(blob).hexdigest()
            run.finished_at = datetime.now(timezone.utc)
            db.commit()
        except Exception as e:
            db.rollback()
            run = db.get(IngestRun, run.id)
            run.status, run.error, run.finished_at = "failed", str(e)[:2000], datetime.now(timezone.utc)
            db.commit()
            raise

    # place each facility in our upazila polygons and cross-check against DGHS's own upazila
    with engine.begin() as c:
        c.execute(text("""
            update health_facilities h set node_id = n.id from nodes n
            where h.geom is not null and n.node_type = 'upazila' and st_contains(n.geom, h.geom)"""))
        rows = c.execute(text("""select h.id, h.dghs_upazila, n.name, n.district, h.dghs_district
                                 from health_facilities h join nodes n on n.id = h.node_id""")).all()
        ok = [r.id for r in rows if _same_upazila(r.dghs_upazila, r.name)
              or (_same_upazila(r.dghs_district, r.district) and (r.dghs_upazila or "").lower() in ("", "n/a"))]
        if ok:
            c.execute(text("update health_facilities set verified = true where id = any(:ids) and is_active"), {"ids": ok})
        stats = dict(c.execute(text("""select 'total', count(*) from health_facilities union all
            select 'with_coords', count(*) from health_facilities where geom is not null union all
            select 'in_upazila', count(*) from health_facilities where node_id is not null union all
            select 'verified', count(*) from health_facilities where verified""")).all())
    return stats
