/** Página Home — carga de archivos y prompt. */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileDropZone } from '@/components/FileDropZone';
import { PromptInput } from '@/components/PromptInput';
import type { OutputFormat } from '@excel-analyzer/shared-types';

function StepBadge({ n, done }: { n: number; done: boolean }) {
  return (
    <div
      style={{
        width: 24,
        height: 24,
        borderRadius: '50%',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 12,
        fontWeight: 700,
        background: done
          ? 'linear-gradient(135deg, #8B6145, #5C4033)'
          : '#F0E8E0',
        color: done ? '#FFF' : '#9A7D6B',
      }}
    >
      {done ? '✓' : n}
    </div>
  );
}

const FORMAT_OPTIONS: {
  value: OutputFormat;
  label: string;
  icon: string;
  desc: string;
}[] = [
  {
    value: 'word',
    label: 'Informe Word',
    icon: '📄',
    desc: 'Documento ejecutivo',
  },
  {
    value: 'pptx',
    label: 'PowerPoint',
    icon: '📊',
    desc: 'Presentación lista',
  },
  {
    value: 'excel',
    label: 'Excel',
    icon: '📈',
    desc: 'Tablas y gráficos',
  },
  { value: 'both', label: 'Word + PPT', icon: '✨', desc: 'Recomendado' },
  { value: 'all', label: 'Todo', icon: '🌟', desc: 'Word + PPT + Excel' },
];

