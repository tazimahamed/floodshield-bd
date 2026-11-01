"""P5: critical assets from OpenStreetMap, linked to the upazila they are in.

Source: the Geofabrik Bangladesh extract (daily OSM snapshot, MD5-checked), read locally
with pyosmium. Kinds: hospital, clinic, school, college, shelter (incl. cyclone/flood
shelters), substation, power_plant, and major roads (motorway/trunk/primary). OSM coverage
in Bangladesh is incomplete, so counts are lower bounds; every row keeps its OSM id.
"""

import hashlib
import logging
from datetime import datetime, timezone

import httpx
import osmium
from geoalchemy2.shape import from_shape
from shapely.geometry import LineString, Point
from sqlalchemy import delete, text

from app.core.config import settings
from app.db.models import Asset, IngestRun, Road
from app.db.session import SessionLocal, engine

log = logging.getLogger(__name__)
PBF_URL = "https://download.geofabrik.de/asia/bangladesh-latest.osm.pbf"
PBF_PATH = settings.data_dir / "raw" / "osm" / "bangladesh-latest.osm.pbf"
SOURCE = "osm-geofabrik"
ROAD_TYPES = ("motorway", "trunk", "primary")


def _kind(tags) -> str | None:
    a, p, e, b = tags.get("amenity"), tags.get("power"), tags.get("emergency"), tags.get("building")
    if a in ("hospital", "clinic"):
        return a
    if a == "school":
        return "school"
    if a in ("college", "university"):
        return "college"
    if a == "shelter" or e in ("shelter", "assembly_point") or b in ("shelter", "cyclone_shelter"):
        return "shelter"
    if p == "substation":
        return "substation"
    if p == "plant":
        return "power_plant"
    return None


class _Handler(osmium.SimpleHandler):
    def __init__(self):
        super().__init__()
        self.assets, self.roads = [], []

    def _add(self, prefix, oid, tags, lon, lat):
        kind = _kind(tags)
        if kind:
            self.assets.append((f"{prefix}{oid}", kind, tags.get("name:en") or tags.get("name"),
                                tags.get("name:bn"), lon, lat))

    def node(self, n):
        if n.location.valid():
            self._add("n", n.id, n.tags, n.location.lon, n.location.lat)

    def way(self, w):
        pts = [(nd.lon, nd.lat) for nd in w.nodes if nd.location.valid()]
        if not pts:
            return
        if w.tags.get("highway") in ROAD_TYPES and len(pts) >= 2:
            self.roads.append((w.id, w.tags["highway"], w.tags.get("ref"),
                               w.tags.get("name:en") or w.tags.get("name"), pts))
        if _kind(w.tags):  # building / area: use the mean of its nodes as the point
            self._add("w", w.id, w.tags, sum(p[0] for p in pts) / len(pts), sum(p[1] for p in pts) / len(pts))


def download() -> tuple[str, str]:
    """Fetch the extract and check it against Geofabrik's published MD5."""
    PBF_PATH.parent.mkdir(parents=True, exist_ok=True)
    with httpx.Client(timeout=1800, follow_redirects=True) as c:
        expected = c.get(PBF_URL + ".md5").text.split()[0]
        with c.stream("GET", PBF_URL) as r, open(PBF_PATH, "wb") as f:
            r.raise_for_status()
            for chunk in r.iter_bytes(1 << 20):
                f.write(chunk)
    md5 = hashlib.md5(PBF_PATH.read_bytes()).hexdigest()
    if md5 != expected:
        raise RuntimeError(f"OSM extract MD5 mismatch: {md5} != {expected}")
    return md5, hashlib.sha256(PBF_PATH.read_bytes()).hexdigest()


def load_assets(fetch: bool = True) -> dict:
    with SessionLocal() as db:
        run = IngestRun(source=SOURCE, status="running", meta={"url": PBF_URL})
        db.add(run)
        db.commit()
        try:
            md5, sha = download() if fetch else (None, hashlib.sha256(PBF_PATH.read_bytes()).hexdigest())
            h = _Handler()
            h.apply_file(str(PBF_PATH), locations=True)
            db.execute(delete(Asset))
            db.execute(delete(Road))
            db.add_all(Asset(id=i, kind=k, name=n, name_bn=nb, geom=from_shape(Point(x, y), srid=4326))
                       for i, k, n, nb, x, y in h.assets)
            db.add_all(Road(id=i, highway=hw, ref=ref, name=n, geom=from_shape(LineString(pts), srid=4326))
                       for i, hw, ref, n, pts in h.roads)
            run.status, run.n_nodes, run.sha256 = "done", len(h.assets), sha
            run.raw_path = str(PBF_PATH.relative_to(settings.data_dir.parent))
            run.meta = {"url": PBF_URL, "md5": md5, "roads": len(h.roads)}
            run.finished_at = datetime.now(timezone.utc)
            db.commit()
        except Exception as e:
            db.rollback()
            run = db.get(IngestRun, run.id)
            run.status, run.error, run.finished_at = "failed", str(e)[:2000], datetime.now(timezone.utc)
            db.commit()
            raise

    with engine.begin() as c:  # which upazila each asset is in
        c.execute(text("""
            update assets a set node_id = n.id from nodes n
            where n.node_type = 'upazila' and st_contains(n.geom, a.geom)"""))
        c.execute(text("delete from assets where node_id is null"))  # outside the upazila polygons
        counts = dict(c.execute(text("select kind, count(*) from assets group by kind")).all())
    return {"assets": counts, "roads": len(h.roads)}
