"""Load real upazila boundaries (geoBoundaries / BBS + OCHA) into the nodes table."""

import json
from pathlib import Path

from geoalchemy2.shape import from_shape
from shapely.geometry import MultiPolygon, shape
from shapely.strtree import STRtree

from app.core.config import settings
from app.db.models import Node
from app.db.session import SessionLocal

BOUNDARY_DIR = settings.data_dir / "raw" / "boundaries"
SOURCE = "geoBoundaries gbOpen BGD (BBS, OCHA ROAP), CC BY 3.0 IGO"
SPELLING_FIXES = {"Rajshani": "Rajshahi"}  # typo in the source ADM1 file


def _features(name: str) -> list[dict]:
    return json.loads(Path(BOUNDARY_DIR / name).read_text(encoding="utf-8"))["features"]


def _parent_lookup(features: list[dict]):
    geoms = [shape(f["geometry"]) for f in features]
    names = [SPELLING_FIXES.get(n, n) for n in (f["properties"]["shapeName"] for f in features)]
    tree = STRtree(geoms)

    def find(point) -> str | None:
        for i in tree.query(point):
            if geoms[i].contains(point):
                return names[i]
        nearest = tree.nearest(point)
        return names[nearest] if nearest is not None else None

    return find


def load_upazilas() -> int:
    division_of = _parent_lookup(_features("bgd_adm1_simplified.geojson"))
    district_of = _parent_lookup(_features("bgd_adm2_simplified.geojson"))

    with SessionLocal() as db:
        for f in _features("bgd_adm3_simplified.geojson"):
            geom = shape(f["geometry"])
            if geom.geom_type == "Polygon":
                geom = MultiPolygon([geom])
            pt = geom.representative_point()
            props = f["properties"]
            db.merge(Node(
                id=f"upz_{props['shapeID']}",
                node_type="upazila",
                name=props["shapeName"],
                district=district_of(pt),
                division=division_of(pt),
                geom=from_shape(geom, srid=4326),
                point_lat=round(pt.y, 4),
                point_lon=round(pt.x, 4),
                source=SOURCE,
            ))
        db.commit()
        return db.query(Node).filter(Node.node_type == "upazila").count()
