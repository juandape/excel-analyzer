"""
Factory que lee la configuración y retorna el AIClient correcto.
El resto del sistema nunca sabe qué proveedor está activo.
"""
import logging

import keyring
from ai.client import AIClient
from core.errors import AppError, ErrorCode

logger = logging.getLogger(__name__)

KEYRING_SERVICE = "excel-analyzer"
KEYRING_AI_PROVIDER = "ai_provider"
KEYRING_API_KEY = "api_key"
KEYRING_OLLAMA_URL = "ollama_url"


def create_ai_client() -> AIClient:
    """Lee la config del keychain y retorna la instancia correcta de AIClient."""
    provider = keyring.get_password(KEYRING_SERVICE, KEYRING_AI_PROVIDER)

    if not provider:
        # Fallback a variable de entorno en desarrollo
        import os
        provider = os.getenv("AI_PROVIDER", "")

    if not provider:
        raise AppError(
            ErrorCode.AI_UNAVAILABLE,
            "No hay proveedor de IA configurado",
        )

    match provider.lower():
        case "openai":
            from ai.providers.openai_provider import OpenAIProvider
            api_key = _get_api_key()
            return OpenAIProvider(api_key=api_key)

        case "anthropic":
            from ai.providers.anthropic_provider import AnthropicProvider
            api_key = _get_api_key()
            return AnthropicProvider(api_key=api_key)

        case "ollama":
            from ai.providers.ollama_provider import OllamaProvider
            base_url = keyring.get_password(KEYRING_SERVICE, KEYRING_OLLAMA_URL) or "http://localhost:11434"
            return OllamaProvider(base_url=base_url)

        case _:
            raise AppError(ErrorCode.AI_UNAVAILABLE, f"Proveedor desconocido: {provider}")


def save_config(provider: str, api_key: str | None = None, ollama_url: str | None = None) -> None:
    """Guarda la configuración de IA en el keychain del OS."""
    keyring.set_password(KEYRING_SERVICE, KEYRING_AI_PROVIDER, provider)
    if api_key:
        keyring.set_password(KEYRING_SERVICE, KEYRING_API_KEY, api_key)
    if ollama_url:
        keyring.set_password(KEYRING_SERVICE, KEYRING_OLLAMA_URL, ollama_url)
    logger.info("Configuración de IA guardada (proveedor: %s)", provider)


def _get_api_key() -> str:
    import os
    key = keyring.get_password(KEYRING_SERVICE, KEYRING_API_KEY) or os.getenv("OPENAI_API_KEY", "")
    if not key:
        raise AppError(ErrorCode.INVALID_API_KEY)
    return key
