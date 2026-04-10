import { ipcMain, dialog } from 'electron';

const ALLOWED_EXTENSIONS = [
  'xlsx',
  'xls',
  'csv',
  'docx',
  'pdf',
  'png',
  'jpg',
  'jpeg',
  'webp',
];

export function registerFileHandlers(_backendPort: number): void {
  ipcMain.handle('dialog:select-files', async () => {
    const result = await dialog.showOpenDialog({
      title: 'Selecciona archivos para analizar',
      properties: ['openFile', 'multiSelections'],
      filters: [
        {
          name: 'Archivos soportados',
          extensions: ALLOWED_EXTENSIONS,
        },
      ],
    });

    if (result.canceled) return [];
    return result.filePaths;
  });
}
