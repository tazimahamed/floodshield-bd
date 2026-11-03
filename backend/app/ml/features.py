"""Features for the flood model: local and upstream (graph) rainfall, runoff and soil moisture.

Every feature for a reference day t0 uses only data up to t0 + FORECAST_DAYS. Training uses
ERA5-Land for the forecast days (a "perfect forecast"); live forecasts use NOAA GFS there.
"""

from datetime import date, timedelta
from functools import lru_cache

import numpy as np
import pandas as pd
from sqlalchemy import text

from app.db.session import engine

FORECAST_DAYS = 3
PAST_WINDOWS = (1, 3, 7, 15, 30)
VARS = ("precip_mm", "runoff_mm", "soil_water_1", "soil_water_2")


def load_daily(start: date, end: date) -> dict[str, pd.DataFrame]:
    """ERA5-Land daily values as {variable: DataFrame[day x node_id]}."""
    df = pd.read_sql(text("select node_id, day, precip_mm, runoff_mm, soil_water_1, soil_water_2 "
                          "from era5_daily where day between :s and :e"), engine, params={"s": start, "e": end},
                     parse_dates=["day"])
    return {v: df.pivot(index="day", columns="node_id", values=v).sort_index() for v in VARS}


@lru_cache(maxsize=1)  # the graph only changes when scripts/build_graph.py is re-run (then restart)
def graph_tables() -> tuple[pd.DataFrame, pd.DataFrame]:
    """(static upazila table, upstream weights). Weights: rows = upazila, columns = basin,
    value = basin area km2 if the basin drains into the upazila, so a weighted mean over the
    columns is the catchment-average value; a second table weights by area outside Bangladesh."""
    with engine.connect() as c:
        static = pd.read_sql(text("""
            select id as node_id, point_lat as lat, point_lon as lon,
                   st_area(geom::geography) / 1e6 as area_km2
            from nodes where node_type = 'upazila' order by id"""), c).set_index("node_id")
        edges = c.execute(text("select src, dst, edge_type from edges")).all()
        basins = pd.read_sql(text("""
            select id as basin, st_area(geom::geography) / 1e6 as km2, 1 - coalesce(bd_share, 0) as outside
            from nodes where node_type = 'basin'"""), c).set_index("basin")
    # walk the drainage graph upstream in Python (1.7k edges; far faster than a recursive CTE)
    feeders: dict[str, list[str]] = {}
    for src, dst, kind in edges:
        if kind == "drains_to":
            feeders.setdefault(dst, []).append(src)
    rows = []
    for upz, first in ((s_, d) for s_, d, k in edges if k == "in_basin"):
        stack = [first]
        seen = {first}
        while stack:
            for f in feeders.get(stack.pop(), []):
                if f not in seen:
                    seen.add(f)
                    stack.append(f)
        rows += [(upz, b) for b in seen]
    up = pd.DataFrame(rows, columns=["upz", "basin"]).drop_duplicates().join(basins, on="basin")
    w = up.pivot_table(index="upz", columns="basin", values="km2", fill_value=0.0)
    w_out = (up.assign(km2=up.km2 * up.outside)
               .pivot_table(index="upz", columns="basin", values="km2", fill_value=0.0)
               .reindex(index=w.index, columns=w.columns, fill_value=0.0))
    static["catchment_km2"] = w.sum(axis=1).reindex(static.index).fillna(0)
    static["outside_share"] = (w_out.sum(axis=1) / w.sum(axis=1)).reindex(static.index).fillna(0)
    return static, (w.reindex(static.index, fill_value=0.0), w_out.reindex(static.index, fill_value=0.0))


def _weighted(series: pd.Series, w: pd.DataFrame) -> pd.Series:
    """Area-weighted mean of a per-node Series over each upazila's upstream basins."""
    vals = series.reindex(w.columns)
    mask = vals.notna().astype(float)
    num = w.values @ vals.fillna(0).values
    den = w.values @ mask.values
    return pd.Series(np.where(den > 0, num / np.maximum(den, 1e-9), np.nan), index=w.index)


def features_at(t0: pd.Timestamp, daily: dict[str, pd.DataFrame], static: pd.DataFrame, weights) -> pd.DataFrame:
    """One row per upazila for reference day t0. `daily` must cover t0-30 .. t0+FORECAST_DAYS-1."""
    w, w_out = weights
    P, R = daily["precip_mm"], daily["runoff_mm"]
    upz = static.index
    f = pd.DataFrame(index=upz)

    def window(df, a, b):  # sum over days [t0+a, t0+b)
        return df.loc[t0 + timedelta(days=a): t0 + timedelta(days=b - 1)].sum(min_count=1)

    for d in PAST_WINDOWS:
        p = window(P, -d, 0)
        f[f"rain_local_past{d}"] = p.reindex(upz)
        if d >= 3:
            f[f"rain_up_past{d}"] = _weighted(p, w)
    for d in (7, 15):
        f[f"rain_upout_past{d}"] = _weighted(window(P, -d, 0), w_out)
    fc = window(P, 0, FORECAST_DAYS)
    f["rain_local_next3"] = fc.reindex(upz)
    f["rain_up_next3"] = _weighted(fc, w)
    f["rain_upout_next3"] = _weighted(fc, w_out)
    for d in (7, 30):
        r = window(R, -d, 0)
        f[f"runoff_local_past{d}"] = r.reindex(upz)
        f[f"runoff_up_past{d}"] = _weighted(r, w)
    last = t0 - timedelta(days=1)
    for v in ("soil_water_1", "soil_water_2"):
        s = daily[v].loc[:last].iloc[-1] if len(daily[v].loc[:last]) else pd.Series(dtype=float)
        f[f"{v}_local"] = s.reindex(upz)
        f[f"{v}_up"] = _weighted(s, w)
    f["log_catchment"] = np.log1p(static["catchment_km2"])
    f["outside_share"] = static["outside_share"]
    f["lat"], f["lon"] = static["lat"], static["lon"]
    f["doy"] = t0.dayofyear
    return f



def training_table() -> pd.DataFrame:
    """Every (upazila, mapped window) pair with its Sentinel-1 abnormal flood fraction."""
    labels = pd.read_sql(text("""
        select l.node_id, l.event_id, e.post_start, l.abnormal_frac
        from flood_labels l join flood_events e on e.id = l.event_id
        where l.abnormal_frac is not null
          and e.id not like 'cyclone_%'  -- post-cyclone maps miss surge flooding in tidal areas"""),
        engine, parse_dates=["post_start"])
    static, weights = graph_tables()
    starts = sorted(labels.post_start.unique())
    daily = load_daily((min(starts) - timedelta(days=31)).date(), (max(starts) + timedelta(days=FORECAST_DAYS)).date())
    parts = []
    for t0 in starts:
        f = features_at(pd.Timestamp(t0), daily, static, weights)
        lab = labels[labels.post_start == t0]
        for ev, g in lab.groupby("event_id"):
            parts.append(f.join(g.set_index("node_id")[["abnormal_frac"]], how="inner")
                          .assign(event_id=ev, year=pd.Timestamp(t0).year).reset_index())
    return pd.concat(parts, ignore_index=True)
