from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any
import random

app = FastAPI(title="EMSBot Demo API", version="0.0.1")

# Allow frontend to talk to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # for local testing, wide open
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request body shapes
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


def meta():
    return {"model": "demo", "latency_ms": int(random.uniform(40, 160))}


# --- Vision ---
@app.post("/api/vision/cxr-classify")
async def cxr_classify(image: UploadFile = File(...)) -> Dict[str, Any]:
    return {
        "prediction": "pneumonia",
        "probs": {
            "normal": 0.08,
            "pneumonia": 0.84,
            "effusion": 0.05,
            "pneumothorax": 0.03,
        },
        "artifacts": {
            "gradcam_url": "https://via.placeholder.com/256x256.png?text=GradCAM"
        },
        "meta": meta(),
    }


@app.post("/api/vision/burn-classify")
async def burn_classify(image: UploadFile = File(...)) -> Dict[str, Any]:
    return {
        "prediction": "partial_thickness",
        "probs": {
            "superficial": 0.12,
            "partial_thickness": 0.76,
            "full_thickness": 0.12,
        },
        "meta": meta(),
    }


@app.post("/api/vision/wound-segment")
async def wound_segment(image: UploadFile = File(...)) -> Dict[str, Any]:
    return {
        "prediction": "wound_detected",
        "artifacts": {"mask_url": "https://via.placeholder.com/256x256.png?text=Mask"},
        "meta": meta(),
    }


# --- Signals ---
@app.post("/api/signals/ecg-classify")
async def ecg_classify(file: UploadFile = File(...)) -> Dict[str, Any]:
    return {
        "rhythm": "AFib",
        "confidence": 0.93,
        "notes": "Irregular R-R intervals",
        "meta": meta(),
    }


# --- Audio ---
@app.post("/api/audio/lung-dx")
async def lung_dx(audio: UploadFile = File(...)) -> Dict[str, Any]:
    return {
        "finding": "Wheezes",
        "severity": "mild",
        "confidence": 0.81,
        "meta": meta(),
    }


@app.post("/api/audio/heart-dx")
async def heart_dx(audio: UploadFile = File(...)) -> Dict[str, Any]:
    return {
        "finding": "Murmur",
        "severity": "moderate",
        "confidence": 0.74,
        "meta": meta(),
    }


# --- Risk ---
@app.post("/api/risk/heart-failure")
async def hf(h: HFIn) -> Dict[str, Any]:
    return {
        "risk": 0.41,
        "class": "moderate",
        "features": {"age": 0.12, "bmi": 0.18},
        "meta": meta(),
    }


@app.post("/api/risk/diabetes")
async def dm(d: DMIn) -> Dict[str, Any]:
    return {
        "risk": 0.23,
        "class": "low",
        "features": {"bmi": 0.22, "glucose": 0.31},
        "meta": meta(),
    }


@app.post("/api/risk/stroke")
async def stroke(s: StrokeIn) -> Dict[str, Any]:
    return {
        "risk": 0.68,
        "class": "high",
        "features": {"age": 0.27, "sbp": 0.19, "afib": 0.22},
        "meta": meta(),
    }


# --- NLP ---
@app.post("/api/nlp/report")
async def report(text: str = Form(...), mode: str = Form("balanced")) -> Dict[str, Any]:
    snippet = (text or "")[:120]
    return {
        "summary": f"[{mode}] {snippet}",
        "icd10": ["R06.2"],
        "meds": ["albuterol"],
        "warnings": ["Demo output — not for clinical use"],
        "mode": mode,
        "meta": meta(),
    }
