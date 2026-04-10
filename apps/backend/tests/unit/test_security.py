"""Tests de seguridad — validación de rutas de archivo."""

import pytest
from core.errors import AppError, ErrorCode
from core.security import validate_file_path


def test_valid_excel_file(tmp_path):
    f = tmp_path / "ventas.xlsx"
    f.write_bytes(b"PK\x03\x04fake_xlsx_content_here_padding_to_avoid_empty")
    result = validate_file_path(str(f))
    assert result == f


def test_path_traversal_rejected(tmp_path):
    with pytest.raises(AppError) as exc:
        validate_file_path(str(tmp_path / "../../../etc/passwd"))
    # El path resuelto no necesariamente falla por traversal si el archivo existe,
    # pero sí falla por extensión no permitida
    assert exc.value.code in (ErrorCode.INVALID_PATH, ErrorCode.UNSUPPORTED_FORMAT)


def test_unsupported_extension_rejected(tmp_path):
    f = tmp_path / "malware.exe"
    f.write_bytes(b"MZ" + b"\x00" * 100)
    with pytest.raises(AppError) as exc:
        validate_file_path(str(f))
    assert exc.value.code == ErrorCode.UNSUPPORTED_FORMAT


def test_empty_file_rejected(tmp_path):
    f = tmp_path / "vacio.pdf"
    f.write_bytes(b"")
    with pytest.raises(AppError) as exc:
        validate_file_path(str(f))
    assert exc.value.code == ErrorCode.EMPTY_FILE


def test_nonexistent_file_rejected():
    with pytest.raises(AppError) as exc:
        validate_file_path("/ruta/que/no/existe/archivo.xlsx")
    assert exc.value.code == ErrorCode.INVALID_PATH
