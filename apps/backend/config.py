"""Configuración del backend leída desde variables de entorno o keychain."""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # Backend
    backend_host: str = "127.0.0.1"
    backend_port: int = 8765
    log_level: str = "INFO"
    dev_mode: bool = False

    # IA — se completa desde el keychain en runtime, no desde .env en producción
    ai_provider: str = "openai"   # openai | anthropic | ollama
    openai_api_key: str = ""
    anthropic_api_key: str = ""
    ollama_base_url: str = "http://localhost:11434"

    # Límites de procesamiento
    max_file_size_mb: int = 100
    max_prompt_chars: int = 2000
    processing_timeout_seconds: int = 60
    ai_timeout_seconds: int = 120
    max_context_tokens: int = 100_000

    # Directorios
    temp_base_dir: str = ""   # vacío = usa tempfile.gettempdir()


settings = Settings()
