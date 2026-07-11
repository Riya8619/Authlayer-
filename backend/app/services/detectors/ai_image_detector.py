"""HuggingFace-backed AI-generated image detection."""

from __future__ import annotations

import requests

from app.core.config import settings
from app.core.logging_config import logger

MODEL_URL = (
    "https://api-inference.huggingface.co/models/umm-maybe/AI-image-detector"
)


def detect_ai_image(image_bytes: bytes) -> dict:
    if not settings.HUGGINGFACE_API_KEY:
        logger.warning("HUGGINGFACE_API_KEY not set; skipping AI image detection.")
        return {
            "success": False,
            "provider": "huggingface",
            "error": "HUGGINGFACE_API_KEY is not configured",
        }

    try:
        response = requests.post(
            MODEL_URL,
            headers={"Authorization": f"Bearer {settings.HUGGINGFACE_API_KEY}"},
            data=image_bytes,
            timeout=settings.PROVIDER_TIMEOUT_SECONDS,
        )
        response.raise_for_status()
        return {
            "success": True,
            "provider": "huggingface",
            "result": response.json(),
        }
    except requests.RequestException as exc:
        logger.error("AI image detection failed: %s", exc)
        return {
            "success": False,
            "provider": "huggingface",
            "error": str(exc),
        }
