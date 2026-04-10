/**
 * Preload script — único puente entre la UI (React) y el sistema.
 * Expone SOLO los métodos necesarios via contextBridge.
 * NUNCA exponer nodeIntegration, require, fs, child_process, etc.
 */
import { contextBridge, ipcRenderer } from 'electron';
import type {
  AnalyzeRequest,
  AnalyzeResponse,
  AnalysisResult,
  AppConfig,
  ElectronAPI,
  ExportRequest,
  ExportResponse,
  ProgressEvent,
} from '@excel-analyzer/shared-types';

const api: ElectronAPI = {
  selectFiles: () => ipcRenderer.invoke('dialog:select-files'),

  selectPptxTemplate: (): Promise<string | null> =>
    ipcRenderer.invoke('dialog:select-pptx-template'),

  analyzeFiles: (request: AnalyzeRequest): Promise<AnalyzeResponse> =>
    ipcRenderer.invoke('analysis:start', request),

  onProgress: (callback: (event: ProgressEvent) => void) => {
    const handler = (_: Electron.IpcRendererEvent, event: ProgressEvent) =>
      callback(event);
    ipcRenderer.on('analysis:progress', handler);
    return () => ipcRenderer.removeListener('analysis:progress', handler);
  },

  subscribeProgress: (sessionId: string): Promise<void> =>
    ipcRenderer.invoke('analysis:subscribe', sessionId),

  getBackendPort: (): Promise<number> => ipcRenderer.invoke('backend:port'),

  getStatus: (sessionId: string) =>
    ipcRenderer.invoke('analysis:status', sessionId),

  getResult: (sessionId: string): Promise<AnalysisResult> =>
    ipcRenderer.invoke('analysis:result', sessionId),

  saveFile: (request: ExportRequest): Promise<ExportResponse> =>
    ipcRenderer.invoke('export:save', request),

  saveConfig: (config: Omit<AppConfig, 'configuredAt'>): Promise<void> =>
    ipcRenderer.invoke('config:save', config),

  getConfig: (): Promise<AppConfig | null> => ipcRenderer.invoke('config:get'),

  testConnection: (): Promise<{ ok: boolean; error?: string }> =>
    ipcRenderer.invoke('config:test'),
};

contextBridge.exposeInMainWorld('electron', api);
