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

    open_meteo_gfs_url: str = "https://api.open-meteo.com/v1/gfs"
    ingest_interval_hours: int = 6
    data_dir: Path = ROOT / "data"


settings = Settings()
