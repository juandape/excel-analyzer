/** Zona de drag & drop para cargar archivos. */
import { useState } from 'react';

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

const EXT_ICON: Record<string, string> = {
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

interface Props {
  files: string[];
  onFilesChange: (files: string[]) => void;
}

export function FileDropZone({ files, onFilesChange }: Props) {
  const [dragging, setDragging] = useState(false);

  async function openNativeDialog() {
    const paths = await window.electron.selectFiles();
    if (paths.length > 0) addFiles(paths);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const paths = Array.from(e.dataTransfer.files)
      .map((f) => (f as ElectronFile).path)
      .filter(Boolean);
    if (paths.length > 0) addFiles(paths);
  }

  function addFiles(newPaths: string[]) {
    const valid = newPaths.filter((p) =>
      ALLOWED.includes(p.substring(p.lastIndexOf('.')).toLowerCase()),
    );
    onFilesChange([...new Set([...files, ...valid])]);
  }

  function removeFile(fp: string) {
    onFilesChange(files.filter((f) => f !== fp));
  }
  function getFileName(fp: string) {
    return fp.split(/[\\/]/).pop() ?? fp;
  }
  function getExt(fp: string) {
    return fp.split('.').pop()?.toLowerCase() ?? '';
  }

  return (
    <div>
      {files.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            marginBottom: 12,
          }}
        >
          {files.map((f) => (
            <div
              key={f}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                background: '#FFFFFF',
                border: '1.5px solid #E8DDD5',
                borderRadius: 10,
                padding: '10px 14px',
              }}
            >
              <span style={{ fontSize: 18 }}>
                {EXT_ICON[getExt(f)] ?? '📎'}
              </span>
              <span
                style={{
                  flex: 1,
                  fontSize: 13,
                  color: '#4A3728',
                  fontFamily: 'monospace',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {getFileName(f)}
              </span>
              <button
                onClick={() => removeFile(f)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#C4A899',
                  fontSize: 16,
                  lineHeight: 1,
                  padding: 0,
                  flexShrink: 0,
                }}
              >
                ✕
              </button>
            </div>
          ))}
          <button
            onClick={openNativeDialog}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#8B6145',
              fontSize: 13,
              fontWeight: 600,
              textAlign: 'left',
              padding: '4px 2px',
            }}
          >
            + Agregar más archivos
          </button>
        </div>
      )}

      {files.length === 0 && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={openNativeDialog}
          style={{
            border: `2px dashed ${dragging ? '#8B6145' : '#D4C4B8'}`,
            borderRadius: 16,
            padding: '48px 24px',
            textAlign: 'center',
            cursor: 'pointer',
            background: dragging ? '#FDF6F0' : '#FAFAF8',
            transition: 'all 0.15s',
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 12 }}>📂</div>
          <p
            style={{
              fontWeight: 600,
              color: '#2D1F14',
              marginBottom: 4,
              fontSize: 15,
            }}
          >
            Arrastra tus archivos aquí
          </p>
          <p style={{ fontSize: 13, color: '#9A7D6B', marginBottom: 8 }}>
            o haz clic para seleccionarlos
          </p>
          <p style={{ fontSize: 11, color: '#C4A899' }}>
            Excel · Word · PDF · Imágenes &nbsp;·&nbsp; Máx. 500 MB
          </p>
        </div>
      )}
    </div>
  );
}
