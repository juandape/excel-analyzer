"""Tests para el dispatcher de procesadores."""
import pytest

from core.errors import AppError, ErrorCode
from core.session import cleanup_session, create_session
from processors.dispatcher import EXTENSION_MAP, dispatch


class TestExtensionMap:
    def test_excel_extensions(self):
        from core.models import FileType
        assert EXTENSION_MAP[".xlsx"] == FileType.EXCEL
        assert EXTENSION_MAP[".xls"] == FileType.EXCEL
        assert EXTENSION_MAP[".csv"] == FileType.EXCEL

    def test_word_extension(self):
        from core.models import FileType
        assert EXTENSION_MAP[".docx"] == FileType.WORD

    def test_pdf_extension(self):
        from core.models import FileType
        assert EXTENSION_MAP[".pdf"] == FileType.PDF

    def test_image_extensions(self):
        from core.models import FileType
        for ext in (".png", ".jpg", ".jpeg", ".webp"):
            assert EXTENSION_MAP[ext] == FileType.IMAGE


class TestDispatch:
    def test_nonexistent_file_raises(self):
        session = create_session()
        try:
            with pytest.raises(AppError) as exc:
                dispatch("/no/existe/archivo.xlsx", session)
            assert exc.value.code == ErrorCode.INVALID_PATH
        finally:
            cleanup_session(session.session_id)

    def test_unsupported_extension_raises(self, tmp_path):
        session = create_session()
        try:
            bad_file = tmp_path / "script.sh"
            bad_file.write_text("#!/bin/bash\necho hello")
            with pytest.raises(AppError) as exc:
                dispatch(str(bad_file), session)
            assert exc.value.code in (ErrorCode.UNSUPPORTED_FORMAT, ErrorCode.INVALID_PATH)
        finally:
            cleanup_session(session.session_id)

    def test_empty_file_raises(self, tmp_path):
        session = create_session()
        try:
            empty = tmp_path / "vacio.csv"
            empty.write_bytes(b"")
            with pytest.raises(AppError) as exc:
                dispatch(str(empty), session)
            assert exc.value.code == ErrorCode.EMPTY_FILE
        finally:
            cleanup_session(session.session_id)

    def test_csv_dispatches_successfully(self, tmp_path):
        session = create_session()
        try:
            csv_file = tmp_path / "datos.csv"
            csv_file.write_text("nombre,ventas\nProducto A,1000\nProducto B,2000")
            result = dispatch(str(csv_file), session)
            assert result is not None
            assert result.text_content
        finally:
            cleanup_session(session.session_id)
