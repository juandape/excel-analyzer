/** Campo de texto para el prompt del usuario con ejemplos clickeables. */

const EXAMPLES = [
  { label: 'Resumen ejecutivo', prompt: 'Analiza este documento y genera un resumen ejecutivo con los KPIs más importantes, tendencias principales y 3 recomendaciones estratégicas accionables.' },
  { label: 'Análisis de ventas', prompt: 'Analiza el desempeño de ventas: identifica los productos con mejor y peor desempeño, calcula crecimientos vs período anterior y señala anomalías.' },
  { label: 'Presentación para directivos', prompt: 'Prepara el contenido para una presentación de 10 slides para el equipo directivo. Enfócate en resultados, comparativos y próximos pasos.' },
  { label: 'Hallazgos y oportunidades', prompt: 'Identifica los 5 hallazgos más importantes, separando lo positivo de lo que requiere atención, e incluye oportunidades de mejora con datos.' },
]

const MAX_CHARS = 2000

interface Props {
  value: string
  onChange: (value: string) => void
}

export function PromptInput({ value, onChange }: Props) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">
        ¿Qué quieres analizar?
      </label>

      {/* Chips de ejemplos */}
      <div className="flex flex-wrap gap-2 mb-2">
        {EXAMPLES.map((ex) => (
          <button
            key={ex.label}
            onClick={() => onChange(ex.prompt)}
            className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full px-3 py-1 transition-colors"
          >
            {ex.label}
          </button>
        ))}
      </div>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, MAX_CHARS))}
        placeholder='Ej: "Analiza el desempeño de ventas del Q1 y genera una presentación con los 5 insights más importantes para el equipo directivo"'
        rows={4}
        className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
      />

      <p className="text-xs text-slate-400 text-right mt-1">
        {value.length} / {MAX_CHARS}
      </p>
    </div>
  )
}
