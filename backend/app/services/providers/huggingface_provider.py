"""HuggingFace Inference API provider for AI-text detection."""

from __future__ import annotations

import requests

from app.core.config import settings
from app.core.logging_config import logger
from app.services.providers.base import BaseProvider


class HuggingFaceProvider(BaseProvider):
    def __init__(self) -> None:
        self.api_key = settings.HUGGINGFACE_API_KEY
        self.model_url = (
            "https://api-inference.huggingface.co/models/"
            "roberta-base-openai-detector"
        )

    def _headers(self) -> dict:
        headers = {}
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"
        return headers

    def analyze_text(self, text: str) -> dict:
        if not self.api_key:
            logger.warning("HUGGINGFACE_API_KEY not set; skipping text analysis.")
            return {
                "provider": "huggingface",
                "success": False,
                "error": "HUGGINGFACE_API_KEY is not configured",
            }

        try:
            response = requests.post(
                self.model_url,
                headers=self._headers(),
                json={"inputs": text},
                timeout=settings.PROVIDER_TIMEOUT_SECONDS,
            )
            response.raise_for_status()
            return {
                "provider": "huggingface",
                "success": True,
                "data": response.json(),
            }
        except requests.RequestException as exc:
            logger.error("HuggingFace text analysis failed: %s", exc)
            return {
                "provider": "huggingface",
                "success": False,
                "error": str(exc),
            }

    def analyze_image(self, image_bytes: bytes) -> dict:
        return {}

    def check_url(self, url: str) -> dict:
        return {}
