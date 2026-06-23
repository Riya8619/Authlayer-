"""Forensic image analysis using Pillow, imagehash, and exifread."""

from __future__ import annotations

import io
import math
from typing import Any

import exifread
import imagehash
from PIL import Image, ImageFilter, ImageStat

from app.services.scoring import compute_image_trust

ALLOWED_FORMATS = {"JPEG", "PNG", "WEBP", "GIF", "BMP", "TIFF", "MPO"}
MAX_FILE_BYTES = 25 * 1024 * 1024

class ImageAnalysisError(ValueError):
    pass


def _shannon_entropy(image: Image.Image) -> float:
    gray = image.convert("L")
    histogram = gray.histogram()
    total = sum(histogram)
    if total == 0:
        return 0.0
    entropy = 0.0
    for count in histogram:
        if count == 0:
            continue
        p = count / total
        entropy -= p * math.log2(p)
    return entropy


def _grayscale_uniformity(gray: Image.Image) -> float:
    """0 = varied tones, 1 = very flat (synthetic look)."""
    stat = ImageStat.Stat(gray)
    mean = stat.mean[0]
    if mean == 0:
        return 1.0
    spread = stat.stddev[0] / max(mean, 1.0)
    return max(0.0, 1.0 - min(spread / 80.0, 1.0))


def _edge_noise_score(gray: Image.Image) -> tuple[float, str]:
    edges = gray.filter(ImageFilter.FIND_EDGES)
    edge_stat = ImageStat.Stat(edges)
    edge_std = edge_stat.stddev[0]
    if edge_std < 8:
        return 0.75, "Very low edge variation (possible synthetic smoothing)"
    if edge_std > 65:
        return 0.65, "High edge noise inconsistent with natural capture"
    return 0.2, "Edge distribution appears consistent with natural imagery"


def _compression_artifact_score(image: Image.Image, file_size: int) -> tuple[int, str | None]:
    """Heuristic: re-encode JPEG and compare size ratio."""
    if image.format not in ("JPEG", "JPG") or file_size < 5000:
        return 0, None
    buffer = io.BytesIO()
    try:
        rgb = image.convert("RGB")
        rgb.save(buffer, format="JPEG", quality=85, optimize=True)
        recompressed = buffer.tell()
        ratio = recompressed / max(file_size, 1)
        if ratio < 0.35:
            return 12, "Heavy compression artifacts detected"
        if ratio > 1.15:
            return 6, "Unusual compression ratio for JPEG payload"
    except Exception:
        pass
    return 0, None


def _extract_exif(file_bytes: bytes) -> dict[str, str]:
    tags = exifread.process_file(io.BytesIO(file_bytes), details=False)
    return {str(k): str(v) for k, v in tags.items()}


def _metadata_integrity(exif: dict[str, str]) -> tuple[int, list[str], list[str]]:
    issues: list[str] = []
    explanations: list[str] = []
    score = 100

    if not exif:
        return 25, ["No EXIF metadata present"], ["Missing EXIF metadata reduces provenance confidence"]

    important = [
        "EXIF DateTimeOriginal",
        "Image DateTime",
        "EXIF Make",
        "EXIF Model",
        "GPS GPSLatitude",
    ]
    found = sum(1 for key in important if any(key in k for k in exif))
    score = 40 + found * 12

    if found == 0:
        issues.append("No camera or capture timestamp in metadata")
        score = 35
    elif found < 2:
        issues.append("Sparse EXIF tags (limited provenance chain)")
        score = min(score, 55)

    has_software = any("Software" in k for k in exif)
    if not has_software:
        issues.append("Software/creator tag absent (possible metadata stripping)")
        score -= 8

    if any("Photoshop" in str(v) or "GIMP" in str(v) for v in exif.values()):
        explanations.append("Editing software signature found in metadata")
        score -= 5

    score = max(0, min(100, score))
    return score, issues, explanations


def _ai_heuristic_probability(
    entropy: float,
    uniformity: float,
    edge_risk: float,
    meta_score: int,
    width: int,
    height: int,
    fmt: str | None,
) -> int:
    prob = 12.0

    # AI images often land in mid-high entropy but very uniform regions
    if 6.8 <= entropy <= 7.6:
        prob += 10
    if uniformity > 0.55:
        prob += 18
    if edge_risk > 0.5:
        prob += 14

    # Common generative resolutions
    square_sizes = {(512, 512), (768, 768), (1024, 1024), (1536, 1536)}
    if (width, height) in square_sizes or (height, width) in square_sizes:
        prob += 12

    if meta_score < 40:
        prob += 16
    elif meta_score < 60:
        prob += 8

    if fmt == "PNG" and meta_score < 50:
        prob += 10

    return max(0, min(100, round(prob)))


def _parse_hf_ai_score(ai_result: dict[str, Any]) -> int | None:
    if not ai_result.get("success"):
        return None
    result = ai_result.get("result")
    if not isinstance(result, list):
        return None
    for item in result:
        if not isinstance(item, dict):
            continue
        label = str(item.get("label", "")).lower()
        score = float(item.get("score", 0))
        if "ai" in label or "artificial" in label or "fake" in label:
            return round(score * 100)
        if "real" in label or "human" in label:
            return round((1.0 - score) * 100)
    return None


