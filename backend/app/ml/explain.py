"""Why the model gave each upazila its risk: per-feature contributions (TreeSHAP) from LightGBM.

LightGBM computes exact TreeSHAP values itself (predict(..., pred_contrib=True)), so no extra
package is needed. For each of the 5 classifiers the values (plus the bias term) add up exactly
to that classifier's raw score (log-odds); this is checked every time and nothing is saved if
it fails. The 5 classifiers' values are averaged, i.e. they explain the ensemble's mean log-odds.
The shown probability is the mean of the 5 probabilities passed through an isotonic calibration;
both steps keep the order of scores, so "raises / lowers the risk" stays true, but the values are
not percentage points of probability. The 27 inputs are summed into 7 plain groups (SHAP values
add up, so a group's value is the sum of its members).

This explains the model's reasoning only. It is not proof of what causes a flood.
"""

import json
import logging
from datetime import datetime, timezone

import numpy as np
import pandas as pd

from app.core.config import settings

log = logging.getLogger(__name__)
OUT = settings.data_dir / "why_now.json"

# feature group -> members; the order of the 27 model inputs does not matter here
GROUPS = {
    "rain_here": ("rain_local_past1", "rain_local_past3", "rain_local_past7", "rain_local_past15", "rain_local_past30"),
    "rain_up": ("rain_up_past3", "rain_up_past7", "rain_up_past15", "rain_up_past30"),
    "rain_abroad": ("rain_upout_past7", "rain_upout_past15"),
    "rain_next": ("rain_local_next3", "rain_up_next3", "rain_upout_next3"),
    "wet_ground": ("soil_water_1_local", "soil_water_1_up", "soil_water_2_local", "soil_water_2_up",
                   "runoff_local_past7", "runoff_up_past7", "runoff_local_past30", "runoff_up_past30"),
    "place": ("log_catchment", "outside_share", "lat", "lon"),
    "season": ("doy",),
}
# one plain number shown next to a group, so the reason can be checked against the data
FACT = {"rain_here": "rain_local_past15", "rain_up": "rain_up_past15", "rain_abroad": "rain_upout_past15",
        "rain_next": "rain_up_next3", "wet_ground": "soil_water_1_local"}
MIN_SHOWN = 0.05  # log-odds; smaller pushes are noise and are not listed


def contributions(model, f: pd.DataFrame) -> pd.DataFrame:
    """Mean TreeSHAP value per input (rows = upazilas, columns = the 27 inputs). Raises if any
    classifier's values do not add up to its own raw score."""
    X = f[model.cols]
    per = []
    for c in model.clfs:
        v = c.predict(X, pred_contrib=True)  # last column = bias (expected raw score)
        raw = c.predict(X, raw_score=True)
        gap = float(np.abs(v.sum(axis=1) - raw).max())
        if gap > 1e-6:
            raise ValueError(f"SHAP values do not add up to the raw score (max gap {gap:.2e})")
        per.append(v[:, :-1])
    return pd.DataFrame(np.mean(per, axis=0), index=f.index, columns=model.cols)


def grouped(contrib: pd.DataFrame) -> pd.DataFrame:
    missing = set(contrib.columns) - {c for cols in GROUPS.values() for c in cols}
    if missing:
        raise ValueError(f"inputs not in any group: {sorted(missing)}")
    return pd.DataFrame({g: contrib[list(cols)].sum(axis=1) for g, cols in GROUPS.items()})


def build(model, f: pd.DataFrame, run_id: int, version: str) -> dict:
    g = grouped(contributions(model, f))
    ups = {}
    for node, row in g.iterrows():
        top = row.reindex(row.abs().sort_values(ascending=False).index)
        reasons = [{"g": k, "v": round(float(v), 3)} for k, v in top.items() if abs(v) >= MIN_SHOWN][:3]
        facts = {k: round(float(f.at[node, col]), 3) for k, col in FACT.items() if pd.notna(f.at[node, col])}
        ups[node] = {"reasons": reasons, "facts": facts}
    return {"run_id": run_id, "model_version": version, "computed_at": datetime.now(timezone.utc).isoformat(),
            "method": "LightGBM TreeSHAP (pred_contrib), mean over 5 classifiers, log-odds, summed into groups",
            "upazilas": ups}


def save(model, f: pd.DataFrame, run_id: int, version: str) -> None:
    """Called right after a forecast run. A failure here never stops the forecast itself."""
    try:
        data = build(model, f, run_id, version)
        tmp = OUT.with_suffix(".tmp")
        tmp.write_text(json.dumps(data, ensure_ascii=False), encoding="utf-8")
        tmp.replace(OUT)
        log.info("why_now.json saved for forecast run %d", run_id)
    except Exception:
        log.exception("Could not explain forecast run %d", run_id)


def load() -> dict | None:
    try:
        return json.loads(OUT.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return None
