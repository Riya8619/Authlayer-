from app.database.database import SessionLocal
from app.database.models import ScanHistory


def find_similar_hash(perceptual_hash):

    db = SessionLocal()

    try:

        existing = db.query(ScanHistory).filter(
            ScanHistory.perceptual_hash == perceptual_hash
        ).first()

        if existing:

            return {
                "duplicate_found": True,
                "existing_scan_id": existing.id
            }

        return {
            "duplicate_found": False
        }

    finally:

        db.close()