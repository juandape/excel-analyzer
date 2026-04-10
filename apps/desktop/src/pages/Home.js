import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/** Página Home — carga de archivos y prompt. */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileDropZone } from '@/components/FileDropZone';
import { PromptInput } from '@/components/PromptInput';
function StepBadge({ n, done }) {
    return (_jsx("div", { style: {
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
        }, children: done ? '✓' : n }));
}
const FORMAT_OPTIONS = [
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
    { value: 'both', label: 'Ambos', icon: '✨', desc: 'Recomendado' },
];
export function Home() {
    const navigate = useNavigate();
    const [files, setFiles] = useState([]);
    const [prompt, setPrompt] = useState('');
    const [outputFormat, setOutputFormat] = useState('both');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const step1Done = files.length > 0;
    const step2Done = prompt.trim().length > 0;
    const canAnalyze = step1Done && step2Done && !loading;
    async function handleAnalyze() {
        if (!canAnalyze)
            return;
        setLoading(true);
        setError(null);
        try {
            const { sessionId } = await window.electron.analyzeFiles({
                filePaths: files,
                userPrompt: prompt,
                outputFormat,
            });
            navigate(`/analysis/${sessionId}`);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Error al iniciar el análisis');
            setLoading(false);
        }
    }
    // Mensaje de ayuda cuando el botón está deshabilitado
    function getHint() {
        if (!step1Done)
            return 'Primero carga al menos un archivo';
        if (!step2Done)
            return 'Escribe o elige una pregunta para continuar';
        return '';
    }
    return (_jsxs("div", { style: {
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            background: '#FAF7F2',
        }, children: [_jsxs("header", { style: {
                    background: 'linear-gradient(135deg, #5C4033, #8B6145)',
                    padding: '14px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: '20px',
                }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 10 }, children: [_jsx("span", { style: { fontSize: 22 }, children: "\uD83D\uDCCA" }), _jsx("span", { style: { color: '#F5EDE3', fontWeight: 700, fontSize: 16 }, children: "Excel Analyzer" })] }), _jsx("button", { onClick: () => navigate('/setup'), style: {
                            background: 'rgba(255,255,255,0.12)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: 8,
                            padding: '5px 12px',
                            cursor: 'pointer',
                            color: 'rgba(255,255,255,0.8)',
                            fontSize: 12,
                            fontWeight: 500,
                        }, children: "\u2699 Configuraci\u00F3n" })] }), _jsxs("main", { style: {
                    flex: 1,
                    maxWidth: 680,
                    width: '100%',
                    margin: '0 auto',
                    padding: '32px 24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 20,
                }, children: [_jsxs("section", { style: {
                            background: '#FFFFFF',
                            borderRadius: 16,
                            border: `1.5px solid ${step1Done ? '#C4956A' : '#E8DDD5'}`,
                            padding: 24,
                        }, children: [_jsxs("div", { style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 10,
                                    marginBottom: 16,
                                }, children: [_jsx(StepBadge, { n: 1, done: step1Done }), _jsx("h2", { style: {
                                            fontSize: 14,
                                            fontWeight: 700,
                                            color: '#2D1F14',
                                            margin: 0,
                                        }, children: "Carga tus archivos" })] }), _jsx(FileDropZone, { files: files, onFilesChange: setFiles })] }), _jsxs("section", { style: {
                            background: '#FFFFFF',
                            borderRadius: 16,
                            border: `1.5px solid ${step2Done ? '#C4956A' : '#E8DDD5'}`,
                            padding: 24,
                            opacity: step1Done ? 1 : 0.5,
                            transition: 'opacity 0.2s',
                        }, children: [_jsxs("div", { style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 10,
                                    marginBottom: 16,
                                }, children: [_jsx(StepBadge, { n: 2, done: step2Done }), _jsx("h2", { style: {
                                            fontSize: 14,
                                            fontWeight: 700,
                                            color: '#2D1F14',
                                            margin: 0,
                                        }, children: "\u00BFQu\u00E9 quieres analizar?" })] }), _jsx(PromptInput, { value: prompt, onChange: setPrompt, disabled: !step1Done })] }), _jsxs("section", { style: {
                            background: '#FFFFFF',
                            borderRadius: 16,
                            border: '1.5px solid #E8DDD5',
                            padding: 24,
                            opacity: step1Done ? 1 : 0.5,
                            transition: 'opacity 0.2s',
                        }, children: [_jsxs("div", { style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 10,
                                    marginBottom: 16,
                                }, children: [_jsx(StepBadge, { n: 3, done: false }), _jsx("h2", { style: {
                                            fontSize: 14,
                                            fontWeight: 700,
                                            color: '#2D1F14',
                                            margin: 0,
                                        }, children: "Formato de salida" })] }), _jsx("div", { style: { display: 'flex', gap: 12 }, children: FORMAT_OPTIONS.map((opt) => {
                                    const sel = outputFormat === opt.value;
                                    return (_jsxs("label", { style: {
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
                                        }, children: [_jsx("input", { type: 'radio', name: 'output', value: opt.value, checked: sel, onChange: () => setOutputFormat(opt.value), style: { display: 'none' } }), _jsx("span", { style: { fontSize: 24 }, children: opt.icon }), _jsx("span", { style: { fontSize: 13, fontWeight: 600, color: '#2D1F14' }, children: opt.label }), _jsx("span", { style: { fontSize: 11, color: '#9A7D6B' }, children: opt.desc })] }, opt.value));
                                }) })] }), _jsxs("div", { children: [_jsx("button", { onClick: handleAnalyze, disabled: !canAnalyze, style: {
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
                                }, children: loading ? '⏳ Enviando análisis...' : '🔍 Analizar ahora' }), !canAnalyze && !loading && (_jsx("p", { style: {
                                    textAlign: 'center',
                                    fontSize: 12,
                                    color: '#B8A090',
                                    marginTop: 8,
                                }, children: getHint() })), error && (_jsxs("div", { style: {
                                    marginTop: 10,
                                    padding: '10px 14px',
                                    borderRadius: 10,
                                    background: '#FEF2F2',
                                    border: '1px solid #FECACA',
                                    fontSize: 13,
                                    color: '#B91C1C',
                                }, children: ["\u26A0 ", error] }))] })] })] }));
}