export function Home() {
  const navigate = useNavigate();
  const [files, setFiles] = useState<string[]>([]);
  const [prompt, setPrompt] = useState('');
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('both');
  const [pptxTemplate, setPptxTemplate] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const step1Done = files.length > 0;
  const step2Done = prompt.trim().length > 0;
  const canAnalyze = step1Done && step2Done && !loading;

  async function handleAnalyze() {
    if (!canAnalyze) return;
    setLoading(true);
    setError(null);
    try {
      const { sessionId } = await window.electron.analyzeFiles({
        filePaths: files,
        userPrompt: prompt,
        outputFormat,
        pptxTemplatePath: pptxTemplate ?? undefined,
      });
      navigate(`/analysis/${sessionId}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al iniciar el análisis',
      );
      setLoading(false);
    }
  }

  // Mensaje de ayuda cuando el botón está deshabilitado
  function getHint() {
    if (!step1Done) return 'Primero carga al menos un archivo';
    if (!step2Done) return 'Escribe o elige una pregunta para continuar';
    return '';
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#FAF7F2',
      }}
    >
      {/* Header */}
      <header
        style={{
          background: 'linear-gradient(135deg, #5C4033, #8B6145)',
          padding: '14px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }}>📊</span>
          <span style={{ color: '#F5EDE3', fontWeight: 700, fontSize: 16 }}>
            Excel Analyzer
          </span>
        </div>
        <button
          onClick={() => navigate('/setup')}
          style={{
            background: 'rgba(255,255,255,0.12)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 8,
            padding: '5px 12px',
            cursor: 'pointer',
            color: 'rgba(255,255,255,0.8)',
            fontSize: 12,
            fontWeight: 500,
          }}
        >
          ⚙ Configuración
        </button>
      </header>

      {/* Main */}
      <main
        style={{
          flex: 1,
          maxWidth: 680,
          width: '100%',
          margin: '0 auto',
          padding: '32px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}
      >
        {/* Paso 1 — Archivos */}
        <section
          style={{
            background: '#FFFFFF',
            borderRadius: 16,
            border: `1.5px solid ${step1Done ? '#C4956A' : '#E8DDD5'}`,
            padding: 24,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 16,
            }}
          >
            <StepBadge n={1} done={step1Done} />
            <h2
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: '#2D1F14',
                margin: 0,
              }}
            >
              Carga tus archivos
            </h2>
          </div>
          <FileDropZone files={files} onFilesChange={setFiles} />
        </section>

        {/* Paso 2 — Prompt */}
        <section
          style={{
            background: '#FFFFFF',
            borderRadius: 16,
            border: `1.5px solid ${step2Done ? '#C4956A' : '#E8DDD5'}`,
            padding: 24,
            opacity: step1Done ? 1 : 0.5,
            transition: 'opacity 0.2s',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 16,
            }}
          >
            <StepBadge n={2} done={step2Done} />
            <h2
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: '#2D1F14',
                margin: 0,
              }}
            >
              ¿Qué quieres analizar?
            </h2>
          </div>
          <PromptInput
            value={prompt}
            onChange={setPrompt}
            disabled={!step1Done}
          />
        </section>

        {/* Paso 3 — Formato */}
        <section
          style={{
            background: '#FFFFFF',
            borderRadius: 16,
            border: '1.5px solid #E8DDD5',
            padding: 24,
            opacity: step1Done ? 1 : 0.5,
            transition: 'opacity 0.2s',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 16,
            }}
          >
            <StepBadge n={3} done={false} />
            <h2
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: '#2D1F14',
                margin: 0,
              }}
            >
              Formato de salida
            </h2>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            {FORMAT_OPTIONS.map((opt) => {
              const sel = outputFormat === opt.value;
              return (
                <label
                  key={opt.value}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6,
                    padding: '16px 10px',
                    borderRadius: 12,
                    cursor: 'pointer',
                    border: sel ? '2px solid #8B6145' : '2px solid #E8DDD5',
                    background: sel ? '#FDF6F0' : '#FAFAF8',
                    transition: 'all 0.15s',
                  }}
                >
                  <input
                    type='radio'
                    name='output'
                    value={opt.value}
                    checked={sel}
                    onChange={() => setOutputFormat(opt.value)}
                    style={{ display: 'none' }}
                  />
                  <span style={{ fontSize: 24 }}>{opt.icon}</span>
                  <span
                    style={{ fontSize: 13, fontWeight: 600, color: '#2D1F14' }}
                  >
                    {opt.label}
                  </span>
                  <span style={{ fontSize: 11, color: '#9A7D6B' }}>
                    {opt.desc}
                  </span>
                </label>
              );
            })}
          </div>
        </section>

        {/* Plantilla PowerPoint (solo cuando el formato incluye pptx) */}
        {(outputFormat === 'pptx' ||
          outputFormat === 'both' ||
          outputFormat === 'all') && (
          <section
            style={{
              background: '#FFFFFF',
              borderRadius: 16,
              border: '1.5px solid #E8DDD5',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '14px 22px',
                background: 'linear-gradient(135deg, #F5EDE3, #FDF6F0)',
                borderBottom: '1px solid #E8DDD5',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <StepBadge n={3} done={false} />
              <h2
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: '#2D1F14',
                  margin: 0,
                }}
              >
                Plantilla PowerPoint
                <span
                  style={{ fontWeight: 400, color: '#9A7D6B', marginLeft: 6 }}
                >
                  (opcional)
                </span>
              </h2>
            </div>
            <div
              style={{
                padding: '16px 22px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <button
                onClick={async () => {
                  const path = await window.electron.selectPptxTemplate();
                  if (path !== null) setPptxTemplate(path);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '9px 16px',
                  borderRadius: 10,
                  cursor: 'pointer',
                  border: '1.5px solid #D4C4B8',
                  background: '#FDF6F0',
                  color: '#5C4033',
                  fontSize: 13,
                  fontWeight: 600,
                  flexShrink: 0,
                }}
              >
                📎 {pptxTemplate ? 'Cambiar plantilla' : 'Adjuntar plantilla'}
              </button>
              {pptxTemplate ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      color: '#4A3728',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      flex: 1,
                    }}
                    title={pptxTemplate}
                  >
                    {pptxTemplate.split('/').pop()}
                  </span>
                  <button
                    onClick={() => setPptxTemplate(null)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 16,
                      color: '#B8A090',
                      flexShrink: 0,
                      lineHeight: 1,
                    }}
                    title='Quitar plantilla'
                  >
                    ×
                  </button>
                </div>
              ) : (
                <span style={{ fontSize: 12, color: '#9A7D6B' }}>
                  Usa el diseño y colores de tu propia plantilla .pptx
                </span>
              )}
            </div>
          </section>
        )}

        {/* Botón analizar + hint */}
        <div>
          <button
            onClick={handleAnalyze}
            disabled={!canAnalyze}
            style={{
              width: '100%',
              padding: '16px 0',
              borderRadius: 14,
              fontSize: 15,
              fontWeight: 700,
              cursor: canAnalyze ? 'pointer' : 'not-allowed',
              opacity: canAnalyze ? 1 : 0.45,
              border: 'none',
              background: 'linear-gradient(135deg, #8B6145, #5C4033)',
              color: '#FFFFFF',
              letterSpacing: '0.2px',
              transition: 'opacity 0.15s',
            }}
          >
            {loading ? '⏳ Enviando análisis...' : '🔍 Analizar ahora'}
          </button>
          {!canAnalyze && !loading && (
            <p
              style={{
                textAlign: 'center',
                fontSize: 12,
                color: '#B8A090',
                marginTop: 8,
              }}
            >
              {getHint()}
            </p>
          )}
          {error && (
            <div
              style={{
                marginTop: 10,
                padding: '10px 14px',
                borderRadius: 10,
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                fontSize: 13,
                color: '#B91C1C',
              }}
            >
              ⚠ {error}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
