/** Zona de drag & drop para cargar archivos. */
import { useRef, useState } from 'react';

// Electron extiende File con .path (ruta absoluta en disco)
interface ElectronFile extends File {
  path: string;
}

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

interface Props {
  files: string[];
  onFilesChange: (files: string[]) => void;
}

export function FileDropZone({ files, onFilesChange }: Props) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const paths = Array.from(e.dataTransfer.files).map(
      (f) => (f as ElectronFile).path,
    );
    addFiles(paths);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const paths = Array.from(e.target.files ?? []).map(
      (f) => (f as ElectronFile).path,
    );
    addFiles(paths);
  }

  function addFiles(newPaths: string[]) {
    const valid = newPaths.filter((p) => {
      const ext = p.substring(p.lastIndexOf('.')).toLowerCase();
      return ALLOWED.includes(ext);
    });
    const unique = [...new Set([...files, ...valid])];
    onFilesChange(unique);
  }

  function removeFile(filePath: string) {
    onFilesChange(files.filter((f) => f !== filePath));
  }

  function getFileName(filePath: string) {
    return filePath.split(/[\\/]/).pop() ?? filePath;
  }

  return (
    <div>
      {/* Lista de archivos cargados */}
      {files.length > 0 && (
        <div className='space-y-2 mb-3'>
          {files.map((f) => (
            <div
              key={f}
              className='flex items-center justify-between bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm'
            >
              <span className='font-mono text-xs text-slate-600 truncate'>
                {getFileName(f)}
              </span>
              <button
                onClick={() => removeFile(f)}
                className='text-slate-400 hover:text-red-500 ml-3 flex-shrink-0 transition-colors'
                aria-label={`Eliminar ${getFileName(f)}`}
              >
                ✕
              </button>
            </div>
          ))}
          <button
            onClick={() => inputRef.current?.click()}
            className='text-xs text-accent hover:underline'
          >
            + Agregar más archivos
          </button>
        </div>
      )}

      {/* Drop zone */}
      {files.length === 0 && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-colors ${
            dragging
              ? 'border-accent bg-sky-50'
              : 'border-slate-300 hover:border-slate-400 bg-white'
          }`}
        >
          <div className='text-4xl mb-3'>📂</div>
          <p className='font-medium text-slate-700 mb-1'>
            Arrastra tus archivos aquí
          </p>
          <p className='text-sm text-slate-400 mb-3'>
            o haz clic para seleccionarlos
          </p>
          <p className='text-xs text-slate-300'>
            Excel · Word · PDF · Imágenes · Máx. {MAX_MB} MB
          </p>
        </div>
      )}

      <input
        ref={inputRef}
        type='file'
        multiple
        accept={ALLOWED.join(',')}
        onChange={handleInputChange}
        className='hidden'
      />
    </div>
  );
}
