import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/** Página Analysis — progreso en tiempo real del análisis. */
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
const STAGE_LABELS = {
    extracting: 'Extrayendo contenido del archivo',
    analyzing: 'Analizando con inteligencia artificial',
    generating: 'Generando archivos',
    done: '¡Análisis completado!',
    error: 'Ocurrió un error',
};
export function Analysis() {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [currentPct, setCurrentPct] = useState(0);
    useEffect(() => {
        if (!sessionId)
            return;
        const unsubscribe = window.electron.onProgress((event) => {
            setEvents((prev) => {
                const existing = prev.find((e) => e.stage === event.stage);
                if (existing)
                    return prev;
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
    return (_jsx("div", { className: 'min-h-screen bg-slate-50 flex items-center justify-center p-6', children: _jsxs("div", { className: 'bg-white rounded-2xl shadow-sm border border-slate-200 p-8 w-full max-w-md', children: [_jsx("h2", { className: 'text-xl font-semibold text-slate-800 mb-6', children: hasError ? '⚠ Algo salió mal' : 'Analizando tu archivo...' }), _jsx("div", { className: 'space-y-3 mb-6', children: ['extracting', 'analyzing', 'generating', 'done'].map((stage) => {
                        const event = events.find((e) => e.stage === stage);
                        const isCurrent = events[events.length - 1]?.stage === stage ||
                            (stage === 'extracting' && events.length === 0);
                        return (_jsxs("div", { className: 'flex items-center gap-3', children: [_jsx("div", { className: 'w-5 flex-shrink-0', children: event ? (_jsx("span", { className: 'text-green-500', children: "\u2713" })) : isCurrent ? (_jsx("span", { className: 'animate-spin inline-block', children: "\u27F3" })) : (_jsx("span", { className: 'text-slate-300', children: "\u25CB" })) }), _jsx("span", { className: `text-sm ${event ? 'text-slate-700' : 'text-slate-400'}`, children: event?.message ?? STAGE_LABELS[stage] })] }, stage));
                    }) }), !hasError && (_jsx("div", { className: 'w-full bg-slate-100 rounded-full h-2 mb-4', children: _jsx("div", { className: 'bg-accent h-2 rounded-full transition-all duration-500', style: { width: `${currentPct}%` } }) })), events.flatMap((e) => e.warnings ?? []).length > 0 && (_jsxs("div", { className: 'bg-amber-50 border border-amber-200 rounded-lg p-3 mt-4', children: [_jsx("p", { className: 'text-xs font-medium text-amber-700 mb-1', children: "Notas de extracci\u00F3n:" }), events
                            .flatMap((e) => e.warnings ?? [])
                            .map((w, i) => (_jsxs("p", { className: 'text-xs text-amber-600', children: ["\u26A0 ", w] }, i)))] })), hasError && (_jsxs("div", { className: 'bg-red-50 border border-red-200 rounded-lg p-3 mt-4', children: [_jsx("p", { className: 'text-sm text-red-700', children: errorEvent?.message }), _jsx("button", { onClick: () => navigate('/home'), className: 'mt-3 text-sm text-red-600 font-medium hover:underline', children: "\u2190 Volver e intentar de nuevo" })] }))] }) }));
}
