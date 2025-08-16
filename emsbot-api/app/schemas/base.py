from pydantic import BaseModel, Field
from typing import Dict, Any, Optional


class RiskResult(BaseModel):
    risk: float = Field(..., ge=0, le=1)
    details: Dict[str, Any]
    meta: Dict[str, Any]


class TextClassifyOut(BaseModel):
    result: str
    prediction: str
    probs: Dict[str, float]
    meta: Dict[str, Any]


class GenericOut(BaseModel):
    prediction: str
    confidence_pct: float
    probs: Dict[str, float]
    meta: Dict[str, Any]
