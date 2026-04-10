"""Modelos de datos compartidos entre procesadores, cliente IA y generadores."""
from dataclasses import dataclass, field
from enum import Enum
from pathlib import Path


class FileType(str, Enum):
    EXCEL = "excel"
    WORD = "word"
    PDF = "pdf"
    IMAGE = "image"


class OutputFormat(str, Enum):
    WORD = "word"
    PPTX = "pptx"
    EXCEL = "excel"
    BOTH = "both"
    ALL = "all"


@dataclass
class TableData:
    headers: list[str]
    rows: list[list[str]]
    sheet_name: str | None = None   # Para Excel


@dataclass
class ImageData:
    temp_path: Path         # Ruta temporal cifrada de la imagen
    source: str             # "chart", "embedded", "page_render", "original"
    page_number: int | None = None


@dataclass
class ExtractedContent:
    source_file_hash: str           # SHA256 del nombre del archivo (nunca el nombre real)
    file_type: FileType
    text_content: str               # Texto principal extraído
    tables: list[TableData] = field(default_factory=list)
    images: list[ImageData] = field(default_factory=list)
    metadata: dict = field(default_factory=dict)
    extraction_warnings: list[str] = field(default_factory=list)


@dataclass
class AnalysisResult:
    session_id: str
    analysis_text: str              # Markdown generado por la IA
    output_files: dict[str, Path]   # "word" → Path, "pptx" → Path
    warnings: list[str] = field(default_factory=list)
