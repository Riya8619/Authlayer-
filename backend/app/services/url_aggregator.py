def compute_url_trust_score(
    structure_result,
    safe_browsing_result
):

    score = 100

    explanations = []

    suspicious = structure_result[
        "suspicious_signals"
    ]

    # Structural penalties
    for signal in suspicious:

        score -= 10

        explanations.append(signal)

    # Safe browsing penalties
    if safe_browsing_result["malicious"]:

        score -= 60

        explanations.append(
            "URL flagged as malicious"
        )

    # Clamp
    score = max(0, min(score, 100))

    # Risk level
    if score >= 80:
        risk = "low"

    elif score >= 50:
        risk = "medium"

    else:
        risk = "high"

    return {
        "trust_score": score,
        "risk_level": risk,
        "explanations": explanations
    }