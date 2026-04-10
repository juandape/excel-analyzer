"use strict";
const electron = require("electron");
const api = {
  selectFiles: () => electron.ipcRenderer.invoke("dialog:select-files"),
  analyzeFiles: (request) => electron.ipcRenderer.invoke("analysis:start", request),
  onProgress: (callback) => {
    const handler = (_, event) => callback(event);
    electron.ipcRenderer.on("analysis:progress", handler);
    return () => electron.ipcRenderer.removeListener("analysis:progress", handler);
  },
  subscribeProgress: (sessionId) => electron.ipcRenderer.invoke("analysis:subscribe", sessionId),
  getBackendPort: () => electron.ipcRenderer.invoke("backend:port"),
  getStatus: (sessionId) => electron.ipcRenderer.invoke("analysis:status", sessionId),
  getResult: (sessionId) => electron.ipcRenderer.invoke("analysis:result", sessionId),
  saveFile: (request) => electron.ipcRenderer.invoke("export:save", request),
  saveConfig: (config) => electron.ipcRenderer.invoke("config:save", config),
  getConfig: () => electron.ipcRenderer.invoke("config:get"),
  testConnection: () => electron.ipcRenderer.invoke("config:test")
};
electron.contextBridge.exposeInMainWorld("electron", api);
//# sourceMappingURL=preload.js.map
