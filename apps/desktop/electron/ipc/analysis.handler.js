import { ipcMain, BrowserWindow } from 'electron';
import { request as httpRequest } from 'http';
// Obtiene la ventana principal en el momento de enviar (evita capturar null en el registro)
function getMainWindow() {
    return BrowserWindow.getAllWindows()[0] ?? null;
}
export function registerAnalysisHandlers(backendPort) {
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
        if (!res.ok) {
            const err = await res
                .json()
                .catch(() => ({ detail: 'Error desconocido' }));
            throw new Error(err.detail ?? 'Error al iniciar el análisis');
        }
        const data = await res.json();
        const sessionId = data.session_id;
        return { sessionId };
    });
    // Handler separado: el renderer llama esto DESPUÉS de registrar onProgress
    // Esto evita la race condition donde los eventos llegan antes de que el listener esté listo
    ipcMain.handle('analysis:subscribe', (_, sessionId) => {
        function consumeSSE() {
            const sseReq = httpRequest({
                host: '127.0.0.1',
                port: backendPort,
                path: `/analysis/progress/${sessionId}`,
            }, (sseRes) => {
                let buffer = '';
                sseRes.on('data', (chunk) => {
                    buffer += chunk.toString();
                    const parts = buffer.split(/\n\n/);
                    buffer = parts.pop() ?? '';
                    for (const part of parts) {
                        const dataLine = part
                            .split('\n')
                            .find((l) => l.startsWith('data:'));
                        if (!dataLine)
                            continue;
                        try {
                            const parsed = JSON.parse(dataLine.slice(5).trim());
                            getMainWindow()?.webContents.send('analysis:progress', parsed);
                            if (parsed.stage === 'done' || parsed.stage === 'error') {
                                sseReq.destroy();
                            }
                        }
                        catch {
                            // línea malformada, ignorar
                        }
                    }
                });
                sseRes.on('error', () => sseReq.destroy());
            });
            sseReq.on('error', () => {
                /* conexión cerrada */
            });
            sseReq.end();
        }
        consumeSSE();
    });
    ipcMain.handle('analysis:result', async (_, sessionId) => {
        const res = await fetch(`http://127.0.0.1:${backendPort}/analysis/result/${sessionId}`);
        const data = await res.json();
        // El backend devuelve snake_case; convertir a camelCase para el frontend
        return {
            sessionId: data.session_id,
            analysisText: data.analysis_text,
            outputFiles: (data.output_files ?? []).map((f) => ({
                type: f.type,
                fileName: f.file_name,
                sessionId: f.session_id,
            })),
            warnings: data.warnings ?? [],
        };
    });
}
