"""Upstream river outlook from GloFAS (Copernicus CEMS): 50-member ensemble discharge at the main rivers
where they enter Bangladesh. The chance is simply the share of members above the river's own 2-year flow,
computed from GloFAS's own reanalysis, because GloFAS flows are biased against measured gauges and must
never be compared with BWDB danger levels directly.
"""

import logging
import shutil
import tempfile
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

import cdsapi
import numpy as np
import xarray as xr

from app.core.config import settings
from app.db.models import GlofasOutlook, GlofasPoint
from app.db.session import Base, SessionLocal, engine

log = logging.getLogger(__name__)
AREA = [27.5, 87.5, 22.5, 93.0]  # N, W, S, E
LEADS = list(range(24, 241, 24))  # 10 days
HIST_YEARS = range(2005, 2026)
ANN_CACHE = settings.data_dir / "glofas_annual_max.nc"

# id, Bangla name, GloFAS grid cell (checked by hand against the river's flow), areas downstream.
# GloFAS does not split the Barak into Surma and Kushiyara, so it is one point; hill water from Meghalaya is separate.
POINTS = [
    ("teesta", "তিস্তা", 26.225, 89.025, "Lalmonirhat, Nilphamari, Rangpur", "লালমনিরহাট, নীলফামারী, রংপুর"),
    ("brahmaputra", "ব্রহ্মপুত্র", 25.725, 89.775, "Kurigram, Jamalpur, Sirajganj", "কুড়িগ্রাম, জামালপুর, সিরাজগঞ্জ"),
    ("ganges", "গঙ্গা", 24.825, 87.925, "Rajshahi, Pabna", "রাজশাহী, পাবনা"),
    ("barak", "বরাক (সুরমা-কুশিয়ারার উজান)", 24.875, 92.425, "Sylhet, Moulvibazar", "সিলেট, মৌলভীবাজার"),
    ("meghalaya_east", "মেঘালয় থেকে নামা পানি (সিলেট)", 25.025, 91.925, "Sylhet", "সিলেট"),
    ("meghalaya_west", "মেঘালয় থেকে নামা পানি (সুনামগঞ্জ)", 25.075, 91.475, "Sunamganj", "সুনামগঞ্জ"),
    ("gomti", "গোমতী", 23.475, 91.175, "Cumilla", "কুমিল্লা"),
    ("muhuri", "মুহুরী", 23.025, 91.475, "Feni", "ফেনী"),
]


def _client() -> cdsapi.Client:
    return cdsapi.Client(url=settings.ewds_url, key=settings.ewds_key, quiet=True, progress=False)


def _open(path: Path) -> xr.DataArray:
    ds = xr.open_dataset(path, engine="cfgrib", backend_kwargs={"indexpath": ""})
    return ds[list(ds.data_vars)[0]].load()


def _annual_maxima() -> xr.DataArray:
    """Annual maximum flow per grid cell, GloFAS reanalysis 2005-2025. Kept on disk: it takes hours to download."""
    if ANN_CACHE.exists():
        return xr.open_dataarray(ANN_CACHE).load()
    c, tmp = _client(), Path(tempfile.mkdtemp())
    try:
        maxima = []
        for y in HIST_YEARS:
            f = tmp / f"h{y}.grib"
            c.retrieve("cems-glofas-historical", {
                "system_version": ["version_4_0"], "hydrological_model": ["lisflood"], "product_type": ["consolidated"],
                "variable": ["average_river_discharge_in_the_last_24_hours"], "timespan": ["time_mean"], "year": [str(y)],
                "month": [f"{m:02d}" for m in range(1, 13)], "day": [f"{d:02d}" for d in range(1, 32)],
                "data_format": "grib2", "download_format": "unarchived", "area": AREA}, str(f))
            a = _open(f)
            maxima.append(a.max("valid_time" if "valid_time" in a.dims else "time").drop_vars(["time", "valid_time", "step", "surface"], errors="ignore"))
            log.info("GloFAS history %d done", y)
        ann = xr.concat(maxima, "year").assign_coords(year=list(HIST_YEARS)).rename("annual_max")
        ANN_CACHE.parent.mkdir(parents=True, exist_ok=True)
        ann.to_netcdf(ANN_CACHE)
        return ann
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


def build_thresholds() -> int:
    """2-year flow per point: the median of the annual maximum."""
    Base.metadata.create_all(engine, tables=[GlofasPoint.__table__, GlofasOutlook.__table__])
    ann = _annual_maxima()
    with SessionLocal() as db:
        db.query(GlofasOutlook).delete()
        db.query(GlofasPoint).delete()
        for pid, bn, lat, lon, down, down_bn in POINTS:
            cell = ann.sel(latitude=lat, longitude=lon, method="nearest")
            db.add(GlofasPoint(id=pid, name_bn=bn, lat=lat, lon=lon, down_en=down, down_bn=down_bn,
                               q2=float(cell.median()), n_years=int(cell.notnull().sum())))
        db.commit()
    return len(POINTS)


def fetch_ensemble(day: date, path: Path) -> xr.DataArray:
    _client().retrieve("cems-glofas-forecast", {
        "system_version": ["operational"], "hydrological_model": ["lisflood"], "product_type": ["ensemble_perturbed_forecasts"],
        "variable": "river_discharge_in_the_last_24_hours", "year": [str(day.year)], "month": [f"{day.month:02d}"],
        "day": [f"{day.day:02d}"], "leadtime_hour": [str(h) for h in LEADS],
        "data_format": "grib2", "download_format": "unarchived", "area": AREA}, str(path))
    return _open(path)


def refresh_glofas(day: date | None = None) -> int:
    """Today's ensemble: store, per point and lead day, the share of the members above the 2-year flow."""
    day = day or date.today() - timedelta(days=1)  # today's run is published with a delay
    tmp = Path(tempfile.mkdtemp())
    try:
        ens, n = fetch_ensemble(day, tmp / "ens.grib"), 0
        now = datetime.now(timezone.utc)
        with SessionLocal() as db:
            for p in db.query(GlofasPoint).all():
                cell = ens.sel(latitude=p.lat, longitude=p.lon, method="nearest")
                for step in cell.step.values:
                    vals = cell.sel(step=step).values
                    vals = vals[~np.isnan(vals)]
                    if not len(vals):
                        continue
                    valid = day + timedelta(days=int(step / np.timedelta64(1, "D")))
                    db.merge(GlofasOutlook(point_id=p.id, run_day=day, valid_day=valid, issued_at=now, members=len(vals),
                                           chance=float((vals > p.q2).mean()), q_median=float(np.median(vals))))
                    n += 1
            db.commit()
        log.info("GloFAS %s stored: %d rows", day, n)
        return n
    finally:
        shutil.rmtree(tmp, ignore_errors=True)
