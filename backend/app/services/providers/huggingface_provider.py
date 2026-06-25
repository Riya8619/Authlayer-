import os
import requests

from app.services.providers.base import BaseProvider


class HuggingFaceProvider(BaseProvider):

    def __init__(self):

        self.api_key = os.getenv("HUGGINGFACE_API_KEY", "")

        self.headers = {
            "Authorization": f"Bearer {self.api_key}"
        }

        self.model_url = (
            "https://api-inference.huggingface.co/models/"
            "roberta-base-openai-detector"
        )

    def analyze_text(self, text: str) -> dict:

        if not self.api_key:
            return {
                "provider": "huggingface",
                "success": False,
                "error": "HUGGINGFACE_API_KEY not configured"
            }

        payload = {
            "inputs": text
        }

        try:

            response = requests.post(
                self.model_url,
                headers=self.headers,
                json=payload,
                timeout=30
            )

            return {
                "provider": "huggingface",
                "success": True,
                "data": response.json()
            }

        except Exception as e:

            return {
                "provider": "huggingface",
                "success": False,
                "error": str(e)
            }

    def analyze_image(self, image_bytes: bytes) -> dict:
        return {}

    def check_url(self, url: str) -> dict:
        return {}