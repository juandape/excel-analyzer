#!/usr/bin/env bash
# Script de desarrollo local — levanta backend Python + Electron en modo dev
set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/apps/backend"
DESKTOP_DIR="$ROOT_DIR/apps/desktop"
DEV_PORT=8765

echo "─────────────────────────────────────────"
echo "  Excel Analyzer — Entorno de desarrollo"
echo "─────────────────────────────────────────"

# 1. Verificar dependencias
if ! command -v python3 &>/dev/null; then
  echo "❌ Python 3 no encontrado. Instálalo desde python.org"
  exit 1
fi
if ! command -v node &>/dev/null; then
  echo "❌ Node.js no encontrado. Instálalo desde nodejs.org"
  exit 1
fi

# 2. Crear virtualenv si no existe
if [ ! -d "$BACKEND_DIR/.venv" ]; then
  echo "📦 Creando entorno virtual Python..."
  python3 -m venv "$BACKEND_DIR/.venv"
fi

# 3. Instalar dependencias Python
echo "📦 Verificando dependencias Python..."
"$BACKEND_DIR/.venv/bin/pip" install -q -r "$BACKEND_DIR/requirements.txt"

# 4. Instalar dependencias Node
echo "📦 Verificando dependencias Node..."
cd "$ROOT_DIR" && npm install --silent

# 5. Levantar backend en background con puerto fijo
echo ""
echo "🐍 Iniciando backend Python (puerto $DEV_PORT)..."
BACKEND_PORT=$DEV_PORT \
BACKEND_HOST=127.0.0.1 \
DEV_MODE=true \
  "$BACKEND_DIR/.venv/bin/python" -m uvicorn main:app \
    --host 127.0.0.1 \
    --port "$DEV_PORT" \
    --reload \
    --app-dir "$BACKEND_DIR" &
BACKEND_PID=$!

# Cleanup al salir (Ctrl+C)
trap "kill $BACKEND_PID 2>/dev/null; echo ''; echo '👋 Backend detenido'" EXIT INT TERM

# Esperar a que el backend esté listo
echo "⏳ Esperando al backend..."
for i in {1..30}; do
  if curl -sf "http://127.0.0.1:$DEV_PORT/health" > /dev/null 2>&1; then
    echo "✅ Backend listo en http://127.0.0.1:$DEV_PORT"
    break
  fi
  if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo "❌ El backend se cerró inesperadamente. Revisa el log de arriba."
    exit 1
  fi
  sleep 0.5
done

# 6. Levantar Electron en modo dev (apunta al backend fijo)
echo ""
echo "⚡ Iniciando Electron + React (Vite HMR activo)..."
cd "$DESKTOP_DIR"
# VITE_BACKEND_PORT se usa para que el renderer sepa el puerto en dev
VITE_BACKEND_PORT=$DEV_PORT npm run dev
