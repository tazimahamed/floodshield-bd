"""Run one live GFS rainfall ingest immediately (the server also runs it every 6 hours)."""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))

from app.services.ingest import run_gfs_ingest  # noqa: E402

if __name__ == "__main__":
    print(f"ingest run {run_gfs_ingest()} done")
