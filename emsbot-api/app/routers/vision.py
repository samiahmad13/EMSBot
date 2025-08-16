from fastapi import APIRouter, UploadFile, File, HTTPException
import numpy as np, os, time
from ..models.loader import load_tf_model, artifacts_path
from ..models.preprocessing import load_image_224_rgb
from ..schemas.base import GenericOut

router = APIRouter(prefix="/api/vision", tags=["vision"])

CXR_MODEL = load_tf_model(artifacts_path("cxr_classifier"))
BURN_MODEL = load_tf_model(artifacts_path("burn_classifier"))


CXR_CLASSES = os.getenv("CXR_CLASSES", "Normal,Pneumonia").split(",")
BURN_CLASSES = os.getenv(
    "BURN_CLASSES", "Superficial,PartialThickness,FullThickness"
).split(",")


def to_probs(pred: np.ndarray, classes: list[str]) -> tuple[str, float, dict]:
    vec = pred.reshape(-1).astype(float)
    if vec.ndim == 1:
        if vec.size == 1:
            vec = np.array([1.0 - float(vec[0]), float(vec[0])], dtype=float)
        else:
            pass
    ex = np.exp(vec - np.max(vec))
    p = ex / np.clip(np.sum(ex), 1e-9, None)
    mapping = {c: float(pi) for c, pi in zip(classes, p[: len(classes)])}
    pred_idx = int(np.argmax(p[: len(classes)]))
    label = classes[pred_idx]
    conf = float(p[pred_idx]) * 100.0
    return label, conf, mapping


def meta() -> dict:
    return {"ts": int(time.time()), "engine": "tensorflow"}


@router.post("/cxr-classify", response_model=GenericOut)
async def cxr_classify(image: UploadFile = File(...)):
    x = load_image_224_rgb(await image.read())
    pred = CXR_MODEL.predict(x)
    label, conf, mapping = to_probs(pred, CXR_CLASSES)
    return {
        "prediction": label,
        "confidence_pct": round(conf, 2),
        "probs": mapping,
        "meta": meta(),
    }


@router.post("/burn-classify", response_model=GenericOut)
async def burn_classify(image: UploadFile = File(...)):
    x = load_image_224_rgb(await image.read())
    pred = BURN_MODEL.predict(x)
    label, conf, mapping = to_probs(pred, BURN_CLASSES)
    return {
        "prediction": label,
        "confidence_pct": round(conf, 2),
        "probs": mapping,
        "meta": meta(),
    }


@router.post("/wound-segment")
async def wound_segment(image: UploadFile = File(...)):
    raise HTTPException(
        status_code=501, detail="Wound segmentation model not available yet."
    )
