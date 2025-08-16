from fastapi import APIRouter, UploadFile, File, HTTPException
import numpy as np, os, time
from ..models.loader import load_tf_model, artifacts_path
from ..models.preprocessing import load_audio_melspec
from ..schemas.base import GenericOut

router = APIRouter(prefix="/api/audio", tags=["audio"])

LUNG_MODEL = load_tf_model(artifacts_path("lung_ausc_diagnosis"))

LUNG_CLASSES = os.getenv("LUNG_CLASSES", "Normal,Wheeze,Crackle,Stridor").split(",")
HEART_CLASSES = os.getenv("HEART_CLASSES", "Normal,Murmur,ExtraSounds").split(",")


def to_probs(pred: np.ndarray, classes: list[str]) -> tuple[str, float, dict]:
    vec = pred.reshape(-1).astype(float)
    ex = np.exp(vec - np.max(vec))
    p = ex / np.clip(np.sum(ex), 1e-9, None)
    mapping = {c: float(pi) for c, pi in zip(classes, p[: len(classes)])}
    pred_idx = int(np.argmax(p[: len(classes)]))
    label = classes[pred_idx]
    conf = float(p[pred_idx]) * 100.0
    return label, conf, mapping


def meta() -> dict:
    return {"ts": int(time.time()), "engine": "tensorflow"}


@router.post("/lung-dx", response_model=GenericOut)
async def lung_dx(audio: UploadFile = File(...)):
    x = load_audio_melspec(await audio.read())
    pred = LUNG_MODEL.predict(x)
    label, conf, mapping = to_probs(pred, LUNG_CLASSES)
    return {
        "prediction": label,
        "confidence_pct": round(conf, 2),
        "probs": mapping,
        "meta": meta(),
    }


@router.post("/heart-dx")
async def heart_dx(audio: UploadFile = File(...)):
    raise HTTPException(
        status_code=501, detail="Heart auscultation model not available yet."
    )
