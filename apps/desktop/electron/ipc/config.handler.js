import { ipcMain, app } from 'electron';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
// Almacenamiento simple en JSON dentro de userData (sin módulos nativos)
function getConfigPath() {
    const dir = app.getPath('userData');
    mkdirSync(dir, { recursive: true });
    return join(dir, 'config.json');
}
function readConfig() {
    try {
        const path = getConfigPath();
        if (!existsSync(path))
            return null;
        const raw = readFileSync(path, 'utf-8');
        return JSON.parse(raw);
    }
    catch {
        return null;
    }
}
function writeConfig(config) {
    writeFileSync(getConfigPath(), JSON.stringify(config, null, 2), 'utf-8');
}
export function registerConfigHandlers(backendPort) {
    ipcMain.handle('config:save', async (_, config) => {
        const full = {
            ...config,
            configuredAt: new Date().toISOString(),
        };
        writeConfig(full);
        // Sincronizar con el backend
        try {
            await fetch(`http://127.0.0.1:${backendPort}/config/save`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ai_provider: config.aiProvider,
                    api_key: config.apiKey,
                    ollama_url: config.ollamaBaseUrl,
                }),
            });
        }
        catch {
            // Backend puede no estar listo aún en el primer guardado
        }
    });
    ipcMain.handle('config:get', () => {
        return readConfig();
    });
    ipcMain.handle('config:test', async () => {
        try {
            const res = await fetch(`http://127.0.0.1:${backendPort}/config/test`);
            const data = await res.json();
            return data;
        }
        catch {
            return { ok: false, error: 'No se pudo conectar con el motor de IA.' };
        }
    });
}
