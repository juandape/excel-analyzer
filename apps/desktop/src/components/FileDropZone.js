import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/** Zona de drag & drop para cargar archivos. */
import { useState } from 'react';
const ALLOWED = [
    '.xlsx',
    '.xls',
    '.csv',
    '.docx',
    '.pdf',
    '.png',
    '.jpg',
    '.jpeg',
    '.webp',
];
const EXT_ICON = {
    xlsx: '📊',
    xls: '📊',
    csv: '📊',
    docx: '📄',
    pdf: '📕',
    png: '🖼',
    jpg: '🖼',
    jpeg: '🖼',
    webp: '🖼',
};
export function FileDropZone({ files, onFilesChange }) {
    const [dragging, setDragging] = useState(false);
    async function openNativeDialog() {
        const paths = await window.electron.selectFiles();
        if (paths.length > 0)
            addFiles(paths);
    }
    function handleDrop(e) {
        e.preventDefault();
        setDragging(false);
        const paths = Array.from(e.dataTransfer.files)
            .map((f) => f.path)
            .filter(Boolean);
        if (paths.length > 0)
            addFiles(paths);
    }
    function addFiles(newPaths) {
        const valid = newPaths.filter((p) => ALLOWED.includes(p.substring(p.lastIndexOf('.')).toLowerCase()));
        onFilesChange([...new Set([...files, ...valid])]);
    }
    function removeFile(fp) {
        onFilesChange(files.filter((f) => f !== fp));
    }
    function getFileName(fp) {
        return fp.split(/[\\/]/).pop() ?? fp;
    }
    function getExt(fp) {
        return fp.split('.').pop()?.toLowerCase() ?? '';
    }
    return (_jsxs("div", { children: [files.length > 0 && (_jsxs("div", { style: {
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    marginBottom: 12,
                }, children: [files.map((f) => (_jsxs("div", { style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            background: '#FFFFFF',
                            border: '1.5px solid #E8DDD5',
                            borderRadius: 10,
                            padding: '10px 14px',
                        }, children: [_jsx("span", { style: { fontSize: 18 }, children: EXT_ICON[getExt(f)] ?? '📎' }), _jsx("span", { style: {
                                    flex: 1,
                                    fontSize: 13,
                                    color: '#4A3728',
                                    fontFamily: 'monospace',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                }, children: getFileName(f) }), _jsx("button", { onClick: () => removeFile(f), style: {
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: '#C4A899',
                                    fontSize: 16,
                                    lineHeight: 1,
                                    padding: 0,
                                    flexShrink: 0,
                                }, children: "\u2715" })] }, f))), _jsx("button", { onClick: openNativeDialog, style: {
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#8B6145',
                            fontSize: 13,
                            fontWeight: 600,
                            textAlign: 'left',
                            padding: '4px 2px',
                        }, children: "+ Agregar m\u00E1s archivos" })] })), files.length === 0 && (_jsxs("div", { onDragOver: (e) => {
                    e.preventDefault();
                    setDragging(true);
                }, onDragLeave: () => setDragging(false), onDrop: handleDrop, onClick: openNativeDialog, style: {
                    border: `2px dashed ${dragging ? '#8B6145' : '#D4C4B8'}`,
                    borderRadius: 16,
                    padding: '48px 24px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: dragging ? '#FDF6F0' : '#FAFAF8',
                    transition: 'all 0.15s',
                }, children: [_jsx("div", { style: { fontSize: 40, marginBottom: 12 }, children: "\uD83D\uDCC2" }), _jsx("p", { style: {
                            fontWeight: 600,
                            color: '#2D1F14',
                            marginBottom: 4,
                            fontSize: 15,
                        }, children: "Arrastra tus archivos aqu\u00ED" }), _jsx("p", { style: { fontSize: 13, color: '#9A7D6B', marginBottom: 8 }, children: "o haz clic para seleccionarlos" }), _jsx("p", { style: { fontSize: 11, color: '#C4A899' }, children: "Excel \u00B7 Word \u00B7 PDF \u00B7 Im\u00E1genes \u00A0\u00B7\u00A0 M\u00E1x. 500 MB" })] }))] }));
}
