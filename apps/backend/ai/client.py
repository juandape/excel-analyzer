"""
Cliente IA unificado. El resto del sistema solo usa AIClient,
nunca la implementación de cada proveedor.
"""
from abc import ABC, abstractmethod

from core.models import AnalysisResult, ExtractedContent, OutputFormat


class AIClient(ABC):
    @abstractmethod
    def analyze(
        self,
        extracted_content: ExtractedContent,
        user_prompt: str,
        output_format: OutputFormat,
        session_id: str,
    ) -> str:
        """
        Analiza el contenido extraído y retorna el análisis en Markdown.
        Lanza AppError en caso de fallo.
        """
        ...

    @abstractmethod
    def test_connection(self) -> bool:
        """Verifica que las credenciales son válidas con una llamada mínima."""
        ...
