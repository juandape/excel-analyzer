# Excel Analyzer

> Analizador de documentos empresariales con Inteligencia Artificial. Carga archivos Excel, Word, PDF o imágenes, formula una pregunta y obtén informes automáticos en Word, PowerPoint y Excel — sin escribir una sola línea de código.

---

## Descargas

| Plataforma                        | Descarga                                                                                                         |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **macOS** (Apple Silicon / Intel) | **Próximamente** (pendiente)                                                |
| **Windows** (64-bit)              | [⬇ Descargar .exe](https://github.com/juandape/excel-analyzer/releases/latest/download/Excel.Analyzer.Setup.exe) |

> Las versiones normalmente se publican en la sección [Releases](https://github.com/juandape/excel-analyzer/releases). Actualmente el instalador para **Windows** está disponible; el instalador para **macOS** queda pendiente.

---

## ¿Qué hace?

- **Carga múltiples archivos** — Excel (`.xlsx`, `.xls`), CSV, Word (`.docx`), PDF, imágenes (`.png`, `.jpg`, `.webp`)
- **Analiza con IA** — compatible con OpenAI GPT-4o, Anthropic Claude y modelos locales via Ollama
- **Genera informes automáticos** en:
  - 📄 **Word** — documento ejecutivo estructurado
  - 📊 **PowerPoint** — presentación lista para usar (soporta plantilla personalizada)
  - 📈 **Excel** — tablas de datos y gráficos de barras
- **100% local con Ollama** — tus datos no salen de tu equipo si usas un modelo local

---

## Capturas de pantalla

> _(próximamente)_

---

## Proveedores de IA soportados

| Proveedor          | Modelos                            | Requiere API Key |
| ------------------ | ---------------------------------- | ---------------- |
| **OpenAI**         | GPT-4o, GPT-4-turbo, GPT-3.5-turbo | Sí               |
| **Anthropic**      | Claude 3.5 Sonnet, Claude 3 Haiku  | Sí               |
| **Ollama** (local) | llama3, mistral, gemma3, etc.      | No               |

---

## Uso rápido

1. Descarga el instalador para tu plataforma (ver tabla arriba)
2. Abre la app e ingresa a **Configuración** para configurar tu proveedor de IA
3. En la pantalla principal: **carga archivos → escribe tu pregunta → elige el formato → Analizar**

---

## Desarrollo local

### Requisitos

- Node.js ≥ 20
- Python ≥ 3.12
- npm ≥ 10

### Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/juandape/excel-analyzer.git
cd excel-analyzer

# 2. Instalar dependencias Node
npm install

# 3. Crear entorno virtual Python e instalar dependencias
cd apps/backend
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cd ../..

# 4. Configurar variables de entorno
cp .env.example .env
```

### Modo desarrollo

```bash
npm run dev
```

Esto inicia el backend Python (puerto 8765) y la aplicación Electron con hot-reload.

### Build de producción

```bash
# macOS
bash scripts/build-dist.sh mac

# Windows (desde Windows o con cross-compilation)
bash scripts/build-dist.sh win
```

El instalador queda en `apps/desktop/dist/`.

---

## Arquitectura

```
excel-analyzer/
├── apps/
│   ├── desktop/          # Electron + React + TypeScript (UI)
│   │   ├── electron/     # Main process, IPC handlers, preload
│   │   └── src/          # Renderer (React + páginas)
│   └── backend/          # FastAPI + Python (motor de análisis)
│       ├── ai/           # Clientes OpenAI / Anthropic / Ollama
│       ├── generators/   # Generadores Word, PPTX, Excel
│       ├── processors/   # Extractores de contenido por tipo de archivo
│       └── api/          # Rutas REST
└── packages/
    └── shared-types/     # Tipos TypeScript compartidos
```

---

## Stack tecnológico

**Frontend / Desktop**

- [Electron](https://www.electronjs.org/) 32
- [React](https://react.dev/) 18 + [TypeScript](https://www.typescriptlang.org/) 5
- [Vite](https://vitejs.dev/) 5 + vite-plugin-electron

**Backend**

- [FastAPI](https://fastapi.tiangolo.com/) + [Uvicorn](https://www.uvicorn.org/)
- [python-pptx](https://python-pptx.readthedocs.io/) — generación PowerPoint
- [python-docx](https://python-docx.readthedocs.io/) — generación Word
- [openpyxl](https://openpyxl.readthedocs.io/) — generación Excel
- [PyInstaller](https://pyinstaller.org/) — empaquetado del backend en ejecutable

---

## Licencia

[MIT](./LICENSE) © 2026 Juan Peña
