from fastapi import APIRouter, UploadFile, File, HTTPException

router = APIRouter(prefix="/api/signals", tags=["signals"])


@router.post("/ecg-classify")
async def ecg_classify(file: UploadFile = File(...)):
    raise HTTPException(status_code=501, detail="ECG classifier not available yet.")
