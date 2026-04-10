import { ipcMain } from 'electron'
import keytar from 'keytar'
import type { AppConfig } from '@excel-analyzer/shared-types'

const SERVICE = 'excel-analyzer'

export function registerConfigHandlers(backendPort: number): void {
  ipcMain.handle('config:save', async (_, config: Omit<AppConfig, 'configuredAt'>) => {
    await keytar.setPassword(SERVICE, 'ai_provider', config.aiProvider)
    if (config.apiKey) {
      await keytar.setPassword(SERVICE, 'api_key', config.apiKey)
    }
    if (config.ollamaBaseUrl) {
      await keytar.setPassword(SERVICE, 'ollama_url', config.ollamaBaseUrl)
    }

    // Sincronizar con el backend
    await fetch(`http://127.0.0.1:${backendPort}/config/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ai_provider: config.aiProvider,
        api_key: config.apiKey,
        ollama_url: config.ollamaBaseUrl,
      }),
    })
  })

  ipcMain.handle('config:get', async (): Promise<AppConfig | null> => {
    const provider = await keytar.getPassword(SERVICE, 'ai_provider')
    if (!provider) return null
    return {
      aiProvider: provider as AppConfig['aiProvider'],
      configuredAt: new Date().toISOString(),
    }
  })

  ipcMain.handle('config:test', async () => {
    try {
      const res = await fetch(`http://127.0.0.1:${backendPort}/config/test`)
      const data = await res.json()
      return data
    } catch {
      return { ok: false, error: 'No se pudo conectar con el motor de IA.' }
    }
  })
}
