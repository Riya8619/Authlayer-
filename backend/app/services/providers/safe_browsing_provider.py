from app.services.providers.base import BaseProvider


class SafeBrowsingProvider(BaseProvider):

    def analyze_text(self, text: str) -> dict:
        return {}

    def analyze_image(self, image_bytes: bytes) -> dict:
        return {}

    def check_url(self, url: str) -> dict:

        return {
            "provider": "google_safe_browsing",
            "malicious": False,
            "threats_found": []
        }