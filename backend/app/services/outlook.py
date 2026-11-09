"""Daily heat and sea outlook per upazila: GFS max temperature and wind, plus wave height.

Heat levels are the Bangladesh Meteorological Department's. Waves are shown as plain numbers,
with no "safe to fish" verdict: the official signal is BMD's, not ours.
"""

import logging
import time
from datetime import date, datetime, timezone

import httpx

from app.core.config import settings
from app.db.models import DailyOutlook, Node
from app.db.session import Base, SessionLocal, engine

log = logging.getLogger(__name__)
MARINE_URL = "https://marine-api.open-meteo.com/v1/marine"
BATCH = 50
DAYS = 3
# BMD heatwave classes, degrees C (lower bound, Bangla, English)
HEAT_LEVELS = [(42, "অতি তীব্র তাপপ্রবাহ", "very severe heatwave"), (40, "তীব্র তাপপ্রবাহ", "severe heatwave"),
               (38, "মাঝারি তাপপ্রবাহ", "moderate heatwave"), (36, "মৃদু তাপপ্রবাহ", "mild heatwave")]


def heat_level(tmax: float | None) -> tuple[str, str] | None:
    if tmax is None:
        return None
    for low, bn, en in HEAT_LEVELS:
        if tmax >= low:
            return bn, en
    return None


def _get(client: httpx.Client, url: str, nodes: list[Node], daily: str) -> list[dict]:
    params = {"latitude": ",".join(str(n.point_lat) for n in nodes),
              "longitude": ",".join(str(n.point_lon) for n in nodes),
              "daily": daily, "forecast_days": DAYS, "timezone": "Asia/Dhaka"}
    for attempt in range(5):
        r = client.get(url, params=params)
        if r.status_code != 429:
            break
        log.info("Open-Meteo rate limit hit, waiting 61 s (attempt %d)", attempt + 1)
        time.sleep(61)
    r.raise_for_status()
    data = r.json()
    return data if isinstance(data, list) else [data]


def refresh_outlook() -> int:
    """Store the next days' heat, wind and waves. Inland points have no wave value: stored as empty."""
    Base.metadata.create_all(engine, tables=[DailyOutlook.__table__])
    with SessionLocal() as db:
        nodes = db.query(Node).filter(Node.node_type == "upazila").order_by(Node.id).all()
        now, n = datetime.now(timezone.utc), 0
        with httpx.Client(timeout=60) as client:
            for i in range(0, len(nodes), BATCH):
                part = nodes[i:i + BATCH]
                air = _get(client, settings.open_meteo_gfs_url, part, "temperature_2m_max,wind_speed_10m_max")
                sea = _get(client, MARINE_URL, part, "wave_height_max")
                for node, a, s in zip(part, air, sea):
                    waves = s["daily"]["wave_height_max"]
                    for k, day in enumerate(a["daily"]["time"]):
                        db.merge(DailyOutlook(node_id=node.id, day=date.fromisoformat(day), issued_at=now,
                                              tmax_c=a["daily"]["temperature_2m_max"][k],
                                              wind_kmh=a["daily"]["wind_speed_10m_max"][k], wave_m=waves[k]))
                        n += 1
        db.commit()
        log.info("Outlook stored: %d rows", n)
        return n


def node_outlook(db, node_id: str) -> list[DailyOutlook]:
    return (db.query(DailyOutlook).filter(DailyOutlook.node_id == node_id, DailyOutlook.day >= date.today())
            .order_by(DailyOutlook.day).limit(DAYS).all())
