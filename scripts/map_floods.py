"""Map historical floods from Sentinel-1 via Google Earth Engine (P2).

One-time login first:  .venv\Scripts\earthengine authenticate
Usage (from repo root):  .venv\Scripts\python scripts\map_floods.py [event_id ... | --auto [first_year last_year]]
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))

from app.db import models  # noqa: E402,F401  (registers tables)
from sqlalchemy import text  # noqa: E402

from app.db.session import Base, engine  # noqa: E402
from app.services.s1_floods import EVENTS, monsoon_windows, run_event  # noqa: E402

if __name__ == "__main__":
    Base.metadata.create_all(engine)
    with engine.begin() as c:  # columns added after the first P2 run
        c.execute(text("alter table flood_labels add column if not exists abnormal_km2 double precision"))
        c.execute(text("alter table flood_labels add column if not exists abnormal_frac double precision"))
    if sys.argv[1:2] == ["--auto"]:  # monsoon windows not mapped yet (safe to re-run after a stop)
        years = [int(a) for a in sys.argv[2:4]] or [2017, 2025]  # optional: --auto FIRST LAST
        with engine.connect() as c:
            done = set(c.execute(text("select id from flood_events")).scalars())
        for ev in monsoon_windows(years[0], years[-1]):
            if ev["id"] not in done:
                print(ev["id"], run_event(ev), "upazilas", flush=True)
        sys.exit()
    wanted = set(sys.argv[1:])
    for ev in EVENTS:
        if not wanted or ev["id"] in wanted:
            print(ev["id"], run_event(ev), "upazilas", flush=True)
