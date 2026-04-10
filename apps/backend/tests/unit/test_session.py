"""Tests del ciclo de vida de sesiones."""

import pytest
from core.errors import AppError, ErrorCode
from core.session import cleanup_session, create_session, get_session


def test_create_session_creates_temp_dir():
    session = create_session()
    assert session.temp_dir.exists()
    assert session.temp_dir.is_dir()
    cleanup_session(session.session_id)


def test_cleanup_removes_temp_dir():
    session = create_session()
    temp_dir = session.temp_dir
    cleanup_session(session.session_id)
    assert not temp_dir.exists()


def test_get_nonexistent_session_raises():
    with pytest.raises(AppError) as exc:
        get_session("sesion-que-no-existe")
    assert exc.value.code == ErrorCode.SESSION_NOT_FOUND


def test_temp_dir_has_restricted_permissions():
    session = create_session()
    mode = oct(session.temp_dir.stat().st_mode)[-3:]
    assert mode == "700", f"Permisos esperados 700, got {mode}"
    cleanup_session(session.session_id)
