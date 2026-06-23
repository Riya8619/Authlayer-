from fastapi import APIRouter, HTTPException

from app.database.crud import save_scan
from app.schemas.url_schema import URLScanRequest
from app.services.registry import get_provider
from app.services.scoring import to_frontend_payload
from app.services.url_analysis import URLAnalysisError, analyze_url

router = APIRouter()


@router.post("/scan-url")
async def scan_url(payload: URLScanRequest):
    try:
        analysis = analyze_url(payload.url)

        provider = get_provider("url_check")
        safe_result = provider.check_url(analysis["url"])

        trust = analysis["trust"]

        if safe_result.get("malicious"):
            trust["trust_score"] = max(0, trust["trust_score"] - 60)
            trust["explanations"].append("URL flagged by safe browsing provider")
            trust["risk_level"] = "critical" if trust["trust_score"] < 30 else "high"

        scan_id = save_scan(
            scan_type="url",
            trust_score=trust["trust_score"],
            risk_level=trust["risk_level"],
            explanations=trust["explanations"],
        )

        response = to_frontend_payload(trust)
        response["scanId"] = scan_id
        response["success"] = True
        response["structureAnalysis"] = {
            "domain": analysis["domain"],
            "scheme": analysis["scheme"],
            "isTrustedDomain": analysis["is_trusted_domain"],
            "suspiciousSignals": analysis["suspicious_signals"],
            "positiveSignals": analysis["positive_signals"],
        }
        response["safeBrowsing"] = safe_result
        return response

    except URLAnalysisError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"URL scan failed: {exc}",
        ) from exc
