"""Train FloodGraph-ST v0: gradient-boosted trees on graph features (upstream rainfall via the
P1 drainage graph), with honest leave-one-year-out evaluation against a climatology baseline.

Two models: a regressor for the abnormal flooded share of each upazila over the next 15 days,
and a classifier for P(share >= FLOOD_FRAC). A GNN replaces this once labels are plentiful.
"""

import json
from datetime import datetime, timezone

import joblib
import lightgbm as lgb
import numpy as np
import pandas as pd
from scipy.stats import spearmanr
from sklearn.metrics import brier_score_loss, roc_auc_score

from app.core.config import settings
from app.ml.features import training_table

MODEL_DIR = settings.data_dir / "models"
FLOOD_FRAC = 0.05  # an upazila counts as "flooded" when >= 5 % of its area has abnormal water
PARAMS = dict(n_estimators=400, learning_rate=0.03, num_leaves=15, min_child_samples=40,
              subsample=0.8, subsample_freq=1, colsample_bytree=0.8, reg_lambda=1.0, verbose=-1)


def _cols(df: pd.DataFrame) -> list[str]:
    return [c for c in df.columns if c not in ("node_id", "event_id", "year", "abnormal_frac")]


def _fit(train: pd.DataFrame, cols):
    reg = lgb.LGBMRegressor(objective="cross_entropy", **PARAMS).fit(train[cols], train.abnormal_frac)
    clf = lgb.LGBMClassifier(**PARAMS).fit(train[cols], (train.abnormal_frac >= FLOOD_FRAC).astype(int))
    return reg, clf


def _scores(y, frac_pred, prob_pred) -> dict:
    flooded = (y >= FLOOD_FRAC).astype(int)
    two_classes = flooded.nunique() == 2
    return {
        "n": int(len(y)), "flooded_share": round(float(flooded.mean()), 4),
        "mae": round(float(np.abs(y - frac_pred).mean()), 4),
        "spearman": round(float(spearmanr(y, frac_pred).statistic), 3),
        "auc": round(float(roc_auc_score(flooded, prob_pred)), 3) if two_classes else None,
        "brier": round(float(brier_score_loss(flooded, prob_pred)), 4),
    }


def evaluate(df: pd.DataFrame) -> dict:
    """Leave-one-year-out: the model never sees any window from the year it is scored on."""
    cols = _cols(df)
    model_out, clim_out = [], []
    for year in sorted(df.year.unique()):
        train, test = df[df.year != year], df[df.year == year]
        reg, clf = _fit(train, cols)
        model_out.append(test.assign(frac=reg.predict(test[cols]), prob=clf.predict_proba(test[cols])[:, 1]))
        clim = train.groupby("node_id").abnormal_frac.agg(frac="mean",
                                                          prob=lambda s: (s >= FLOOD_FRAC).mean())
        clim_out.append(test.join(clim, on="node_id").fillna({"frac": train.abnormal_frac.mean(),
                                                              "prob": (train.abnormal_frac >= FLOOD_FRAC).mean()}))
    m, c = pd.concat(model_out), pd.concat(clim_out)
    per_year = {int(y): _scores(g.abnormal_frac, g.frac, g.prob) for y, g in m.groupby("year")}
    return {"model": _scores(m.abnormal_frac, m.frac, m.prob),
            "climatology_baseline": _scores(c.abnormal_frac, c.frac, c.prob),
            "per_year": per_year}


def train() -> dict:
    df = training_table()
    if df.year.nunique() < 2:
        raise RuntimeError("Need labelled windows from at least 2 years (run scripts/map_floods.py --auto)")
    metrics = evaluate(df)
    cols = _cols(df)
    reg, clf = _fit(df, cols)
    version = f"floodgraph-st-v0-{datetime.now(timezone.utc):%Y%m%dT%H%MZ}"
    info = {"version": version, "trained_at": datetime.now(timezone.utc).isoformat(), "features": cols,
            "flood_frac": FLOOD_FRAC, "n_windows": int(df.event_id.nunique()), "n_rows": int(len(df)),
            "years": sorted(int(y) for y in df.year.unique()), "evaluation": "leave-one-year-out",
            "metrics": metrics,
            "importance": dict(sorted(zip(cols, (int(v) for v in reg.booster_.feature_importance("gain"))),
                                      key=lambda kv: -kv[1])[:12])}
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump({"reg": reg, "clf": clf, "info": info}, MODEL_DIR / f"{version}.joblib")
    (MODEL_DIR / f"{version}.json").write_text(json.dumps(info, indent=2))
    (MODEL_DIR / "latest.txt").write_text(version)
    return info
