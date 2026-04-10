from core.errors import AppError, ErrorCode
from core.models import ExtractedContent, FileType
from core.security import validate_file_path
from core.session import Session
from processors.excel import process_excel
from processors.image import process_image
from processors.pdf import process_pdf
from processors.word import process_word

EXTENSION_MAP = {
    ".xlsx": FileType.EXCEL,
    ".xls":  FileType.EXCEL,
    ".csv":  FileType.EXCEL,
    ".docx": FileType.WORD,
    ".pdf":  FileType.PDF,
    ".png":  FileType.IMAGE,
    ".jpg":  FileType.IMAGE,
    ".jpeg": FileType.IMAGE,
    ".webp": FileType.IMAGE,
}


def dispatch(raw_path: str, session: Session) -> ExtractedContent:
    """Valida el archivo y delega al procesador correcto según su tipo."""
    file_path = validate_file_path(raw_path)
    file_type = EXTENSION_MAP.get(file_path.suffix.lower())

    if file_type is None:
        raise AppError(ErrorCode.UNSUPPORTED_FORMAT)

    match file_type:
        case FileType.EXCEL:
            return process_excel(file_path, session)
        case FileType.WORD:
            return process_word(file_path, session)
        case FileType.PDF:
            return process_pdf(file_path, session)
        case FileType.IMAGE:
            return process_image(file_path, session)
