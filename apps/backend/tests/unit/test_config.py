"""Tests para la configuración del backend."""
from config import Settings


class TestSettings:
    def test_defaults(self):
        s = Settings()
        assert s.backend_host == "127.0.0.1"
        assert s.backend_port == 8765
        assert s.ai_provider in ("openai", "anthropic", "ollama", "mock")

    def test_override_via_env(self, monkeypatch):
        monkeypatch.setenv("BACKEND_PORT", "9999")
        monkeypatch.setenv("AI_PROVIDER", "anthropic")
        s = Settings()
        assert s.backend_port == 9999
        assert s.ai_provider == "anthropic"

    def test_max_file_size_positive(self):
        s = Settings()
        assert s.max_file_size_mb > 0

    def test_max_prompt_chars_positive(self):
        s = Settings()
        assert s.max_prompt_chars > 0

    def test_processing_timeout_positive(self):
        s = Settings()
        assert s.processing_timeout_seconds > 0

    def test_log_level_valid(self):
        s = Settings()
        assert s.log_level in ("DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL")
