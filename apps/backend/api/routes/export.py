"""POST /export/download — Retorna el archivo generado para que Electron lo guarde."""
import logging
from pathlib import Path

from fastapi import APIRouter
from fastapi.responses import FileResponse
from pydantic import BaseModel

from core.errors import AppError, ErrorCode
from core.session import get_session

logger = logging.getLogger(__name__)
router = APIRouter()


class ExportRequest(BaseModel):
    session_id: str
    file_type: str   # "word" | "pptx"


@router.post("/download")
def download_file(request: ExportRequest):
    session = get_session(request.session_id)
    result = getattr(session, "_result", None)

    if not result:
        raise AppError(ErrorCode.SESSION_NOT_FOUND)

    file_path: Path | None = result.output_files.get(request.file_type)
    if not file_path or not file_path.exists():
        raise AppError(ErrorCode.EXPORT_FAILED, f"Archivo {request.file_type} no encontrado")

    media_types = {
        "word": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    }

    return FileResponse(
        path=str(file_path),
        media_type=media_types.get(request.file_type, "application/octet-stream"),
        filename=file_path.name,
    )
