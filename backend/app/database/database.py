"""
Database engine and session management.

Production database is Neon PostgreSQL (set via DATABASE_URL). Connection
pooling is tuned for serverless/managed Postgres, which can close idle
connections — pool_pre_ping + pool_recycle protect against stale connections.
"""

from __future__ import annotations

from typing import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, declarative_base, sessionmaker

from app.core.config import settings
from app.core.logging_config import logger

Base = declarative_base()

if not settings.DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL is not set. Configure it in your environment "
        "(e.g. your Neon PostgreSQL connection string) before starting the app."
    )

_is_sqlite = settings.DATABASE_URL.startswith("sqlite")

_engine_kwargs = {"pool_pre_ping": True}
if _is_sqlite:
    # SQLite is only supported for local/dev fallback use, never production.
    _engine_kwargs["connect_args"] = {"check_same_thread": False}
else:
    _engine_kwargs.update(
        pool_size=5,
        max_overflow=10,
        pool_recycle=300,
    )

engine = create_engine(settings.DATABASE_URL, **_engine_kwargs)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency that yields a request-scoped DB session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables() -> None:
    """Create all tables if they don't already exist (idempotent)."""
    import app.database.models  # noqa: F401  (ensure models are registered)

    Base.metadata.create_all(bind=engine)
    logger.info("Database tables verified/created.")


def check_database_connection() -> bool:
    """Used at startup to fail fast if the database is unreachable."""
    from sqlalchemy import text

    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True
    except Exception as exc:  # noqa: BLE001
        logger.error("Database connection check failed: %s", exc)
        return False
