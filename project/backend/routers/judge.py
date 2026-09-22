from fastapi import APIRouter

from models.judge import JudgeRequest
from services import judge_service, limits_service

router = APIRouter()


@router.post("/api/judge")
def judge(body: JudgeRequest):
    limit_rows, _ = limits_service.load()
    return judge_service.run_judge(body.rows, body.cf_db, limit_rows)
