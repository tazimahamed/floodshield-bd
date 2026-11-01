"""Build the hydrological graph (P1) from HydroBASINS + HydroRIVERS in data/raw/hydrosheds/.

Usage (from repo root):  .venv\\Scripts\\python scripts\\build_graph.py
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))

from app.db import models  # noqa: E402,F401  (registers tables)
from sqlalchemy import text  # noqa: E402

from app.db.session import Base, engine  # noqa: E402
from app.services.hydro import build_graph  # noqa: E402

if __name__ == "__main__":
    Base.metadata.create_all(engine)
    with engine.begin() as c:  # column added in P1 to a table created in P0
        c.execute(text("alter table nodes add column if not exists bd_share double precision"))
    print(build_graph())
