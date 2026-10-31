from datetime import datetime

from geoalchemy2 import Geometry
from sqlalchemy import JSON, DateTime, Float, ForeignKey, Integer, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base


class Node(Base):
    """Graph node. For now only upazilas; reaches and catchments are added in P1."""

    __tablename__ = "nodes"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    node_type: Mapped[str] = mapped_column(String(16), index=True)
    name: Mapped[str] = mapped_column(String(128))
    district: Mapped[str | None] = mapped_column(String(64), index=True)
    division: Mapped[str | None] = mapped_column(String(64), index=True)
    geom = mapped_column(Geometry("MULTIPOLYGON", srid=4326))
    point_lat: Mapped[float] = mapped_column(Float)
    point_lon: Mapped[float] = mapped_column(Float)
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
