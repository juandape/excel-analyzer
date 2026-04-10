import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/** Página Results — muestra el análisis y permite descargar los reportes. */
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
export function Results() {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const [result, setResult] = useState(null);
    const [downloading, setDownloading] = useState(null);
    useEffect(() => {
        if (!sessionId)
            return;
        window.electron.getResult(sessionId).then(setResult);
    }, [sessionId]);
    async function handleDownload(fileType) {
        if (!sessionId)
            return;
        setDownloading(fileType);
        await window.electron.saveFile({ sessionId, fileType });
        setDownloading(null);
    }
    if (!result) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center", children: _jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-primary" }) }));
    }
    const hasWord = result.outputFiles.some((f) => f.type === 'word');
    const hasPptx = result.outputFiles.some((f) => f.type === 'pptx');
    return (_jsxs("div", { className: "min-h-screen bg-slate-50 flex flex-col", children: [_jsx("header", { className: "bg-white border-b border-slate-200 px-6 py-4", children: _jsx("p", { className: "text-sm text-green-600 font-medium", children: "\u2705 An\u00E1lisis completado" }) }), _jsxs("main", { className: "flex-1 max-w-3xl mx-auto w-full px-6 py-8 space-y-6", children: [_jsxs("div", { className: "bg-white rounded-2xl border border-slate-200 p-6", children: [_jsx("h2", { className: "text-lg font-semibold text-slate-800 mb-4", children: "Resultado del an\u00E1lisis" }), _jsx("div", { className: "prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap", children: result.analysisText })] }), result.warnings.length > 0 && (_jsxs("div", { className: "bg-amber-50 border border-amber-200 rounded-xl p-4", children: [_jsx("p", { className: "text-xs font-medium text-amber-700 mb-1", children: "Notas del procesamiento:" }), result.warnings.map((w, i) => (_jsxs("p", { className: "text-xs text-amber-600", children: ["\u26A0 ", w] }, i)))] })), (hasWord || hasPptx) && (_jsxs("div", { className: "bg-white rounded-2xl border border-slate-200 p-6", children: [_jsx("h3", { className: "text-sm font-semibold text-slate-700 mb-4", children: "Descargar archivos" }), _jsxs("div", { className: "flex gap-3 flex-wrap", children: [hasWord && (_jsxs("button", { onClick: () => handleDownload('word'), disabled: downloading === 'word', className: "flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl px-5 py-3 text-sm font-medium hover:bg-blue-100 disabled:opacity-50 transition-colors", children: ["\uD83D\uDCC4 ", downloading === 'word' ? 'Guardando...' : 'Informe Word'] })), hasPptx && (_jsxs("button", { onClick: () => handleDownload('pptx'), disabled: downloading === 'pptx', className: "flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-700 rounded-xl px-5 py-3 text-sm font-medium hover:bg-orange-100 disabled:opacity-50 transition-colors", children: ["\uD83D\uDCCA ", downloading === 'pptx' ? 'Guardando...' : 'PowerPoint'] }))] })] })), _jsx("button", { onClick: () => navigate('/home'), className: "text-sm text-slate-500 hover:text-slate-700 transition-colors", children: "\u2190 Nuevo an\u00E1lisis" })] })] }));
}
