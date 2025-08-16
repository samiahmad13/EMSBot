from fastapi import APIRouter, UploadFile, File, HTTPException
import numpy as np, time
from typing import Dict, Any, List
from ..models.loader import load_tf_model, artifacts_path
from ..models.preprocessing import load_audio_vector_52

router = APIRouter(prefix="/api/audio", tags=["audio"])

LUNG_MODEL = load_tf_model(artifacts_path("lung_ausc_diagnosis"))
LUNG_DX_LABELS: List[str] = ["COPD", "Bronchiolitis", "Pneumonia", "URTI", "Healthy"]


def _meta() -> Dict[str, Any]:
    return {"ts": int(time.time()), "engine": "tensorflow.keras"}


def _softmax(vec: np.ndarray) -> np.ndarray:
    v = np.asarray(vec, dtype=float).reshape(-1)
    ex = np.exp(v - np.max(v))
    return ex / np.clip(np.sum(ex), 1e-9, None)


@router.post("/lung-dx")
async def lung_dx(audio: UploadFile = File(...)):
    try:
        raw = await audio.read()
        x = load_audio_vector_52(raw)  # (1, 1, 52)
        raw_out = LUNG_MODEL.predict(x)[0]
        probs = _softmax(raw_out)

        probs_dict = {
            LUNG_DX_LABELS[i]: float(probs[i]) for i in range(len(LUNG_DX_LABELS))
        }
        pred_idx = int(np.argmax(probs))
        pred = LUNG_DX_LABELS[pred_idx]

        return {
            "prediction": pred,
            "confidence_pct": round(float(probs[pred_idx]) * 100.0, 2),
            "probs": probs_dict,
            "meta": _meta(),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lung inference failed: {e}")


@router.post("/heart-dx")
async def heart_dx(audio: UploadFile = File(...)):
    raise HTTPException(
        status_code=501, detail="Heart auscultation model not available yet."
    )
