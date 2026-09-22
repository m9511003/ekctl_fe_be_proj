import os

from fastapi import APIRouter, File, HTTPException, UploadFile

from services import ocr_service

router = APIRouter()


@router.post("/api/ocr")
async def ocr(files: list[UploadFile] = File(...)):
    if not os.environ.get("OPENAI_API_KEY"):
        raise HTTPException(
            status_code=400,
            detail="OPENAI_API_KEY가 설정되지 않았습니다. backend/.env 파일을 확인하세요.",
        )

    results = []
    for f in files:
        content = await f.read()
        results.append(ocr_service.extract(content, f.filename))
    return results
