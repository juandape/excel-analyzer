import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/** Página Home — carga de archivos y prompt. */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileDropZone } from '@/components/FileDropZone';
import { PromptInput } from '@/components/PromptInput';
export function Home() {
    const navigate = useNavigate();
    const [files, setFiles] = useState([]);
    const [prompt, setPrompt] = useState('');
    const [outputFormat, setOutputFormat] = useState('both');
    const [loading, setLoading] = useState(false);
    const canAnalyze = files.length > 0 && prompt.trim().length > 0 && !loading;
    async function handleAnalyze() {
        if (!canAnalyze)
            return;
        setLoading(true);
        try {
            const { sessionId } = await window.electron.analyzeFiles({
                filePaths: files,
                userPrompt: prompt,
                outputFormat,
            });
            navigate(`/analysis/${sessionId}`);
        }
        catch {
            setLoading(false);
        }
    }
    return (_jsxs("div", { className: "min-h-screen bg-slate-50 flex flex-col", children: [_jsxs("header", { className: "bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between", children: [_jsx("h1", { className: "text-lg font-semibold text-primary", children: "Excel Analyzer" }), _jsx("button", { onClick: () => navigate('/setup'), className: "text-xs text-slate-400 hover:text-slate-600 transition-colors", children: "Configuraci\u00F3n" })] }), _jsxs("main", { className: "flex-1 max-w-2xl mx-auto w-full px-6 py-8 space-y-6", children: [_jsx(FileDropZone, { files: files, onFilesChange: setFiles }), files.length > 0 && (_jsxs(_Fragment, { children: [_jsx(PromptInput, { value: prompt, onChange: setPrompt }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-slate-700 mb-2", children: "Quiero generar:" }), _jsx("div", { className: "flex gap-3", children: ['word', 'pptx', 'both'].map((fmt) => (_jsxs("label", { className: "flex items-center gap-2 cursor-pointer", children: [_jsx("input", { type: "radio", name: "output", value: fmt, checked: outputFormat === fmt, onChange: () => setOutputFormat(fmt), className: "accent-accent" }), _jsx("span", { className: "text-sm text-slate-700", children: fmt === 'word' ? 'Informe Word' : fmt === 'pptx' ? 'PowerPoint' : 'Ambos' })] }, fmt))) })] }), _jsx("button", { onClick: handleAnalyze, disabled: !canAnalyze, className: "w-full bg-primary text-white rounded-xl py-3 font-semibold text-sm hover:bg-primary-light disabled:opacity-40 disabled:cursor-not-allowed transition-colors", children: loading ? 'Enviando...' : '🔍 Analizar' })] }))] })] }));
}
