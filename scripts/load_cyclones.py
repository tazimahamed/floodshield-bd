"""Load cyclone history near Bangladesh from NOAA IBTrACS (North Indian basin).

Usage (from repo root):  .venv\Scripts\python scripts\load_cyclones.py [--no-download]
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))

from app.db import models  # noqa: E402,F401  (registers tables)
from app.db.session import Base, engine  # noqa: E402
from app.services.cyclones import load_cyclones  # noqa: E402

if __name__ == "__main__":
    Base.metadata.create_all(engine)
    print(load_cyclones(fetch="--no-download" not in sys.argv))
