"""
Entry point del backend FastAPI.
Electron lanza este proceso como subproceso y se comunica con él
exclusivamente via HTTP en loopback (127.0.0.1).
"""
import logging
import os
import sys
from contextlib import asynccontextmanager

import uvicorn
from api.routes import analysis, config, export, health
from core.session import cleanup_all_sessions
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# ── Logging ──────────────────────────────────────────────────────────────────
log_level = os.getenv("LOG_LEVEL", "INFO").upper()
logging.basicConfig(
    level=getattr(logging, log_level, logging.INFO),
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    stream=sys.stderr,
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Excel Analyzer backend iniciado")
    yield
    await cleanup_all_sessions()
    logger.info("Backend detenido — sesiones limpiadas")

# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Excel Analyzer Backend",
    version="1.0.0",
    docs_url=None,
    redoc_url=None,
    lifespan=lifespan,
)

# Permite requests desde el renderer de Electron (dev y prod)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "null",
        "http://localhost",
        "http://localhost:5173",
        "http://127.0.0.1",
        "http://127.0.0.1:5173",
    ],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
    allow_credentials=False,
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(health.router)
app.include_router(config.router, prefix="/config")
app.include_router(analysis.router, prefix="/analysis")
app.include_router(export.router, prefix="/export")


if __name__ == "__main__":
    host = os.getenv("BACKEND_HOST", "127.0.0.1")
    port = int(os.getenv("BACKEND_PORT", "8765"))

    uvicorn.run(
        app,
        host=host,
        port=port,
        log_level=log_level.lower(),
    )
