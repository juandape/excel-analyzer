"""Tests para los modelos de datos del dominio."""
from pathlib import Path

from core.models import (
    AnalysisResult,
    ExtractedContent,
    FileType,
    ImageData,
    OutputFormat,
    TableData,
)


class TestFileType:
    def test_values(self):
        assert FileType.EXCEL.value == "excel"
        assert FileType.WORD.value == "word"
        assert FileType.PDF.value == "pdf"
        assert FileType.IMAGE.value == "image"

    def test_is_string_enum(self):
        assert isinstance(FileType.EXCEL, str)


class TestOutputFormat:
    def test_values(self):
        assert OutputFormat.WORD.value == "word"
        assert OutputFormat.PPTX.value == "pptx"
        assert OutputFormat.EXCEL.value == "excel"
        assert OutputFormat.BOTH.value == "both"
        assert OutputFormat.ALL.value == "all"

    def test_is_string_enum(self):
        assert isinstance(OutputFormat.WORD, str)


class TestTableData:
    def test_basic_creation(self):
        t = TableData(headers=["A", "B"], rows=[["1", "2"]])
        assert t.headers == ["A", "B"]
        assert t.rows == [["1", "2"]]
        assert t.sheet_name is None

    def test_with_sheet_name(self):
        t = TableData(headers=["X"], rows=[], sheet_name="Hoja1")
        assert t.sheet_name == "Hoja1"

    def test_empty_rows(self):
        t = TableData(headers=["Col1", "Col2"], rows=[])
        assert len(t.rows) == 0


class TestImageData:
    def test_creation(self, tmp_path):
        p = tmp_path / "img.png"
        p.write_bytes(b"\x89PNG")
        img = ImageData(temp_path=p, source="chart")
        assert img.temp_path == p
        assert img.source == "chart"
        assert img.page_number is None

    def test_with_page_number(self, tmp_path):
        p = tmp_path / "page.png"
        p.write_bytes(b"data")
        img = ImageData(temp_path=p, source="page_render", page_number=3)
        assert img.page_number == 3


class TestExtractedContent:
    def test_defaults(self):
        ec = ExtractedContent(
            source_file_hash="abc123",
            file_type=FileType.EXCEL,
            text_content="datos aquí",
        )
        assert ec.tables == []
        assert ec.images == []
        assert ec.metadata == {}
        assert ec.extraction_warnings == []

    def test_with_tables(self):
        t = TableData(headers=["A"], rows=[["1"]])
        ec = ExtractedContent(
            source_file_hash="def456",
            file_type=FileType.PDF,
            text_content="texto",
            tables=[t],
        )
        assert len(ec.tables) == 1
        assert ec.tables[0].headers == ["A"]

    def test_with_warnings(self):
        ec = ExtractedContent(
            source_file_hash="xyz",
            file_type=FileType.WORD,
            text_content="doc",
            extraction_warnings=["Advertencia 1"],
        )
        assert "Advertencia 1" in ec.extraction_warnings


class TestAnalysisResult:
    def test_creation(self):
        r = AnalysisResult(
            session_id="sess-001",
            analysis_text="# Resumen\nTexto del análisis.",
            output_files={"word": Path("/tmp/informe.docx")},
        )
        assert r.session_id == "sess-001"
        assert "Resumen" in r.analysis_text
        assert "word" in r.output_files

    def test_warnings_default_empty(self):
        r = AnalysisResult(
            session_id="sess-002",
            analysis_text="texto",
            output_files={},
        )
        assert r.warnings == []

    def test_with_multiple_outputs(self):
        r = AnalysisResult(
            session_id="sess-003",
            analysis_text="análisis",
            output_files={
                "word": Path("/tmp/informe.docx"),
                "pptx": Path("/tmp/pres.pptx"),
                "excel": Path("/tmp/datos.xlsx"),
            },
        )
        assert len(r.output_files) == 3
