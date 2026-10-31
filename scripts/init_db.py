"""Create the database, enable PostGIS, create tables and load real upazila boundaries.

Usage (from repo root):  .venv\\Scripts\\python scripts\\init_db.py
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))

from sqlalchemy import create_engine, text  # noqa: E402
from sqlalchemy.engine import make_url  # noqa: E402

from app.core.config import settings  # noqa: E402


def ensure_database() -> None:
    url = make_url(settings.database_url)
    admin = create_engine(url.set(database="postgres"), isolation_level="AUTOCOMMIT")
    with admin.connect() as c:
        if not c.scalar(text("select 1 from pg_database where datname = :n"), {"n": url.database}):
            c.execute(text(f'create database "{url.database}"'))
            print(f"created database {url.database}")


def main() -> None:
    ensure_database()
    from app.db import models  # noqa: F401  (registers tables)
    from app.db.session import Base, engine
    from app.services.boundaries import load_upazilas

    with engine.begin() as c:
        c.execute(text("create extension if not exists postgis"))
    Base.metadata.create_all(engine)
    print("tables ready")
    print(f"upazilas loaded: {load_upazilas()}")


if __name__ == "__main__":
    main()
