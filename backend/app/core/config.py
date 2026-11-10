from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

ROOT = Path(__file__).resolve().parents[3]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=ROOT / ".env", extra="ignore")

    database_url: str
    ee_project: str = ""
    cdsapi_url: str = "https://cds.climate.copernicus.eu/api"
    cdsapi_key: str = ""
    telegram_bot_token: str = ""
    jwt_secret: str = ""
    ewds_url: str = "https://ewds.climate.copernicus.eu/api"
    ewds_key: str = ""
    healthchecks_forecast_url: str = ""
    healthchecks_era5_url: str = ""
    admin_chat_id: str = ""
    rate_limit_per_minute: int = 600  # per IP, generous because mobile users share IPs; 0 turns it off
    site_address: str = ""  # public host name (also used by Caddy), for links the bot sends

    open_meteo_gfs_url: str = "https://api.open-meteo.com/v1/gfs"
    ingest_interval_hours: int = 6
    data_dir: Path = ROOT / "data"


settings = Settings()
