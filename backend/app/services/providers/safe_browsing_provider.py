"""Google Safe Browsing (v4) URL reputation provider."""

from __future__ import annotations

import requests

from app.core.config import settings
from app.core.logging_config import logger
from app.services.providers.base import BaseProvider

SAFE_BROWSING_ENDPOINT = "https://safebrowsing.googleapis.com/v4/threatMatches:find"

THREAT_TYPES = [
    "MALWARE",
    "SOCIAL_ENGINEERING",
    "UNWANTED_SOFTWARE",
    "POTENTIALLY_HARMFUL_APPLICATION",
]


class SafeBrowsingProvider(BaseProvider):
    def __init__(self) -> None:
        self.api_key = settings.GOOGLE_SAFE_BROWSING_API_KEY

    def analyze_text(self, text: str) -> dict:
        return {}

    def analyze_image(self, image_bytes: bytes) -> dict:
        return {}

    def check_url(self, url: str) -> dict:
        if not self.api_key:
            logger.warning(
                "GOOGLE_SAFE_BROWSING_API_KEY not set; skipping safe browsing check."
            )
            return {
                "provider": "google_safe_browsing",
                "success": False,
                "malicious": False,
                "threats_found": [],
                "warning": "GOOGLE_SAFE_BROWSING_API_KEY is not configured",
            }

        payload = {
            "client": {"clientId": "authlayer", "clientVersion": "1.0.0"},
            "threatInfo": {
                "threatTypes": THREAT_TYPES,
                "platformTypes": ["ANY_PLATFORM"],
                "threatEntryTypes": ["URL"],
                "threatEntries": [{"url": url}],
            },
        }

        try:
            response = requests.post(
                SAFE_BROWSING_ENDPOINT,
                params={"key": self.api_key},
                json=payload,
                timeout=settings.PROVIDER_TIMEOUT_SECONDS,
            )
            response.raise_for_status()
            data = response.json()
            matches = data.get("matches", [])

            return {
                "provider": "google_safe_browsing",
                "success": True,
                "malicious": len(matches) > 0,
                "threats_found": [m.get("threatType") for m in matches],
            }
        except requests.RequestException as exc:
            logger.error("Safe Browsing check failed: %s", exc)
            return {
                "provider": "google_safe_browsing",
                "success": False,
                "malicious": False,
                "threats_found": [],
                "error": str(exc),
            }
