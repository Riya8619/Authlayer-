from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.core.logging_config import logger
from app.database.crud import save_scan
from app.database.database import get_db
from app.services.detectors.ai_image_detector import detect_ai_image
from app.services.detectors.duplicate_detector import find_similar_hash
from app.services.image_analysis import ImageAnalysisError, analyze_image_bytes
from app.services.scoring import to_frontend_payload

router = APIRouter(tags=["image-scan"])

ALLOWED_CONTENT_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/bmp",
    "image/tiff",
    "image/jpg",
}


@router.post("/scan-image")
async def scan_image(file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        if file.content_type and file.content_type not in ALLOWED_CONTENT_TYPES:
            raise ImageAnalysisError(
                f"Unsupported file type: {file.content_type}. Upload a JPEG, PNG, or WebP image."
            )

        image_bytes = await file.read()
        if not image_bytes:
            raise ImageAnalysisError("Uploaded file is empty")

        ai_result = detect_ai_image(image_bytes)

        analysis = analyze_image_bytes(
            image_bytes,
            filename=file.filename,
            ai_provider_result=ai_result,
            duplicate_found=False,
        )

        duplicate_result = find_similar_hash(db, analysis["perceptual_hash"])

        if duplicate_result.get("duplicate_found"):
            analysis = analyze_image_bytes(
                image_bytes,
                filename=file.filename,
                ai_provider_result=ai_result,
                duplicate_found=True,
            )

        trust = analysis["trust"]

        scan_id = save_scan(
            db,
            scan_type="image",
            trust_score=trust["trust_score"],
            risk_level=trust["risk_level"],
            explanations=trust["explanations"],
            perceptual_hash=analysis["perceptual_hash"],
        )

        response = to_frontend_payload(trust)
        response["scanId"] = scan_id
        response["success"] = True
        response["imageAnalysis"] = {
            "format": analysis["format"],
            "width": analysis["width"],
            "height": analysis["height"],
            "fileSizeBytes": analysis["file_size_bytes"],
            "entropy": analysis["entropy"],
            "perceptualHash": analysis["perceptual_hash"],
        }
        response["duplicateDetection"] = duplicate_result
        response["aiDetection"] = ai_result
        return response

    except ImageAnalysisError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Image scan failed")
        raise HTTPException(
            status_code=500,
            detail=f"Image scan failed: {exc}",
        ) from exc
