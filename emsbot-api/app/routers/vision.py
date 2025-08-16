from fastapi import APIRouter, UploadFile, File, HTTPException
import numpy as np, time
from typing import Dict, Any, List
from ..models.loader import load_tf_model, artifacts_path
from ..models.preprocessing import load_image_rgb

router = APIRouter(prefix="/api/vision", tags=["vision"])

CXR_MODEL = load_tf_model(artifacts_path("cxr_classifier"))
BURN_MODEL = load_tf_model(artifacts_path("burn_classifier"))


CXR_SIZE = (256, 256)
BURN_SIZE = (180, 180)

CXR_LABELS: List[str] = ["Covid", "Normal", "Pneumonia"]
BURN_LABELS: List[str] = [
    "No Burn Injury",
    "1st Degree Burn",
    "2nd Degree Burn",
    "3rd Degree Burn",
]


def _meta() -> Dict[str, Any]:
    return {"ts": int(time.time()), "engine": "tensorflow.keras"}


def _softmax(vec: np.ndarray) -> np.ndarray:
    vec = np.asarray(vec, dtype=float).reshape(-1)
    ex = np.exp(vec - np.max(vec))
    denom = np.clip(np.sum(ex), 1e-9, None)
    return ex / denom


@router.post("/cxr-classify")
async def cxr_classify(image: UploadFile = File(...)):
    try:
        raw = await image.read()
        x = load_image_rgb(raw, size=CXR_SIZE)
        raw_out = CXR_MODEL.predict(x)[0]
        probs = _softmax(raw_out)
        probs_dict = {CXR_LABELS[i]: float(probs[i]) for i in range(len(CXR_LABELS))}
        pred_idx = int(np.argmax(probs))
        pred = CXR_LABELS[pred_idx]
        return {
            "prediction": pred,
            "confidence_pct": round(probs[pred_idx] * 100, 2),
            "probs": probs_dict,
            "meta": _meta(),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"CXR inference failed: {e}")


@router.post("/burn-classify")
async def burn_classify(image: UploadFile = File(...)):
    try:
        raw = await image.read()
        x = load_image_rgb(raw, size=BURN_SIZE)
        raw_out = BURN_MODEL.predict(x)[0]
        probs = _softmax(raw_out)
        probs_dict = {BURN_LABELS[i]: float(probs[i]) for i in range(len(BURN_LABELS))}
        pred_idx = int(np.argmax(probs))
        pred = BURN_LABELS[pred_idx]
        return {
            "prediction": pred,
            "confidence_pct": round(probs[pred_idx] * 100, 2),
            "probs": probs_dict,
            "meta": _meta(),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Burn inference failed: {e}")


@router.post("/wound-segment")
async def wound_segment():
    raise HTTPException(
        status_code=501, detail="Wound segmentation is not implemented yet"
    )
