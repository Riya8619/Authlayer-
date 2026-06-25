from app.services.providers.huggingface_provider import HuggingFaceProvider
from app.services.providers.safe_browsing_provider import SafeBrowsingProvider

PROVIDERS = {
    "url_check": SafeBrowsingProvider(),
    "text_analysis": HuggingFaceProvider(),
    "image_analysis": HuggingFaceProvider(),
}


def get_provider(service_type: str):

    provider = PROVIDERS.get(service_type)

    if provider is None:
        raise Exception(f"Provider not found for service type: {service_type}")

    return provider