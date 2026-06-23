import requests

from app.core.config_loader import API_KEYS


HF_TOKEN = API_KEYS["huggingface"]

HEADERS = {
    "Authorization": f"Bearer {HF_TOKEN}"
}

MODEL_URL = (
    "https://api-inference.huggingface.co/models/"
    "umm-maybe/AI-image-detector"
)


def detect_ai_image(image_bytes: bytes):

    try:

        response = requests.post(
            MODEL_URL,
            headers=HEADERS,
            data=image_bytes
        )

        result = response.json()

        return {
            "success": True,
            "provider": "huggingface",
            "result": result
        }

    except Exception as e:

        return {
            "success": False,
            "error": str(e)
        }