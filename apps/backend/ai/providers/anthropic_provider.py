"""Proveedor Anthropic (claude-opus-4-5)."""
import logging

import anthropic as anthropic_sdk
from ai.client import AIClient
from ai.providers.openai_provider import _build_messages
from core.errors import AppError, ErrorCode
from core.models import ExtractedContent, OutputFormat

logger = logging.getLogger(__name__)

MODEL = "claude-opus-4-5"


class AnthropicProvider(AIClient):
    def __init__(self, api_key: str):
        self._client = anthropic_sdk.Anthropic(api_key=api_key)

    def analyze(
        self,
        extracted_content: ExtractedContent,
        user_prompt: str,
        output_format: OutputFormat,
        session_id: str,
    ) -> str:
        messages = _build_messages(extracted_content, user_prompt, output_format)
        # Anthropic usa system separado de messages
        system_msg = next((m["content"] for m in messages if m["role"] == "system"), "")
        user_messages = [m for m in messages if m["role"] != "system"]
        try:
            response = self._client.messages.create(
                model=MODEL,
                system=system_msg,
                messages=user_messages,
                max_tokens=8192,
                temperature=0.3,
                timeout=120,
            )
            return response.content[0].text
        except anthropic_sdk.AuthenticationError:
            raise AppError(ErrorCode.INVALID_API_KEY)
        except anthropic_sdk.RateLimitError:
            raise AppError(ErrorCode.AI_RATE_LIMIT)
        except Exception as e:
            logger.error("Error Anthropic: %s", type(e).__name__)
            raise AppError(ErrorCode.AI_UNAVAILABLE)

    def test_connection(self) -> bool:
        try:
            self._client.messages.create(
                model=MODEL,
                messages=[{"role": "user", "content": "ping"}],
                max_tokens=5,
                timeout=15,
            )
            return True
        except anthropic_sdk.AuthenticationError:
            raise AppError(ErrorCode.INVALID_API_KEY)
        except Exception as e:
            logger.warning("test_connection falló: %s", e)
            raise AppError(ErrorCode.AI_UNAVAILABLE)
