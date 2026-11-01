"""Map historical floods from Sentinel-1 via Google Earth Engine (P2).

One-time login first:  .venv\Scripts\earthengine authenticate
Usage (from repo root):  .venv\Scripts\python scripts\map_floods.py [event_id ...]
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))

from app.db import models  # noqa: E402,F401  (registers tables)
from sqlalchemy import text  # noqa: E402

from app.db.session import Base, engine  # noqa: E402
from app.services.s1_floods import EVENTS, run_event  # noqa: E402

if __name__ == "__main__":
    Base.metadata.create_all(engine)
    with engine.begin() as c:  # columns added after the first P2 run
        c.execute(text("alter table flood_labels add column if not exists abnormal_km2 double precision"))
        c.execute(text("alter table flood_labels add column if not exists abnormal_frac double precision"))
    wanted = set(sys.argv[1:])
    for ev in EVENTS:
        if not wanted or ev["id"] in wanted:
            print(ev["id"], run_event(ev), "upazilas", flush=True)
