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


def test_alert_levels_and_messages():
    from datetime import date
    from types import SimpleNamespace

    from app.services.alerts import level_for, render

    assert level_for("low", 0.1) == "none"
    assert level_for("medium", 0.3) == "watch"
    assert level_for("high", 0.6) == "warning"
    assert level_for("high", 0.8) == "severe"

    node = SimpleNamespace(id="upz_test", name="Chhatak", district="Sunamganj")
    run = SimpleNamespace(reference_day=date(2026, 7, 1), valid_until=date(2026, 7, 15))
    low = SimpleNamespace(flood_prob=0.03, flood_frac=0.01, frac_p10=0.0, frac_p90=0.02, risk="low")
    calm = render("none", node, low, run)
    assert "বাড়তি ঝুঁকি নেই" in calm and "No elevated flood risk" in calm and "বৃষ্টির পূর্বাভাস" in calm
    assert "আশ্রয়কেন্দ্র" not in calm and "shelter" not in calm  # no alarming advice at low risk

    high = SimpleNamespace(flood_prob=0.62, flood_frac=0.18, frac_p10=0.05, frac_p90=0.35, risk="high")
    hosp = [SimpleNamespace(name="Chhatak Upazila Health Complex", name_bn=None, mobile="01730324741")]
    assert "হাসপাতাল" not in render("none", node, low, run, None, hosp)  # no hospital list at low risk
    assert "01730324741" in render("warning", node, high, run, None, hosp)
    msg = render("warning", node, high, run)
    assert "স্কুল" not in msg and "school" not in msg  # OSM counts are incomplete: never in alerts
    assert "৬২%" in msg and "62%" in msg and "এখনই" in msg and "act now" in msg and "FFWC" in msg


def test_place_names_normalise_spellings():
    from app.services.places import norm

    assert norm("Jashore") == "jessore"
    assert norm("Cumilla Sadar") == "comilla"
    assert norm("  Chhatak upazila ") == "chhatak"


def test_dghs_upazila_cross_check():
    from app.services.dghs import _same_upazila

    assert _same_upazila("Char Bhadrasan", "Char Bhadrasan")
    assert _same_upazila("Madhukhali", "Madhukhali")
    assert not _same_upazila("Dhamrai", "Savar")  # registry point lies in the wrong upazila: rejected
    assert not _same_upazila("Fenchuganj", "Khaliajuri")


def test_cyclone_landfall_and_class():
    from datetime import datetime, timezone

    import pandas as pd

    from app.services.cyclones import imd_class, landfall

    assert imd_class(115) == "Extremely Severe Cyclonic Storm" and imd_class(60) == "Severe Cyclonic Storm"
    t0 = datetime(2024, 5, 26, 12, tzinfo=timezone.utc)
    track = pd.DataFrame({"time": [t0, t0 + pd.Timedelta(hours=6)], "LAT": [21.0, 22.0], "LON": [89.0, 89.0],
                          "DIST2LAND": [55.0, 0.0], "LANDFALL": [0.0, 0.0]})
    t, lat, lon = landfall(track)
    assert 21.4 < lat < 21.6 and lon == 89.0 and t0 < t < t0 + pd.Timedelta(hours=6)
    pacific = track.assign(LON=[109.0, 109.0])  # a crossing outside the Bay of Bengal is ignored
    assert landfall(pacific) == (None, None, None)
