/** Página Setup — configuración de IA (solo se muestra si no hay config guardada). */
import { useState } from 'react'
import type { AIProvider } from '@excel-analyzer/shared-types'

interface Props {
  onConfigSaved: () => void
}

const PROVIDERS: { value: AIProvider; label: string; description: string }[] = [
  { value: 'openai', label: 'OpenAI', description: 'Recomendado para uso personal' },
  { value: 'anthropic', label: 'Anthropic', description: 'Claude — excelente para documentos largos' },
  { value: 'ollama', label: 'Local (Ollama)', description: 'Sin internet requerido' },
]

export function Setup({ onConfigSaved }: Props) {
  const [provider, setProvider] = useState<AIProvider>('openai')
  const [apiKey, setApiKey] = useState('')
  const [ollamaUrl, setOllamaUrl] = useState('http://localhost:11434')
  const [showKey, setShowKey] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ ok: boolean; error?: string } | null>(null)
  const [saving, setSaving] = useState(false)

  const needsApiKey = provider !== 'ollama'

  async function handleTest() {
    setTesting(true)
    setTestResult(null)
    await window.electron.saveConfig({
      aiProvider: provider,
      apiKey: needsApiKey ? apiKey : undefined,
      ollamaBaseUrl: provider === 'ollama' ? ollamaUrl : undefined,
    })
    const result = await window.electron.testConnection()
    setTestResult(result)
    setTesting(false)
  }

  async function handleSave() {
    setSaving(true)
    await window.electron.saveConfig({
      aiProvider: provider,
      apiKey: needsApiKey ? apiKey : undefined,
      ollamaBaseUrl: provider === 'ollama' ? ollamaUrl : undefined,
    })
    setSaving(false)
    onConfigSaved()
  }

  const canSave = testResult?.ok === true

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-primary mb-1">Configura tu IA</h1>
        <p className="text-slate-500 text-sm mb-6">Solo necesitas hacer esto una vez</p>

        {/* Selector de proveedor */}
        <div className="space-y-3 mb-6">
          {PROVIDERS.map((p) => (
            <label
              key={p.value}
              className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                provider === p.value
                  ? 'border-accent bg-sky-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <input
                type="radio"
                name="provider"
                value={p.value}
                checked={provider === p.value}
                onChange={() => { setProvider(p.value); setTestResult(null) }}
                className="mt-0.5 accent-accent"
              />
              <div>
                <p className="font-medium text-slate-800">{p.label}</p>
                <p className="text-xs text-slate-500">{p.description}</p>
              </div>
            </label>
          ))}
        </div>

        {/* Campo API Key */}
        {needsApiKey && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => { setApiKey(e.target.value); setTestResult(null) }}
                placeholder="sk-..."
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-2.5 text-slate-400 text-xs"
              >
                {showKey ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Guardada de forma segura en tu dispositivo. Nunca sale de tu computadora.
            </p>
          </div>
        )}

        {/* Ollama URL */}
        {provider === 'ollama' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              URL de Ollama
            </label>
            <input
              type="text"
              value={ollamaUrl}
              onChange={(e) => setOllamaUrl(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
        )}

        {/* Resultado del test */}
        {testResult && (
          <div
            className={`rounded-lg px-4 py-3 text-sm mb-4 ${
              testResult.ok
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {testResult.ok ? '✓ Conexión exitosa' : `✗ ${testResult.error}`}
          </div>
        )}

        {/* Botones */}
        <div className="flex gap-3">
          <button
            onClick={handleTest}
            disabled={testing || (needsApiKey && !apiKey.trim())}
            className="flex-1 border border-slate-300 rounded-lg py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {testing ? 'Verificando...' : 'Verificar conexión'}
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave || saving}
            className="flex-1 bg-primary text-white rounded-lg py-2 text-sm font-medium hover:bg-primary-light disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Guardando...' : 'Guardar y continuar'}
          </button>
        </div>
      </div>
    </div>
  )
}
