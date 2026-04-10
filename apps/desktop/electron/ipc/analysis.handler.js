import { ipcMain } from 'electron';
export function registerAnalysisHandlers(backendPort, mainWindow) {
    ipcMain.handle('analysis:start', async (_, request) => {
        const res = await fetch(`http://127.0.0.1:${backendPort}/analysis/start`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                file_paths: request.filePaths,
                user_prompt: request.userPrompt,
                output_format: request.outputFormat,
            }),
        });
        const data = await res.json();
        const sessionId = data.session_id;
        // Suscribir al SSE del backend y reenviar eventos al renderer via IPC
        const eventSource = new EventSource(`http://127.0.0.1:${backendPort}/analysis/progress/${sessionId}`);
        eventSource.onmessage = (event) => {
            const parsed = JSON.parse(event.data);
            mainWindow?.webContents.send('analysis:progress', parsed);
            if (parsed.stage === 'done' || parsed.stage === 'error') {
                eventSource.close();
            }
        };
        eventSource.onerror = () => {
            eventSource.close();
        };
        return { sessionId };
    });
    ipcMain.handle('analysis:result', async (_, sessionId) => {
        const res = await fetch(`http://127.0.0.1:${backendPort}/analysis/result/${sessionId}`);
        return res.json();
    });
}
