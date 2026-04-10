import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/** Página Setup — configuración de IA (solo se muestra si no hay config guardada). */
import { useState } from 'react';
const PROVIDERS = [
    { value: 'openai', label: 'OpenAI', description: 'Recomendado para uso personal' },
    { value: 'anthropic', label: 'Anthropic', description: 'Claude — excelente para documentos largos' },
    { value: 'ollama', label: 'Local (Ollama)', description: 'Sin internet requerido' },
];
export function Setup({ onConfigSaved }) {
    const [provider, setProvider] = useState('openai');
    const [apiKey, setApiKey] = useState('');
    const [ollamaUrl, setOllamaUrl] = useState('http://localhost:11434');
    const [showKey, setShowKey] = useState(false);
    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState(null);
    const [saving, setSaving] = useState(false);
    const needsApiKey = provider !== 'ollama';
    async function handleTest() {
        setTesting(true);
        setTestResult(null);
        await window.electron.saveConfig({
            aiProvider: provider,
            apiKey: needsApiKey ? apiKey : undefined,
            ollamaBaseUrl: provider === 'ollama' ? ollamaUrl : undefined,
        });
        const result = await window.electron.testConnection();
        setTestResult(result);
        setTesting(false);
    }
    async function handleSave() {
        setSaving(true);
        await window.electron.saveConfig({
            aiProvider: provider,
            apiKey: needsApiKey ? apiKey : undefined,
            ollamaBaseUrl: provider === 'ollama' ? ollamaUrl : undefined,
        });
        setSaving(false);
        onConfigSaved();
    }
    const canSave = testResult?.ok === true;
    return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-slate-50 p-6", children: _jsxs("div", { className: "bg-white rounded-2xl shadow-sm border border-slate-200 p-8 w-full max-w-md", children: [_jsx("h1", { className: "text-2xl font-bold text-primary mb-1", children: "Configura tu IA" }), _jsx("p", { className: "text-slate-500 text-sm mb-6", children: "Solo necesitas hacer esto una vez" }), _jsx("div", { className: "space-y-3 mb-6", children: PROVIDERS.map((p) => (_jsxs("label", { className: `flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${provider === p.value
                            ? 'border-accent bg-sky-50'
                            : 'border-slate-200 hover:border-slate-300'}`, children: [_jsx("input", { type: "radio", name: "provider", value: p.value, checked: provider === p.value, onChange: () => { setProvider(p.value); setTestResult(null); }, className: "mt-0.5 accent-accent" }), _jsxs("div", { children: [_jsx("p", { className: "font-medium text-slate-800", children: p.label }), _jsx("p", { className: "text-xs text-slate-500", children: p.description })] })] }, p.value))) }), needsApiKey && (_jsxs("div", { className: "mb-4", children: [_jsx("label", { className: "block text-sm font-medium text-slate-700 mb-1", children: "API Key" }), _jsxs("div", { className: "relative", children: [_jsx("input", { type: showKey ? 'text' : 'password', value: apiKey, onChange: (e) => { setApiKey(e.target.value); setTestResult(null); }, placeholder: "sk-...", className: "w-full border border-slate-300 rounded-lg px-3 py-2 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-accent" }), _jsx("button", { type: "button", onClick: () => setShowKey(!showKey), className: "absolute right-3 top-2.5 text-slate-400 text-xs", children: showKey ? 'Ocultar' : 'Mostrar' })] }), _jsx("p", { className: "text-xs text-slate-400 mt-1", children: "Guardada de forma segura en tu dispositivo. Nunca sale de tu computadora." })] })), provider === 'ollama' && (_jsxs("div", { className: "mb-4", children: [_jsx("label", { className: "block text-sm font-medium text-slate-700 mb-1", children: "URL de Ollama" }), _jsx("input", { type: "text", value: ollamaUrl, onChange: (e) => setOllamaUrl(e.target.value), className: "w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent" })] })), testResult && (_jsx("div", { className: `rounded-lg px-4 py-3 text-sm mb-4 ${testResult.ok
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-red-50 text-red-700 border border-red-200'}`, children: testResult.ok ? '✓ Conexión exitosa' : `✗ ${testResult.error}` })), _jsxs("div", { className: "flex gap-3", children: [_jsx("button", { onClick: handleTest, disabled: testing || (needsApiKey && !apiKey.trim()), className: "flex-1 border border-slate-300 rounded-lg py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors", children: testing ? 'Verificando...' : 'Verificar conexión' }), _jsx("button", { onClick: handleSave, disabled: !canSave || saving, className: "flex-1 bg-primary text-white rounded-lg py-2 text-sm font-medium hover:bg-primary-light disabled:opacity-40 disabled:cursor-not-allowed transition-colors", children: saving ? 'Guardando...' : 'Guardar y continuar' })] })] }) }));
}
