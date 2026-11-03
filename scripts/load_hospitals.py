"""Load government hospitals from the official DGHS Facility Registry and verify their location.

Usage (from repo root):  .venv\Scripts\python scripts\load_hospitals.py
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))

from app.db import models  # noqa: E402,F401  (registers tables)
from app.db.session import Base, engine  # noqa: E402
from app.services.dghs import load_hospitals  # noqa: E402

if __name__ == "__main__":
    Base.metadata.create_all(engine)
    print(load_hospitals())
