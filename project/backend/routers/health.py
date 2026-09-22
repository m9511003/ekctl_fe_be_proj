import os

from fastapi import APIRouter

router = APIRouter()


@router.get("/api/health")
def health():
    return {
        "status": "ok",
        "api_key_loaded": bool(os.environ.get("OPENAI_API_KEY")),
    }
