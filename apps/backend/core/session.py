"""Ciclo de vida de sesiones de análisis y limpieza de archivos temporales."""
import asyncio
import hashlib
import logging
import shutil
import tempfile
import uuid
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path

logger = logging.getLogger(__name__)

# Registro en memoria de sesiones activas
_sessions: dict[str, "Session"] = {}


@dataclass
class Session:
    session_id: str
    temp_dir: Path
    created_at: datetime = field(default_factory=datetime.utcnow)
    output_files: dict[str, Path] = field(default_factory=dict)  # type → path


def create_session() -> "Session":
    """Crea una nueva sesión con directorio temporal aislado."""
    session_id = str(uuid.uuid4())
    temp_dir = Path(tempfile.mkdtemp(prefix=f".analyzer_{session_id[:8]}_"))
    temp_dir.chmod(0o700)  # Solo el proceso actual puede acceder

    session = Session(session_id=session_id, temp_dir=temp_dir)
    _sessions[session_id] = session

    logger.info("Sesión creada: %s", _hash_id(session_id))
    return session


def get_session(session_id: str) -> "Session":
    from core.errors import AppError, ErrorCode
    session = _sessions.get(session_id)
    if not session:
        raise AppError(ErrorCode.SESSION_NOT_FOUND)
    return session


def cleanup_session(session_id: str) -> None:
    """Elimina el directorio temporal y la sesión del registro."""
    session = _sessions.pop(session_id, None)
    if session and session.temp_dir.exists():
        try:
            shutil.rmtree(session.temp_dir, ignore_errors=False)
            logger.info("Sesión limpiada: %s", _hash_id(session_id))
        except Exception as e:
            logger.error("Error limpiando sesión %s: %s", _hash_id(session_id), type(e).__name__)


async def cleanup_all_sessions() -> None:
    """Llamado en shutdown del servidor para limpiar todas las sesiones activas."""
    session_ids = list(_sessions.keys())
    for sid in session_ids:
        cleanup_session(sid)
    logger.info("Todas las sesiones limpiadas (%d)", len(session_ids))


def _hash_id(session_id: str) -> str:
    """Hash corto para logs — nunca logueamos el session_id real."""
    return hashlib.sha256(session_id.encode()).hexdigest()[:8]
