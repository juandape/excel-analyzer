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

# Cola de eventos por sesión (para suscriptores activos)
_progress_queues: dict[str, asyncio.Queue] = {}
# Historial de eventos por sesión (para suscriptores tardíos — replay)
_event_history: dict[str, list[dict]] = {}


class AnalyzeRequest(BaseModel):
    file_paths: list[str]
    user_prompt: str
    output_format: str = "both"
    pptx_template_path: str | None = None

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
        if v not in {"word", "pptx", "excel", "both", "all"}:
            raise ValueError("output_format debe ser: word, pptx, excel, both o all")
        return v


class StatusResponse(BaseModel):
    stage: str
    percentage: int
    message: str
    done: bool
    error: bool


@router.get("/status/{session_id}", response_model=StatusResponse)
def get_status(session_id: str):
    """Endpoint de polling — más simple y confiable que SSE para Electron."""
    try:
        session = get_session(session_id)
    except AppError:
        return StatusResponse(stage="error", percentage=0, message="Sesión no encontrada", done=False, error=True)
    stage = getattr(session, "_current_stage", "extracting")
    pct = getattr(session, "_current_pct", 5)
    msg = getattr(session, "_current_msg", "Procesando...")
    result = getattr(session, "_result", None)
    error = getattr(session, "_error_msg", None)
    if error:
        return StatusResponse(stage="error", percentage=0, message=error, done=False, error=True)
    if result:
        return StatusResponse(stage="done", percentage=100, message="¡Análisis completado!", done=True, error=False)
    return StatusResponse(stage=stage, percentage=pct, message=msg, done=False, error=False)


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
    _event_history[session.session_id] = []

    # Lanzar el pipeline en background
    task = asyncio.create_task(
        _run_pipeline(session, request, queue)
    )

    def _on_task_done(t: asyncio.Task) -> None:
        """Captura excepciones no manejadas del pipeline para no perderlas silenciosamente."""
        if t.cancelled():
            return
        exc = t.exception()
        if exc:
            logger.error(
                "Pipeline falló sin manejar la excepción (sesión %s): %s: %s",
                session.session_id[:8],
                type(exc).__name__,
                exc,
            )
            # Escribir error en sesión para que el polling lo devuelva
            try:
                session._error_msg = "Error inesperado. Revisa los logs."  # type: ignore[attr-defined]
                session._current_stage = "error"  # type: ignore[attr-defined]
            except Exception:
                pass

    task.add_done_callback(_on_task_done)

    return AnalyzeResponse(session_id=session.session_id)


