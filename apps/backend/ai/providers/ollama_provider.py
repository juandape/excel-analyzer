"""Proveedor Ollama local (llama3.x)."""
import logging

import requests

from ai.client import AIClient
from ai.providers.openai_provider import _build_messages
from core.errors import AppError, ErrorCode
from core.models import ExtractedContent, OutputFormat

logger = logging.getLogger(__name__)

# Modelos preferidos en orden de prioridad
PREFERRED_MODELS = ["llama3.2", "llama3.1", "llama3", "llama2", "mistral", "gemma2"]
MAX_CONTEXT_CHARS = 18_000


def _pick_model(base_url: str) -> str:
    """Devuelve el mejor modelo disponible en Ollama, o el primero de PREFERRED_MODELS como fallback."""
    try:
        resp = requests.get(f"{base_url}/api/tags", timeout=5)
        resp.raise_for_status()
        installed = [m["name"].split(":")[0] for m in resp.json().get("models", [])]
        for preferred in PREFERRED_MODELS:
            if preferred in installed:
                return preferred
        # Si ninguno coincide, usar el primero disponible
        if installed:
            return installed[0]
    except Exception:
        pass
    return PREFERRED_MODELS[0]  # fallback


class OllamaProvider(AIClient):
    def __init__(self, base_url: str = "http://localhost:11434"):
        self._base_url = base_url.rstrip("/")

    def analyze(
        self,
        extracted_content: ExtractedContent,
        user_prompt: str,
        output_format: OutputFormat,
        session_id: str,
    ) -> str:
        # Para Ollama recortamos el contexto agresivamente
        from copy import deepcopy
        trimmed = deepcopy(extracted_content)
        trimmed.text_content = trimmed.text_content[:MAX_CONTEXT_CHARS]
        trimmed.tables = trimmed.tables[:3]

        messages = _build_messages(trimmed, user_prompt, output_format)
        model = _pick_model(self._base_url)
        logger.info("Usando modelo Ollama: %s", model)
        try:
            resp = requests.post(
                f"{self._base_url}/api/chat",
                json={"model": model, "messages": messages, "stream": False},
                timeout=120,
            )
            resp.raise_for_status()
            return resp.json()["message"]["content"]
        except requests.ConnectionError:
            raise AppError(ErrorCode.AI_UNAVAILABLE, "Ollama no está ejecutándose. Abre Ollama e inténtalo de nuevo.")
        except requests.Timeout:
            raise AppError(ErrorCode.PROCESSING_TIMEOUT)
        except requests.HTTPError as e:
            status = e.response.status_code if e.response is not None else '?'
            if status == 404:
                raise AppError(ErrorCode.AI_UNAVAILABLE, f"El modelo '{model}' no está descargado. Ejecuta: ollama pull {model}")
            logger.error("Error HTTP Ollama %s: %s", status, e)
            raise AppError(ErrorCode.AI_UNAVAILABLE, f"Ollama respondió con error {status}.")
        except Exception as e:
            logger.error("Error Ollama: %s", type(e).__name__)
            raise AppError(ErrorCode.AI_UNAVAILABLE)

    def test_connection(self) -> bool:
        try:
            resp = requests.get(f"{self._base_url}/api/tags", timeout=5)
            if resp.status_code == 200:
                return True
            raise AppError(ErrorCode.AI_UNAVAILABLE)
        except AppError:
            raise
        except Exception as e:
            logger.warning("test_connection Ollama falló: %s", e)
            raise AppError(ErrorCode.AI_UNAVAILABLE)
