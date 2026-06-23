"""Centralized trust scoring engine for URL and image analysis."""

from __future__ import annotations

from typing import Any


def score_to_risk_level(score: int) -> str:
    if score >= 90:
        return "low"
    if score >= 70:
        return "low" if score >= 80 else "medium"
    if score >= 50:
        return "medium"
    if score >= 30:
        return "high"
    return "critical"


def compute_url_trust(analysis: dict[str, Any]) -> dict[str, Any]:
    """Aggregate URL analysis signals into a trust score and explanations."""
    score = 50
    explanations: list[str] = []

    for bonus, message in analysis.get("bonuses", []):
        score += bonus
        explanations.append(message)

    for penalty, message in analysis.get("penalties", []):
        score -= penalty
        explanations.append(message)

    for note in analysis.get("notes", []):
        if note not in explanations:
            explanations.append(note)

    score = max(0, min(100, round(score)))

    ai_probability = max(0, min(100, analysis.get("ai_probability", 0)))
    metadata_score = max(0, min(100, analysis.get("metadata_integrity_score", 70)))

    return {
        "trust_score": score,
        "risk_level": score_to_risk_level(score),
        "ai_generated_probability": ai_probability,
        "metadata_integrity": {
            "score": metadata_score,
            "issues": analysis.get("metadata_issues", []),
        },
        "duplicate_count": 0,
        "explanations": explanations[:12] or ["URL structure analyzed with no major anomalies"],
    }


def compute_image_trust(analysis: dict[str, Any]) -> dict[str, Any]:
    """Aggregate image analysis signals into a trust score and explanations."""
    score = 50
    explanations: list[str] = list(analysis.get("explanations", []))

    for bonus, message in analysis.get("bonuses", []):
        score += bonus
        if message not in explanations:
            explanations.append(message)

    for penalty, message in analysis.get("penalties", []):
        score -= penalty
        if message not in explanations:
            explanations.append(message)

    if analysis.get("duplicate_found"):
        score -= 12
        msg = "Perceptual hash matches a previously scanned image"
        if msg not in explanations:
            explanations.append(msg)

    score = max(0, min(100, round(score)))

    ai_probability = max(0, min(100, round(analysis.get("ai_probability", 0))))
    metadata_score = max(0, min(100, round(analysis.get("metadata_integrity_score", 0))))

    return {
        "trust_score": score,
        "risk_level": score_to_risk_level(score),
        "ai_generated_probability": ai_probability,
        "metadata_integrity": {
            "score": metadata_score,
            "issues": analysis.get("metadata_issues", []),
        },
        "duplicate_count": 1 if analysis.get("duplicate_found") else 0,
        "explanations": explanations[:14] or ["Image forensic pass completed"],
    }


def to_frontend_payload(trust_result: dict[str, Any]) -> dict[str, Any]:
    """Map internal trust result to camelCase fields expected by the dashboard."""
    metadata = trust_result.get("metadata_integrity", {})
    return {
        "trustScore": trust_result["trust_score"],
        "riskLevel": trust_result["risk_level"],
        "aiGeneratedProbability": trust_result.get(
            "ai_generated_probability",
            trust_result.get("ai_probability", 0),
        ),
        "metadataIntegrity": {
            "score": metadata.get("score", 0),
            "issues": metadata.get("issues", []),
        },
        "duplicateCount": trust_result.get("duplicate_count", 0),
        "explanations": trust_result.get("explanations", []),
        "forensicDetails": build_forensic_details(trust_result),
    }


def build_forensic_details(trust_result: dict[str, Any]) -> list[dict[str, str]]:
    score = trust_result["trust_score"]
    risk = trust_result["risk_level"]
    ai_prob = trust_result.get("ai_generated_probability", 0)
    metadata = trust_result.get("metadata_integrity", {})
    meta_score = metadata.get("score", 0)
    dup_count = trust_result.get("duplicate_count", 0)

    def status_for_threshold(
        value: float,
        safe_at: float,
        warn_at: float,
    ) -> str:
        if value >= safe_at:
            return "safe"
        if value >= warn_at:
            return "warning"
        return "danger"

    risk_status = (
        "safe" if risk == "low" else "warning" if risk == "medium" else "danger"
    )

    return [
        {
            "label": "Trust Index",
            "value": f"{score}/100",
            "status": status_for_threshold(score, 70, 40),
        },
        {
            "label": "AI Synthesis",
            "value": f"{ai_prob}%",
            "status": status_for_threshold(100 - ai_prob, 30, 60),
        },
        {
            "label": "Metadata Chain",
            "value": f"{meta_score}%",
            "status": status_for_threshold(meta_score, 75, 50),
        },
        {
            "label": "Risk Posture",
            "value": risk.upper(),
            "status": risk_status,
        },
        {
            "label": "Duplicate Signals",
            "value": str(dup_count),
            "status": "safe" if dup_count == 0 else "warning",
        },
    ]
