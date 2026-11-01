from datetime import date, datetime

from geoalchemy2 import Geometry
from sqlalchemy import JSON, Date, DateTime, Float, ForeignKey, Integer, String, UniqueConstraint, func
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
