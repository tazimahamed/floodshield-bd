"""Build the hydrological graph: every HydroBASINS level-7 basin that drains into Bangladesh
(the Ganges-Brahmaputra-Meghna upstream in India, Nepal, Bhutan, China and Myanmar), the
basin-to-basin drainage edges, upazila-to-basin membership and the major HydroRIVERS reaches.

Source data (Lehner & Grill 2013, HydroSHEDS v1) lives in data/raw/hydrosheds/.
"""

import json
from pathlib import Path

import shapefile
from geoalchemy2.shape import from_shape
from shapely.geometry import LineString, MultiPolygon, shape
from shapely.ops import unary_union
from shapely.strtree import STRtree
from sqlalchemy import delete, text

from app.core.config import settings
from app.db.models import Edge, Node, River
from app.db.session import SessionLocal, engine

HYDRO_DIR = settings.data_dir / "raw" / "hydrosheds"
BASIN_SHP = HYDRO_DIR / "basins" / "hybas_as_lev07_v1c.shp"
RIVER_SHP = HYDRO_DIR / "rivers" / "HydroRIVERS_v10_as_shp" / "HydroRIVERS_v10_as.shp"
BASIN_SOURCE = "HydroBASINS v1c level 7 (Lehner & Grill 2013, HydroSHEDS)"
REGION = (70.0, 18.0, 105.0, 35.0)  # lon/lat box containing the whole GBM system
MIN_UPLAND_BD = 1_000.0  # km2: reaches kept in and near Bangladesh
MIN_UPLAND_UP = 20_000.0  # km2: only main stems upstream


def _bangladesh():
    path = settings.data_dir / "raw" / "boundaries" / "bgd_adm1_simplified.geojson"
    feats = json.loads(Path(path).read_text(encoding="utf-8"))["features"]
    return unary_union([shape(f["geometry"]) for f in feats])


def _in_region(bbox) -> bool:
    return not (bbox[0] > REGION[2] or bbox[2] < REGION[0] or bbox[1] > REGION[3] or bbox[3] < REGION[1])


def upstream_basins(bd) -> dict[int, tuple[dict, object]]:
    """Basins intersecting Bangladesh plus every basin that drains into them."""
    recs = {}
    for sr in shapefile.Reader(str(BASIN_SHP)).iterShapeRecords():
        if _in_region(sr.shape.bbox):
            d = sr.record.as_dict()
            recs[d["HYBAS_ID"]] = (d, shape(sr.shape.__geo_interface__))
    children: dict[int, list[int]] = {}
    for k, (d, _) in recs.items():
        children.setdefault(d["NEXT_DOWN"], []).append(k)
    keep = {k for k, (_, g) in recs.items() if g.intersects(bd)}
    stack = list(keep)
    while stack:
        for c in children.get(stack.pop(), []):
            if c not in keep:
                keep.add(c)
                stack.append(c)
    return {k: recs[k] for k in keep}


def build_graph() -> dict:
    bd = _bangladesh()
    basins = upstream_basins(bd)
    bid = {k: f"bas_{k}" for k in basins}

    with SessionLocal() as db:
        db.execute(delete(River))
        db.execute(delete(Edge))
        for k, (d, g) in basins.items():
            if g.geom_type == "Polygon":
                g = MultiPolygon([g])
            pt = g.representative_point()
            share = g.intersection(bd).area / g.area if g.intersects(bd) else 0.0
            db.merge(Node(  # merge keeps rain_forecasts rows that reference basins
                id=bid[k], node_type="basin", name=f"Basin {d['PFAF_ID']}", bd_share=round(share, 4),
                district=None, division="Bangladesh" if share >= 0.5 else "Upstream",
                geom=from_shape(g, srid=4326), point_lat=round(pt.y, 4), point_lon=round(pt.x, 4),
                source=BASIN_SOURCE,
            ))
        db.flush()
        n_drain = 0
        for k, (d, _) in basins.items():
            if d["NEXT_DOWN"] in basins:
                db.add(Edge(src=bid[k], dst=bid[d["NEXT_DOWN"]], edge_type="drains_to",
                            weight=1.0, source=BASIN_SOURCE))
                n_drain += 1
        db.commit()

    # upazila -> basin, weighted by the share of the upazila's area inside that basin
    with engine.begin() as c:
        n_member = c.execute(text("""
            insert into edges (src, dst, edge_type, weight, source)
            select src, dst, 'in_basin', share, :src from (
              select u.id as src, b.id as dst,
                     st_area(st_intersection(u.geom, b.geom)::geography) / st_area(u.geom::geography) as share
              from nodes u join nodes b on b.node_type = 'basin' and st_intersects(u.geom, b.geom)
              where u.node_type = 'upazila') s
            where share > 0.01
        """), {"src": BASIN_SOURCE}).rowcount

    return {"basins": len(basins), "drains_to": n_drain, "in_basin": n_member,
            "rivers": load_rivers(bd, basins, bid)}


def load_rivers(bd, basins, bid) -> int:
    ids = list(basins)
    geoms = [basins[k][1] for k in ids]
    tree = STRtree(geoms)
    near_bd = bd.buffer(0.3)
    rows = []
    for sr in shapefile.Reader(str(RIVER_SHP)).iterShapeRecords():
        if not _in_region(sr.shape.bbox):
            continue
        d = sr.record.as_dict()
        if d["UPLAND_SKM"] < MIN_UPLAND_BD:
            continue
        line = LineString(sr.shape.points)
        mid = line.interpolate(0.5, normalized=True)
        if d["UPLAND_SKM"] < MIN_UPLAND_UP and not near_bd.contains(mid):
            continue
        basin = next((ids[i] for i in tree.query(mid) if geoms[i].contains(mid)), None)
        if basin is None:
            continue
        rows.append(River(
            id=d["HYRIV_ID"], next_down=d["NEXT_DOWN"], main_riv=d["MAIN_RIV"], basin_id=bid[basin],
            length_km=d["LENGTH_KM"], upland_skm=d["UPLAND_SKM"], dis_av_cms=d["DIS_AV_CMS"],
            ord_stra=d["ORD_STRA"], geom=from_shape(line, srid=4326),
        ))
    with SessionLocal() as db:
        db.add_all(rows)
        db.commit()
    return len(rows)
