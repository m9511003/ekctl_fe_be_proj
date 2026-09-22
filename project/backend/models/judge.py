from pydantic import BaseModel

from models.ocr import OcrRow


class JudgeRequest(BaseModel):
    rows: list[OcrRow]
    cf_db: float = -50.0