@router.get("/progress/{session_id}")
async def get_progress(session_id: str):
    history = _event_history.get(session_id)
    queue = _progress_queues.get(session_id)

    # Si no hay historial ni cola, la sesión no existe
    if history is None and queue is None:
        return StreamingResponse(
            _error_stream("session_not_found", "Sesión no encontrada"),
            media_type="text/event-stream",
        )

    return StreamingResponse(
        _sse_generator(session_id, queue, list(history or [])),
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

        # Extraer contenido — dispatch es síncrono (openpyxl, pandas, etc.)
        # Se ejecuta en thread pool para no bloquear el event loop y poder emitir SSE
        contents = []
        for i, path in enumerate(request.file_paths):
            content = await asyncio.to_thread(dispatch, path, session)
            contents.append(content)
            pct = 10 + int((i + 1) / len(request.file_paths) * 30)
            await _emit(queue, session.session_id, "extracting", pct, f"Archivo {i+1} procesado")

        await _emit(queue, session.session_id, "analyzing", 50, "Analizando con IA...")

        # Para BOTH y ALL hacemos llamadas de IA separadas por formato
        # para evitar mezcla de instrucciones y parsing de separadores
        client = create_ai_client()
        fmt = OutputFormat(request.output_format)

        needs_word  = fmt in (OutputFormat.WORD,  OutputFormat.BOTH, OutputFormat.ALL)
        needs_pptx  = fmt in (OutputFormat.PPTX,  OutputFormat.BOTH, OutputFormat.ALL)
        needs_excel = fmt in (OutputFormat.EXCEL, OutputFormat.ALL)

        word_text  = ""
        pptx_text  = ""
        excel_text = ""

        if needs_word:
            await _emit(queue, session.session_id, "analyzing", 52, "Generando informe Word...")
            word_text = await asyncio.to_thread(
                client.analyze, contents[0], request.user_prompt,
                OutputFormat.WORD, session.session_id,
            )

        if needs_pptx:
            pct = 65 if needs_word else 52
            await _emit(queue, session.session_id, "analyzing", pct, "Generando presentación...")
            pptx_text = await asyncio.to_thread(
                client.analyze, contents[0], request.user_prompt,
                OutputFormat.PPTX, session.session_id,
            )

        if needs_excel:
            pct = 75 if (needs_word or needs_pptx) else 52
            await _emit(queue, session.session_id, "analyzing", pct, "Generando tabla Excel...")
            excel_text = await asyncio.to_thread(
                client.analyze, contents[0], request.user_prompt,
                OutputFormat.EXCEL, session.session_id,
            )

        # Texto principal para mostrar en la UI (preferir Word, si no PPTX)
        analysis_text = word_text or pptx_text or excel_text

        await _emit(queue, session.session_id, "generating", 80, "Generando archivos...")

        from core.models import AnalysisResult
        output_files: dict = {}
        all_warnings = [w for c in contents for w in c.extraction_warnings]

        if needs_word:
            provisional_word = AnalysisResult(
                session_id=session.session_id, analysis_text=word_text,
                output_files={}, warnings=all_warnings,
            )
            try:
                from generators.word_generator import generate_word
                output_files["word"] = await asyncio.to_thread(generate_word, provisional_word, session)
            except Exception as e:
                logger.warning("Error generando Word: %s", type(e).__name__)
                all_warnings.append("No se pudo generar el reporte Word.")

        if needs_pptx:
            provisional_pptx = AnalysisResult(
                session_id=session.session_id, analysis_text=pptx_text,
                output_files={}, warnings=all_warnings,
            )
            try:
                from generators.pptx_generator import generate_pptx
                output_files["pptx"] = await asyncio.to_thread(
                    generate_pptx, provisional_pptx, session, request.pptx_template_path
                )
            except Exception as e:
                logger.warning("Error generando PPTX: %s", type(e).__name__)
                all_warnings.append("No se pudo generar la presentación PowerPoint.")

        if needs_excel:
            provisional_excel = AnalysisResult(
                session_id=session.session_id, analysis_text=excel_text,
                output_files={}, warnings=all_warnings,
            )
            try:
                from generators.excel_generator import generate_excel
                output_files["excel"] = await asyncio.to_thread(generate_excel, provisional_excel, session)
            except Exception as e:
                logger.warning("Error generando Excel: %s", type(e).__name__)
                all_warnings.append("No se pudo generar el archivo Excel.")

        result = AnalysisResult(
            session_id=session.session_id,
            analysis_text=analysis_text,
            output_files=output_files,
            warnings=all_warnings,
        )
        session._result = result  # type: ignore[attr-defined]

        await _emit(queue, session.session_id, "done", 100, "¡Análisis completado!")

    except AppError as e:
        try:
            session._error_msg = e.user_message  # type: ignore[attr-defined]
        except Exception:
            pass
        await _emit(queue, session.session_id, "error", 0, e.user_message)
    except Exception as e:
        msg = "Algo salió mal. Intenta de nuevo."
        try:
            session._error_msg = msg  # type: ignore[attr-defined]
        except Exception:
            pass
        logger.error("Error inesperado en pipeline (sesión hasheada): %s", type(e).__name__)
        await _emit(queue, session.session_id, "error", 0, msg)
    finally:
        _progress_queues.pop(session.session_id, None)
        # El historial se limpia cuando el SSE lo consume, no aquí


async def _emit(queue: asyncio.Queue, session_id: str, stage: str, pct: int, msg: str):
    event = {"session_id": session_id, "stage": stage, "percentage": pct, "message": msg}
    # Guardar estado en sesión para polling
    try:
        session = get_session(session_id)
        session._current_stage = stage  # type: ignore[attr-defined]
        session._current_pct = pct       # type: ignore[attr-defined]
        session._current_msg = msg       # type: ignore[attr-defined]
    except AppError as e:
        logger.error("[_emit] Sesión no encontrada al guardar estado: %s", e.code)
    except Exception as e:
        logger.error("[_emit] Error inesperado guardando estado: %s", type(e).__name__, exc_info=True)
    # Guardar en historial para replay de suscriptores tardíos
    if session_id in _event_history:
        _event_history[session_id].append(event)
    await queue.put(event)


async def _sse_generator(session_id: str, queue: asyncio.Queue | None, replay: list[dict]) -> AsyncGenerator[str, None]:
    # 1. Primero emitir los eventos ya almacenados (replay para suscriptores tardíos)
    for event in replay:
        yield f"data: {json.dumps(event)}\n\n"
        if event.get("stage") in ("done", "error"):
            _event_history.pop(session_id, None)
            return

    # 2. Si la cola ya no existe (pipeline terminó antes de que SSE conectara y ya
    #    se hizo replay completo incluyendo done/error), no hay nada más que esperar
    if queue is None:
        _event_history.pop(session_id, None)
        return

    # 3. Esperar nuevos eventos de la cola
    while True:
        try:
            event = await asyncio.wait_for(queue.get(), timeout=120.0)
            yield f"data: {json.dumps(event)}\n\n"
            if event.get("stage") in ("done", "error"):
                _event_history.pop(session_id, None)
                break
        except asyncio.TimeoutError:
            yield "data: {\"stage\": \"error\", \"message\": \"Timeout\"}\n\n"
            _event_history.pop(session_id, None)
            break


async def _error_stream(stage: str, message: str) -> AsyncGenerator[str, None]:
    yield f"data: {json.dumps({'stage': stage, 'message': message})}\n\n"
