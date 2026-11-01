"""Train FloodGraph-ST v1: gradient-boosted trees on graph features (upstream rainfall via the
P1 drainage graph), with honest leave-one-year-out evaluation against a climatology baseline.

- 5-seed ensemble of regressors (abnormal flooded share over the next 15 days) and
  classifiers (P(share >= FLOOD_FRAC))
- P10 / P90 of the share from LightGBM quantile models
- isotonic calibration of the probability, fitted on out-of-fold (leave-one-year-out) predictions
- every trained model is recorded in model_versions; it becomes active only if its
  out-of-fold AUC is at least the active model's (best model selected automatically)
A GNN replaces the trees once labels are plentiful.
"""

import json
from datetime import datetime, timezone

import joblib
import lightgbm as lgb
import numpy as np
import pandas as pd
from scipy.stats import spearmanr
from sklearn.isotonic import IsotonicRegression
from sklearn.metrics import brier_score_loss, roc_auc_score
from sqlalchemy import select, update

from app.core.config import settings
from app.db.models import ModelVersion
from app.db.session import SessionLocal
from app.ml.features import training_table

MODEL_DIR = settings.data_dir / "models"
FLOOD_FRAC = 0.05  # an upazila counts as "flooded" when >= 5 % of its area has abnormal water
SEEDS = (0, 1, 2, 3, 4)
PARAMS = dict(n_estimators=400, learning_rate=0.03, num_leaves=15, min_child_samples=40,
              subsample=0.8, subsample_freq=1, colsample_bytree=0.8, reg_lambda=1.0, verbose=-1)


class FloodModel:
    """Seed ensemble + quantile models + optional isotonic calibration of the probability."""

    def __init__(self, cols: list[str]):
        self.cols, self.regs, self.clfs, self.q10, self.q90, self.calibrator = cols, [], [], None, None, None

    def fit(self, df: pd.DataFrame) -> "FloodModel":
        X, y = df[self.cols], df.abnormal_frac
        flooded = (y >= FLOOD_FRAC).astype(int)
        for s in SEEDS:
            self.regs.append(lgb.LGBMRegressor(objective="cross_entropy", random_state=s, **PARAMS).fit(X, y))
            self.clfs.append(lgb.LGBMClassifier(random_state=s, **PARAMS).fit(X, flooded))
        self.q10 = lgb.LGBMRegressor(objective="quantile", alpha=0.1, **PARAMS).fit(X, y)
        self.q90 = lgb.LGBMRegressor(objective="quantile", alpha=0.9, **PARAMS).fit(X, y)
        return self

    def raw_prob(self, f: pd.DataFrame) -> np.ndarray:
        return np.mean([c.predict_proba(f[self.cols])[:, 1] for c in self.clfs], axis=0)

    def predict(self, f: pd.DataFrame) -> pd.DataFrame:
        X = f[self.cols]
        frac = np.clip(np.mean([r.predict(X) for r in self.regs], axis=0), 0, 1)
        prob = self.raw_prob(f)
        if self.calibrator is not None:
            prob = self.calibrator.predict(prob)
        p10 = np.clip(self.q10.predict(X), 0, 1)
        p90 = np.clip(self.q90.predict(X), 0, 1)
        return pd.DataFrame({"frac": frac, "p10": np.minimum(p10, frac), "p90": np.maximum(p90, frac),
                             "prob": prob}, index=f.index)


def _cols(df: pd.DataFrame) -> list[str]:
    return [c for c in df.columns if c not in ("node_id", "event_id", "year", "abnormal_frac")]


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


def evaluate(df: pd.DataFrame) -> tuple[dict, pd.DataFrame]:
    """Leave-one-year-out: the model never sees any window from the year it is scored on.
    Returns the scores and the out-of-fold predictions (used to fit the calibration)."""
    cols = _cols(df)
    model_out, clim_out = [], []
    for year in sorted(df.year.unique()):
        train, test = df[df.year != year], df[df.year == year]
        p = FloodModel(cols).fit(train).predict(test)
        model_out.append(test.assign(frac=p.frac.values, prob=p.prob.values,
                                     inside=((test.abnormal_frac >= p.p10) & (test.abnormal_frac <= p.p90)).values))
        clim = train.groupby("node_id").abnormal_frac.agg(frac="mean",
                                                          prob=lambda s: (s >= FLOOD_FRAC).mean())
        clim_out.append(test.join(clim, on="node_id").fillna({"frac": train.abnormal_frac.mean(),
                                                              "prob": (train.abnormal_frac >= FLOOD_FRAC).mean()}))
    m, c = pd.concat(model_out), pd.concat(clim_out)
    model_scores = _scores(m.abnormal_frac, m.frac, m.prob)
    model_scores["p10_p90_coverage"] = round(float(m.inside.mean()), 3)  # ideal 0.80
    return {"model": model_scores,
            "climatology_baseline": _scores(c.abnormal_frac, c.frac, c.prob),
            "per_year": {int(y): _scores(g.abnormal_frac, g.frac, g.prob) for y, g in m.groupby("year")}}, m


def _active_auc(db) -> float | None:
    active = db.scalars(select(ModelVersion).where(ModelVersion.is_active)).first()
    return active.metrics.get("model", {}).get("auc") if active else None


def train() -> dict:
    df = training_table()
    if df.year.nunique() < 2:
        raise RuntimeError("Need labelled windows from at least 2 years (run scripts/map_floods.py --auto)")
    metrics, oof = evaluate(df)
    cols = _cols(df)
    model = FloodModel(cols).fit(df)
    # calibrate on out-of-fold probabilities: the model had not seen those years
    model.calibrator = IsotonicRegression(out_of_bounds="clip", y_min=0, y_max=1).fit(
        oof.prob, (oof.abnormal_frac >= FLOOD_FRAC).astype(int))
    metrics["calibrated_brier_in_sample"] = round(float(brier_score_loss(
        (oof.abnormal_frac >= FLOOD_FRAC).astype(int), model.calibrator.predict(oof.prob))), 4)

    version = f"floodgraph-st-v1-{datetime.now(timezone.utc):%Y%m%dT%H%MZ}"
    gain = np.mean([r.booster_.feature_importance("gain") for r in model.regs], axis=0)
    info = {"version": version, "trained_at": datetime.now(timezone.utc).isoformat(), "features": cols,
            "flood_frac": FLOOD_FRAC, "n_windows": int(df.event_id.nunique()), "n_rows": int(len(df)),
            "years": sorted(int(y) for y in df.year.unique()), "evaluation": "leave-one-year-out",
            "ensemble": f"{len(SEEDS)} seeds + P10/P90 quantile models + isotonic calibration",
            "metrics": metrics,
            "importance": dict(sorted(zip(cols, (int(v) for v in gain)), key=lambda kv: -kv[1])[:12])}
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    path = MODEL_DIR / f"{version}.joblib"
    joblib.dump({"model": model, "info": info}, path)
    (MODEL_DIR / f"{version}.json").write_text(json.dumps(info, indent=2))

    with SessionLocal() as db:
        best = _active_auc(db)
        new_auc = metrics["model"]["auc"] or 0
        activate = best is None or new_auc >= best
        if activate:
            db.execute(update(ModelVersion).values(is_active=False))
        db.add(ModelVersion(version=version, trained_at=datetime.now(timezone.utc), path=str(path.name),
                            metrics=metrics, info={k: info[k] for k in ("n_windows", "n_rows", "years", "ensemble",
                                                                      "importance", "flood_frac")},
                            is_active=activate))
        db.commit()
    info["activated"] = activate
    return info
