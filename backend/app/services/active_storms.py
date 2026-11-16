"""Active tropical cyclones near Bangladesh, from GDACS (European Commission JRC and UN OCHA).

GDACS lists current tropical cyclones with their position, alert level and the track forecast it takes from JTWC.
This is not the Bangladesh Meteorological Department's signal; the page and bot link to BMD for that.
Results are cached for 30 minutes so visitors do not each call GDACS.
"""

import logging
import math
import time
from datetime import date, timedelta

import httpx

log = logging.getLogger(__name__)
LIST = "https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH"
GEOM = "https://www.gdacs.org/gdacsapi/api/polygons/getgeometry"
REGION = (70.0, 0.0, 100.0, 30.0)   # west, south, east, north: the Bay of Bengal, Arabian Sea edge and Myanmar
BD = (90.35, 23.7)                  # rough centre of Bangladesh, for "how far away"
TTL = 30 * 60
_cache: dict = {}


def _km(a, b) -> float:
    k = math.cos(math.radians((a[1] + b[1]) / 2))
    return math.hypot((a[0] - b[0]) * k * 111.32, (a[1] - b[1]) * 110.57)


def _storm(client: httpx.Client, f: dict) -> dict:
    p = f["properties"]
    pos = f["geometry"]["coordinates"]
    geo = client.get(GEOM, params={"eventtype": "TC", "eventid": p["eventid"], "episodeid": p["episodeid"]}).json()
    lines, areas, pts = [], [], []
    for g in geo.get("features", []):
        gp, kind = g["properties"], g["geometry"]["type"]
        cls = str(gp.get("Class") or "")
        if kind == "LineString":
            fc = str(gp.get("forecast") or "").lower() in ("true", "1", "yes") or "forecast" in cls.lower()
            lines.append({"type": "Feature", "geometry": g["geometry"], "properties": {"forecast": fc}})
            pts += g["geometry"]["coordinates"]
        elif kind == "Polygon" and cls.startswith("Poly_"):
            areas.append({"type": "Feature", "geometry": g["geometry"], "properties": {"level": cls[5:].lower()}})
    near = min((_km(q, BD) for q in pts + [pos]), default=None)
    return {
        "id": p["eventid"], "episode": p["episodeid"], "name": p.get("eventname") or p.get("name"),
        "alert": (p.get("alertlevel") or "").lower(), "position": pos, "from": p.get("fromdate"), "to": p.get("todate"),
        "countries": p.get("affectedcountries") and [c.get("countryname") for c in p["affectedcountries"]] or [],
        "now_km_from_bd": round(_km(pos, BD)), "closest_km_from_bd": round(near) if near is not None else None,
        "report": (p.get("url") or {}).get("report"), "track": {"type": "FeatureCollection", "features": lines},
        "wind_areas": {"type": "FeatureCollection", "features": areas},
    }


def active(event: int | None = None, episode: int | None = None) -> dict:
    """Current storms in the region. With event/episode, that one storm (old ones too) for testing the display."""
    key = (event, episode)
    hit = _cache.get(key)
    if hit and time.time() - hit[0] < TTL:
        return hit[1]
    out = {"source": "GDACS (EC JRC / UN OCHA), track forecast from JTWC", "storms": [], "checked": int(time.time())}
    try:
        with httpx.Client(timeout=30, headers={"User-Agent": "FloodShield-BD"}) as c:
            if event:
                ev = c.get("https://www.gdacs.org/gdacsapi/api/events/geteventdata", params={"eventtype": "TC", "eventid": event}).json()
                ev["properties"]["episodeid"] = episode or ev["properties"].get("episodeid")
                out["storms"].append({**_storm(c, ev), "test": True})
            else:
                today = date.today()
                r = c.get(LIST, params={"eventlist": "TC", "fromdate": (today - timedelta(days=10)).isoformat(),
                                        "todate": today.isoformat()})
                r.raise_for_status()
                # GDACS answers 204 with an empty body when there has been no storm anywhere: that is "none", not an error
                lst = r.json() if r.status_code != 204 and r.content.strip() else {}
                for f in lst.get("features", []):
                    x, y = f["geometry"]["coordinates"][:2]
                    current = str(f["properties"].get("iscurrent")).lower() == "true"
                    if current and REGION[0] <= x <= REGION[2] and REGION[1] <= y <= REGION[3]:
                        out["storms"].append(_storm(c, f))
    except Exception as e:  # GDACS down: say so rather than "no storm"
        log.warning("GDACS check failed: %s", e)
        out["error"] = "GDACS could not be reached"
        if hit:
            return hit[1]
    _cache[key] = (time.time(), out)
    return out
