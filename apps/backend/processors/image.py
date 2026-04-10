"""Procesador de imágenes (.png, .jpg, .jpeg, .webp)."""
import hashlib
import logging
from pathlib import Path

import pytesseract
from core.errors import AppError, ErrorCode
from core.models import ExtractedContent, FileType, ImageData
from core.session import Session
from PIL import Image, ImageFilter

logger = logging.getLogger(__name__)

MIN_DIMENSION = 200
MAX_DIMENSION = 4000


def process_image(file_path: Path, session: Session) -> ExtractedContent:
    try:
        img = Image.open(file_path)
    except Exception:
        raise AppError(ErrorCode.CORRUPT_FILE)

    warnings: list[str] = []

    # Convertir a RGB si es necesario (evita problemas con RGBA, P, CMYK)
    if img.mode not in ("RGB", "L"):
        img = img.convert("RGB")

    # Escalar si es demasiado pequeña
    w, h = img.size
    if w < MIN_DIMENSION or h < MIN_DIMENSION:
        scale = MIN_DIMENSION / min(w, h)
        img = img.resize((int(w * scale), int(h * scale)), Image.LANCZOS)
        warnings.append("Imagen pequeña escalada para mejorar OCR.")

    # Escalar si es demasiado grande (reduce memoria y tiempo)
    if w > MAX_DIMENSION or h > MAX_DIMENSION:
        scale = MAX_DIMENSION / max(w, h)
        img = img.resize((int(w * scale), int(h * scale)), Image.LANCZOS)

    # Preprocesar: sharpening leve
    img_processed = img.filter(ImageFilter.SHARPEN)

    # OCR
    try:
        ocr_text: str = pytesseract.image_to_string(
            img_processed,
            lang="spa+eng",
            config="--oem 3 --psm 3",
        ).strip()
    except Exception as e:
        logger.warning("OCR falló: %s", e)
        ocr_text = ""
        warnings.append("OCR no disponible — se enviará la imagen directamente a la IA.")

    if not ocr_text:
        warnings.append("OCR no extrajo texto. Se analizará la imagen visualmente.")

    # Serializar imagen en directorio de sesión para análisis multimodal
    out_path = session.temp_dir / f"{hashlib.sha256(file_path.name.encode()).hexdigest()[:8]}_processed.png"
    img.save(str(out_path), format="PNG")

    image_data = ImageData(
        temp_path=out_path,
        source="original",
    )

    return ExtractedContent(
        source_file_hash=hashlib.sha256(file_path.name.encode()).hexdigest()[:16],
        file_type=FileType.IMAGE,
        text_content=ocr_text or "Imagen sin texto extraído por OCR.",
        tables=[],
        images=[image_data],
        metadata={"ancho": img.size[0], "alto": img.size[1]},
        extraction_warnings=warnings,
    )

