"""Tests para el sistema de errores tipados."""
import pytest

from core.errors import AppError, ErrorCode, USER_MESSAGES


class TestErrorCode:
    def test_all_codes_are_strings(self):
        for code in ErrorCode:
            assert isinstance(code.value, str)

    def test_all_codes_have_user_message(self):
        for code in ErrorCode:
            assert code in USER_MESSAGES
            assert len(USER_MESSAGES[code]) > 0

    def test_codes_are_uppercase(self):
        for code in ErrorCode:
            assert code.value == code.value.upper()


class TestAppError:
    def test_creates_with_code(self):
        err = AppError(ErrorCode.INVALID_PATH)
        assert err.code == ErrorCode.INVALID_PATH

    def test_user_message_is_set(self):
        err = AppError(ErrorCode.EMPTY_FILE)
        assert err.user_message == USER_MESSAGES[ErrorCode.EMPTY_FILE]
        assert len(err.user_message) > 0

    def test_detail_is_optional(self):
        err = AppError(ErrorCode.INTERNAL_ERROR)
        assert err.detail is None

    def test_detail_stored(self):
        err = AppError(ErrorCode.AI_UNAVAILABLE, detail="connection refused")
        assert err.detail == "connection refused"

    def test_is_exception(self):
        err = AppError(ErrorCode.SESSION_NOT_FOUND)
        assert isinstance(err, Exception)

    def test_can_be_raised_and_caught(self):
        with pytest.raises(AppError) as exc_info:
            raise AppError(ErrorCode.CORRUPT_FILE, detail="bad header")
        assert exc_info.value.code == ErrorCode.CORRUPT_FILE
        assert exc_info.value.detail == "bad header"

    def test_str_returns_user_message(self):
        err = AppError(ErrorCode.ENCRYPTED_FILE)
        assert str(err) == USER_MESSAGES[ErrorCode.ENCRYPTED_FILE]

    def test_unknown_code_fallback(self):
        """Todos los códigos tienen mensaje definido — ninguno usa fallback."""
        for code in ErrorCode:
            err = AppError(code)
            assert err.user_message is not None
