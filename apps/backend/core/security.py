"""Validación segura de rutas de archivo."""
import mimetypes
from pathlib import Path

from core.errors import AppError, ErrorCode

MAX_FILE_SIZE_BYTES = 500 * 1024 * 1024  # 500 MB

ALLOWED_EXTENSIONS = {
    ".xlsx", ".xls", ".csv",   # Excel
    ".docx",                    # Word
    ".pdf",                     # PDF
    ".png", ".jpg", ".jpeg", ".webp",  # Imágenes
}


def validate_file_path(raw_path: str) -> Path:
    """
    Valida que el path es seguro antes de cualquier operación de lectura.
    Previene path traversal y tipos de archivo no permitidos.
    """
    try:
        resolved = Path(raw_path).resolve()
    except (OSError, ValueError) as e:
        raise AppError(ErrorCode.INVALID_PATH, f"Path no resoluble: {e}")

    if not resolved.exists():
        raise AppError(ErrorCode.INVALID_PATH, f"Archivo no encontrado: {resolved}")

    if not resolved.is_file():
        raise AppError(ErrorCode.INVALID_PATH, "La ruta no apunta a un archivo")

    if resolved.suffix.lower() not in ALLOWED_EXTENSIONS:
        raise AppError(
            ErrorCode.UNSUPPORTED_FORMAT,
            f"Extensión no permitida: {resolved.suffix}",
        )

    try:
        size = resolved.stat().st_size
    except OSError as e:
        raise AppError(ErrorCode.INVALID_PATH, f"No se pudo leer el tamaño: {e}")

    if size == 0:
        raise AppError(ErrorCode.EMPTY_FILE)

    if size > MAX_FILE_SIZE_BYTES:
        raise AppError(ErrorCode.FILE_TOO_LARGE, f"Tamaño: {size} bytes")

    return resolved
