"""
POST /analysis/start — Inicia el análisis y retorna session_id.
GET  /analysis/progress/{session_id} — SSE stream de progreso.
GET  /analysis/result/{session_id} — Resultado final.
"""
import asyncio
import json
import logging
from typing import AsyncGenerator

from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, field_validator

from ai.factory import create_ai_client
from core.errors import AppError, ErrorCode
from core.models import OutputFormat
from core.session import Session, cleanup_session, create_session, get_session
from processors.dispatcher import dispatch

logger = logging.getLogger(__name__)
router = APIRouter()

# Cola de eventos por sesión
_progress_queues: dict[str, asyncio.Queue] = {}


class AnalyzeRequest(BaseModel):
    file_paths: list[str]
    user_prompt: str
    output_format: str = "both"

    @field_validator("user_prompt")
    @classmethod
    def validate_prompt(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("El prompt no puede estar vacío")
        return v[:2000]  # Truncar al límite

    @field_validator("output_format")
    @classmethod
    def validate_format(cls, v: str) -> str:
        if v not in {"word", "pptx", "both"}:
            raise ValueError("output_format debe ser: word, pptx o both")
        return v


class AnalyzeResponse(BaseModel):
    session_id: str


class ResultResponse(BaseModel):
    session_id: str
    analysis_text: str
    output_files: list[dict]
    warnings: list[str]


@router.post("/start", response_model=AnalyzeResponse)
async def start_analysis(request: AnalyzeRequest):
    session = create_session()
    queue: asyncio.Queue = asyncio.Queue()
    _progress_queues[session.session_id] = queue

    # Lanzar el pipeline en background
    asyncio.create_task(
        _run_pipeline(session, request, queue)
    )

    return AnalyzeResponse(session_id=session.session_id)


@router.get("/progress/{session_id}")
async def get_progress(session_id: str):
    queue = _progress_queues.get(session_id)
    if not queue:
        return StreamingResponse(
            _error_stream("session_not_found", "Sesión no encontrada"),
            media_type="text/event-stream",
        )

    return StreamingResponse(
        _sse_generator(session_id, queue),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@router.get("/result/{session_id}", response_model=ResultResponse)
def get_result(session_id: str):
    session = get_session(session_id)
    result = getattr(session, "_result", None)
    if not result:
        raise AppError(ErrorCode.SESSION_NOT_FOUND)

    return ResultResponse(
        session_id=session_id,
        analysis_text=result.analysis_text,
        output_files=[
            {"type": k, "file_name": v.name, "session_id": session_id}
            for k, v in result.output_files.items()
        ],
        warnings=result.warnings,
    )


async def _run_pipeline(session: Session, request: AnalyzeRequest, queue: asyncio.Queue):
    try:
        await _emit(queue, session.session_id, "extracting", 10, "Leyendo archivos...")

        # Extraer contenido de todos los archivos
        contents = []
        for i, path in enumerate(request.file_paths):
            contents.append(dispatch(path, session))
            pct = 10 + int((i + 1) / len(request.file_paths) * 30)
            await _emit(queue, session.session_id, "extracting", pct, f"Archivo {i+1} procesado")

        await _emit(queue, session.session_id, "analyzing", 50, "Analizando con IA...")

        # Análisis con IA (usa solo el primer archivo en MVP)
        client = create_ai_client()
        fmt = OutputFormat(request.output_format)
        analysis_text = client.analyze(
            extracted_content=contents[0],
            user_prompt=request.user_prompt,
            output_format=fmt,
            session_id=session.session_id,
        )

        await _emit(queue, session.session_id, "generating", 80, "Generando archivos...")

        # Generar Word / PPTX según formato solicitado
        from core.models import AnalysisResult
        output_files: dict = {}
        all_warnings = [w for c in contents for w in c.extraction_warnings]

        # Resultado provisional necesario para los generadores
        provisional = AnalysisResult(
            session_id=session.session_id,
            analysis_text=analysis_text,
            output_files={},
            warnings=all_warnings,
        )

        if fmt in (OutputFormat.WORD, OutputFormat.BOTH):
            try:
                from generators.word_generator import generate_word
                word_path = generate_word(provisional, session)
                output_files["word"] = word_path
            except Exception as e:
                logger.warning("Error generando Word: %s", type(e).__name__)
                all_warnings.append("No se pudo generar el reporte Word.")

        if fmt in (OutputFormat.PPTX, OutputFormat.BOTH):
            try:
                from generators.pptx_generator import generate_pptx
                pptx_path = generate_pptx(provisional, session)
                output_files["pptx"] = pptx_path
            except Exception as e:
                logger.warning("Error generando PPTX: %s", type(e).__name__)
                all_warnings.append("No se pudo generar la presentación PowerPoint.")

        result = AnalysisResult(
            session_id=session.session_id,
            analysis_text=analysis_text,
            output_files=output_files,
            warnings=all_warnings,
        )
        session._result = result  # type: ignore[attr-defined]

        await _emit(queue, session.session_id, "done", 100, "¡Análisis completado!")

    except AppError as e:
        await _emit(queue, session.session_id, "error", 0, e.user_message)
    except Exception as e:
        logger.error("Error inesperado en pipeline (sesión hasheada): %s", type(e).__name__)
        await _emit(queue, session.session_id, "error", 0, "Algo salió mal. Intenta de nuevo.")
    finally:
        _progress_queues.pop(session.session_id, None)


async def _emit(queue: asyncio.Queue, session_id: str, stage: str, pct: int, msg: str):
    await queue.put({"session_id": session_id, "stage": stage, "percentage": pct, "message": msg})


async def _sse_generator(session_id: str, queue: asyncio.Queue) -> AsyncGenerator[str, None]:
    while True:
        try:
            event = await asyncio.wait_for(queue.get(), timeout=120.0)
            yield f"data: {json.dumps(event)}\n\n"
            if event.get("stage") in ("done", "error"):
                break
        except asyncio.TimeoutError:
            yield "data: {\"stage\": \"error\", \"message\": \"Timeout\"}\n\n"
            break


async def _error_stream(stage: str, message: str) -> AsyncGenerator[str, None]:
    yield f"data: {json.dumps({'stage': stage, 'message': message})}\n\n"