def analyze_image_bytes(
    file_bytes: bytes,
    filename: str | None = None,
    ai_provider_result: dict[str, Any] | None = None,
    duplicate_found: bool = False,
) -> dict[str, Any]:
    if not file_bytes:
        raise ImageAnalysisError("Empty file uploaded")

    if len(file_bytes) > MAX_FILE_BYTES:
        raise ImageAnalysisError("File exceeds maximum size of 25MB")

    try:
        image = Image.open(io.BytesIO(file_bytes))
        image.load()
    except Exception as exc:
        raise ImageAnalysisError(f"Unsupported or corrupted image: {exc}") from exc

    fmt = (image.format or "").upper()
    if fmt not in ALLOWED_FORMATS:
        raise ImageAnalysisError(f"Unsupported image format: {fmt or 'unknown'}")

    width, height = image.size
    file_size = len(file_bytes)
    perceptual_hash = str(imagehash.phash(image))
    exif = _extract_exif(file_bytes)
    meta_score, meta_issues, meta_notes = _metadata_integrity(exif)

    gray = image.convert("L")
    entropy = _shannon_entropy(image)
    uniformity = _grayscale_uniformity(gray)
    edge_risk, edge_note = _edge_noise_score(gray)

    bonuses: list[tuple[int, str]] = []
    penalties: list[tuple[int, str]] = []
    explanations: list[str] = list(meta_notes)

    # Dimensions
    pixels = width * height
    if pixels >= 2_000_000:
        bonuses.append((8, f"High resolution capture ({width}×{height})"))
    elif pixels < 100_000:
        penalties.append((10, f"Low resolution ({width}×{height}) limits forensic confidence"))

    # File size vs resolution
    bytes_per_pixel = file_size / max(pixels, 1)
    if bytes_per_pixel < 0.15 and fmt == "JPEG":
        penalties.append((10, "Very low bytes-per-pixel suggests heavy recompression"))
    elif 0.3 <= bytes_per_pixel <= 3.5:
        bonuses.append((6, "File size proportional to resolution"))

    # Entropy
    if entropy < 5.5:
        penalties.append((14, f"Low Shannon entropy ({entropy:.2f}) suggests flat synthetic regions"))
    elif entropy > 7.8:
        penalties.append((8, f"Very high entropy ({entropy:.2f}) may indicate noise injection"))
    else:
        bonuses.append((5, f"Healthy entropy ({entropy:.2f}) for photographic content"))

    if uniformity > 0.5:
        penalties.append((12, "Grayscale distribution unusually uniform"))
    else:
        bonuses.append((4, "Natural luminance variation detected"))

    if edge_risk > 0.5:
        penalties.append((10, edge_note))
    else:
        bonuses.append((3, edge_note))

    comp_penalty, comp_msg = _compression_artifact_score(image, file_size)
    if comp_penalty:
        penalties.append((comp_penalty, comp_msg or "Compression artifacts detected"))

    # EXIF
    if not exif:
        penalties.append((18, "No EXIF metadata — provenance cannot be verified"))
    elif len(exif) >= 15:
        bonuses.append((10, f"Rich EXIF metadata ({len(exif)} tags)"))
    elif len(exif) < 4:
        penalties.append((12, "Minimal EXIF metadata present"))

    # Format consistency with filename
    if filename:
        ext = filename.rsplit(".", 1)[-1].lower()
        ext_map = {"jpg": "JPEG", "jpeg": "JPEG", "png": "PNG", "webp": "WEBP", "gif": "GIF"}
        expected = ext_map.get(ext)
        if expected and expected != fmt:
            penalties.append((14, f"Extension .{ext} does not match actual format {fmt}"))

    if fmt == "PNG" and not exif:
        penalties.append((6, "PNG without metadata common for screenshots or AI exports"))

    # AI probability blend
    heuristic_ai = _ai_heuristic_probability(
        entropy, uniformity, edge_risk, meta_score, width, height, fmt
    )
    provider_ai = _parse_hf_ai_score(ai_provider_result or {})
    if provider_ai is not None:
        ai_probability = round(heuristic_ai * 0.45 + provider_ai * 0.55)
        explanations.append(f"Model-assisted AI estimate: {provider_ai}%")
    else:
        ai_probability = heuristic_ai
        explanations.append(f"Heuristic AI-synthesis estimate: {heuristic_ai}%")

    if ai_probability >= 70:
        penalties.append((15, "Elevated AI-generation probability"))
    elif ai_probability <= 25:
        bonuses.append((8, "Low AI-generation indicators"))

    scoring_input = {
        "bonuses": bonuses,
        "penalties": penalties,
        "explanations": explanations,
        "ai_probability": ai_probability,
        "metadata_integrity_score": meta_score,
        "metadata_issues": meta_issues,
        "duplicate_found": duplicate_found,
    }

    trust = compute_image_trust(scoring_input)

    return {
        "perceptual_hash": perceptual_hash,
        "format": fmt,
        "width": width,
        "height": height,
        "file_size_bytes": file_size,
        "entropy": round(entropy, 3),
        "grayscale_uniformity": round(uniformity, 3),
        "edge_risk": round(edge_risk, 3),
        "exif_tag_count": len(exif),
        "metadata_found": bool(exif),
        "trust": trust,
        "diagnostics": scoring_input,
    }
