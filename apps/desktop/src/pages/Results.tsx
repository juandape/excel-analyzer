/** Página Results — muestra el análisis y permite descargar los reportes. */
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { AnalysisResult } from '@excel-analyzer/shared-types'

export function Results() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [downloading, setDownloading] = useState<string | null>(null)

  useEffect(() => {
    if (!sessionId) return
    window.electron.getResult(sessionId).then(setResult)
  }, [sessionId])

  async function handleDownload(fileType: 'word' | 'pptx') {
    if (!sessionId) return
    setDownloading(fileType)
    await window.electron.saveFile({ sessionId, fileType })
    setDownloading(null)
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  const hasWord = result.outputFiles.some((f) => f.type === 'word')
  const hasPptx = result.outputFiles.some((f) => f.type === 'pptx')

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <p className="text-sm text-green-600 font-medium">✅ Análisis completado</p>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-8 space-y-6">
        {/* Texto del análisis */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Resultado del análisis</h2>
          <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap">
            {result.analysisText}
          </div>
        </div>

        {/* Advertencias */}
        {result.warnings.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-xs font-medium text-amber-700 mb-1">Notas del procesamiento:</p>
            {result.warnings.map((w, i) => (
              <p key={i} className="text-xs text-amber-600">⚠ {w}</p>
            ))}
          </div>
        )}

        {/* Descargas */}
        {(hasWord || hasPptx) && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">Descargar archivos</h3>
            <div className="flex gap-3 flex-wrap">
              {hasWord && (
                <button
                  onClick={() => handleDownload('word')}
                  disabled={downloading === 'word'}
                  className="flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl px-5 py-3 text-sm font-medium hover:bg-blue-100 disabled:opacity-50 transition-colors"
                >
                  📄 {downloading === 'word' ? 'Guardando...' : 'Informe Word'}
                </button>
              )}
              {hasPptx && (
                <button
                  onClick={() => handleDownload('pptx')}
                  disabled={downloading === 'pptx'}
                  className="flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-700 rounded-xl px-5 py-3 text-sm font-medium hover:bg-orange-100 disabled:opacity-50 transition-colors"
                >
                  📊 {downloading === 'pptx' ? 'Guardando...' : 'PowerPoint'}
                </button>
              )}
            </div>
          </div>
        )}

        <button
          onClick={() => navigate('/home')}
          className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          ← Nuevo análisis
        </button>
      </main>
    </div>
  )
}
