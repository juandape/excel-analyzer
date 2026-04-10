/** Página Analysis — progreso en tiempo real del análisis. */
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { ProgressEvent } from '@excel-analyzer/shared-types';

const STAGE_LABELS: Record<string, string> = {
  extracting: 'Extrayendo contenido del archivo',
  analyzing: 'Analizando con inteligencia artificial',
  generating: 'Generando archivos',
  done: '¡Análisis completado!',
  error: 'Ocurrió un error',
};

export function Analysis() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [events, setEvents] = useState<ProgressEvent[]>([]);
  const [currentPct, setCurrentPct] = useState(0);

  useEffect(() => {
    if (!sessionId) return;

    const unsubscribe = window.electron.onProgress((event) => {
      setEvents((prev) => {
        const existing = prev.find((e) => e.stage === event.stage);
        if (existing) return prev;
        return [...prev, event];
      });
      setCurrentPct(event.percentage);

      if (event.stage === 'done') {
        setTimeout(() => navigate(`/results/${sessionId}`), 800);
      }
      if (event.stage === 'error') {
        // Se queda en la pantalla mostrando el error
      }
    });

    return unsubscribe;
  }, [sessionId, navigate]);

  const hasError = events.some((e) => e.stage === 'error');
  const errorEvent = events.find((e) => e.stage === 'error');

  return (
    <div className='min-h-screen bg-slate-50 flex items-center justify-center p-6'>
      <div className='bg-white rounded-2xl shadow-sm border border-slate-200 p-8 w-full max-w-md'>
        <h2 className='text-xl font-semibold text-slate-800 mb-6'>
          {hasError ? '⚠ Algo salió mal' : 'Analizando tu archivo...'}
        </h2>

        {/* Lista de etapas */}
        <div className='space-y-3 mb-6'>
          {['extracting', 'analyzing', 'generating', 'done'].map((stage) => {
            const event = events.find((e) => e.stage === stage);
            const isCurrent =
              events[events.length - 1]?.stage === stage ||
              (stage === 'extracting' && events.length === 0);

            return (
              <div key={stage} className='flex items-center gap-3'>
                <div className='w-5 flex-shrink-0'>
                  {event ? (
                    <span className='text-green-500'>✓</span>
                  ) : isCurrent ? (
                    <span className='animate-spin inline-block'>⟳</span>
                  ) : (
                    <span className='text-slate-300'>○</span>
                  )}
                </div>
                <span
                  className={`text-sm ${event ? 'text-slate-700' : 'text-slate-400'}`}
                >
                  {event?.message ?? STAGE_LABELS[stage]}
                </span>
              </div>
            );
          })}
        </div>

        {/* Barra de progreso */}
        {!hasError && (
          <div className='w-full bg-slate-100 rounded-full h-2 mb-4'>
            <div
              className='bg-accent h-2 rounded-full transition-all duration-500'
              style={{ width: `${currentPct}%` }}
            />
          </div>
        )}

        {/* Warnings */}
        {events.flatMap((e) => e.warnings ?? []).length > 0 && (
          <div className='bg-amber-50 border border-amber-200 rounded-lg p-3 mt-4'>
            <p className='text-xs font-medium text-amber-700 mb-1'>
              Notas de extracción:
            </p>
            {events
              .flatMap((e) => e.warnings ?? [])
              .map((w, i) => (
                <p key={i} className='text-xs text-amber-600'>
                  ⚠ {w}
                </p>
              ))}
          </div>
        )}

        {/* Error */}
        {hasError && (
          <div className='bg-red-50 border border-red-200 rounded-lg p-3 mt-4'>
            <p className='text-sm text-red-700'>{errorEvent?.message}</p>
            <button
              onClick={() => navigate('/home')}
              className='mt-3 text-sm text-red-600 font-medium hover:underline'
            >
              ← Volver e intentar de nuevo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
