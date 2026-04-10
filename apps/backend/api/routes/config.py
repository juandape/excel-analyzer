"""POST /config — Guarda la configuración de IA en el keychain."""
import logging

from fastapi import APIRouter
from pydantic import BaseModel, field_validator

from ai.factory import create_ai_client, save_config
from core.errors import AppError

logger = logging.getLogger(__name__)
router = APIRouter()


class SaveConfigRequest(BaseModel):
    ai_provider: str
    api_key: str | None = None
    ollama_url: str | None = None

    @field_validator("ai_provider")
    @classmethod
    def validate_provider(cls, v: str) -> str:
        allowed = {"openai", "anthropic", "ollama"}
        if v.lower() not in allowed:
            raise ValueError(f"Proveedor inválido. Usa: {', '.join(allowed)}")
        return v.lower()


class ConfigResponse(BaseModel):
    ok: bool
    error: str | None = None


@router.post("/save", response_model=ConfigResponse)
def save_configuration(request: SaveConfigRequest):
    try:
        save_config(
            provider=request.ai_provider,
            api_key=request.api_key,
            ollama_url=request.ollama_url,
        )
        return ConfigResponse(ok=True)
    except AppError as e:
        return ConfigResponse(ok=False, error=e.user_message)


@router.get("/test", response_model=ConfigResponse)
def test_connection():
    try:
        client = create_ai_client()
        client.test_connection()
        return ConfigResponse(ok=True)
    except AppError as e:
        return ConfigResponse(ok=False, error=e.user_message)
    except Exception as e:
        logger.warning("test_connection inesperado: %s", e)
        return ConfigResponse(ok=False, error="No se pudo verificar la conexión con la IA.")
