"""Upazila report: every Sentinel-1 window mapped for this upazila (2017-2025), the rainfall
before each one (local and upstream, ERA5-Land), and what rainfall has led to floods here."""

from datetime import timedelta

import numpy as np
import pandas as pd
from sqlalchemy import text

from app.db.session import engine
from app.ml.features import graph_tables
from app.ml.train import FLOOD_FRAC
import re


def _daily_rain(node_id: str) -> pd.DataFrame:
    """Daily ERA5-Land rain: local (this upazila) and upstream (area-weighted over its basins)."""
    static, (w, _) = graph_tables()
    row = w.loc[node_id] if node_id in w.index else pd.Series(dtype=float)
    row = row[row > 0]
    with engine.connect() as c:
        local = pd.read_sql(text("select day, precip_mm as local from era5_daily where node_id = :n"), c,
                            params={"n": node_id}, parse_dates=["day"]).set_index("day")
        if len(row):
            up = pd.read_sql(text("""
                select e.day, sum(e.precip_mm * w.km2) / sum(w.km2) as upstream
                from era5_daily e join unnest(cast(:ids as text[]), cast(:km2 as float8[])) as w(id, km2) on w.id = e.node_id
                where e.precip_mm is not null group by e.day"""), c,
                             params={"ids": list(row.index), "km2": [float(v) for v in row.values]},
                             parse_dates=["day"]).set_index("day")
            local = local.join(up, how="outer")
        else:
            local["upstream"] = np.nan
    return local.sort_index()


def slugify(s: str | None) -> str:
    return re.sub(r"[^a-z0-9]+", "-", (s or "").lower()).strip("-")


def slug(district: str | None, name: str) -> str:
    """Readable URL path: /upazila/magura/magura-sadar"""
    return f"{slugify(district)}/{slugify(name)}"


def node_from_slug(district: str, name: str) -> str | None:
    with engine.connect() as c:
        for nid, d, n in c.execute(text("select id, district, name from nodes where node_type = 'upazila'")):
            if slugify(d) == district and slugify(n) == name:
                return nid
    return None


def upazila_report(node_id: str) -> dict:
    static, _ = graph_tables()
    with engine.connect() as c:
        node = c.execute(text("""select id, name, district, division, st_area(geom::geography) / 1e6 as km2
                                 from nodes where id = :n and node_type = 'upazila'"""), {"n": node_id}).mappings().first()
        if not node:
            return {}
        events = pd.read_sql(text("""
            select e.id, e.name, e.post_start, e.post_end, l.abnormal_frac, l.abnormal_km2, l.flooded_frac
            from flood_labels l join flood_events e on e.id = l.event_id
            where l.node_id = :n and l.abnormal_frac is not null
              and e.id like 'auto_%'  -- the regular 15-day monsoon grid only: named events overlap it
            order by e.post_start"""), c,
                             params={"n": node_id}, parse_dates=["post_start", "post_end"])
        current = c.execute(text("""
            select f.flood_prob, f.flood_frac, f.frac_p10, f.frac_p90, f.risk, r.reference_day, r.valid_until
            from flood_forecasts f join flood_forecast_runs r on r.id = f.run_id
            where f.node_id = :n and r.issued_at > now() - interval '24 hours' order by r.id desc limit 1"""), {"n": node_id}).mappings().first()

    rain = _daily_rain(node_id)

    def total(col, start, days):
        s = rain[col].loc[start: start + timedelta(days=days - 1)]
        return round(float(s.sum()), 1) if s.notna().any() else None

    rows = []
    for e in events.itertuples():
        t0 = e.post_start
        rows.append({
            "id": e.id, "name": e.name, "named_event": not e.id.startswith("auto_"),
            "start": t0.date().isoformat(), "end": e.post_end.date().isoformat(),
            "flooded_pct": round(e.abnormal_frac * 100, 1), "flooded_km2": round(e.abnormal_km2 or 0, 1),
            "all_water_pct": round((e.flooded_frac or 0) * 100, 1), "flooded": bool(e.abnormal_frac >= FLOOD_FRAC),
            "rain_local_7d_before": total("local", t0 - timedelta(days=7), 7),
            "rain_local_15d_before": total("local", t0 - timedelta(days=15), 15),
            "rain_up_15d_before": total("upstream", t0 - timedelta(days=15), 15),
            "rain_local_during": total("local", t0, 15),
            "rain_up_during": total("upstream", t0, 15),
        })
    hist = pd.DataFrame(rows)

    summary = None
    if len(hist):
        f, nf = hist[hist.flooded], hist[~hist.flooded]
        med = lambda d, c: None if d.empty or d[c].isna().all() else round(float(d[c].median()))  # noqa: E731
        summary = {
            "windows": int(len(hist)), "flooded_windows": int(len(f)),
            "flood_rate_pct": round(100 * len(f) / len(hist)),
            "median_rain_local_15d_before": {"flooded": med(f, "rain_local_15d_before"),
                                             "not_flooded": med(nf, "rain_local_15d_before")},
            "median_rain_up_15d_before": {"flooded": med(f, "rain_up_15d_before"),
                                          "not_flooded": med(nf, "rain_up_15d_before")},
            "median_rain_during": {"flooded": med(f, "rain_local_during"), "not_flooded": med(nf, "rain_local_during")},
            "lowest_rain_local_15d_before_a_flood": None if f.empty else f.rain_local_15d_before.min(),
            "worst": None if f.empty else hist.loc[hist.flooded_pct.idxmax()].to_dict(),
        }

    monsoon = rain[rain.index.month.isin([6, 7, 8, 9])]
    yearly = monsoon.groupby(monsoon.index.year).sum(min_count=1).round(0)
    wettest = rain.local.nlargest(5)
    st = static.loc[node_id]
    return {
        "node": {**dict(node), "km2": round(node["km2"], 1), "catchment_km2": round(float(st.catchment_km2)),
                 "outside_bd_pct": round(float(st.outside_share) * 100)},
        "flood_threshold_pct": FLOOD_FRAC * 100,
        "history": rows, "summary": summary,
        "monsoon_rain": [{"year": int(y), "local_mm": None if pd.isna(r.local) else int(r.local),
                          "upstream_mm": None if pd.isna(r.upstream) else int(r.upstream)}
                         for y, r in yearly.iterrows()],
        "wettest_days": [{"day": d.date().isoformat(), "mm": round(float(v), 1)} for d, v in wettest.items()],
        "current": None if not current else {k: (v.isoformat() if hasattr(v, "isoformat") else v)
                                             for k, v in current.items()},
        "slug": slug(node["district"], node["name"]),
    }
