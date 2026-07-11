"""Response schemas shared across scan endpoints."""

from __future__ import annotations

from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel


class ScanHistoryItem(BaseModel):
    id: int
    scan_type: str
    trust_score: int
    risk_level: str
    explanations: Optional[str] = None
    perceptual_hash: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class ScanHistoryListResponse(BaseModel):
    total_scans: int
    results: list[ScanHistoryItem]


class ScanHistoryDetailResponse(BaseModel):
    success: bool
    scan: Optional[ScanHistoryItem] = None
    error: Optional[str] = None


class ErrorResponse(BaseModel):
    success: bool = False
    error: str
    detail: Optional[Any] = None


class HealthResponse(BaseModel):
    status: str
    database: str
    environment: str
