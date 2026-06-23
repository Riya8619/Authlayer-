from app.database.database import SessionLocal
from app.database.models import ScanHistory


def save_scan(
    scan_type,
    trust_score,
    risk_level,
    explanations,
    perceptual_hash=None
):

    db = SessionLocal()

    try:

        scan = ScanHistory(
            scan_type=scan_type,
            trust_score=trust_score,
            risk_level=risk_level,
            explanations=str(explanations),
            perceptual_hash=perceptual_hash
        )

        db.add(scan)

        db.commit()

        db.refresh(scan)

        return scan.id

    finally:

        db.close()


def get_all_scans():

    db = SessionLocal()

    try:

        scans = db.query(ScanHistory).all()

        return scans

    finally:

        db.close()


def get_scan_by_id(scan_id):

    db = SessionLocal()

    try:

        scan = db.query(ScanHistory).filter(
            ScanHistory.id == scan_id
        ).first()

        return scan

    finally:

        db.close()