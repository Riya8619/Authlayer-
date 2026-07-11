from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.crud import get_all_scans, get_scan_by_id
from app.database.database import get_db
from app.schemas.scan_schema import ScanHistoryDetailResponse, ScanHistoryListResponse

router = APIRouter(tags=["history"])


@router.get("/history", response_model=ScanHistoryListResponse)
async def scan_history(db: Session = Depends(get_db)):
    scans = get_all_scans(db)

    results = [
        {
            "id": scan.id,
            "scan_type": scan.scan_type,
            "trust_score": scan.trust_score,
            "risk_level": scan.risk_level,
            "explanations": scan.explanations,
            "perceptual_hash": scan.perceptual_hash,
            "created_at": scan.created_at,
        }
        for scan in scans
    ]

    return {"total_scans": len(results), "results": results}


@router.get("/history/{scan_id}", response_model=ScanHistoryDetailResponse)
async def scan_detail(scan_id: int, db: Session = Depends(get_db)):
    scan = get_scan_by_id(db, scan_id)

    if not scan:
        return {"success": False, "error": "Scan not found"}

    return {
        "success": True,
        "scan": {
            "id": scan.id,
            "scan_type": scan.scan_type,
            "trust_score": scan.trust_score,
            "risk_level": scan.risk_level,
            "explanations": scan.explanations,
            "perceptual_hash": scan.perceptual_hash,
            "created_at": scan.created_at,
        },
    }
