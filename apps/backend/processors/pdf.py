"""Procesador de archivos PDF — nativo y escaneado."""
import hashlib
import logging
from pathlib import Path

import fitz  # PyMuPDF
import pdfplumber

from core.errors import AppError, ErrorCode
from core.models import ExtractedContent, FileType, TableData
from core.session import Session

logger = logging.getLogger(__name__)

CHARS_PER_PAGE_THRESHOLD = 100   # Por debajo → PDF escaneado
MAX_PAGES = 50


def process_pdf(file_path: Path, session: Session) -> ExtractedContent:
    try:
        pdf_type = _classify_pdf(file_path)
        if pdf_type == "scanned":
            return _process_scanned(file_path, session)
        else:
            return _process_native(file_path, session)
    except AppError:
        raise
    except Exception as e:
        logger.error("Error procesando PDF: %s", type(e).__name__)
        raise AppError(ErrorCode.CORRUPT_FILE, str(e))


def _classify_pdf(file_path: Path) -> str:
    """Determina si el PDF es nativo (texto seleccionable) o escaneado."""
    try:
        doc = fitz.open(str(file_path))
        total_chars = sum(len(page.get_text().strip()) for page in doc)
        pages = max(len(doc), 1)
        doc.close()
        return "native" if total_chars / pages >= CHARS_PER_PAGE_THRESHOLD else "scanned"
    except Exception:
        return "native"


def _process_native(file_path: Path, session: Session) -> ExtractedContent:
    warnings: list[str] = []
    tables: list[TableData] = []
    text_parts: list[str] = []

    doc = fitz.open(str(file_path))
    total_pages = len(doc)
    pages_to_process = min(total_pages, MAX_PAGES)

    if total_pages > MAX_PAGES:
        warnings.append(f"PDF de {total_pages} páginas — se procesaron las primeras {MAX_PAGES}.")

    for i in range(pages_to_process):
        page_text = doc[i].get_text().strip()
        if page_text:
            text_parts.append(f"[Página {i+1}]\n{page_text}")
    doc.close()

    # Extraer tablas con pdfplumber (mejor para tablas financieras)
    try:
        with pdfplumber.open(str(file_path)) as pdf:
            for i, page in enumerate(pdf.pages[:pages_to_process]):
                for t in page.extract_tables() or []:
                    if not t or len(t) < 2:
                        continue
                    headers = [str(c) if c else f"Col_{j}" for j, c in enumerate(t[0])]
                    rows = [[str(c) if c else "" for c in row] for row in t[1:] if row]
                    tables.append(TableData(headers=headers, rows=rows))
    except Exception as e:
        logger.debug("pdfplumber no pudo extraer tablas: %s", type(e).__name__)

    return ExtractedContent(
        source_file_hash=hashlib.sha256(file_path.name.encode()).hexdigest()[:16],
        file_type=FileType.PDF,
        text_content="\n\n".join(text_parts) or "PDF sin texto extraíble.",
        tables=tables,
        metadata={"paginas": total_pages, "tipo": "nativo"},
        extraction_warnings=warnings,
    )


def _process_scanned(file_path: Path, session: Session) -> ExtractedContent:
    """PDF escaneado — renderiza páginas y aplica OCR."""
    warnings: list[str] = []
    text_parts: list[str] = []

    try:
        import pytesseract
        from PIL import Image
        import io
    except ImportError:
        warnings.append("Tesseract no disponible — no se pudo aplicar OCR al PDF escaneado.")
        return ExtractedContent(
            source_file_hash=hashlib.sha256(file_path.name.encode()).hexdigest()[:16],
            file_type=FileType.PDF,
            text_content="",
            metadata={"tipo": "escaneado", "ocr": False},
            extraction_warnings=warnings,
        )

    doc = fitz.open(str(file_path))
    total_pages = len(doc)
    pages_to_process = min(total_pages, MAX_PAGES)
    warnings.append(f"PDF escaneado detectado — se aplicó OCR a {pages_to_process} páginas.")

    if total_pages > MAX_PAGES:
        warnings.append(f"PDF de {total_pages} páginas — se procesaron las primeras {MAX_PAGES}.")

    for i in range(pages_to_process):
        page = doc[i]
        mat = fitz.Matrix(2.0, 2.0)   # 2x zoom = ~150 DPI eficiente
        pix = page.get_pixmap(matrix=mat, colorspace=fitz.csGRAY)
        img = Image.frombytes("L", [pix.width, pix.height], pix.samples)

        text = pytesseract.image_to_string(img, lang="spa+eng", config="--oem 3 --psm 3")
        if text.strip():
            text_parts.append(f"[Página {i+1}]\n{text.strip()}")

    doc.close()

    return ExtractedContent(
        source_file_hash=hashlib.sha256(file_path.name.encode()).hexdigest()[:16],
        file_type=FileType.PDF,
        text_content="\n\n".join(text_parts) or "OCR no produjo texto legible.",
        metadata={"paginas": total_pages, "tipo": "escaneado", "ocr": True},
        extraction_warnings=warnings,
    )
