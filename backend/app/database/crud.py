"""
CRUD operations for ScanHistory.

Functions accept an active SQLAlchemy Session (injected by FastAPI's
Depends(get_db) in the routers) rather than opening a new session per call,
so connections are properly scoped to the request lifecycle and returned to
the pool.
"""

from __future__ import annotations

from typing import Any, Optional

from sqlalchemy.orm import Session

from app.database.models import ScanHistory


def save_scan(
    db: Session,
    scan_type: str,
    trust_score: int,
    risk_level: str,
    explanations: Any,
    perceptual_hash: Optional[str] = None,
) -> int:
    scan = ScanHistory(
        scan_type=scan_type,
        trust_score=trust_score,
        risk_level=risk_level,
        explanations=str(explanations),
        perceptual_hash=perceptual_hash,
    )
    db.add(scan)
    db.commit()
    db.refresh(scan)
    return scan.id


def get_all_scans(db: Session, limit: int = 200) -> list[ScanHistory]:
    return (
        db.query(ScanHistory)
        .order_by(ScanHistory.id.desc())
        .limit(limit)
        .all()
    )


def get_scan_by_id(db: Session, scan_id: int) -> Optional[ScanHistory]:
    return db.query(ScanHistory).filter(ScanHistory.id == scan_id).first()


def find_by_perceptual_hash(db: Session, perceptual_hash: str) -> Optional[ScanHistory]:
    return (
        db.query(ScanHistory)
        .filter(ScanHistory.perceptual_hash == perceptual_hash)
        .first()
    )
