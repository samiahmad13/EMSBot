from typing import Any, Dict, List, Optional
from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from pydantic import BaseModel
import numpy as np, time, json, os

from ..models.loader import load_tf_model, artifacts_path

router = APIRouter(prefix="/api/nlp", tags=["nlp"])

DX_MODEL = load_tf_model(artifacts_path("text_diagnosis"))
TX_MODEL = load_tf_model(artifacts_path("text_treatment"))


DX_LABELS: List[str] = [
    "Infectious",
    "Mental",
    "Autism Spectrum",
    "Prevention/Good Health",
    "Cardiac/Circulatory",
    "OB-Gyn/ Pregnancy",
    "Digestive System/ Gastrointestinal",
    "Orthopedic/ Musculoskeletal",
    "Central Nervous System/ Neuromuscular",
    "Endocrine/ Metabolic",
    "Pediatrics",
    "Chronic Pain",
    "Respiratory System",
    "Cancer",
    "Morbid Obesity",
    "Ears, Nose, Throat",
    "Post Surgical Complication",
    "Immunologic",
    "Skin",
    "Foot",
    "Dental",
    "Blood Related",
    "Genetic",
    "Genitourinary/ Kidney",
    "Vision",
    "Trauma/Injuries",
    "Organ Failure",
    "Alcohol and Drug Addiction",
]
TX_LABELS: List[str] = [
    "Pharmacy/Prescription Drugs",
    "Mental Health Treatment",
    "Autism Related Treatment",
    "Diagnostic Imaging, Screening and Testing",
    "Cardio Vascular",
    "Durable Medical Equipment",
    "Diagnostic/Physician Evaluation",
    "Orthopedic",
    "Emergency/Urgent Care",
    "General Surgery",
    "Acute Medical Services - Outpatient",
    "Pain Management",
    "Cancer Treatment",
    "Reconstructive/Plastic Surgery",
    "Rehabilitation Services - Skilled Nursing Facility - Inpatient",
    "Special Procedure",
    "Electrical/ Thermal/ Radiofreq. Interventions",
    "Alternative Treatment",
    "OB/GYN Procedures",
    "Neurosugery",
    "Dental/Orthodontic",
    "Home Health Care",
    "Acute Medical Services - Inpatient",
    "Ear, Nose and Throat Procedures",
    "Rehabilitation Services - Outpatient",
    "Vision",
    "Urology",
    "Preventive Health Screening",
    "Chiropractic",
    "Ophthalmology",
]


class TextIn(BaseModel):
    text: str


def _meta() -> Dict[str, Any]:
    return {"ts": int(time.time()), "engine": "tensorflow.keras"}


def _softmax(vec: np.ndarray) -> np.ndarray:
    v = np.asarray(vec, dtype=float).reshape(-1)
    ex = np.exp(v - np.max(v))
    denom = np.clip(np.sum(ex), 1e-9, None)
    return ex / denom


def _predict_text(model, text: str) -> np.ndarray:
    try:
        y = model.predict([text])
        return np.array(y).reshape(-1)
    except Exception:
        try:
            y = model.predict(np.array([text], dtype=object))
            return np.array(y).reshape(-1)
        except Exception as e:
            raise RuntimeError(f"text inference failed: {e}")


def _map_probs(vec: np.ndarray, labels: List[str]) -> Dict[str, float]:
    p = _softmax(vec)
    if labels and len(labels) == len(p):
        return {labels[i]: float(p[i]) for i in range(len(p))}
    return {f"class_{i}": float(p[i]) for i in range(len(p))}


def _get_text(text_form: Optional[str], body: Optional[TextIn]) -> str:
    """
    Accept text from either multipart/form-data (Form) or JSON body.
    """
    if text_form is not None:
        return text_form
    if body is not None and isinstance(body, TextIn) and body.text:
        return body.text
    raise HTTPException(status_code=400, detail="Missing 'text'")


@router.post("/diagnosis")
def nlp_diagnosis(
    text: Optional[str] = Form(None),
    body: Optional[TextIn] = None,
):
    try:
        content = _get_text(text, body)
        vec = _predict_text(DX_MODEL, content)
        probs = _map_probs(vec, DX_LABELS)
        pred = max(probs.items(), key=lambda kv: kv[1])[0]
        return {
            "task": "diagnosis",
            "prediction": pred,
            "probs": probs,
            "diagnoses": [pred],
            "meta": _meta(),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/treatment")
def nlp_treatment(
    text: Optional[str] = Form(None),
    body: Optional[TextIn] = None,
):
    try:
        content = _get_text(text, body)
        vec = _predict_text(TX_MODEL, content)
        probs = _map_probs(vec, TX_LABELS)
        pred = max(probs.items(), key=lambda kv: kv[1])[0]
        return {
            "task": "treatment",
            "prediction": pred,
            "probs": probs,
            "medications": [pred],
            "meta": _meta(),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
