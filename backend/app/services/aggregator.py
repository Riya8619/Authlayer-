def compute_trust_score(
    image_result,
    metadata_result,
    ai_result
):

    score = 100

    explanations = []

    # Metadata checks
    if not metadata_result["metadata_found"]:

        score -= 25

        explanations.append(
            "No metadata found in image"
        )

    # PNG heuristic
    if image_result["format"] == "PNG":

        score -= 10

        explanations.append(
            "PNG images may lack original camera metadata"
        )

    # Weak metadata
    if metadata_result["metadata_count"] < 3:

        score -= 15

        explanations.append(
            "Very limited metadata detected"
        )

    # AI detection signal
    try:

        predictions = ai_result["result"]

        if isinstance(predictions, list):

            for item in predictions:

                label = item.get("label", "").lower()

                score_value = item.get("score", 0)

                if "ai" in label and score_value > 0.7:

                    score -= 40

                    explanations.append(
                        f"High probability AI-generated image ({round(score_value * 100)}%)"
                    )

    except:
        pass

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