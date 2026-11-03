import sys
from pathlib import Path

import pandas as pd

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))

from app.ml.features import _weighted  # noqa: E402
from app.ml.forecast import risk_level  # noqa: E402


def test_weighted_mean_uses_area_and_skips_missing_basins():
    w = pd.DataFrame({"b1": [100.0, 0.0], "b2": [300.0, 50.0], "b3": [0.0, 50.0]}, index=["u1", "u2"])
    rain = pd.Series({"b1": 10.0, "b2": 20.0, "b3": None})

    out = _weighted(rain, w)

    assert out["u1"] == 17.5  # (100*10 + 300*20) / 400
    assert out["u2"] == 20.0  # b3 has no data, so only b2 counts


def test_risk_levels():
    assert [risk_level(p) for p in (0.1, 0.25, 0.49, 0.5, 0.9)] == ["low", "medium", "medium", "high", "high"]


def test_osm_asset_kinds():
    from app.services.assets import _kind

    assert _kind({"amenity": "hospital"}) == "hospital"
    assert _kind({"amenity": "university"}) == "college"
    assert _kind({"building": "cyclone_shelter"}) == "shelter"
    assert _kind({"power": "substation"}) == "substation"
    assert _kind({"amenity": "restaurant"}) is None


def test_alert_levels_and_bangla_message():
    from types import SimpleNamespace

    from app.services.alerts import handle_message, level_for, render  # noqa: F401

    assert level_for("low", True) == "none"
    assert level_for("medium", True) == "watch"
    assert level_for("high", False) == "warning"
    assert level_for("high", True) == "severe"

    node = SimpleNamespace(name="Chhatak", district="Sunamganj")
    fc = SimpleNamespace(flood_prob=0.62, flood_frac=0.18, frac_p10=0.05, frac_p90=0.35)
    run = SimpleNamespace(reference_day="2026-07-01", valid_until="2026-07-15")
    msg = render("bn", "warning", node, fc, run, {"hospital": 1, "school": 20})
    assert "বন্যা সতর্কবার্তা" in msg and "62%" in msg and "১ হাসপাতাল" not in msg and "1 হাসপাতাল" in msg
    assert "FFWC" in msg
