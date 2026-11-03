from datetime import date, datetime

from geoalchemy2 import Geometry
from sqlalchemy import JSON, BigInteger, Boolean, Date, DateTime, Float, ForeignKey, Integer, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base


class Node(Base):
    """Graph node. node_type "upazila" (BBS) or "basin" (HydroBASINS level 7, GBM upstream)."""

    __tablename__ = "nodes"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    node_type: Mapped[str] = mapped_column(String(16), index=True)
    name: Mapped[str] = mapped_column(String(128))
    district: Mapped[str | None] = mapped_column(String(64), index=True)
    division: Mapped[str | None] = mapped_column(String(64), index=True)
    geom = mapped_column(Geometry("MULTIPOLYGON", srid=4326))
    point_lat: Mapped[float] = mapped_column(Float)
    point_lon: Mapped[float] = mapped_column(Float)
    bd_share: Mapped[float | None] = mapped_column(Float)  # fraction of area inside Bangladesh
    source: Mapped[str] = mapped_column(String(256))


class IngestRun(Base):
    """One pull from an external data source, with provenance."""

    __tablename__ = "ingest_runs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    source: Mapped[str] = mapped_column(String(64), index=True)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    finished_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    status: Mapped[str] = mapped_column(String(16), default="running")
    model_run_time: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    n_nodes: Mapped[int] = mapped_column(Integer, default=0)
    raw_path: Mapped[str | None] = mapped_column(String(512))
    sha256: Mapped[str | None] = mapped_column(String(64))
    error: Mapped[str | None] = mapped_column(String(2000))
    meta: Mapped[dict] = mapped_column(JSON, default=dict)


