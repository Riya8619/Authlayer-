"""
Centralized application configuration.

All configuration is loaded from environment variables (via a local .env file
in development, or platform-injected env vars in production on Render /
Railway). No JSON config files are used — this keeps secrets out of the
repository and makes the app deployable without manual edits.
"""

from __future__ import annotations

from functools import lru_cache
from typing import List

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # --- App ---
    APP_NAME: str = "AuthLayer API"
    ENVIRONMENT: str = Field(default="development")  # development | production
    PORT: int = Field(default=8000)

    # --- Database (Neon PostgreSQL in production) ---
    DATABASE_URL: str = Field(
        default="",
        description="SQLAlchemy database URL. Required in production (Neon PostgreSQL).",
    )

    # --- CORS ---
    ALLOWED_ORIGINS: str = Field(
        default="http://localhost:3000,http://127.0.0.1:3000",
        description="Comma-separated list of allowed CORS origins.",
    )

    # --- Provider selection (replaces config/providers.json) ---
    TEXT_DETECTION_PROVIDER: str = Field(default="huggingface")
    URL_CHECK_PROVIDER: str = Field(default="google_safe_browsing")

    # --- Provider API keys (replaces config/api_keys.json) ---
    HUGGINGFACE_API_KEY: str = Field(default="")
    GOOGLE_SAFE_BROWSING_API_KEY: str = Field(default="")

    # --- HTTP client behavior ---
    PROVIDER_TIMEOUT_SECONDS: float = Field(default=15.0)

    @field_validator("DATABASE_URL")
    @classmethod
    def _normalize_database_url(cls, value: str) -> str:
        # Some providers hand out "postgres://" URLs, which SQLAlchemy 1.4+/2.x
        # no longer accepts directly — normalize to "postgresql://".
        if value.startswith("postgres://"):
            value = value.replace("postgres://", "postgresql://", 1)
        return value

    @property
    def cors_origins(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT.lower() == "production"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
