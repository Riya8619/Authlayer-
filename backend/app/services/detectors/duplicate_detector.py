"""Perceptual-hash duplicate lookup against previously scanned images."""

from __future__ import annotations

from sqlalchemy.orm import Session

from app.database.crud import find_by_perceptual_hash


def find_similar_hash(db: Session, perceptual_hash: str) -> dict:
    existing = find_by_perceptual_hash(db, perceptual_hash)

    if existing:
        return {
            "duplicate_found": True,
            "existing_scan_id": existing.id,
        }

    return {"duplicate_found": False}
