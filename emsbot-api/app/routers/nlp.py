from fastapi import APIRouter, HTTPException
import numpy as np, os, time, tensorflow as tf
from tensorflow import keras  # pylint: disable=no-name-in-module
from typing import Literal
from ..models.loader import load_tf_model, artifacts_path
from ..schemas.base import TextClassifyOut

router = APIRouter(prefix="/api/nlp", tags=["nlp"])

DIAG_MODEL = load_tf_model(artifacts_path("text_diagnosis"))
TX_MODEL = load_tf_model(artifacts_path("text_treatment"))

DIAG_CLASSES = os.getenv("DIAG_CLASSES", "Negative,Uncertain,Positive").split(",")
TX_CLASSES = os.getenv("TX_CLASSES", "NotRecommended,Consider,Recommended").split(",")


def meta() -> dict:
    return {"ts": int(time.time()), "engine": "tensorflow"}


def classify_text(model: keras.Model, text: str, classes: list[str]):
    x = tf.constant([text])
    y = model(x) if hasattr(model, "__call__") else model.predict(x)
    if hasattr(y, "numpy"):
        y = y.numpy()
    vec = np.array(y).reshape(-1).astype(float)
    if vec.size == 1 and len(classes) == 2:
        vec = np.array([1.0 - float(vec[0]), float(vec[0])], dtype=float)
    ex = np.exp(vec - np.max(vec))
    p = ex / np.clip(np.sum(ex), 1e-9, None)
    idx = int(np.argmax(p[: len(classes)]))
    return classes[idx], {c: float(p[i]) for i, c in enumerate(classes[: len(p)])}


@router.post("/report", response_model=TextClassifyOut)
def report(body: dict):
    """
    Expects: { "task": "diagnosis" | "treatment", "text": "..." }
    Returns string 'result' so the current frontend continues to work,
    plus prediction/probs/meta for transparency.
    """
    task = body.get("task")
    text = (body.get("text") or "").strip()
    if task not in {"diagnosis", "treatment"}:
        raise HTTPException(400, "task must be 'diagnosis' or 'treatment'")
    if not text:
        raise HTTPException(400, "text is required")

    if task == "diagnosis":
        label, probs = classify_text(DIAG_MODEL, text, DIAG_CLASSES)
        summary = f"[DIAGNOSIS] Predicted: {label}"
    else:
        label, probs = classify_text(TX_MODEL, text, TX_CLASSES)
        summary = f"[TREATMENT] Predicted: {label}"

    return {"result": summary, "prediction": label, "probs": probs, "meta": meta()}
