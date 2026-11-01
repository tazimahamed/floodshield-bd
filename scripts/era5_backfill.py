"""Load ERA5-Land daily history for every upazila and basin (P3).

Usage (from repo root):  .venv\\Scripts\\python scripts\\era5_backfill.py 2017 2024
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))

from app.db import models  # noqa: E402,F401  (registers tables)
from app.db.session import Base, engine  # noqa: E402
from app.services.era5 import backfill  # noqa: E402

if __name__ == "__main__":
    Base.metadata.create_all(engine)
    first, last = (int(a) for a in sys.argv[1:3])
    months = range(int(sys.argv[3]), int(sys.argv[3]) + 1) if len(sys.argv) > 3 else range(1, 13)
    print("rows:", backfill(first, last, months))
