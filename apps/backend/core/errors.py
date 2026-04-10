"""Errores tipados de la aplicación. Todo error interno se mapea aquí
antes de llegar al usuario — nunca se exponen stack traces en la UI."""
from enum import Enum


class ErrorCode(str, Enum):
    INVALID_PATH = "INVALID_PATH"
    UNSUPPORTED_FORMAT = "UNSUPPORTED_FORMAT"
    FILE_TOO_LARGE = "FILE_TOO_LARGE"
    EMPTY_FILE = "EMPTY_FILE"
    CORRUPT_FILE = "CORRUPT_FILE"
    ENCRYPTED_FILE = "ENCRYPTED_FILE"
    PROCESSING_TIMEOUT = "PROCESSING_TIMEOUT"
    AI_UNAVAILABLE = "AI_UNAVAILABLE"
    AI_RATE_LIMIT = "AI_RATE_LIMIT"
    AI_CONTEXT_TOO_LARGE = "AI_CONTEXT_TOO_LARGE"
    INVALID_API_KEY = "INVALID_API_KEY"
    SESSION_NOT_FOUND = "SESSION_NOT_FOUND"
    EXPORT_FAILED = "EXPORT_FAILED"
    INTERNAL_ERROR = "INTERNAL_ERROR"


# Mensajes en español para mostrar al usuario final
USER_MESSAGES: dict[ErrorCode, str] = {
    ErrorCode.INVALID_PATH: "La ruta del archivo no es válida.",
    ErrorCode.UNSUPPORTED_FORMAT: "Este tipo de archivo no está soportado. Usa Excel, Word, PDF o imágenes.",
    ErrorCode.FILE_TOO_LARGE: "El archivo supera el límite de 100 MB. Intenta dividirlo en partes más pequeñas.",
    ErrorCode.EMPTY_FILE: "El archivo está vacío.",
    ErrorCode.CORRUPT_FILE: "No pudimos leer este archivo. Puede estar dañado. Ábrelo primero en su programa original para verificarlo.",
    ErrorCode.ENCRYPTED_FILE: "Este archivo está protegido con contraseña. Desbloquéalo primero y vuelve a intentarlo.",
    ErrorCode.PROCESSING_TIMEOUT: "El procesamiento tardó demasiado. Intenta con un archivo más pequeño.",
    ErrorCode.AI_UNAVAILABLE: "No pudimos conectar con la IA. Verifica tu conexión a internet y vuelve a intentarlo.",
    ErrorCode.AI_RATE_LIMIT: "La IA está ocupada en este momento. Espera unos segundos y vuelve a intentarlo.",
    ErrorCode.AI_CONTEXT_TOO_LARGE: "El archivo tiene demasiados datos para analizarlos de una vez. Intenta con una sección más pequeña.",
    ErrorCode.INVALID_API_KEY: "Tu API key parece inválida. Ve a Configuración para actualizarla.",
    ErrorCode.SESSION_NOT_FOUND: "La sesión de análisis expiró. Inicia un nuevo análisis.",
    ErrorCode.EXPORT_FAILED: "No pudimos generar el archivo. Intenta de nuevo.",
    ErrorCode.INTERNAL_ERROR: "Algo salió mal. Intenta de nuevo.",
}


class AppError(Exception):
    def __init__(self, code: ErrorCode, detail: str | None = None):
        self.code = code
        self.user_message = USER_MESSAGES.get(code, USER_MESSAGES[ErrorCode.INTERNAL_ERROR])
        self.detail = detail  # Solo para logs internos, nunca para el usuario
        super().__init__(self.user_message)
