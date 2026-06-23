import requests

from app.services.providers.base import BaseProvider
from app.core.config_loader import API_KEYS


class HuggingFaceProvider(BaseProvider):

    def __init__(self):

        self.api_key = API_KEYS["huggingface"]

        self.headers = {
            "Authorization": f"Bearer {self.api_key}"
        }

        self.model_url = (
            "https://api-inference.huggingface.co/models/"
            "roberta-base-openai-detector"
        )

    def analyze_text(self, text: str) -> dict:

        payload = {
            "inputs": text
        }

        try:

            response = requests.post(
                self.model_url,
                headers=self.headers,
                json=payload
            )

            data = response.json()

            return {
                "provider": "huggingface",
                "success": True,
                "data": data
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