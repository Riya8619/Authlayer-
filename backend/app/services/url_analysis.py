"""Heuristic URL trust and phishing analysis."""

from __future__ import annotations

import re
from urllib.parse import parse_qs, unquote, urlparse

from app.services.scoring import compute_url_trust

TRUSTED_DOMAINS = {
    "google.com",
    "www.google.com",
    "youtube.com",
    "www.youtube.com",
    "youtu.be",
    "github.com",
    "www.github.com",
    "microsoft.com",
    "www.microsoft.com",
    "apple.com",
    "www.apple.com",
    "amazon.com",
    "www.amazon.com",
    "wikipedia.org",
    "www.wikipedia.org",
    "linkedin.com",
    "www.linkedin.com",
    "stackoverflow.com",
    "www.stackoverflow.com",
    "mozilla.org",
    "www.mozilla.org",
    "cloudflare.com",
    "www.cloudflare.com",
}

SUSPICIOUS_TLDS = {
    ".xyz",
    ".top",
    ".tk",
    ".ml",
    ".ga",
    ".cf",
    ".gq",
    ".buzz",
    ".cam",
    ".zip",
    ".mov",
    ".click",
    ".work",
    ".rest",
    ".monster",
    ".surf",
    ".icu",
}

PHISHING_KEYWORDS = [
    "login",
    "verify",
    "secure",
    "account",
    "banking",
    "password",
    "wallet",
    "signin",
    "update",
    "confirm",
    "suspend",
    "urgent",
    "credential",
    "paypal",
    "amazon",
    "microsoft",
    "appleid",
]

BRAND_IMPERSONATION = [
    "google",
    "microsoft",
    "apple",
    "amazon",
    "paypal",
    "netflix",
    "facebook",
    "instagram",
    "whatsapp",
    "bank",
]

IPV4_PATTERN = re.compile(
    r"^(\d{1,3}\.){3}\d{1,3}$"
)


class URLAnalysisError(ValueError):
    pass


def _normalize_url(raw: str) -> str:
    url = raw.strip()
    if not url:
        raise URLAnalysisError("URL cannot be empty")
    if not re.match(r"^[a-zA-Z][a-zA-Z0-9+.-]*://", url):
        url = f"https://{url}"
    return url


def _root_domain(host: str) -> str:
    host = host.lower().split(":")[0]
    if host.startswith("www."):
        host = host[4:]
    parts = host.split(".")
    if len(parts) >= 2:
        return ".".join(parts[-2:])
    return host


def _is_trusted(host: str) -> bool:
    host_lower = host.lower()
    if host_lower in TRUSTED_DOMAINS:
        return True
    root = _root_domain(host_lower)
    return root in {d.replace("www.", "") for d in TRUSTED_DOMAINS} or any(
        host_lower == d or host_lower.endswith("." + d) for d in TRUSTED_DOMAINS
    )


def _count_subdomains(host: str) -> int:
    host = host.split(":")[0].lower()
    parts = [p for p in host.split(".") if p]
    if len(parts) <= 2:
        return 0
    return len(parts) - 2


