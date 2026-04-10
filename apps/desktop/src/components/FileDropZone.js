import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/** Zona de drag & drop para cargar archivos. */
import { useRef, useState } from 'react';
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
const MAX_MB = 100;
export function FileDropZone({ files, onFilesChange }) {
    const [dragging, setDragging] = useState(false);
    const inputRef = useRef(null);
    function handleDrop(e) {
        e.preventDefault();
        setDragging(false);
        const paths = Array.from(e.dataTransfer.files).map((f) => f.path);
        addFiles(paths);
    }
    function handleInputChange(e) {
        const paths = Array.from(e.target.files ?? []).map((f) => f.path);
        addFiles(paths);
    }
    function addFiles(newPaths) {
        const valid = newPaths.filter((p) => {
            const ext = p.substring(p.lastIndexOf('.')).toLowerCase();
            return ALLOWED.includes(ext);
        });
        const unique = [...new Set([...files, ...valid])];
        onFilesChange(unique);
    }
    function removeFile(filePath) {
        onFilesChange(files.filter((f) => f !== filePath));
    }
    function getFileName(filePath) {
        return filePath.split(/[\\/]/).pop() ?? filePath;
    }
    return (_jsxs("div", { children: [files.length > 0 && (_jsxs("div", { className: 'space-y-2 mb-3', children: [files.map((f) => (_jsxs("div", { className: 'flex items-center justify-between bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm', children: [_jsx("span", { className: 'font-mono text-xs text-slate-600 truncate', children: getFileName(f) }), _jsx("button", { onClick: () => removeFile(f), className: 'text-slate-400 hover:text-red-500 ml-3 flex-shrink-0 transition-colors', "aria-label": `Eliminar ${getFileName(f)}`, children: "\u2715" })] }, f))), _jsx("button", { onClick: () => inputRef.current?.click(), className: 'text-xs text-accent hover:underline', children: "+ Agregar m\u00E1s archivos" })] })), files.length === 0 && (_jsxs("div", { onDragOver: (e) => {
                    e.preventDefault();
                    setDragging(true);
                }, onDragLeave: () => setDragging(false), onDrop: handleDrop, onClick: () => inputRef.current?.click(), className: `border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-colors ${dragging
                    ? 'border-accent bg-sky-50'
                    : 'border-slate-300 hover:border-slate-400 bg-white'}`, children: [_jsx("div", { className: 'text-4xl mb-3', children: "\uD83D\uDCC2" }), _jsx("p", { className: 'font-medium text-slate-700 mb-1', children: "Arrastra tus archivos aqu\u00ED" }), _jsx("p", { className: 'text-sm text-slate-400 mb-3', children: "o haz clic para seleccionarlos" }), _jsxs("p", { className: 'text-xs text-slate-300', children: ["Excel \u00B7 Word \u00B7 PDF \u00B7 Im\u00E1genes \u00B7 M\u00E1x. ", MAX_MB, " MB"] })] })), _jsx("input", { ref: inputRef, type: 'file', multiple: true, accept: ALLOWED.join(','), onChange: handleInputChange, className: 'hidden' })] }));
}
