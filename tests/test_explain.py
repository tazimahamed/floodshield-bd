import sys
from pathlib import Path

import numpy as np
import pandas as pd

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))

from app.ml import explain  # noqa: E402
from app.ml.train import FloodModel  # noqa: E402

COLS = [c for cols in explain.GROUPS.values() for c in cols]


def _model_and_features(n=600, seed=0):
    rng = np.random.default_rng(seed)
    X = pd.DataFrame(rng.random((n, len(COLS))), columns=COLS, index=[f"u{i}" for i in range(n)])
    # floods follow upstream rain and wet ground, so those groups should matter most
    y = np.clip(0.6 * X.rain_up_past15 + 0.4 * X.soil_water_1_local - 0.45 + rng.normal(0, 0.05, n), 0, 1)
    df = X.assign(abnormal_frac=y)
    return FloodModel(COLS).fit(df), X


def test_values_add_up_and_risk_is_unchanged():
    model, X = _model_and_features()
    before = model.predict(X).prob.copy()
    c = explain.contributions(model, X)
    bias = np.mean([cl.predict(X.iloc[:1], pred_contrib=True)[0, -1] for cl in model.clfs])
    mean_raw = np.mean([cl.predict(X, raw_score=True) for cl in model.clfs], axis=0)
    assert np.allclose(c.sum(axis=1) + bias, mean_raw, atol=1e-6)
    assert np.array_equal(model.predict(X).prob, before)  # explaining never changes the forecast


def test_groups_cover_every_input_and_top_reasons_make_sense():
    model, X = _model_and_features()
    data = explain.build(model, X, run_id=1, version="test")
    assert set(data["upazilas"]) == set(X.index)
    g = explain.grouped(explain.contributions(model, X)).abs().mean()
    assert set(g.nlargest(2).index) == {"rain_up", "wet_ground"}
    for v in data["upazilas"].values():
        assert len(v["reasons"]) <= 3
        assert all(abs(r["v"]) >= explain.MIN_SHOWN for r in v["reasons"])
