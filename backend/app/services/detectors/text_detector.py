from app.services.registry import get_provider


def analyze_text(text: str):

    provider = get_provider("text_detection")

    result = provider.analyze_text(text)

    return result