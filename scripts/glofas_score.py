"""Score the past GloFAS river forecasts against what Sentinel-1 actually saw downstream.

Rules fixed before looking at any result (do not tune them to make GloFAS pass):

  Forecast   For each run day and lead day (1-10), the chance that the river is above its own 2-year flow
             (share of the 50 ensemble members, from data/glofas_hindcast.csv). Warning = chance >= 0.5.
  Truth      The 15-day Sentinel-1 window that contains the forecast's valid day. The window counts as a flood
             for a river point when at least 10% of the upazilas in that point's downstream districts were
             flooded (unusual water over >= 5% of the upazila, the same rule the flood model uses).
             Windows where fewer than half of those upazilas were mapped have no verdict and are skipped.
  Baselines  Climatology: the flood rate of that point over all scored windows.
             Persistence: "it stays as it is now", i.e. the verdict of the window containing the run day.
  Pass       Per point, over leads 1-5 days together, ALL of:
               1. Brier skill vs climatology > 0
               2. Brier score better than persistence
               3. hit rate (POD) >= 0.5 and false alarm ratio (FAR) <= 0.5 at the 0.5 warning level
             A point that fails is not shown on the site. Points with fewer than 3 flood windows cannot be
             judged and are not shown either.

Usage (from repo root): .venv\\Scripts\\python scripts\\glofas_score.py
Writes data/glofas_score.json.
"""

import csv
import json
import sys
from collections import defaultdict
from datetime import date, timedelta
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))

from sqlalchemy import text  # noqa: E402

from app.core.config import settings  # noqa: E402
from app.db.session import SessionLocal  # noqa: E402
from app.ml.train import FLOOD_FRAC  # noqa: E402

WARN = 0.5
SHARE = 0.10          # share of downstream upazilas that must flood for a window to count as a flood
MIN_MAPPED = 0.5      # share of downstream upazilas that must be mapped for a verdict
MIN_EVENTS = 3
PASS_LEADS = range(1, 6)
# downstream districts per river point (the same lists the site shows); patterns allow spelling variants
DOWN = {
    "teesta": ["Lalmonirhat", "Nilphamari", "Rangpur"],
    "brahmaputra": ["Kurigram", "Jamalpur", "Sirajganj"],
    "ganges": ["Rajshahi", "Pabna"],
    "barak": ["Sylhet", "%ulvi%azar"],
    "meghalaya_east": ["Sylhet"],
    "meghalaya_west": ["Sunamganj"],
    "gomti": ["C_milla", "Comilla"],
    "muhuri": ["Feni"],
}


def load_truth(db):
    """{point: {window_start: (window_end, flooded: bool)}} for windows with enough mapped upazilas."""
    wins = db.execute(text("select id, post_start, post_end from flood_events where id like 'auto_%' "
                           "and post_start >= '2024-05-15' order by post_start")).all()
    truth = {}
    for pid, pats in DOWN.items():
        ids = [r[0] for r in db.execute(text(
            "select id from nodes where node_type = 'upazila' and (" + " or ".join(f"district ilike :p{i}" for i in range(len(pats))) + ")"),
            {f"p{i}": p for i, p in enumerate(pats)})]
        truth[pid] = {"n_upazilas": len(ids), "windows": {}}
        for eid, s, e in wins:
            rows = db.execute(text("select abnormal_frac from flood_labels where event_id = :e and node_id = any(:ids) "
                                   "and abnormal_frac is not null"), {"e": eid, "ids": ids}).all()
            if len(rows) < MIN_MAPPED * len(ids):
                continue
            share = sum(r[0] >= FLOOD_FRAC for r in rows) / len(rows)
            truth[pid]["windows"][s] = (e, share >= SHARE, round(share, 3))
    return truth


def window_of(day, windows):
    for s, (e, flood, _) in windows.items():
        if s <= day <= e:
            return s
    return None


def brier(pairs):
    return sum((p - o) ** 2 for p, o in pairs) / len(pairs) if pairs else None


