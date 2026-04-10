/**
 * Expone la API de Electron al renderer de forma tipada.
 * Este archivo se incluye automáticamente gracias a tsconfig.json (src/**).
 */
import type { ElectronAPI } from '@excel-analyzer/shared-types';

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}
