from datetime import datetime
from pathlib import Path

from fastapi import APIRouter
from fastapi.responses import Response

from models.export import ExportRequest
from services import docx_service, xlsx_service

router = APIRouter()

OUTPUT_DIR = Path(__file__).resolve().parent.parent.parent / "output"

XLSX_MEDIA = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
DOCX_MEDIA = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"


def _save_to_output(filename: str, content: bytes) -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    stamped = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{filename}"
    (OUTPUT_DIR / stamped).write_bytes(content)


@router.post("/api/export/xlsx")
def export_xlsx(req: ExportRequest):
    content = xlsx_service.build(req)
    _save_to_output("re_result.xlsx", content)
    return Response(
        content=content,
        media_type=XLSX_MEDIA,
        headers={"Content-Disposition": 'attachment; filename="re_result.xlsx"'},
    )


@router.post("/api/export/docx")
def export_docx(req: ExportRequest):
    content = docx_service.build(req)
    _save_to_output("re_report.docx", content)
    return Response(
        content=content,
        media_type=DOCX_MEDIA,
        headers={"Content-Disposition": 'attachment; filename="re_report.docx"'},
    )
