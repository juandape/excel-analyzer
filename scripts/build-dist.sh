#!/usr/bin/env bash
# Build completo: backend → PyInstaller → Electron → instalador
# Resultado: una app autoejecutable, sin instalar Python ni Node en el equipo destino.
set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PLATFORM=${1:-"mac"}   # mac | win | linux

echo "════════════════════════════════════════════"
echo "  Excel Analyzer — Build de producción ($PLATFORM)"
echo "════════════════════════════════════════════"

# 1. Empaquetar backend Python
echo ""
echo "[ 1/3 ] Empaquetando backend Python..."
bash "$ROOT_DIR/scripts/build-backend.sh"

# 2. Compilar frontend TypeScript + Vite
echo ""
echo "[ 2/3 ] Compilando frontend Electron + React..."
cd "$ROOT_DIR/apps/desktop"

# Asegurar que 7zip-bin arm64 es accesible para electron-builder
if [ -f "$ROOT_DIR/node_modules/7zip-bin/mac/arm64/7za" ]; then
  mkdir -p "$ROOT_DIR/apps/desktop/node_modules/7zip-bin/mac/arm64"
  ln -sf "$ROOT_DIR/node_modules/7zip-bin/mac/arm64/7za" \
         "$ROOT_DIR/apps/desktop/node_modules/7zip-bin/mac/arm64/7za" 2>/dev/null || true
fi
npm run build

# 3. Empaquetar instalador con electron-builder
echo ""
echo "[ 3/3 ] Generando instalador ($PLATFORM)..."
case "$PLATFORM" in
  mac)   npx electron-builder --mac ;;
  win)   npx electron-builder --win ;;
  linux) npx electron-builder --linux ;;
  *)     npx electron-builder ;;
esac

echo ""
echo "════════════════════════════════════════════"
echo "  ✅ Listo — instalador en: apps/desktop/dist/"
ls -lh "$ROOT_DIR/apps/desktop/dist/"*.dmg 2>/dev/null \
  || ls -lh "$ROOT_DIR/apps/desktop/dist/"*.exe 2>/dev/null \
  || ls -lh "$ROOT_DIR/apps/desktop/dist/"*.AppImage 2>/dev/null \
  || true
echo "════════════════════════════════════════════"
