"""
Centralized configuration using pydantic-settings.
All secrets and config come from environment variables (or a .env file).
This keeps API keys out of code and makes deployment easy.
"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # App
    app_name: str = "NomadCal"
    debug: bool = False

    # Database — PostgreSQL connection string
    # Format: postgresql+asyncpg://user:password@host:port/dbname
    database_url: str = "postgresql+asyncpg://nomadcal:nomadcal@localhost:5432/nomadcal"

    # Redis — for caching flight/hotel prices
    redis_url: str = "redis://localhost:6379/0"

    # JWT Auth
    secret_key: str = "change-me-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24  # 24 hours

    # Google OAuth
    google_client_id: str = ""
    google_client_secret: str = ""

    class Config:
        env_file = ".env"  # auto-loads from backend/.env


# Single instance used across the app — import this everywhere
settings = Settings()