def score():
    with SessionLocal() as db:
        truth = load_truth(db)
    rows = list(csv.DictReader((settings.data_dir / "glofas_hindcast.csv").open(encoding="utf-8")))
    out = {"rules": {"warning_chance": WARN, "flood_share_of_downstream_upazilas": SHARE, "flood_frac_per_upazila": FLOOD_FRAC,
                     "min_mapped_share": MIN_MAPPED, "pass_leads": list(PASS_LEADS), "min_flood_windows": MIN_EVENTS},
           "points": {}}
    for pid in DOWN:
        wins = truth[pid]["windows"]
        recs = []  # (lead, chance, observed, persistence)
        for r in rows:
            if r["point"] != pid:
                continue
            run = date.fromisoformat(r["run_day"]); lead = int(r["lead_day"])
            w = window_of(run + timedelta(days=lead), wins)
            w0 = window_of(run, wins)
            if w is None or w0 is None:
                continue
            recs.append((lead, float(r["chance"]), int(wins[w][1]), int(wins[w0][1])))
        flood_windows = sum(f for _, f, _ in wins.values())
        clim = flood_windows / len(wins) if wins else 0
        by_lead = {}
        for L in range(1, 11):
            rr = [x for x in recs if x[0] == L]
            if not rr:
                continue
            hits = sum(1 for _, c, o, _ in rr if c >= WARN and o)
            miss = sum(1 for _, c, o, _ in rr if c < WARN and o)
            fa = sum(1 for _, c, o, _ in rr if c >= WARN and not o)
            bs = brier([(c, o) for _, c, o, _ in rr])
            bs_clim = brier([(clim, o) for _, c, o, _ in rr])
            bs_pers = brier([(p, o) for _, c, o, p in rr])
            by_lead[L] = {"n": len(rr), "events": hits + miss, "hits": hits, "misses": miss, "false_alarms": fa,
                          "pod": round(hits / (hits + miss), 2) if hits + miss else None,
                          "far": round(fa / (hits + fa), 2) if hits + fa else None,
                          "csi": round(hits / (hits + miss + fa), 2) if hits + miss + fa else None,
                          "brier": round(bs, 3), "brier_climatology": round(bs_clim, 3), "brier_persistence": round(bs_pers, 3),
                          "bss_vs_climatology": round(1 - bs / bs_clim, 2) if bs_clim else None}
        # pass test on leads 1-5 pooled
        rr = [x for x in recs if x[0] in PASS_LEADS]
        hits = sum(1 for _, c, o, _ in rr if c >= WARN and o); miss = sum(1 for _, c, o, _ in rr if c < WARN and o)
        fa = sum(1 for _, c, o, _ in rr if c >= WARN and not o)
        bs, bs_clim, bs_pers = brier([(c, o) for _, c, o, _ in rr]), brier([(clim, o) for _, c, o, _ in rr]), brier([(p, o) for _, c, o, p in rr])
        pod = hits / (hits + miss) if hits + miss else None
        far = fa / (hits + fa) if hits + fa else None
        checks = {
            "enough_flood_windows": flood_windows >= MIN_EVENTS,
            "beats_climatology": bool(bs is not None and bs_clim and bs < bs_clim),
            "beats_persistence": bool(bs is not None and bs_pers is not None and bs < bs_pers),
            "pod_at_least_0.5": bool(pod is not None and pod >= 0.5),
            "far_at_most_0.5": bool(far is not None and far <= 0.5),
        }
        # how many days ahead GloFAS first warned, for each flood window it caught
        leads_caught = []
        for s, (e, flood, _) in wins.items():
            if not flood:
                continue
            warned = [x for x in rows if x["point"] == pid and float(x["chance"]) >= WARN
                      and s <= date.fromisoformat(x["run_day"]) + timedelta(days=int(x["lead_day"])) <= e]
            if warned:
                leads_caught.append(max(int(x["lead_day"]) - max(0, (s - date.fromisoformat(x["run_day"])).days) for x in warned))
        out["points"][pid] = {
            "downstream_upazilas": truth[pid]["n_upazilas"], "windows_scored": len(wins), "flood_windows": flood_windows,
            "climatology": round(clim, 3), "pairs_leads_1_5": len(rr),
            "leads_1_5": {"hits": hits, "misses": miss, "false_alarms": fa, "pod": round(pod, 2) if pod is not None else None,
                          "far": round(far, 2) if far is not None else None, "brier": round(bs, 3) if bs is not None else None,
                          "brier_climatology": round(bs_clim, 3) if bs_clim is not None else None,
                          "brier_persistence": round(bs_pers, 3) if bs_pers is not None else None},
            "flood_windows_warned": f"{len(leads_caught)} of {flood_windows}",
            "best_lead_days_when_warned": sorted(leads_caught),
            "checks": checks, "passes": all(checks.values()), "by_lead": by_lead,
        }
    (settings.data_dir / "glofas_score.json").write_text(json.dumps(out, indent=2, default=str), encoding="utf-8")
    return out


if __name__ == "__main__":
    res = score()
    print(f"{'point':16} {'win':>4} {'flood':>5} {'POD':>5} {'FAR':>5} {'BS':>6} {'BSclim':>6} {'BSpers':>6} warned  pass")
    for pid, p in res["points"].items():
        l = p["leads_1_5"]
        print(f"{pid:16} {p['windows_scored']:>4} {p['flood_windows']:>5} {str(l['pod']):>5} {str(l['far']):>5} "
              f"{str(l['brier']):>6} {str(l['brier_climatology']):>6} {str(l['brier_persistence']):>6} "
              f"{p['flood_windows_warned']:>7}  {'PASS' if p['passes'] else 'fail'}  "
              + ",".join(k for k, v in p["checks"].items() if not v))
