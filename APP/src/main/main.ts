import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import { setupIpcHandlers } from './ipc-handlers';
import { setupTray } from './tray';
import { downloadManager } from './download-manager';
import { appStore } from './store';

app.commandLine.appendSwitch('allow-file-access-from-files');

let mainWindow: BrowserWindow | null = null;
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    // Someone tried to run a second instance, we should focus our window
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  const createWindow = () => {
    mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      minWidth: 900,
      minHeight: 600,
      frame: false,
      titleBarStyle: 'hidden',
      titleBarOverlay: {
        color: '#0F0F14',
        symbolColor: '#7C3AED',
        height: 32
      },
      backgroundColor: '#0F0F14',
      webPreferences: {
        preload: path.join(__dirname, '../preload/preload.js'),
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: false,
      },
    });

    mainWindow.webContents.on('console-message', (_event, level, message, line, sourceId) => {
      console.log(`[Renderer Console] [level=${level}] ${message} (${sourceId}:${line})`);
    });

    mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription, validatedURL) => {
      console.error(`[Renderer did-fail-load] code=${errorCode} desc=${errorDescription} url=${validatedURL}`);
    });

    mainWindow.webContents.on('did-finish-load', async () => {
      try {
        const html = await mainWindow?.webContents.executeJavaScript('document.getElementById("root")?.innerHTML');
        console.log('[DEBUG ROOT INNERHTML]:', html ? (html.length + ' chars: ' + html.substring(0, 150)) : 'EMPTY ROOT!');
      } catch (e: any) {
        console.error('[DEBUG ROOT ERROR]:', e.message);
      }
    });

    // Load the index.html of the app.
    if (app.isPackaged) {
      mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
    } else {
      // Try Vite dev server first, fall back to built renderer file if not running
      mainWindow.loadURL('http://localhost:5173').catch(() => {
        mainWindow?.loadFile(path.join(__dirname, '../renderer/index.html'));
      });
    }

    const settings = appStore.getSettings();

    mainWindow.on('close', (event) => {
      if (settings.closeToTray) {
        event.preventDefault();
        mainWindow?.hide();
      }
    });

    mainWindow.on('closed', () => {
      mainWindow = null;
    });

    setupIpcHandlers(mainWindow);
    downloadManager.setMainWindow(mainWindow);
    setupTray(mainWindow);
  };

  app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });

    // Ensure default download directory is set to OS downloads folder
    const settings = appStore.getSettings();
    if (!settings.downloadDir) {
      appStore.saveSettings({ downloadDir: app.getPath('downloads') });
    }

    if (app.isPackaged) {
      app.setLoginItemSettings({
        openAtLogin: settings.startWithWindows,
        openAsHidden: settings.minimizeToTray,
      });
    }
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
}
