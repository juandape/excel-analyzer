"""
Entry point del backend FastAPI.
Electron lanza este proceso como subproceso y se comunica con él
exclusivamente via HTTP en loopback (127.0.0.1).
"""
import logging
import os
import sys

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes import analysis, config, export, health

# ── Logging ──────────────────────────────────────────────────────────────────
log_level = os.getenv("LOG_LEVEL", "INFO").upper()
logging.basicConfig(
    level=getattr(logging, log_level, logging.INFO),
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    stream=sys.stderr,
)
logger = logging.getLogger(__name__)

# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Excel Analyzer Backend",
    version="1.0.0",
    docs_url=None,    # Deshabilitado en producción
    redoc_url=None,
)

# Solo permite requests desde el proceso main de Electron (loopback)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["null", "http://localhost", "http://127.0.0.1"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(health.router)
app.include_router(config.router, prefix="/config")
app.include_router(analysis.router, prefix="/analysis")
app.include_router(export.router, prefix="/export")


@app.on_event("startup")
async def startup():
    logger.info("Excel Analyzer backend iniciado")


@app.on_event("shutdown")
async def shutdown():
    from core.session import cleanup_all_sessions
    await cleanup_all_sessions()
    logger.info("Backend detenido — sesiones limpiadas")


if __name__ == "__main__":
    host = os.getenv("BACKEND_HOST", "127.0.0.1")
    port = int(os.getenv("BACKEND_PORT", "8765"))

    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        log_level=log_level.lower(),
        reload=os.getenv("DEV_MODE", "false").lower() == "true",
    )
