from fastapi import APIRouter, HTTPException

from models.limits import LimitsPutRequest, LimitsResponse
from services import limits_service

router = APIRouter()


@router.get("/api/limits", response_model=LimitsResponse)
def get_limits():
    rows, source = limits_service.load()
    return {"rows": rows, "source": source}


@router.put("/api/limits", response_model=LimitsResponse)
def put_limits(body: LimitsPutRequest):
    error = limits_service.validate(body.rows)
    if error:
        raise HTTPException(status_code=400, detail=error)
    rows = limits_service.save(body.rows)
    return {"rows": rows, "source": "user"}


@router.post("/api/limits/reset", response_model=LimitsResponse)
def reset_limits():
    rows = limits_service.reset()
    return {"rows": rows, "source": "default"}
