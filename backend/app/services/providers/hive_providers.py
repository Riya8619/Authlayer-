from app.services.providers.base import BaseProvider


class HiveProvider(BaseProvider):

    def analyze_text(self, text: str) -> dict:
        return {}

    def analyze_image(self, image_bytes: bytes) -> dict:
        return {
            "provider": "hive",
            "result": "placeholder"
        }

    def check_url(self, url: str) -> dict:
        return {}