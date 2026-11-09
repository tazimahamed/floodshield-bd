"""Past GloFAS forecasts, one run every 3 days over recent monsoons, saved to data/glofas_hindcast.csv for scoring.
Safe to stop and rerun: finished runs are skipped.
Usage (from repo root): .venv\\Scripts\\python scripts\\glofas_hindcast.py"""

import csv
import shutil
import sys
import tempfile
from datetime import date, timedelta
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))

import numpy as np  # noqa: E402

from app.core.config import settings  # noqa: E402
from app.db import models  # noqa: E402,F401
from app.db.models import GlofasPoint  # noqa: E402
from app.db.session import SessionLocal  # noqa: E402
from app.services.glofas import fetch_ensemble  # noqa: E402

OUT = settings.data_dir / "glofas_hindcast.csv"
YEARS = (2024, 2025, 2026)


def run_days():
    for y in YEARS:
        d = date(y, 6, 1)
        while d <= date(y, 10, 15):
            yield d
            d += timedelta(days=3)


if __name__ == "__main__":
    with SessionLocal() as db:
        pts = [(p.id, p.lat, p.lon, p.q2) for p in db.query(GlofasPoint).all()]
    done = set()
    if OUT.exists():
        with OUT.open(encoding="utf-8") as fh:
            done = {r["run_day"] for r in csv.DictReader(fh)}
    new = not OUT.exists()
    with OUT.open("a", newline="", encoding="utf-8") as fh:
        w = csv.writer(fh)
        if new:
            w.writerow(["run_day", "point", "lead_day", "chance", "q_median", "q2", "members"])
        for d in run_days():
            if d.isoformat() in done:
                continue
            tmp = Path(tempfile.mkdtemp())
            try:
                e = fetch_ensemble(d, tmp / "e.grib")
                for pid, la, lo, q2 in pts:
                    c = e.sel(latitude=la, longitude=lo, method="nearest")
                    for s in c.step.values:
                        v = c.sel(step=s).values
                        v = v[~np.isnan(v)]
                        w.writerow([d, pid, int(s / np.timedelta64(1, "D")), round(float((v > q2).mean()), 3),
                                    round(float(np.median(v)), 1), round(q2, 1), len(v)])
                fh.flush()
                print(d, "ok", flush=True)
            except Exception as ex:  # one missing day must not stop the rest; a rerun retries it
                print(d, "FAILED", str(ex).splitlines()[0][:150], flush=True)
            finally:
                shutil.rmtree(tmp, ignore_errors=True)
