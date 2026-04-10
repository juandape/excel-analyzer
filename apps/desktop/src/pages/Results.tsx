/** Página Results — pestañas separadas por tipo de output. */
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { AnalysisResult } from '@excel-analyzer/shared-types';

type FileType = 'word' | 'pptx' | 'excel';

const TAB_CONFIG: Record<
  FileType,
  { icon: string; label: string; accent: string; border: string; bg: string }
> = {
  word: {
    icon: '📄',
    label: 'Informe Word',
    accent: '#5C4033',
    border: '#D4C4B8',
    bg: '#FDF6F0',
  },
  pptx: {
    icon: '📊',
    label: 'PowerPoint',
    accent: '#4A3728',
    border: '#D4C4B8',
    bg: '#F5EDE3',
  },
  excel: {
    icon: '📈',
    label: 'Excel',
    accent: '#2D4A28',
    border: '#C4D4B8',
    bg: '#F0F5E3',
  },
};

export function Results() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState<FileType | 'summary'>('summary');
  const [downloading, setDownloading] = useState<string | null>(null);
  const [savedToast, setSavedToast] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) return;
    window.electron.getResult(sessionId).then((r) => {
      setResult(r);
      // Activar primera pestaña disponible si hay múltiples outputs
      const files = r?.outputFiles ?? [];
      if (files.length > 0) {
        setActiveTab(files[0].type as FileType);
      }
    });
  }, [sessionId]);

  async function handleDownload(fileType: FileType) {
    if (!sessionId) return;
    setDownloading(fileType);
    const response = await window.electron.saveFile({ sessionId, fileType });
    setDownloading(null);
    if (response?.savedPath) {
      setSavedToast(fileType);
      setTimeout(() => setSavedToast(null), 3000);
    }
  }

  if (!result) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#FAF7F2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            border: '3px solid #E8DDD5',
            borderTopColor: '#8B6145',
            animation: 'spin 0.8s linear infinite',
          }}
        />
      </div>
    );
  }

  const outputFiles = result.outputFiles ?? [];
  const availableTabs = outputFiles
    .map((f) => f.type as FileType)
    .filter((t) => t in TAB_CONFIG);
  const hasTabs = availableTabs.length > 0;

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#FAF7F2',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <header
        style={{
          background: 'linear-gradient(135deg, #5C4033, #8B6145)',
          padding: '14px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: 'rgba(255,255,255,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 14,
          }}
        >
          ✅
        </div>
        <span style={{ color: '#F5EDE3', fontWeight: 700, fontSize: 15 }}>
          Análisis completado
        </span>
      </header>

      <main
        style={{
          flex: 1,
          maxWidth: 760,
          width: '100%',
          margin: '0 auto',
          padding: '28px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}
      >
        {/* Advertencias */}
        {result.warnings.length > 0 && (
          <section
            style={{
              background: '#FFFBEB',
              border: '1px solid #FDE68A',
              borderRadius: 12,
              padding: '12px 16px',
            }}
          >
            <p
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: '#92400E',
                marginBottom: 6,
              }}
            >
              Notas del procesamiento:
            </p>
            {result.warnings.map((w, i) => (
              <p
                key={i}
                style={{ fontSize: 11, color: '#B45309', margin: '3px 0' }}
              >
                ⚠ {w}
              </p>
            ))}
          </section>
        )}

        {/* Pestañas de outputs */}
        {hasTabs && (
          <section
            style={{
              background: '#FFFFFF',
              borderRadius: 16,
              border: '1.5px solid #E8DDD5',
              overflow: 'hidden',
            }}
          >
            {/* Barra de pestañas */}
            <div
              style={{
                display: 'flex',
                borderBottom: '1.5px solid #E8DDD5',
                background: '#FAF7F2',
              }}
            >
              {/* Pestaña resumen solo si hay un único output */}
              {availableTabs.length === 1 && (
                <button
                  onClick={() => setActiveTab('summary')}
                  style={{
                    padding: '12px 20px',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: 'none',
                    borderBottom:
                      activeTab === 'summary'
                        ? '2.5px solid #8B6145'
                        : '2.5px solid transparent',
                    background:
                      activeTab === 'summary' ? '#FFFFFF' : 'transparent',
                    color: activeTab === 'summary' ? '#5C4033' : '#9A7D6B',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  📋 Resumen
                </button>
              )}
              {availableTabs.map((tab) => {
                const cfg = TAB_CONFIG[tab];
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      padding: '12px 20px',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: 'none',
                      borderBottom: isActive
                        ? '2.5px solid #8B6145'
                        : '2.5px solid transparent',
                      background: isActive ? '#FFFFFF' : 'transparent',
                      color: isActive ? '#5C4033' : '#9A7D6B',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      transition: 'color 0.15s',
                    }}
                  >
                    {cfg.icon} {cfg.label}
                    {savedToast === tab && (
                      <span
                        style={{
                          fontSize: 10,
                          background: '#D1FAE5',
                          color: '#065F46',
                          borderRadius: 6,
                          padding: '2px 6px',
                          marginLeft: 4,
                        }}
                      >
                        ✓ Guardado
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Contenido de pestaña resumen */}
            {activeTab === 'summary' && availableTabs.length === 1 && (
              <div
                style={{
                  padding: '20px 22px',
                  fontSize: 14,
                  lineHeight: 1.75,
                  color: '#4A3728',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {result.analysisText}
              </div>
            )}

            {/* Contenido por output */}
            {availableTabs.map((tab) => {
              if (activeTab !== tab) return null;
              const cfg = TAB_CONFIG[tab];
              return (
                <div key={tab}>
                  {/* Vista previa del contenido */}
                  <div
                    style={{
                      padding: '20px 22px',
                      fontSize: 14,
                      lineHeight: 1.75,
                      color: '#4A3728',
                      whiteSpace: 'pre-wrap',
                      maxHeight: 380,
                      overflowY: 'auto',
                      borderBottom: '1.5px solid #E8DDD5',
                      background: '#FDFAF7',
                    }}
                  >
                    {tab === 'excel'
                      ? '📊 El archivo Excel contiene tablas de datos estructuradas y gráficos generados a partir del análisis. Descárgalo para verlo en Excel.'
                      : result.analysisText}
                  </div>

                  {/* Barra de descarga */}
                  <div
                    style={{
                      padding: '16px 22px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: cfg.bg,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        color: cfg.accent,
                        fontWeight: 500,
                      }}
                    >
                      Listo para guardar en tu computadora
                    </span>
                    <button
                      onClick={() => handleDownload(tab)}
                      disabled={!!downloading}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '10px 20px',
                        borderRadius: 10,
                        cursor: downloading ? 'not-allowed' : 'pointer',
                        opacity: downloading && downloading !== tab ? 0.5 : 1,
                        border: `1.5px solid ${cfg.border}`,
                        background:
                          downloading === tab ? cfg.border : '#FFFFFF',
                        color: cfg.accent,
                        fontSize: 13,
                        fontWeight: 700,
                        transition: 'background 0.15s',
                      }}
                    >
                      {cfg.icon}
                      {downloading === tab
                        ? 'Guardando...'
                        : `Guardar ${cfg.label}`}
                    </button>
                  </div>
                </div>
              );
            })}
          </section>
        )}

        {/* Fallback si no hay archivos (solo texto) */}
        {!hasTabs && (
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
              <span style={{ fontSize: 16 }}>📋</span>
              <h2
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: '#2D1F14',
                  margin: 0,
                }}
              >
                Resultado del análisis
              </h2>
            </div>
            <div
              style={{
                padding: '20px 22px',
                fontSize: 14,
                lineHeight: 1.75,
                color: '#4A3728',
                whiteSpace: 'pre-wrap',
              }}
            >
              {result.analysisText}
            </div>
          </section>
        )}

        <button
          onClick={() => navigate('/home')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 13,
            color: '#9A7D6B',
            fontWeight: 600,
            padding: '4px 0',
            alignSelf: 'flex-start',
          }}
        >
          ← Nuevo análisis
        </button>
      </main>
    </div>
  );
}
