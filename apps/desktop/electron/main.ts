/**
 * Proceso principal de Electron.
 * Es el único que conoce el puerto del backend y gestiona el subproceso Python.
 */
import { app, BrowserWindow, dialog, shell, ipcMain } from 'electron';
import { join } from 'path';
import { spawn, ChildProcess } from 'child_process';
import { chmodSync, existsSync } from 'fs';
import log from 'electron-log';
import { registerFileHandlers } from './ipc/file.handler';
import { registerConfigHandlers } from './ipc/config.handler';
import { registerAnalysisHandlers } from './ipc/analysis.handler';
import { registerExportHandlers } from './ipc/export.handler';
import { generatePort } from './services/port.service';

log.initialize();
log.transports.file.level = 'info';

let mainWindow: BrowserWindow | null = null;
let pythonProcess: ChildProcess | null = null;
let backendPort: number = 8765;

async function startPythonBackend(): Promise<number> {
  const isDev = !app.isPackaged;

  // En dev el backend ya está corriendo (lanzado por dev.sh en puerto fijo)
  if (isDev) {
    const devPort = parseInt(process.env.VITE_BACKEND_PORT ?? '8765', 10);
    backendPort = devPort;
    log.info(`Modo dev — usando backend en puerto ${devPort}`);
    await waitForBackend(devPort);
    return devPort;
  }

  const port = generatePort();
  backendPort = port;
  const exeName =
    process.platform === 'win32'
      ? 'excel-analyzer-backend.exe'
      : 'excel-analyzer-backend';
  const pythonCmd = join(process.resourcesPath, 'backend', exeName);

  log.info(`Backend cmd: ${pythonCmd}`);

  // Asegurar permisos de ejecución (macOS/Linux)
  if (process.platform !== 'win32') {
    if (existsSync(pythonCmd)) {
      try {
        chmodSync(pythonCmd, 0o755);
      } catch {
        /* ya tiene permisos */
      }
    } else {
      throw new Error(`Ejecutable no encontrado: ${pythonCmd}`);
    }
  }

  log.info(`Iniciando backend en puerto ${port}`);

  pythonProcess = spawn(pythonCmd, [], {
    env: {
      ...process.env,
      BACKEND_PORT: String(port),
      BACKEND_HOST: '127.0.0.1',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  pythonProcess.stdout?.on('data', (data) => {
    log.info(`[backend] ${data.toString().trim()}`);
  });

  pythonProcess.stderr?.on('data', (data) => {
    log.info(`[backend:err] ${data.toString().trim()}`);
  });

  pythonProcess.on('exit', (code) => {
    log.warn(`Backend terminó con código: ${code}`);
  });

  // Esperar a que el backend esté listo (healthcheck)
  await waitForBackend(port);
  return port;
}

async function waitForBackend(port: number, retries = 120): Promise<void> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/health`);
      if (res.ok) {
        log.info('Backend listo');
        return;
      }
    } catch {
      // Backend aún no está listo
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error('El backend no respondió en el tiempo esperado');
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 750,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      preload: join(__dirname, 'preload.js'),
      webSecurity: app.isPackaged,
      allowRunningInsecureContent: false,
    },
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    show: true,
  });

  // Inyectar headers CORS en respuestas del backend para que EventSource funcione
  // tanto en dev (localhost:5173) como en prod (file://)
  mainWindow.webContents.session.webRequest.onHeadersReceived(
    { urls: [`http://127.0.0.1:*/*`] },
    (details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          'Access-Control-Allow-Origin': ['*'],
          'Access-Control-Allow-Headers': ['*'],
        },
      });
    },
  );

  if (!app.isPackaged) {
    // vite-plugin-electron inyecta VITE_DEV_SERVER_URL con el puerto real (puede ser 5173, 5174, etc.)
    const devURL = process.env.VITE_DEV_SERVER_URL ?? 'http://localhost:5173';
    log.info(`Cargando renderer desde: ${devURL}`);
    mainWindow.loadURL(devURL);
    mainWindow.webContents.openDevTools();

    // En dev: Cmd+R / F5 hace hard-reload ignorando caché
    mainWindow.webContents.on('before-input-event', (_, input) => {
      if (
        input.type === 'keyDown' &&
        (input.key === 'F5' ||
          (input.key === 'r' && (input.meta || input.control)))
      ) {
        mainWindow?.webContents.reloadIgnoringCache();
      }
    });
  } else {
    mainWindow.loadFile(join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(async () => {
  try {
    await startPythonBackend();
  } catch (err) {
    log.error('Error iniciando backend:', err);
    dialog.showErrorBox(
      'Error de inicio',
      `No se pudo iniciar el motor de análisis.\n\nRevisa el log en:\n${log.transports.file.getFile().path}\n\nIntenta reiniciar la aplicación.`,
    );
    app.quit();
    return;
  }

  // Registrar todos los handlers IPC, pasando el puerto del backend
  registerFileHandlers(backendPort);
  registerConfigHandlers(backendPort);
  registerAnalysisHandlers(backendPort);
  registerExportHandlers(backendPort);

  // Exponer el puerto del backend al renderer para que use EventSource directamente
  ipcMain.handle('backend:port', () => backendPort);

  // Polling de estado del análisis
  ipcMain.handle('analysis:status', async (_, sessionId: string) => {
    try {
      const res = await fetch(
        `http://127.0.0.1:${backendPort}/analysis/status/${sessionId}`,
      );
      if (!res.ok) {
        log.warn(
          `[analysis:status] HTTP ${res.status} para sesión ${sessionId}`,
        );
        return {
          stage: 'error',
          percentage: 0,
          message: `Error del servidor (${res.status})`,
          done: false,
          error: true,
        };
      }
      return res.json();
    } catch (err) {
      log.warn('[analysis:status] Backend no responde:', err);
      // Devolver estado neutro para que el polling reintente
      return {
        stage: 'extracting',
        percentage: 5,
        message: 'Conectando...',
        done: false,
        error: false,
      };
    }
  });

  createWindow();
});

app.on('before-quit', () => {
  if (pythonProcess) {
    pythonProcess.kill('SIGTERM');
    log.info('Backend detenido');
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// Prevenir navegación a URLs externas
app.on('web-contents-created', (_, contents) => {
  contents.on('will-navigate', (event, url) => {
    if (!url.startsWith('http://localhost') && !url.startsWith('file://')) {
      event.preventDefault();
    }
  });
  contents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
});
