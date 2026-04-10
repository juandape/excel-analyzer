import { ipcMain, app } from 'electron';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import type { AppConfig } from '@excel-analyzer/shared-types';

// Almacenamiento simple en JSON dentro de userData (sin módulos nativos)
function getConfigPath(): string {
  const dir = app.getPath('userData');
  mkdirSync(dir, { recursive: true });
  return join(dir, 'config.json');
}

function readConfig(): AppConfig | null {
  try {
    const path = getConfigPath();
    if (!existsSync(path)) return null;
    const raw = readFileSync(path, 'utf-8');
    return JSON.parse(raw) as AppConfig;
  } catch {
    return null;
  }
}

function writeConfig(config: AppConfig): void {
  writeFileSync(getConfigPath(), JSON.stringify(config, null, 2), 'utf-8');
}

export function registerConfigHandlers(backendPort: number): void {
  ipcMain.handle(
    'config:save',
    async (_, config: Omit<AppConfig, 'configuredAt'>) => {
      const full: AppConfig = {
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
      } catch {
        // Backend puede no estar listo aún en el primer guardado
      }
    },
  );

  ipcMain.handle('config:get', (): AppConfig | null => {
    return readConfig();
  });

  ipcMain.handle('config:test', async () => {
    try {
      const res = await fetch(`http://127.0.0.1:${backendPort}/config/test`);
      const data = await res.json();
      return data;
    } catch {
      return { ok: false, error: 'No se pudo conectar con el motor de IA.' };
    }
  });
}