class RainForecast(Base):
    """Forecast rainfall accumulations per node for one ingest run."""

    __tablename__ = "rain_forecasts"
    __table_args__ = (UniqueConstraint("ingest_run_id", "node_id"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    ingest_run_id: Mapped[int] = mapped_column(ForeignKey("ingest_runs.id", ondelete="CASCADE"), index=True)
    node_id: Mapped[str] = mapped_column(ForeignKey("nodes.id"), index=True)
    issued_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    rain_24h_mm: Mapped[float] = mapped_column(Float)
    rain_48h_mm: Mapped[float] = mapped_column(Float)
    rain_72h_mm: Mapped[float] = mapped_column(Float)
    rain_past_72h_mm: Mapped[float] = mapped_column(Float)
    hourly: Mapped[dict] = mapped_column(JSON)


class Edge(Base):
    """Directed graph edge: basin drains_to basin, upazila in_basin basin (weight = area share)."""

    __tablename__ = "edges"
    __table_args__ = (UniqueConstraint("src", "dst", "edge_type"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    src: Mapped[str] = mapped_column(ForeignKey("nodes.id", ondelete="CASCADE"), index=True)
    dst: Mapped[str] = mapped_column(ForeignKey("nodes.id", ondelete="CASCADE"), index=True)
    edge_type: Mapped[str] = mapped_column(String(16), index=True)
    weight: Mapped[float] = mapped_column(Float, default=1.0)
    source: Mapped[str] = mapped_column(String(256))


class River(Base):
    """HydroRIVERS reach linked to the HydroBASINS node it lies in."""

    __tablename__ = "rivers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)  # HYRIV_ID
    next_down: Mapped[int] = mapped_column(Integer, index=True)
    main_riv: Mapped[int] = mapped_column(Integer, index=True)
    basin_id: Mapped[str | None] = mapped_column(ForeignKey("nodes.id", ondelete="SET NULL"), index=True)
    length_km: Mapped[float] = mapped_column(Float)
    upland_skm: Mapped[float] = mapped_column(Float)
    dis_av_cms: Mapped[float] = mapped_column(Float)
    ord_stra: Mapped[int] = mapped_column(Integer)
    geom = mapped_column(Geometry("LINESTRING", srid=4326))


class FloodEvent(Base):
    """A documented historical flood mapped from Sentinel-1 (P2 training labels)."""

    __tablename__ = "flood_events"

    id: Mapped[str] = mapped_column(String(32), primary_key=True)
    name: Mapped[str] = mapped_column(String(128))
    pre_start: Mapped[date] = mapped_column(Date)
    pre_end: Mapped[date] = mapped_column(Date)
    post_start: Mapped[date] = mapped_column(Date)
    post_end: Mapped[date] = mapped_column(Date)
    method: Mapped[str] = mapped_column(String(256))
    n_pre_scenes: Mapped[int] = mapped_column(Integer)
    n_post_scenes: Mapped[int] = mapped_column(Integer)
    computed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))


class FloodLabel(Base):
    """Sentinel-1 flooded area of one upazila during one event."""

    __tablename__ = "flood_labels"
    __table_args__ = (UniqueConstraint("event_id", "node_id"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    event_id: Mapped[str] = mapped_column(ForeignKey("flood_events.id", ondelete="CASCADE"), index=True)
    node_id: Mapped[str] = mapped_column(ForeignKey("nodes.id", ondelete="CASCADE"), index=True)
    flooded_km2: Mapped[float] = mapped_column(Float)
    flooded_frac: Mapped[float] = mapped_column(Float)
    abnormal_km2: Mapped[float | None] = mapped_column(Float)  # excluding normal seasonal water
    abnormal_frac: Mapped[float | None] = mapped_column(Float)


class Era5Daily(Base):
    """ERA5-Land daily history per node (P3 model inputs): area-mean over the node polygon."""

    __tablename__ = "era5_daily"

    node_id: Mapped[str] = mapped_column(ForeignKey("nodes.id", ondelete="CASCADE"), primary_key=True)
    day: Mapped[date] = mapped_column(Date, primary_key=True, index=True)
    precip_mm: Mapped[float | None] = mapped_column(Float)
    runoff_mm: Mapped[float | None] = mapped_column(Float)
    soil_water_1: Mapped[float | None] = mapped_column(Float)  # m3/m3, 0-7 cm
    soil_water_2: Mapped[float | None] = mapped_column(Float)  # m3/m3, 7-28 cm


class FloodForecastRun(Base):
    """One live flood forecast: model version + the GFS rain run it used."""

    __tablename__ = "flood_forecast_runs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    issued_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    reference_day: Mapped[date] = mapped_column(Date)
    valid_until: Mapped[date] = mapped_column(Date)
    model_version: Mapped[str] = mapped_column(String(64))
    rain_run_id: Mapped[int] = mapped_column(ForeignKey("ingest_runs.id"))
    era5_last_day: Mapped[date] = mapped_column(Date)
    meta: Mapped[dict] = mapped_column(JSON, default=dict)


class FloodForecast(Base):
    """Forecast for one upazila: expected abnormal flooded share and P(share >= threshold)."""

    __tablename__ = "flood_forecasts"
    __table_args__ = (UniqueConstraint("run_id", "node_id"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    run_id: Mapped[int] = mapped_column(ForeignKey("flood_forecast_runs.id", ondelete="CASCADE"), index=True)
    node_id: Mapped[str] = mapped_column(ForeignKey("nodes.id", ondelete="CASCADE"), index=True)
    flood_frac: Mapped[float] = mapped_column(Float)
    frac_p10: Mapped[float | None] = mapped_column(Float)
    frac_p90: Mapped[float | None] = mapped_column(Float)
    flood_prob: Mapped[float] = mapped_column(Float)
    risk: Mapped[str] = mapped_column(String(8))  # low / medium / high


class ModelVersion(Base):
    """Every trained flood model with its leave-one-year-out scores; one is active."""

    __tablename__ = "model_versions"

    version: Mapped[str] = mapped_column(String(64), primary_key=True)
    trained_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    path: Mapped[str] = mapped_column(String(256))
    metrics: Mapped[dict] = mapped_column(JSON)
    info: Mapped[dict] = mapped_column(JSON)
    is_active: Mapped[bool] = mapped_column(Boolean, default=False, index=True)


class Asset(Base):
    """Critical facility from OpenStreetMap (id = n/w/r + OSM id), linked to its upazila."""

    __tablename__ = "assets"

    id: Mapped[str] = mapped_column(String(24), primary_key=True)
    kind: Mapped[str] = mapped_column(String(16), index=True)
    name: Mapped[str | None] = mapped_column(String(256))
    name_bn: Mapped[str | None] = mapped_column(String(256))
    node_id: Mapped[str | None] = mapped_column(ForeignKey("nodes.id", ondelete="SET NULL"), index=True)
    geom = mapped_column(Geometry("POINT", srid=4326))


class Road(Base):
    """Major road from OpenStreetMap (motorway / trunk / primary)."""

    __tablename__ = "roads"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)  # OSM way id
    highway: Mapped[str] = mapped_column(String(16))
    ref: Mapped[str | None] = mapped_column(String(64))
    name: Mapped[str | None] = mapped_column(String(256))
    geom = mapped_column(Geometry("LINESTRING", srid=4326))


class Subscriber(Base):
    """A Telegram chat that asked for alerts for some upazilas."""

    __tablename__ = "subscribers"

    chat_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    lang: Mapped[str] = mapped_column(String(2), default="bn")
    voice: Mapped[bool | None] = mapped_column(Boolean, default=True)  # Bangla voice note with each message
    node_ids: Mapped[list] = mapped_column(JSON, default=list)
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class AlertLog(Base):
    """Every alert sent (or attempted), so nothing is sent twice and delivery can be audited."""

    __tablename__ = "alert_log"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    forecast_run_id: Mapped[int | None] = mapped_column(ForeignKey("flood_forecast_runs.id", ondelete="SET NULL"))
    chat_id: Mapped[int] = mapped_column(BigInteger, index=True)
    node_id: Mapped[str] = mapped_column(String(64), index=True)
    level: Mapped[str] = mapped_column(String(8))
    message: Mapped[str] = mapped_column(String(4096))
    status: Mapped[str] = mapped_column(String(16))  # sent / failed / test
    error: Mapped[str | None] = mapped_column(String(1000))
    sent_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
