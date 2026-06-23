from app.core.config_loader import load_json

from app.services.providers.huggingface_provider import HuggingFaceProvider
from app.services.providers.safe_browsing_provider import SafeBrowsingProvider

providers_config = load_json("config/providers.json")

PROVIDERS = {
    "huggingface": HuggingFaceProvider(),
    "google_safe_browsing": SafeBrowsingProvider()
}


def get_provider(service_type: str):

    provider_name = providers_config.get(service_type)

    if provider_name not in PROVIDERS:
        raise Exception(f"Provider not found: {provider_name}")

    return PROVIDERS[provider_name]