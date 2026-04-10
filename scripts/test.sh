#!/usr/bin/env bash
# Ejecuta todos los tests del proyecto
set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/apps/backend"

echo "🧪 Ejecutando tests del backend..."
source "$BACKEND_DIR/.venv/bin/activate"
cd "$BACKEND_DIR"
AI_PROVIDER=mock pytest tests/ -v --cov=. --cov-report=term-missing

echo ""
echo "🧪 Ejecutando tests del frontend..."
cd "$ROOT_DIR/apps/desktop"
npm run test -- --run

echo ""
echo "✅ Todos los tests completados"
