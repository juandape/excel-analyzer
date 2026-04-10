/** Página Home — carga de archivos y prompt. */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileDropZone } from '@/components/FileDropZone'
import { PromptInput } from '@/components/PromptInput'
import type { OutputFormat } from '@excel-analyzer/shared-types'

export function Home() {
  const navigate = useNavigate()
  const [files, setFiles] = useState<string[]>([])
  const [prompt, setPrompt] = useState('')
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('both')
  const [loading, setLoading] = useState(false)

  const canAnalyze = files.length > 0 && prompt.trim().length > 0 && !loading

  async function handleAnalyze() {
    if (!canAnalyze) return
    setLoading(true)
    try {
      const { sessionId } = await window.electron.analyzeFiles({
        filePaths: files,
        userPrompt: prompt,
        outputFormat,
      })
      navigate(`/analysis/${sessionId}`)
    } catch {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-primary">Excel Analyzer</h1>
        <button
          onClick={() => navigate('/setup')}
          className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
        >
          Configuración
        </button>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-8 space-y-6">
        <FileDropZone files={files} onFilesChange={setFiles} />

        {files.length > 0 && (
          <>
            <PromptInput value={prompt} onChange={setPrompt} />

            {/* Output format */}
            <div>
              <p className="text-sm font-medium text-slate-700 mb-2">Quiero generar:</p>
              <div className="flex gap-3">
                {(['word', 'pptx', 'both'] as OutputFormat[]).map((fmt) => (
                  <label key={fmt} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="output"
                      value={fmt}
                      checked={outputFormat === fmt}
                      onChange={() => setOutputFormat(fmt)}
                      className="accent-accent"
                    />
                    <span className="text-sm text-slate-700">
                      {fmt === 'word' ? 'Informe Word' : fmt === 'pptx' ? 'PowerPoint' : 'Ambos'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={!canAnalyze}
              className="w-full bg-primary text-white rounded-xl py-3 font-semibold text-sm hover:bg-primary-light disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Enviando...' : '🔍 Analizar'}
            </button>
          </>
        )}
      </main>
    </div>
  )
}
