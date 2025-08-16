import io
import os
import json
from typing import Any, Dict, List
import numpy as np
import soundfile as sf
import librosa
from PIL import Image


# Vision


def load_image_rgb(raw: bytes, size: tuple[int, int]) -> np.ndarray:
    """Bytes -> (1, H, W, 3) float32 in [0,1], resized to `size`."""
    img = Image.open(io.BytesIO(raw)).convert("RGB").resize(size)
    x = (np.array(img, dtype=np.float32) / 255.0)[None, ...]
    return x


# Audio


def load_audio_vector_52(raw: bytes, sr: int = 16000) -> np.ndarray:
    """
    Bytes -> (1, 1, 52) float32
    Extract 52 MFCCs, aggregate over time (mean), and shape for models that expect (None, 1, 52).
    """
    y, in_sr = sf.read(io.BytesIO(raw), dtype="float32", always_2d=False)
    if in_sr != sr:
        y = librosa.resample(y, orig_sr=in_sr, target_sr=sr)
    if y.ndim > 1:
        y = np.mean(y, axis=1)

    mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=52)
    vec = np.mean(mfcc, axis=1).astype(np.float32)

    return vec[None, None, :]


# Helpers


def _load_stats(json_path: str) -> Dict[str, Dict[str, float]] | None:
    """Load per-column scaler stats: {col: {'mean': ..., 'std': ...}, ...}."""
    try:
        if os.path.exists(json_path):
            with open(json_path, "r") as f:
                obj = json.load(f)
            return {
                str(k): {"mean": float(v["mean"]), "std": float(v["std"])}
                for k, v in obj.items()
            }
    except Exception:
        pass
    return None


def _z(val: Any, mu: float, sd: float) -> float:
    """Standardize a value to z-score form."""
    try:
        x = float(val)
    except Exception:
        x = 0.0
    s = sd if sd and sd > 1e-12 else 1.0
    return (x - mu) / s


def _one_hot(v: Any, levels: List[str]) -> List[float]:
    s = (str(v) if v is not None else "").strip()
    return [1.0 if s == lvl else 0.0 for lvl in levels]


# Heart (UCI heart.csv)
HEART_COLS: List[str] = [
    "Age",
    "RestingBP",
    "Cholesterol",
    "FastingBS",
    "MaxHR",
    "Oldpeak",
    "Sex_F",
    "Sex_M",
    "ChestPainType_ASY",
    "ChestPainType_ATA",
    "ChestPainType_NAP",
    "ChestPainType_TA",
    "RestingECG_LVH",
    "RestingECG_Normal",
    "RestingECG_ST",
    "ExerciseAngina_N",
    "ExerciseAngina_Y",
    "ST_Slope_Down",
    "ST_Slope_Flat",
    "ST_Slope_Up",
]


_HEART_STATS = _load_stats(
    os.getenv("HEART_SCALER_JSON", "artifacts/heart_failure_prediction_scaler.json")
)


def preprocess_heart_failure(payload: Dict[str, Any]) -> np.ndarray:
    """Return (1, 20) vector matching training order; apply per-column z-score"""
    nums = [
        payload.get("Age", 0),
        payload.get("RestingBP", 0),
        payload.get("Cholesterol", 0),
        payload.get("FastingBS", 0),
        payload.get("MaxHR", 0),
        payload.get("Oldpeak", 0),
    ]
    sex = _one_hot(payload.get("Sex"), ["F", "M"])
    chest = _one_hot(payload.get("ChestPainType"), ["ASY", "ATA", "NAP", "TA"])
    ecg = _one_hot(payload.get("RestingECG"), ["LVH", "Normal", "ST"])
    ang = _one_hot(payload.get("ExerciseAngina"), ["N", "Y"])
    slope = _one_hot(payload.get("ST_Slope"), ["Down", "Flat", "Up"])

    vals = nums + sex + chest + ecg + ang + slope

    if _HEART_STATS:
        scaled = []
        for name, v in zip(HEART_COLS, vals):
            st = _HEART_STATS.get(name)
            if st:
                scaled.append(_z(v, st.get("mean", 0.0), st.get("std", 1.0)))
            else:
                try:
                    scaled.append(float(v))
                except Exception:
                    scaled.append(0.0)
        vec = scaled
    else:
        vec = [
            (
                float(v)
                if isinstance(v, (int, float))
                else float(v) if str(v).replace(".", "", 1).isdigit() else float(v)
            )
            for v in vals
        ]

    return np.array([vec], dtype=np.float32)


# Diabetes (BRFSS diabetes_binary)
DIAB_KEYS: List[str] = [
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
_DIAB_STATS = _load_stats(
    os.getenv("DIABETES_SCALER_JSON", "artifacts/diabetes_prediction_scaler.json")
)


def preprocess_diabetes(
    payload: Dict[str, Any], _ignore: List[str] | None = None
) -> np.ndarray:
    row: List[float] = []
    for k in DIAB_KEYS:
        v = payload.get(k, 0)
        if _DIAB_STATS and k in _DIAB_STATS:
            st = _DIAB_STATS[k]
            row.append(_z(v, st["mean"], st["std"]))
        else:
            try:
                row.append(float(v))
            except Exception:
                row.append(0.0)
    return np.array([row], dtype=np.float32)


# Stroke
STROKE_KEYS: List[str] = [
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
_STROKE_STATS = _load_stats(
    os.getenv("STROKE_SCALER_JSON", "artifacts/stroke_prediction_scaler.json")
)


def preprocess_stroke(
    payload: Dict[str, Any], _ignore: List[str] | None = None
) -> np.ndarray:
    row: List[float] = []
    for k in STROKE_KEYS:
        v = payload.get(k, 0)
        if _STROKE_STATS and k in _STROKE_STATS:
            st = _STROKE_STATS[k]
            row.append(_z(v, st["mean"], st["std"]))
        else:
            try:
                row.append(float(v))
            except Exception:
                row.append(0.0)
    return np.array([row], dtype=np.float32)
