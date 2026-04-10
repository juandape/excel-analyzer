#!/usr/bin/env bash
# Empaqueta el backend Python en un ejecutable autónomo con PyInstaller.
# Output: apps/desktop/resources/bin/excel-analyzer-backend[.exe]
set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/apps/backend"
OUT_DIR="$ROOT_DIR/apps/desktop/resources/bin"

echo "────────────────────────────────────────────"
echo "  Empaquetando backend Python con PyInstaller"
echo "────────────────────────────────────────────"

# Activar virtualenv
if [ ! -d "$BACKEND_DIR/.venv" ]; then
  echo "📦 Creando entorno virtual..."
  python3 -m venv "$BACKEND_DIR/.venv"
fi

PYTHON="$BACKEND_DIR/.venv/bin/python"
PIP="$BACKEND_DIR/.venv/bin/pip"

echo "📦 Instalando dependencias..."
"$PIP" install --quiet -r "$BACKEND_DIR/requirements.txt"

echo "📦 Instalando PyInstaller..."
"$PIP" install --quiet pyinstaller

mkdir -p "$OUT_DIR"

echo "🔨 Compilando ejecutable..."
cd "$BACKEND_DIR"

# --onedir es más rápido de arrancar que --onefile (no necesita extraerse en /tmp)
# El resultado es una carpeta excel-analyzer-backend/ con el binario y sus librerías.
DIST_PARENT="$ROOT_DIR/apps/desktop/resources"

"$BACKEND_DIR/.venv/bin/pyinstaller" \
  --onedir \
  --name excel-analyzer-backend \
  --distpath "$DIST_PARENT" \
  --workpath "$BACKEND_DIR/.pyinstaller-build" \
  --specpath "$BACKEND_DIR/.pyinstaller-build" \
  --noconfirm \
  --paths "$BACKEND_DIR" \
  --collect-all=api \
  --collect-all=core \
  --collect-all=processors \
  --collect-all=generators \
  --collect-all=ai \
  --hidden-import=uvicorn.logging \
  --hidden-import=uvicorn.loops \
  --hidden-import=uvicorn.loops.auto \
  --hidden-import=uvicorn.protocols \
  --hidden-import=uvicorn.protocols.http \
  --hidden-import=uvicorn.protocols.http.auto \
  --hidden-import=uvicorn.protocols.websockets \
  --hidden-import=uvicorn.protocols.websockets.auto \
  --hidden-import=uvicorn.lifespan \
  --hidden-import=uvicorn.lifespan.on \
  --hidden-import=anyio \
  --hidden-import=anyio._backends._asyncio \
  --hidden-import=pydantic_core \
  --hidden-import=openpyxl \
  --hidden-import=xlrd \
  --hidden-import=pdfplumber \
  --hidden-import=fitz \
  --hidden-import=pytesseract \
  --hidden-import=docx \
  --hidden-import=PIL \
  --hidden-import=pptx \
  --hidden-import=keyring.backends \
  --hidden-import=keyring.backends.macOS \
  --hidden-import=keyring.backends.SecretService \
  --hidden-import=keyring.backends.Windows \
  --collect-all=uvicorn \
  --collect-all=fastapi \
  main.py

# El ejecutable queda en: resources/excel-analyzer-backend/excel-analyzer-backend
echo ""
ls -lh "$DIST_PARENT/excel-analyzer-backend/excel-analyzer-backend" 2>/dev/null || \
ls -lh "$DIST_PARENT/excel-analyzer-backend/excel-analyzer-backend.exe" 2>/dev/null || true
echo ""
echo "✅ Backend empaquetado en: $DIST_PARENT/excel-analyzer-backend/"
