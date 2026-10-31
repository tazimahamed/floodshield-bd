import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))

from app.services.ingest import _accumulate  # noqa: E402


def test_accumulate_splits_past_and_forecast_windows():
    now = datetime(2026, 10, 31, 12, tzinfo=timezone.utc)
    times = [(now + timedelta(hours=h)).strftime("%Y-%m-%dT%H:%M") for h in range(-72, 72)]
    precip = [1.0] * 72 + [2.0] * 72  # 1 mm/h before now, 2 mm/h after

    out = _accumulate(times, precip, now)

    assert out["rain_past_72h_mm"] == 72.0
    assert out["rain_24h_mm"] == 48.0
    assert out["rain_48h_mm"] == 96.0
    assert out["rain_72h_mm"] == 144.0


def test_accumulate_ignores_missing_values():
    now = datetime(2026, 10, 31, 0, tzinfo=timezone.utc)
    times = [(now + timedelta(hours=h)).strftime("%Y-%m-%dT%H:%M") for h in range(3)]

    assert _accumulate(times, [None, 1.5, None], now)["rain_24h_mm"] == 1.5
