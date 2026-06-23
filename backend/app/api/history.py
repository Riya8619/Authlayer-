from fastapi import APIRouter

from app.database.crud import (
    get_all_scans,
    get_scan_by_id
)

router = APIRouter()


@router.get("/history")
async def scan_history():

    scans = get_all_scans()

    results = []

    for scan in scans:

        results.append({
            "id": scan.id,
            "scan_type": scan.scan_type,
            "trust_score": scan.trust_score,
            "risk_level": scan.risk_level,
            "explanations": scan.explanations,
            "perceptual_hash": scan.perceptual_hash
        })

    return {
        "total_scans": len(results),
        "results": results
    }


@router.get("/history/{scan_id}")
async def scan_detail(scan_id: int):

    scan = get_scan_by_id(scan_id)

    if not scan:

        return {
            "success": False,
            "error": "Scan not found"
        }

    return {
        "success": True,
        "scan": {
            "id": scan.id,
            "scan_type": scan.scan_type,
            "trust_score": scan.trust_score,
            "risk_level": scan.risk_level,
            "explanations": scan.explanations,
            "perceptual_hash": scan.perceptual_hash
        }
    }