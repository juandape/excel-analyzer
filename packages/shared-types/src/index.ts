// ─── Providers de IA ─────────────────────────────────────────────────────────

export type AIProvider = 'openai' | 'anthropic' | 'ollama';

export interface AppConfig {
  aiProvider: AIProvider;
  apiKey?: string; // No aplica para Ollama
  ollamaBaseUrl?: string; // Default: http://localhost:11434
  configuredAt: string; // ISO timestamp
}

// ─── Tipos de archivo soportados ─────────────────────────────────────────────

export type SupportedFileType = 'excel' | 'word' | 'pdf' | 'image';

export type OutputFormat = 'word' | 'pptx' | 'excel' | 'both' | 'all';

// ─── Request / Response de análisis ──────────────────────────────────────────

export interface AnalyzeRequest {
  filePaths: string[]; // Rutas absolutas validadas por el proceso main
  userPrompt: string; // Máximo 2000 caracteres
  outputFormat: OutputFormat;
  pptxTemplatePath?: string; // Ruta a plantilla .pptx personalizada (opcional)
}

export interface AnalyzeResponse {
  sessionId: string;
}

// ─── Eventos de progreso (SSE → IPC) ─────────────────────────────────────────

export type ProgressStage =
  | 'extracting'
  | 'analyzing'
  | 'generating'
  | 'done'
  | 'error';

export interface ProgressEvent {
  sessionId: string;
  stage: ProgressStage;
  percentage: number; // 0-100
  message: string; // Texto legible para el usuario (en español)
  warnings?: string[]; // Advertencias no críticas de extracción
}

// ─── Resultado del análisis ───────────────────────────────────────────────────

export interface OutputFile {
  type: 'word' | 'pptx' | 'excel';
  fileName: string;
  sessionId: string;
}

export interface AnalysisResult {
  sessionId: string;
  analysisText: string; // Markdown del análisis generado por la IA
  outputFiles: OutputFile[];
  warnings: string[];
  processedAt: string; // ISO timestamp
}

// ─── Request de exportación ───────────────────────────────────────────────────

export interface ExportRequest {
  sessionId: string;
  fileType: 'word' | 'pptx' | 'excel';
}

export interface ExportResponse {
  savedPath: string; // Ruta final elegida por el usuario via diálogo
}

// ─── API del contextBridge (lo que ve React) ──────────────────────────────────

export interface ElectronAPI {
  // Selección de archivos via diálogo nativo del OS
  selectFiles: () => Promise<string[]>;

  // Selección de plantilla PowerPoint (.pptx)
  selectPptxTemplate: () => Promise<string | null>;

  // Análisis — retorna sessionId inmediatamente; progreso via onProgress
  analyzeFiles: (request: AnalyzeRequest) => Promise<AnalyzeResponse>;

  // Suscripción a eventos de progreso
  onProgress: (callback: (event: ProgressEvent) => void) => () => void;

  // Iniciar consumo de SSE (llamar DESPUÉS de onProgress para evitar race condition)
  subscribeProgress: (sessionId: string) => Promise<void>;

  // Puerto del backend (para EventSource directo en renderer)
  getBackendPort: () => Promise<number>;

  // Polling de estado del análisis
  getStatus: (sessionId: string) => Promise<{
    stage: string;
    percentage: number;
    message: string;
    done: boolean;
    error: boolean;
  }>;

  // Obtener resultado una vez que stage === 'done'
  getResult: (sessionId: string) => Promise<AnalysisResult>;

  // Guardar archivo generado en ubicación elegida por el usuario
  saveFile: (request: ExportRequest) => Promise<ExportResponse>;

  // Configuración de IA
  saveConfig: (config: Omit<AppConfig, 'configuredAt'>) => Promise<void>;
  getConfig: () => Promise<AppConfig | null>;

  // Verificar conexión con el proveedor configurado
  testConnection: () => Promise<{ ok: boolean; error?: string }>;
}

// Extiende la interfaz Window para que TypeScript la reconozca en React
declare global {
  interface Window {
    electron: ElectronAPI;
  }
}
