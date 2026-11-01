"""Train the flood model (P4) and print its leave-one-year-out scores.

Usage (from repo root):  .venv\Scripts\python scripts\train_model.py [--forecast]
"""

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))

from app.db import models  # noqa: E402,F401  (registers tables)
from app.db.session import Base, engine  # noqa: E402
from app.ml.train import train  # noqa: E402

if __name__ == "__main__":
    Base.metadata.create_all(engine)
    info = train()
    print(json.dumps({k: info[k] for k in ("version", "n_windows", "n_rows", "years", "metrics", "importance")},
                     indent=2))
    if "--forecast" in sys.argv:
        from app.ml.forecast import run_forecast
        print("flood forecast run", run_forecast())
