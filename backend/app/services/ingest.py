"""M1 ingestion: live GFS rainfall forecast from Open-Meteo for every upazila.

Raw responses are written to data/raw/openmeteo/ with a SHA-256 checksum so every
stored number can be traced back to the exact file it came from.
"""

import hashlib
import json
import logging
from datetime import datetime, timedelta, timezone

import httpx

from app.core.config import settings
from app.db.models import IngestRun, Node, RainForecast
from app.db.session import SessionLocal

log = logging.getLogger(__name__)
SOURCE = "open-meteo-gfs"
BATCH = 50


def _fetch(client: httpx.Client, nodes: list[Node]) -> list[dict]:
    params = {
        "latitude": ",".join(str(n.point_lat) for n in nodes),
        "longitude": ",".join(str(n.point_lon) for n in nodes),
        "hourly": "precipitation",
        "past_days": 3,
        "forecast_days": 3,
        "timezone": "UTC",
    }
    r = client.get(settings.open_meteo_gfs_url, params=params)
    r.raise_for_status()
    data = r.json()
    return data if isinstance(data, list) else [data]


def _accumulate(times: list[str], precip: list[float | None], now: datetime) -> dict:
    def total(start: datetime, end: datetime) -> float:
        s = 0.0
        for t, p in zip(times, precip):
            ts = datetime.fromisoformat(t).replace(tzinfo=timezone.utc)
            if start <= ts < end and p is not None:
                s += p
        return round(s, 1)

    return {
        "rain_past_72h_mm": total(now - timedelta(hours=72), now),
        "rain_24h_mm": total(now, now + timedelta(hours=24)),
        "rain_48h_mm": total(now, now + timedelta(hours=48)),
        "rain_72h_mm": total(now, now + timedelta(hours=72)),
    }


def run_gfs_ingest() -> int:
    """Pull the latest GFS forecast for all upazilas. Returns the ingest run id."""
    with SessionLocal() as db:
        nodes = db.query(Node).filter(Node.node_type == "upazila").order_by(Node.id).all()
        if not nodes:
            raise RuntimeError("No upazilas loaded. Run scripts/init_db.py first.")

        run = IngestRun(source=SOURCE, status="running", meta={"url": settings.open_meteo_gfs_url})
        db.add(run)
        db.commit()

        try:
            now = datetime.now(timezone.utc).replace(minute=0, second=0, microsecond=0)
            responses: list[dict] = []
            with httpx.Client(timeout=60) as client:
                for i in range(0, len(nodes), BATCH):
                    responses.extend(_fetch(client, nodes[i:i + BATCH]))
            if len(responses) != len(nodes):
                raise RuntimeError(f"Expected {len(nodes)} locations, got {len(responses)}")

            raw_dir = settings.data_dir / "raw" / "openmeteo"
            raw_dir.mkdir(parents=True, exist_ok=True)
            raw = json.dumps({"fetched_at": now.isoformat(), "node_ids": [n.id for n in nodes], "responses": responses})
            raw_path = raw_dir / f"gfs_{now:%Y%m%dT%H%MZ}_run{run.id}.json"
            raw_path.write_text(raw, encoding="utf-8")

            for node, resp in zip(nodes, responses):
                h = resp["hourly"]
                db.add(RainForecast(
                    ingest_run_id=run.id, node_id=node.id, issued_at=now,
                    hourly={"time": h["time"], "precipitation": h["precipitation"]},
                    **_accumulate(h["time"], h["precipitation"], now),
                ))

            run.status = "done"
            run.n_nodes = len(nodes)
            run.model_run_time = now
            run.raw_path = str(raw_path.relative_to(settings.data_dir.parent))
            run.sha256 = hashlib.sha256(raw.encode()).hexdigest()
        except Exception as e:  # recorded on the run, then re-raised
            db.rollback()
            run = db.get(IngestRun, run.id)
            run.status = "failed"
            run.error = str(e)[:2000]
            log.exception("GFS ingest failed")
            raise
        finally:
            run.finished_at = datetime.now(timezone.utc)
            db.commit()
        log.info("GFS ingest %s done for %d upazilas", run.id, len(nodes))
        return run.id
