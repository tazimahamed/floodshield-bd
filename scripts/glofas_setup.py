"""One-time: compute each border river's 2-year flow from the GloFAS reanalysis, then fetch today's forecast.
Usage (from repo root): .venv\\Scripts\\python scripts\\glofas_setup.py"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))

from app.db import models  # noqa: E402,F401
from app.services.glofas import build_thresholds, refresh_glofas  # noqa: E402

if __name__ == "__main__":
    print("points", build_thresholds(), flush=True)
    print("rows", refresh_glofas(), flush=True)
