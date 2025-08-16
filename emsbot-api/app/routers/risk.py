from fastapi import APIRouter, HTTPException
from typing import Dict, Any
import numpy as np, time
from ..models.loader import load_tf_model, artifacts_path
from ..models.preprocessing import (
    preprocess_heart_failure,
    preprocess_diabetes,
    preprocess_stroke,
)

router = APIRouter(prefix="/api/risk", tags=["risk"])

HF_PATH = artifacts_path("heart_failure_prediction")
DM_PATH = artifacts_path("diabetes_prediction")
ST_PATH = artifacts_path("stroke_prediction")

HF_MODEL = load_tf_model(HF_PATH)
DM_MODEL = load_tf_model(DM_PATH)
ST_MODEL = load_tf_model(ST_PATH)

HF_KEYS = [
    "Age",
    "Sex",
    "ChestPainType",
    "RestingBP",
    "Cholesterol",
    "FastingBS",
    "RestingECG",
    "MaxHR",
    "ExerciseAngina",
    "Oldpeak",
    "ST_Slope",
]
DM_KEYS = [
    "HighBP",
    "HighChol",
    "CholCheck",
    "BMI",
    "Smoker",
    "Stroke",
    "HeartDiseaseorAttack",
    "PhysActivity",
    "Fruits",
    "Veggies",
    "HvyAlcoholConsump",
    "AnyHealthcare",
    "NoDocbcCost",
    "GenHlth",
    "MentHlth",
    "PhysHlth",
    "DiffWalk",
    "Sex",
    "Age",
    "Education",
    "Income",
]
ST_KEYS = [
    "gender",
    "age",
    "hypertension",
    "heart_disease",
    "ever_married",
    "work_type",
    "Residence_type",
    "avg_glucose_level",
    "bmi",
    "smoking_status",
]


def meta() -> dict:
    return {"ts": int(time.time()), "engine": "tensorflow.keras"}


def _sigmoid(x: float) -> float:
    # numerically stable
    if x >= 0:
        z = np.exp(-x)
        return float(1 / (1 + z))
    else:
        z = np.exp(x)
        return float(z / (1 + z))


def predict_prob(model, row: np.ndarray) -> float:
    """
    Returns a calibrated positive-class probability in [0,1].
    - If model returns 1 value per example:
        * If value ∈ [0,1], treat as sigmoid probability.
        * Else treat as a logit and apply sigmoid.
    - If model returns 2 values: treat as logits/probs for [negative, positive],
      apply softmax if needed and return P(positive).
    - If model returns >2 values: softmax and return max class prob as a 'risk-like' score.
    """
    y = model.predict(row)
    vec = np.array(y).reshape(-1).astype(float)

    if vec.size == 1:
        v = vec[0]
        # if already a prob
        if 0.0 <= v <= 1.0:
            p_pos = float(v)
        else:
            # assume logit
            p_pos = _sigmoid(v)
        return max(0.0, min(1.0, p_pos))

    # softmax for 2+ values (robust to logits or already close to probs)
    ex = np.exp(vec - np.max(vec))
    p = ex / np.clip(np.sum(ex), 1e-9, None)

    if vec.size == 2:
        # convention: index 0 = negative, index 1 = positive
        p_pos = float(p[1])
        return max(0.0, min(1.0, p_pos))

    # multiclass: use most confident class prob as 'risk-like' score
    return float(np.max(p))


def _risk_class(p: float) -> str:
    if p < 0.33:
        return "Low"
    if p < 0.67:
        return "Moderate"
    return "High"


@router.post("/heart-failure")
def heart_failure(payload: Dict[str, Any]):
    row = preprocess_heart_failure(payload)
    risk = predict_prob(HF_MODEL, row)
    return {
        "risk": risk,
        "class": _risk_class(risk),
        "probs": {"negative": 1.0 - risk, "positive": risk},
        "details": {
            "features": HF_KEYS,
            "risk_class": _risk_class(risk),
            "probability_pct": round(risk * 100.0, 2),
        },
        "meta": meta(),
    }


@router.post("/diabetes")
def diabetes(payload: Dict[str, Any]):
    row = preprocess_diabetes(payload, DM_KEYS)
    risk = predict_prob(DM_MODEL, row)
    return {
        "risk": risk,
        "class": _risk_class(risk),
        "probs": {"negative": 1.0 - risk, "positive": risk},
        "details": {
            "features": DM_KEYS,
            "risk_class": _risk_class(risk),
            "probability_pct": round(risk * 100.0, 2),
        },
        "meta": meta(),
    }


@router.post("/stroke")
def stroke(payload: Dict[str, Any]):
    row = preprocess_stroke(payload, ST_KEYS)
    risk = predict_prob(ST_MODEL, row)
    return {
        "risk": risk,
        "class": _risk_class(risk),
        "probs": {"negative": 1.0 - risk, "positive": risk},
        "details": {
            "features": ST_KEYS,
            "risk_class": _risk_class(risk),
            "probability_pct": round(risk * 100.0, 2),
        },
        "meta": meta(),
    }
