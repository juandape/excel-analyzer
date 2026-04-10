/**
 * Preload script — único puente entre la UI (React) y el sistema.
 * Expone SOLO los métodos necesarios via contextBridge.
 * NUNCA exponer nodeIntegration, require, fs, child_process, etc.
 */
import { contextBridge, ipcRenderer } from 'electron';
const api = {
    selectFiles: () => ipcRenderer.invoke('dialog:select-files'),
    analyzeFiles: (request) => ipcRenderer.invoke('analysis:start', request),
    onProgress: (callback) => {
        const handler = (_, event) => callback(event);
        ipcRenderer.on('analysis:progress', handler);
        return () => ipcRenderer.removeListener('analysis:progress', handler);
    },
    subscribeProgress: (sessionId) => ipcRenderer.invoke('analysis:subscribe', sessionId),
    getBackendPort: () => ipcRenderer.invoke('backend:port'),
    getStatus: (sessionId) => ipcRenderer.invoke('analysis:status', sessionId),
    getResult: (sessionId) => ipcRenderer.invoke('analysis:result', sessionId),
    saveFile: (request) => ipcRenderer.invoke('export:save', request),
    saveConfig: (config) => ipcRenderer.invoke('config:save', config),
    getConfig: () => ipcRenderer.invoke('config:get'),
    testConnection: () => ipcRenderer.invoke('config:test'),
};
contextBridge.exposeInMainWorld('electron', api);
