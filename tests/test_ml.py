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
