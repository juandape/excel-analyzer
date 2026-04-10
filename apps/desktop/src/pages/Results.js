import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/** Página Results — muestra el análisis y permite descargar los reportes. */
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
export function Results() {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const [result, setResult] = useState(null);
    const [downloading, setDownloading] = useState(null);
    const [savedToast, setSavedToast] = useState(null);
    useEffect(() => {
        if (!sessionId)
            return;
        window.electron.getResult(sessionId).then(setResult);
    }, [sessionId]);
    async function handleDownload(fileType) {
        if (!sessionId)
            return;
        setDownloading(fileType);
        const response = await window.electron.saveFile({ sessionId, fileType });
        setDownloading(null);
        if (response?.savedPath) {
            setSavedToast(fileType);
            setTimeout(() => setSavedToast(null), 3000);
        }
    }
    if (!result) {
        return (_jsx("div", { style: {
                minHeight: '100vh',
                background: '#FAF7F2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }, children: _jsx("div", { style: {
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    border: '3px solid #E8DDD5',
                    borderTopColor: '#8B6145',
                    animation: 'spin 0.8s linear infinite',
                } }) }));
    }
    const outputFiles = result.outputFiles ?? [];
    const hasWord = outputFiles.some((f) => f.type === 'word');
    const hasPptx = outputFiles.some((f) => f.type === 'pptx');
    return (_jsxs("div", { style: {
            minHeight: '100vh',
            background: '#FAF7F2',
            display: 'flex',
            flexDirection: 'column',
        }, children: [_jsxs("header", { style: {
                    background: 'linear-gradient(135deg, #5C4033, #8B6145)',
                    padding: '14px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                }, children: [_jsx("div", { style: {
                            width: 28,
                            height: 28,
                            borderRadius: 8,
                            background: 'rgba(255,255,255,0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 14,
                        }, children: "\u2705" }), _jsx("span", { style: { color: '#F5EDE3', fontWeight: 700, fontSize: 15 }, children: "An\u00E1lisis completado" })] }), _jsxs("main", { style: {
                    flex: 1,
                    maxWidth: 720,
                    width: '100%',
                    margin: '0 auto',
                    padding: '32px 24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 20,
                }, children: [_jsxs("section", { style: {
                            background: '#FFFFFF',
                            borderRadius: 16,
                            border: '1.5px solid #E8DDD5',
                            overflow: 'hidden',
                        }, children: [_jsxs("div", { style: {
                                    padding: '14px 22px',
                                    background: 'linear-gradient(135deg, #F5EDE3, #FDF6F0)',
                                    borderBottom: '1px solid #E8DDD5',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                }, children: [_jsx("span", { style: { fontSize: 16 }, children: "\uD83D\uDCCB" }), _jsx("h2", { style: {
                                            fontSize: 14,
                                            fontWeight: 700,
                                            color: '#2D1F14',
                                            margin: 0,
                                        }, children: "Resultado del an\u00E1lisis" })] }), _jsx("div", { style: {
                                    padding: '20px 22px',
                                    fontSize: 14,
                                    lineHeight: 1.75,
                                    color: '#4A3728',
                                    whiteSpace: 'pre-wrap',
                                }, children: result.analysisText })] }), result.warnings.length > 0 && (_jsxs("section", { style: {
                            background: '#FFFBEB',
                            border: '1px solid #FDE68A',
                            borderRadius: 12,
                            padding: '12px 16px',
                        }, children: [_jsx("p", { style: {
                                    fontSize: 11,
                                    fontWeight: 600,
                                    color: '#92400E',
                                    marginBottom: 6,
                                }, children: "Notas del procesamiento:" }), result.warnings.map((w, i) => (_jsxs("p", { style: { fontSize: 11, color: '#B45309', margin: '3px 0' }, children: ["\u26A0 ", w] }, i)))] })), (hasWord || hasPptx) && (_jsxs("section", { style: {
                            background: '#FFFFFF',
                            borderRadius: 16,
                            border: '1.5px solid #E8DDD5',
                            padding: '22px 22px',
                        }, children: [_jsx("h3", { style: {
                                    fontSize: 13,
                                    fontWeight: 700,
                                    color: '#2D1F14',
                                    marginBottom: 16,
                                }, children: "Descargar archivos generados" }), _jsxs("div", { style: {
                                    display: 'flex',
                                    gap: 14,
                                    flexWrap: 'wrap',
                                    alignItems: 'flex-start',
                                }, children: [hasWord && (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 8 }, children: [_jsxs("button", { onClick: () => handleDownload('word'), disabled: !!downloading, style: {
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 10,
                                                    padding: '13px 22px',
                                                    borderRadius: 12,
                                                    cursor: downloading ? 'not-allowed' : 'pointer',
                                                    opacity: downloading && downloading !== 'word' ? 0.5 : 1,
                                                    border: '1.5px solid #D4C4B8',
                                                    background: '#FDF6F0',
                                                    color: '#5C4033',
                                                    fontSize: 13,
                                                    fontWeight: 600,
                                                    transition: 'background 0.15s',
                                                }, children: [_jsx("span", { style: { fontSize: 20 }, children: "\uD83D\uDCC4" }), downloading === 'word' ? 'Guardando...' : 'Informe Word'] }), savedToast === 'word' && (_jsx("div", { style: {
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 6,
                                                    padding: '7px 14px',
                                                    borderRadius: 8,
                                                    background: '#E8F5E2',
                                                    border: '1px solid #A8C89A',
                                                    color: '#4A3728',
                                                    fontSize: 12,
                                                    fontWeight: 600,
                                                }, children: "\u2713 Guardado correctamente" }))] })), hasPptx && (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 8 }, children: [_jsxs("button", { onClick: () => handleDownload('pptx'), disabled: !!downloading, style: {
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 10,
                                                    padding: '13px 22px',
                                                    borderRadius: 12,
                                                    cursor: downloading ? 'not-allowed' : 'pointer',
                                                    opacity: downloading && downloading !== 'pptx' ? 0.5 : 1,
                                                    border: '1.5px solid #D4C4B8',
                                                    background: '#F5EDE3',
                                                    color: '#4A3728',
                                                    fontSize: 13,
                                                    fontWeight: 600,
                                                    transition: 'background 0.15s',
                                                }, children: [_jsx("span", { style: { fontSize: 20 }, children: "\uD83D\uDCCA" }), downloading === 'pptx' ? 'Guardando...' : 'PowerPoint'] }), savedToast === 'pptx' && (_jsx("div", { style: {
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 6,
                                                    padding: '7px 14px',
                                                    borderRadius: 8,
                                                    background: '#E8F5E2',
                                                    border: '1px solid #A8C89A',
                                                    color: '#4A3728',
                                                    fontSize: 12,
                                                    fontWeight: 600,
                                                }, children: "\u2713 Guardado correctamente" }))] }))] })] })), _jsx("button", { onClick: () => navigate('/home'), style: {
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: 13,
                            color: '#9A7D6B',
                            fontWeight: 600,
                            padding: '4px 0',
                            alignSelf: 'flex-start',
                        }, children: "\u2190 Nuevo an\u00E1lisis" })] })] }));
}
