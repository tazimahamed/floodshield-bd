import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path
from types import SimpleNamespace

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))

from app.api.routes import _latest_flood_run  # noqa: E402
from app.services.alerts import is_stale  # noqa: E402

NOW = datetime(2026, 11, 9, tzinfo=timezone.utc)


def test_recent_forecast_is_not_stale():
    assert not is_stale(SimpleNamespace(issued_at=NOW - timedelta(hours=7)), NOW)


def test_day_old_forecast_is_stale():
    assert is_stale(SimpleNamespace(issued_at=NOW - timedelta(hours=25)), NOW)


def _db_with_run(issued_at):
    run = SimpleNamespace(issued_at=issued_at)
    return SimpleNamespace(scalars=lambda _: SimpleNamespace(first=lambda: run)), run


def test_site_hides_stale_run_but_keeps_fresh_one():
    now = datetime.now(timezone.utc)
    db, run = _db_with_run(now - timedelta(hours=1))
    assert _latest_flood_run(db) is run
    db, _ = _db_with_run(now - timedelta(days=6))
    assert _latest_flood_run(db) is None
