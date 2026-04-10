"""Proveedor OpenAI (gpt-4o)."""
import logging

from openai import APITimeoutError, AuthenticationError, OpenAI, RateLimitError

from ai.client import AIClient
from ai.prompts.system import OUTPUT_INSTRUCTIONS, SYSTEM_PROMPT, WARNINGS_ADDENDUM
from core.errors import AppError, ErrorCode
from core.models import ExtractedContent, OutputFormat

logger = logging.getLogger(__name__)

MODEL = "gpt-4o"
MAX_CONTEXT_CHARS = 300_000   # ~100k tokens aprox


class OpenAIProvider(AIClient):
    def __init__(self, api_key: str):
        self._client = OpenAI(api_key=api_key)

    def analyze(
        self,
        extracted_content: ExtractedContent,
        user_prompt: str,
        output_format: OutputFormat,
        session_id: str,
    ) -> str:
        messages = _build_messages(extracted_content, user_prompt, output_format)
        try:
            response = self._client.chat.completions.create(
                model=MODEL,
                messages=messages,
                temperature=0.3,
                max_tokens=4096,
                timeout=120,
            )
            return response.choices[0].message.content or ""
        except AuthenticationError:
            raise AppError(ErrorCode.INVALID_API_KEY)
        except RateLimitError:
            raise AppError(ErrorCode.AI_RATE_LIMIT)
        except APITimeoutError:
            raise AppError(ErrorCode.PROCESSING_TIMEOUT)
        except Exception as e:
            logger.error("Error OpenAI: %s", type(e).__name__)
            raise AppError(ErrorCode.AI_UNAVAILABLE)

    def test_connection(self) -> bool:
        try:
            self._client.chat.completions.create(
                model=MODEL,
                messages=[{"role": "user", "content": "ping"}],
                max_tokens=5,
                timeout=15,
            )
            return True
        except AuthenticationError:
            raise AppError(ErrorCode.INVALID_API_KEY)
        except RateLimitError as e:
            # 429 insufficient_quota = sin crédito; 429 rate_limit = límite de velocidad
            msg = str(e)
            if "insufficient_quota" in msg:
                raise AppError(ErrorCode.AI_QUOTA_EXCEEDED)
            raise AppError(ErrorCode.AI_RATE_LIMIT)
        except APITimeoutError:
            raise AppError(ErrorCode.AI_UNAVAILABLE)
        except Exception as e:
            logger.warning("test_connection falló: %s", e)
            raise AppError(ErrorCode.AI_UNAVAILABLE)


def _build_messages(
    content: ExtractedContent,
    user_prompt: str,
    output_format: OutputFormat,
) -> list[dict]:
    system = SYSTEM_PROMPT
    if content.extraction_warnings:
        system += WARNINGS_ADDENDUM.format(
            warnings="\n".join(f"- {w}" for w in content.extraction_warnings)
        )

    doc_context = _build_document_context(content)
    format_instruction = OUTPUT_INSTRUCTIONS.get(output_format.value, "")

    user_message = (
        f"DOCUMENTO A ANALIZAR:\n---\n{doc_context}\n---\n\n"
        f"SOLICITUD:\n{user_prompt}\n\n"
        f"{format_instruction}"
    )

    return [
        {"role": "system", "content": system},
        {"role": "user", "content": user_message},
    ]


def _build_document_context(content: ExtractedContent) -> str:
    parts: list[str] = []

    if content.metadata:
        meta_lines = [f"- {k}: {v}" for k, v in content.metadata.items()]
        parts.append("**Metadata del documento:**\n" + "\n".join(meta_lines))

    if content.text_content:
        text = content.text_content[:MAX_CONTEXT_CHARS]
        parts.append(f"**Contenido:**\n{text}")

    for i, table in enumerate(content.tables[:10]):   # máximo 10 tablas
        header = " | ".join(table.headers)
        rows = "\n".join(" | ".join(str(c) for c in row) for row in table.rows[:100])
        sheet = f" (hoja: {table.sheet_name})" if table.sheet_name else ""
        parts.append(f"**Tabla {i+1}{sheet}:**\n{header}\n{rows}")

    return "\n\n".join(parts)
