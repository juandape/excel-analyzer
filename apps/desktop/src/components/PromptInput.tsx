/** Campo de texto para el prompt del usuario con ejemplos clickeables. */

const EXAMPLES = [
  {
    label: '📋 Resumen ejecutivo',
    prompt:
      'Analiza este documento y genera un resumen ejecutivo con los KPIs más importantes, tendencias principales y 3 recomendaciones estratégicas accionables.',
  },
  {
    label: '📈 Análisis de ventas',
    prompt:
      'Analiza el desempeño de ventas: identifica los productos con mejor y peor desempeño, calcula crecimientos vs período anterior y señala anomalías.',
  },
  {
    label: '🎯 Presentación directivos',
    prompt:
      'Prepara el contenido para una presentación de 10 slides para el equipo directivo. Enfócate en resultados, comparativos y próximos pasos.',
  },
  {
    label: '🔍 Hallazgos y oportunidades',
    prompt:
      'Identifica los 5 hallazgos más importantes, separando lo positivo de lo que requiere atención, e incluye oportunidades de mejora con datos.',
  },
];

const MAX_CHARS = 2000;

interface Props {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function PromptInput({ value, onChange, disabled = false }: Props) {
  return (
    <div>
      <label
        style={{
          display: 'block',
          fontSize: 13,
          fontWeight: 600,
          color: '#4A3728',
          marginBottom: 10,
        }}
      >
        ¿Qué quieres analizar?
      </label>

      {/* Chips de ejemplos */}
      <div
        style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}
      >
        {EXAMPLES.map((ex) => (
          <button
            key={ex.label}
            onClick={() => !disabled && onChange(ex.prompt)}
            disabled={disabled}
            style={{
              fontSize: 12,
              padding: '5px 12px',
              borderRadius: 20,
              cursor: disabled ? 'not-allowed' : 'pointer',
              background: value === ex.prompt ? '#EDD9C8' : '#F5EDE3',
              border:
                value === ex.prompt
                  ? '1.5px solid #8B6145'
                  : '1.5px solid #E8DDD5',
              color: value === ex.prompt ? '#5C4033' : '#7A6055',
              fontWeight: 500,
              transition: 'all 0.15s',
            }}
          >
            {ex.label}
          </button>
        ))}
      </div>

      <textarea
        value={value}
        onChange={(e) =>
          !disabled && onChange(e.target.value.slice(0, MAX_CHARS))
        }
        disabled={disabled}
        placeholder='Ej: "Analiza el desempeño de ventas del Q1 y genera una presentación con los 5 insights más importantes..."'
        rows={4}
        style={{
          width: '100%',
          boxSizing: 'border-box',
          border: '2px solid #E8DDD5',
          borderRadius: 12,
          padding: '12px 14px',
          fontSize: 13,
          lineHeight: 1.6,
          resize: 'vertical',
          outline: 'none',
          color: '#2D1F14',
          background: '#FFFFFF',
          fontFamily: 'inherit',
          transition: 'border-color 0.15s',
        }}
        onFocus={(e) => (e.target.style.borderColor = '#8B6145')}
        onBlur={(e) => (e.target.style.borderColor = '#E8DDD5')}
      />
      <p
        style={{
          fontSize: 11,
          color: '#C4A899',
          textAlign: 'right',
          marginTop: 4,
        }}
      >
        {value.length} / {MAX_CHARS}
      </p>
    </div>
  );
}
