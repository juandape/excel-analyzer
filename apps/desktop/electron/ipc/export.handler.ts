import { ipcMain, dialog } from 'electron';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';
import type { ExportRequest } from '@excel-analyzer/shared-types';

const FILE_CONFIG: Record<string, { ext: string; label: string }> = {
  word: { ext: 'docx', label: 'Documento Word' },
  pptx: { ext: 'pptx', label: 'Presentación PowerPoint' },
};

export function registerExportHandlers(backendPort: number): void {
  ipcMain.handle('export:save', async (_, request: ExportRequest) => {
    const config = FILE_CONFIG[request.fileType];
    if (!config) return { savedPath: '' };

    const { filePath: savePath } = await dialog.showSaveDialog({
      title: `Guardar ${config.label}`,
      defaultPath: `analisis_${Date.now()}.${config.ext}`,
      filters: [{ name: config.label, extensions: [config.ext] }],
    });

    if (!savePath) return { savedPath: '' };

    // Descargar el archivo desde el backend y guardarlo en la ruta elegida
    const res = await fetch(`http://127.0.0.1:${backendPort}/export/download`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: request.sessionId,
        file_type: request.fileType,
      }),
    });

    if (!res.ok || !res.body) return { savedPath: '' };

    const writer = createWriteStream(savePath);
    await pipeline(Readable.fromWeb(res.body as any), writer);

    return { savedPath: savePath };
  });
}
