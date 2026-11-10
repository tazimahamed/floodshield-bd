"""How the flood model did over the last 12 months, fortnight by fortnight.

For each 15-day Sentinel-1 window, the active model is run for the window's first day with the rain that actually
fell (ERA5-Land, so a perfect rain forecast) and compared with what the satellite saw in that window.
  warned   = the model gave medium or high risk (chance >= 25%), the same levels users see
  flooded  = unusual water over >= 5% of the upazila, the same rule the model was trained on
Only upazilas the satellite mapped in that window are counted. A window where part of the country has no picture is
marked partial: its unmapped upazilas are "no data", never "no flood".
"""

import json
import logging
from datetime import datetime, timedelta, timezone

from sqlalchemy import text

from app.core.config import settings
from app.db.session import SessionLocal
from app.ml.forecast import MEDIUM, hindcast
from app.ml.train import FLOOD_FRAC

log = logging.getLogger(__name__)
OUT = settings.data_dir / "model_calendar.json"
UPAZILAS = 544
FULL = 500        # fewer mapped upazilas than this: a partial window
TOP = 8           # upazilas listed per window for misses, false alarms and catches


def _place(names, n):
    name, district = names.get(n, ("?", ""))
    return {"name": name, "district": district}


def build() -> dict:
    with SessionLocal() as db:
        last = db.execute(text(
            "select max(e.post_start) from flood_events e where e.id like 'auto_%' and exists "
            "(select 1 from flood_labels l where l.event_id = e.id and l.abnormal_frac is not null)")).scalar()
        if last is None:
            raise RuntimeError("No satellite flood windows yet")
        wins = db.execute(text("select id, post_start, post_end from flood_events where id like 'auto_%' "
                               "and post_start > :f and post_start <= :l order by post_start"),
                          {"f": last - timedelta(days=365), "l": last}).all()
        names = {i: (n, d) for i, n, d in db.execute(text("select id, name, district from nodes where node_type = 'upazila'"))}
        rows, version = [], None
        for eid, start, end in wins:
            labels = dict(db.execute(text("select node_id, abnormal_frac from flood_labels where event_id = :e "
                                          "and abnormal_frac is not null"), {"e": eid}).all())
            w = {"start": start.isoformat(), "end": end.isoformat(), "mapped": len(labels), "partial": len(labels) < FULL}
            try:
                version, pred = hindcast(start)
            except Exception as ex:  # rain history not available for this date
                w["error"] = str(ex)[:120]
                rows.append(w)
                continue
            prob = pred["prob"]
            hits, misses, fas, quiet = [], [], [], 0
            for n, frac in labels.items():
                if n not in prob.index:
                    continue
                p, flooded = float(prob[n]), frac >= FLOOD_FRAC
                rec = {**_place(names, n), "chance": round(p * 100), "flooded_pct": round(frac * 100, 1)}
                if flooded and p >= MEDIUM:
                    hits.append(rec)
                elif flooded:
                    misses.append(rec)
                elif p >= MEDIUM:
                    fas.append(rec)
                else:
                    quiet += 1
            w.update({"flooded": len(hits) + len(misses), "hits": len(hits), "misses": len(misses),
                      "false_alarms": len(fas), "quiet": quiet,
                      "caught_list": sorted(hits, key=lambda r: -r["flooded_pct"])[:TOP],
                      "missed_list": sorted(misses, key=lambda r: -r["flooded_pct"])[:TOP],
                      "false_alarm_list": sorted(fas, key=lambda r: -r["chance"])[:TOP]})
            rows.append(w)
    ok = [w for w in rows if "hits" in w]

    def totals(ws):
        h, m, f = (sum(w[k] for w in ws) for k in ("hits", "misses", "false_alarms"))
        return {"windows": len(ws), "flooded": h + m, "hits": h, "misses": m, "false_alarms": f,
                "pod": round(h / (h + m), 3) if h + m else None, "far": round(f / (h + f), 3) if h + f else None}

    out = {
        "built_at": datetime.now(timezone.utc).isoformat(), "model_version": version,
        "rule": {"warned_if_chance_at_least": MEDIUM, "flooded_if_share_at_least": FLOOD_FRAC, "partial_if_mapped_below": FULL,
                 "upazilas": UPAZILAS, "rain": "ERA5-Land (rain that actually fell)"},
        # the model is built for the June-October monsoon, so that season is reported on its own as well
        "monsoon": totals([w for w in ok if 6 <= int(w["start"][5:7]) <= 10]),
        "totals": totals(ok),
        "windows": rows,
    }
    h = out["totals"]["hits"]; m = out["totals"]["misses"]
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(out, ensure_ascii=False), encoding="utf-8")
    log.info("Model calendar built: %d windows, %d flooded, %d caught", len(ok), h + m, h)
    return out


def load() -> dict | None:
    return json.loads(OUT.read_text(encoding="utf-8")) if OUT.exists() else None


def refresh() -> None:
    """Scheduler entry point: rebuild once a day (new satellite windows and ERA5 days keep arriving)."""
    try:
        build()
    except Exception:
        log.exception("Model calendar build failed")


def needs_build(max_age_hours: int = 24) -> bool:
    if not OUT.exists():
        return True
    age = datetime.now(timezone.utc).timestamp() - OUT.stat().st_mtime
    return age > max_age_hours * 3600
