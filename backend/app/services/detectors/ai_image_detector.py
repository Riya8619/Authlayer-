import os
import requests

HF_TOKEN = os.getenv("HUGGINGFACE_API_KEY", "")

HEADERS = {
    "Authorization": f"Bearer {HF_TOKEN}"
}

MODEL_URL = (
    "https://api-inference.huggingface.co/models/"
    "umm-maybe/AI-image-detector"
)

def detect_ai_image(image_bytes: bytes):

    if not HF_TOKEN:
        return {
            "success": False,
            "error": "HUGGINGFACE_API_KEY not configured"
        }

    try:

        response = requests.post(
            MODEL_URL,
            headers=HEADERS,
            data=image_bytes,
            timeout=30
        )

        return {
            "success": True,
            "provider": "huggingface",
            "result": response.json()
        }

    except Exception as e:

        return {
            "success": False,
            "error": str(e)
        }