import os

API_KEYS = {
    "google_safe_browsing": os.getenv("GOOGLE_SAFE_BROWSING_API_KEY", ""),
    "huggingface": os.getenv("HUGGINGFACE_API_KEY", ""),
}