def analyze_url(raw_url: str) -> dict:
    """
    Perform structural and reputation heuristics on a URL.
    Returns scoring input for compute_url_trust plus raw diagnostics.
    """
    try:
        url = _normalize_url(raw_url)
        parsed = urlparse(url)
    except Exception as exc:
        raise URLAnalysisError(f"Invalid URL: {exc}") from exc

    if not parsed.netloc:
        raise URLAnalysisError("URL is missing a valid domain")

    host = parsed.netloc.lower()
    domain = _root_domain(host)
    path = unquote(parsed.path or "")
    full_lower = url.lower()
    query = parse_qs(parsed.query)

    bonuses: list[tuple[int, str]] = []
    penalties: list[tuple[int, str]] = []
    notes: list[str] = []
    metadata_issues: list[str] = []
    ai_probability = 15

    # Trusted domain boost
    if _is_trusted(host):
        bonuses.append((38, f"Known trusted domain: {domain}"))
        ai_probability = 8
    else:
        notes.append(f"Domain '{domain}' is not in the trusted allowlist")

    # HTTPS
    if parsed.scheme == "https":
        bonuses.append((12, "Connection uses HTTPS encryption"))
    else:
        penalties.append((22, "URL does not use HTTPS"))
        metadata_issues.append("Insecure HTTP scheme")
        ai_probability += 12

    # Suspicious TLD
    for tld in SUSPICIOUS_TLDS:
        if host.endswith(tld) or domain.endswith(tld):
            penalties.append((18, f"High-risk top-level domain ({tld})"))
            ai_probability += 20
            break

    # IP-based host
    bare_host = host.split(":")[0]
    if IPV4_PATTERN.match(bare_host):
        penalties.append((25, "Direct IP address used instead of domain name"))
        ai_probability += 18

    # URL length
    if len(url) > 120:
        penalties.append((10, "Unusually long URL may hide malicious destination"))
    elif len(url) < 12:
        penalties.append((8, "URL is unusually short or malformed"))

    # Excessive query parameters
    param_count = sum(len(v) for v in query.values())
    if len(query) > 8 or param_count > 12:
        penalties.append((14, "Excessive query parameters detected"))
        ai_probability += 10

    # Suspicious keywords (skip for trusted domains)
    if not _is_trusted(host):
        keyword_hits = [kw for kw in PHISHING_KEYWORDS if kw in full_lower]
        if keyword_hits:
            hit_count = min(len(keyword_hits), 4)
            penalties.append(
                (6 * hit_count, f"Phishing-related keywords: {', '.join(keyword_hits[:4])}")
            )
            ai_probability += 8 * hit_count

    # Brand impersonation in non-trusted domain
    if not _is_trusted(host):
        for brand in BRAND_IMPERSONATION:
            if brand in host and brand not in domain:
                penalties.append((20, f"Possible brand impersonation ({brand})"))
                ai_probability += 15
                break
            if brand in path and brand not in domain:
                penalties.append((12, f"Brand name '{brand}' in path but not official domain"))
                ai_probability += 10
                break

    # Subdomain stuffing
    sub_count = _count_subdomains(host)
    if sub_count >= 3:
        penalties.append((12, f"Excessive subdomains ({sub_count}) suggest redirect chains"))
        ai_probability += 8

    # @ symbol (credential phishing)
    if "@" in url:
        penalties.append((28, "Userinfo (@) pattern often used in credential phishing"))
        ai_probability += 22

    # Double slashes in path
    if "//" in path.lstrip("/"):
        penalties.append((8, "Malformed path with double slashes"))

    # Hyphen-heavy domain (fake domains)
    label = domain.split(".")[0] if "." in domain else domain
    if label.count("-") >= 2 and not _is_trusted(host):
        penalties.append((10, "Hyphen-heavy domain label common in spoofing"))
        ai_probability += 8

    # Numeric-heavy domain
    digit_ratio = sum(c.isdigit() for c in label) / max(len(label), 1)
    if digit_ratio > 0.4:
        penalties.append((12, "Domain contains unusually high numeric content"))
        ai_probability += 10

    # Punycode / homograph
    if "xn--" in host:
        penalties.append((16, "Internationalized (punycode) domain requires extra scrutiny"))
        metadata_issues.append("Punycode domain detected")

    # Redirect parameters
    redirect_keys = ("redirect", "url", "next", "goto", "return", "target", "redir")
    for key in query:
        if key.lower() in redirect_keys:
            penalties.append((10, "Open redirect parameter present in URL"))
            ai_probability += 6
            break

    # Domain age placeholder
    if _is_trusted(host):
        bonuses.append((8, "Established domain reputation (allowlist verified)"))
    else:
        penalties.append((6, "Domain age could not be verified (reputation unknown)"))
        metadata_issues.append("Domain reputation unverified")

    # Structure quality
    if parsed.scheme and host and not path.startswith(" "):
        bonuses.append((5, "URL structure is well-formed"))
    else:
        penalties.append((15, "Malformed URL structure"))

    # Port in URL (unusual)
    if parsed.port and parsed.port not in (80, 443):
        penalties.append((8, f"Non-standard port {parsed.port} in URL"))

    metadata_integrity_score = 85
    if metadata_issues:
        metadata_integrity_score -= 12 * len(metadata_issues)
    if not _is_trusted(host) and parsed.scheme != "https":
        metadata_integrity_score -= 15
    metadata_integrity_score = max(0, min(100, metadata_integrity_score))

    ai_probability = max(0, min(100, ai_probability))

    scoring_input = {
        "bonuses": bonuses,
        "penalties": penalties,
        "notes": notes,
        "ai_probability": ai_probability,
        "metadata_integrity_score": metadata_integrity_score,
        "metadata_issues": metadata_issues,
    }

    trust = compute_url_trust(scoring_input)

    return {
        "url": url,
        "domain": domain,
        "host": host,
        "scheme": parsed.scheme,
        "path_length": len(path),
        "query_param_count": len(query),
        "is_trusted_domain": _is_trusted(host),
        "suspicious_signals": [p[1] for p in penalties],
        "positive_signals": [b[1] for b in bonuses],
        "trust": trust,
        "diagnostics": scoring_input,
    }
