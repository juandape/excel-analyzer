"""Proveedor Ollama local (llama3.1)."""
import logging

import requests

from ai.client import AIClient
from ai.providers.openai_provider import _build_messages
from core.errors import AppError, ErrorCode
from core.models import ExtractedContent, OutputFormat

logger = logging.getLogger(__name__)

MODEL = "llama3.1"
# Ollama tiene contexto limitado — usamos un presupuesto conservador
MAX_CONTEXT_CHARS = 18_000   # ~6k tokens


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
        # Convertir al formato Ollama (compatible OpenAI)
        try:
            resp = requests.post(
                f"{self._base_url}/api/chat",
                json={"model": MODEL, "messages": messages, "stream": False},
                timeout=120,
            )
            resp.raise_for_status()
            return resp.json()["message"]["content"]
        except requests.ConnectionError:
            raise AppError(ErrorCode.AI_UNAVAILABLE, "Ollama no está ejecutándose")
        except requests.Timeout:
            raise AppError(ErrorCode.PROCESSING_TIMEOUT)
        except Exception as e:
            logger.error("Error Ollama: %s", type(e).__name__)
            raise AppError(ErrorCode.AI_UNAVAILABLE)

    def test_connection(self) -> bool:
        try:
            resp = requests.get(f"{self._base_url}/api/tags", timeout=5)
            return resp.status_code == 200
        except Exception:
            return False
