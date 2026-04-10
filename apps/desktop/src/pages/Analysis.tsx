/** Página Analysis — progreso via polling IPC (simple y confiable). */
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const STAGE_ORDER = ['extracting', 'analyzing', 'generating', 'done'];
const STAGE_LABELS: Record<string, string> = {
  extracting: 'Extrayendo contenido del archivo',
  analyzing: 'Analizando con inteligencia artificial',
  generating: 'Generando archivos',
  done: '¡Análisis completado!',
};

export function Analysis() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [stage, setStage] = useState('extracting');
  const [pct, setPct] = useState(5);
  const [message, setMessage] = useState('Iniciando...');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!sessionId) {
      console.error('[Analysis] sessionId no disponible');
      return;
    }
    let stopped = false;

    async function poll() {
      console.log('[Analysis] Iniciando polling para sesión:', sessionId);
      while (!stopped) {
        try {
          const status = await window.electron.getStatus(sessionId!);
          setStage(status.stage);
          setPct(status.percentage);
          setMessage(status.message);

          if (status.error) {
            setErrorMsg(status.message);
            return;
          }
          if (status.done) {
            setTimeout(() => navigate(`/results/${sessionId}`), 800);
            return;
          }
        } catch (err) {
          console.warn('[polling] Error al obtener estado:', err);
        }
        await new Promise((r) => setTimeout(r, 1000));
      }
    }

    poll();
    return () => {
      stopped = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const hasError = !!errorMsg;
  const stageIndex = STAGE_ORDER.indexOf(stage);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#FAF7F2',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: 20,
          border: '1.5px solid #E8DDD5',
          padding: '36px 32px',
          width: '100%',
          maxWidth: 440,
        }}
      >
        {/* Título */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 28,
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              fontSize: 20,
              background: hasError
                ? '#FEE2E2'
                : 'linear-gradient(135deg, #8B6145, #5C4033)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {hasError ? '⚠' : '📊'}
          </div>
          <div>
            <p
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: '#2D1F14',
                margin: 0,
              }}
            >
              {hasError ? 'Algo salió mal' : 'Procesando tu archivo'}
            </p>
            <p
              style={{
                fontSize: 12,
                color: '#9A7D6B',
                margin: 0,
                marginTop: 2,
              }}
            >
              {hasError
                ? 'Revisa el error y vuelve a intentarlo'
                : 'Esto tarda menos de un minuto'}
            </p>
          </div>
        </div>

        {/* Barra de progreso */}
        {!hasError && (
          <div
            style={{
              width: '100%',
              height: 6,
              borderRadius: 10,
              background: '#F5EDE3',
              marginBottom: 28,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                borderRadius: 10,
                background: 'linear-gradient(90deg, #C4956A, #8B6145)',
                width: `${pct}%`,
                transition: 'width 0.8s ease',
              }}
            />
          </div>
        )}

        {/* Lista de etapas */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            marginBottom: 20,
          }}
        >
          {STAGE_ORDER.map((s, i) => {
            const isDone = i < stageIndex || (s === stage && stage === 'done');
            const isCurrent = s === stage && stage !== 'done';
            return (
              <div
                key={s}
                style={{ display: 'flex', alignItems: 'center', gap: 12 }}
              >
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 700,
                    background: isDone
                      ? 'linear-gradient(135deg, #8B6145, #5C4033)'
                      : isCurrent
                        ? '#FDF6F0'
                        : '#F5EDE3',
                    border: isCurrent
                      ? '2px solid #C4956A'
                      : '2px solid transparent',
                    color: isDone ? '#FFFFFF' : '#9A7D6B',
                  }}
                >
                  {isDone ? '✓' : isCurrent ? '·' : '○'}
                </div>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: isDone || isCurrent ? 600 : 400,
                    color: isDone
                      ? '#2D1F14'
                      : isCurrent
                        ? '#5C4033'
                        : '#C4A899',
                  }}
                >
                  {isCurrent ? message : STAGE_LABELS[s]}
                </span>
              </div>
            );
          })}
        </div>

        {/* Error */}
        {hasError && (
          <div
            style={{
              background: '#FEF2F2',
              border: '1px solid #FECACA',
              borderRadius: 10,
              padding: '12px 14px',
            }}
          >
            <p style={{ fontSize: 13, color: '#B91C1C', marginBottom: 10 }}>
              {errorMsg}
            </p>
            <button
              onClick={() => navigate('/home')}
              style={{
                fontSize: 12,
                color: '#8B6145',
                fontWeight: 600,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              ← Volver e intentar de nuevo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
