from urllib.parse import urlparse


def analyze_url_structure(url: str):

    parsed = urlparse(url)

    suspicious = []

    # HTTP check
    if parsed.scheme != "https":

        suspicious.append(
            "URL does not use HTTPS"
        )

    # IP-based URLs
    domain = parsed.netloc

    if domain.replace(".", "").isdigit():

        suspicious.append(
            "IP-based URL detected"
        )

    # Suspicious keywords
    keywords = [
        "login",
        "verify",
        "secure",
        "account",
        "banking"
    ]

    lowered = url.lower()

    for keyword in keywords:

        if keyword in lowered:

            suspicious.append(
                f"Suspicious keyword detected: {keyword}"
            )

    return {
        "domain": domain,
        "scheme": parsed.scheme,
        "suspicious_signals": suspicious
    }