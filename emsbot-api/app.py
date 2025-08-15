from fastapi import FastAPI, UploadFile, File, Form, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Optional
import random

app = FastAPI(title="EMSBot Demo API", version="0.0.2")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- Schemas ----------
class HFIn(BaseModel):
    age: int
    sex: str
    systolic_bp: float
    heart_rate: float
    bmi: float


class DMIn(BaseModel):
    age: int
    bmi: float
    fasting_glucose: float
    systolic_bp: float


class StrokeIn(BaseModel):
    age: int
    sex: str
    systolic_bp: float
    smoker: bool
    afib: bool


# --- labels ---
BURN_LABELS = ["No Burn Injury", "1st Degree", "2nd Degree", "3rd Degree"]
CXR_LABELS = ["Covid", "Normal", "Pneumonia"]
DIAB_LABELS = ["Non-Diabetic", "Diabetic"]
HEART_LABELS = ["No Heart Disease", "Heart Disease"]
STROKE_LABELS = ["No Stroke", "Stroke"]
LUNG_LABELS = [
    "COPD",
    "Healthy",
    "URTI",
    "Bronchiectasis",
    "Pneumonia",
    "Bronchiolitis",
    "LRTI",
    "Asthma",
]
ECG_LABELS = [
    "Normal",
    "Supraventricular Premature",
    "Fusion of Ventricular and Normal",
    "Premature Ventricular Contraction",
    "Unclassified",
]
HEART_AUDIO_LABELS = [
    "Normal",
    "Heart murmur",
    "Extrasystole",
    "Extra heart sounds",
    "Artifact",
]

WOUND_LABELS = ["Wound", "Background"]


def meta():
    return {"model": "demo", "latency_ms": int(random.uniform(40, 160))}


def rand_probs(labels):
    vals = [random.random() for _ in labels]
    s = sum(vals) or 1.0
    probs = [v / s for v in vals]
    return {lab: round(p, 4) for lab, p in zip(labels, probs)}


# ========== Vision ==========
@app.post("/api/vision/burn-classify")
async def burn_classify(image: UploadFile = File(...)):
    probs = rand_probs(BURN_LABELS)
    pred = max(probs, key=probs.get)
    return {
        "prediction": pred,
        "confidence_pct": round(probs[pred] * 100, 2),
        "probs": probs,
        "meta": meta(),
    }


@app.post("/api/vision/cxr-classify")
async def cxr_classify(image: UploadFile = File(...)):
    probs = rand_probs(CXR_LABELS)
    pred = max(probs, key=probs.get)
    return {
        "prediction": pred,
        "confidence_pct": round(probs[pred] * 100, 2),
        "probs": probs,
        "meta": meta(),
    }


@app.post("/api/vision/wound-segment")
async def wound_segment(image: UploadFile = File(...)):
    data = await image.read()
    size_kb = max(1, len(data) // 1024)
    wound_p = min(0.9, max(0.05, (size_kb % 67) / 100))
    probs = {"Wound": wound_p, "Background": 1.0 - wound_p}
    pred = max(probs, key=probs.get)
    return {
        "prediction": pred,
        "confidence_pct": round(probs[pred] * 100, 2),
        "probs": probs,
        "meta": meta(),
    }


# ========== Audio ==========
@app.post("/api/audio/lung-dx")
async def lung_dx(audio: UploadFile = File(...)):
    probs = rand_probs(LUNG_LABELS)
    pred = max(probs, key=probs.get)
    return {
        "prediction": pred,
        "confidence_pct": round(probs[pred] * 100, 2),
        "probs": probs,
        "meta": meta(),
    }


@app.post("/api/audio/heart-dx")
async def heart_dx(audio: UploadFile = File(...)):
    probs = rand_probs(HEART_AUDIO_LABELS)
    pred = max(probs, key=probs.get)
    return {
        "prediction": pred,
        "confidence_pct": round(probs[pred] * 100, 2),
        "probs": probs,
        "meta": meta(),
    }


# ========== Signals ==========
@app.post("/api/signals/ecg-classify")
async def ecg_classify(file: UploadFile = File(...)):
    probs = rand_probs(ECG_LABELS)
    pred = max(probs, key=probs.get)
    return {
        "prediction": pred,
        "confidence_pct": round(probs[pred] * 100, 2),
        "probs": probs,
        "meta": meta(),
    }


# ========== Risk ==========
@app.post("/api/risk/diabetes")
async def dm(payload: Dict[str, Any] = Body(...)) -> Dict[str, Any]:
    # payload matches BRFSS field names; real backend will validate/encode
    labels = ["Non-Diabetic", "Diabetic"]
    probs = rand_probs(labels)
    pred = max(probs, key=probs.get)
    risk = probs.get("Diabetic", 0.5)
    severity = "high" if risk > 0.66 else "moderate" if risk > 0.33 else "low"
    return {
        "prediction": pred,
        "probs": probs,
        "risk": risk,
        "class": severity,
        "meta": meta(),
    }


@app.post("/api/risk/heart-failure")
async def hf(payload: Dict[str, Any] = Body(...)) -> Dict[str, Any]:
    # payload keys: Age, Sex, ChestPainType, RestingBP, Cholesterol, FastingBS, RestingECG, MaxHR, ExerciseAngina, Oldpeak, ST_Slope
    labels = ["No Heart Disease", "Heart Disease"]
    probs = rand_probs(labels)
    pred = max(probs, key=probs.get)
    risk = probs.get("Heart Disease", 0.5)
    severity = "high" if risk > 0.66 else "moderate" if risk > 0.33 else "low"
    return {
        "prediction": pred,
        "probs": probs,
        "risk": risk,
        "class": severity,
        "meta": meta(),
    }


@app.post("/api/risk/stroke")
async def stroke(payload: Dict[str, Any] = Body(...)) -> Dict[str, Any]:
    # payload keys: gender, age, hypertension, heart_disease, ever_married, work_type, Residence_type, avg_glucose_level, bmi, smoking_status
    labels = ["No Stroke", "Stroke"]
    probs = rand_probs(labels)
    pred = max(probs, key=probs.get)
    risk = probs.get("Stroke", 0.5)
    severity = "high" if risk > 0.66 else "moderate" if risk > 0.33 else "low"
    return {
        "prediction": pred,
        "probs": probs,
        "risk": risk,
        "class": severity,
        "meta": meta(),
    }


# ========== NLP ==========
@app.post("/api/nlp/diagnosis")
async def nlp_diagnosis(text: str = Form(...), mode: Optional[str] = Form(None)):
    snippet = (text or "")[:160]
    return {
        "task": "diagnosis",
        "summary": snippet,
        "diagnoses": ["Pneumonia", "Asthma"],  # demo
        "icd10": ["J18.9", "J45.909"],
        "warnings": ["Demo output — not for clinical use"],
        "meta": meta(),
    }


@app.post("/api/nlp/treatment")
async def nlp_treatment(text: str = Form(...), mode: Optional[str] = Form(None)):
    snippet = (text or "")[:160]
    return {
        "task": "treatment",
        "summary": snippet,
        "medications": ["albuterol", "amoxicillin"],  # demo
        "dosage_notes": ["2 puffs q4h PRN", "500mg TID x5d"],
        "warnings": ["Check allergies / renal adjustments"],
        "meta": meta(),
    }
