"""P5: impact of flooding on critical assets, and ripple effects beyond the flooded upazilas.

Direct: OSM assets inside flooded upazilas, km of major road inside them.
Ripple (modelled, stated as such in every response):
  - power: each upazila is assumed to be served by its nearest OSM substation; if that
    substation's upazila floods, the served upazila may lose power
  - health access: if every hospital within HEALTH_RADIUS_KM of an upazila is in a flooded
    upazila, its residents may lose hospital access
"""

from sqlalchemy import text

from app.db.session import engine

HEALTH_RADIUS_KM = 25
ASSUMPTIONS = [
    "Assets and roads come from OpenStreetMap; coverage in Bangladesh is incomplete, so counts are lower bounds.",
    "An upazila is treated as flooded as a whole; real flooding is patchy inside an upazila.",
    "Power ripple assumes each upazila is fed by its nearest substation (no grid topology data is public).",
    f"Health ripple counts an upazila when every hospital within {HEALTH_RADIUS_KM} km lies in a flooded upazila.",
]


def impact(flooded: list[str]) -> dict:
    """Direct and ripple impact if the given upazilas flood."""
    if not flooded:
        return {"flooded_upazilas": 0, "direct": {}, "road_km": {}, "power_ripple": [], "health_ripple": [],
                "assumptions": ASSUMPTIONS}
    p = {"ids": flooded, "r": HEALTH_RADIUS_KM * 1000}
    with engine.connect() as c:
        direct = dict(c.execute(text(
            "select kind, count(*) from assets where node_id = any(:ids) group by kind"), p).all())
        road_km = {h: round(km, 1) for h, km in c.execute(text("""
            select r.highway, sum(st_length(st_intersection(r.geom, n.geom)::geography)) / 1000
            from roads r join nodes n on n.id = any(:ids) and st_intersects(r.geom, n.geom)
            group by r.highway"""), p).all()}
        power = c.execute(text("""
            with served as (
                select u.id, u.name, u.district, s.node_id as sub_upz, s.name as sub_name
                from nodes u
                cross join lateral (
                    select a.node_id, a.name from assets a where a.kind = 'substation'
                    order by a.geom <-> st_setsrid(st_point(u.point_lon, u.point_lat), 4326) limit 1) s
                where u.node_type = 'upazila')
            select id, name, district, sub_name from served
            where sub_upz = any(:ids) and not (id = any(:ids))
            order by district, name"""), p).mappings().all()
        health = c.execute(text("""
            select u.id, u.name, u.district,
                   count(*) as hospitals_near
            from nodes u
            join assets a on a.kind = 'hospital'
                and st_dwithin(a.geom::geography, st_setsrid(st_point(u.point_lon, u.point_lat), 4326)::geography, :r)
            where u.node_type = 'upazila' and not (u.id = any(:ids))
            group by u.id, u.name, u.district
            having bool_and(a.node_id = any(:ids))
            order by u.district, u.name"""), p).mappings().all()
    return {"flooded_upazilas": len(flooded), "direct": direct, "road_km": road_km,
            "power_ripple": [dict(r) for r in power], "health_ripple": [dict(r) for r in health],
            "assumptions": ASSUMPTIONS}
