"""
Provider registry.

Provider selection is driven by environment variables (TEXT_DETECTION_PROVIDER,
URL_CHECK_PROVIDER) instead of a JSON config file, so it can be changed per
deployment without editing code or committing files.
"""

from __future__ import annotations

from app.core.config import settings
from app.services.providers.huggingface_provider import HuggingFaceProvider
from app.services.providers.safe_browsing_provider import SafeBrowsingProvider

PROVIDERS = {
    "huggingface": HuggingFaceProvider(),
    "google_safe_browsing": SafeBrowsingProvider(),
}

_SERVICE_TYPE_TO_PROVIDER_NAME = {
    "text_detection": settings.TEXT_DETECTION_PROVIDER,
    "url_check": settings.URL_CHECK_PROVIDER,
}


def get_provider(service_type: str):
    provider_name = _SERVICE_TYPE_TO_PROVIDER_NAME.get(service_type)

    if provider_name not in PROVIDERS:
        raise ValueError(
            f"No provider configured for service type '{service_type}' "
            f"(resolved provider name: '{provider_name}')"
        )

    return PROVIDERS[provider_name]
