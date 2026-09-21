import { ipcMain, dialog, shell, BrowserWindow, app } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { spawn } from 'child_process';
import { IPC_CHANNELS } from '../shared/constants';
import { YtDlpWrapper } from './ytdlp-wrapper';
import { downloadManager } from './download-manager';
import { appStore } from './store';
import { YtDlpUpdater } from './updater';
import { AutoUpdaterWorker } from './auto-updater-worker';
import { AppSettings, DownloadOptions } from '../shared/types';

export function setupIpcHandlers(mainWindow: BrowserWindow) {
  ipcMain.handle(IPC_CHANNELS.FETCH_VIDEO_INFO, async (_, url: string) => {
    return await YtDlpWrapper.getVideoInfo(url);
  });

  ipcMain.handle(IPC_CHANNELS.FETCH_PLAYLIST_INFO, async (_, url: string) => {
    return await YtDlpWrapper.getPlaylistInfo(url);
  });

  ipcMain.handle(IPC_CHANNELS.GET_FORMATS, async (_, url: string) => {
    return await YtDlpWrapper.getFormats(url);
  });

  ipcMain.handle(IPC_CHANNELS.START_DOWNLOAD, (_, data: any) => {
    if (data && data.options) {
      return downloadManager.addTask(data.options, data.title || '', data.thumbnail || '', data.url || data.options.url || '');
    } else {
      return downloadManager.addTask(data, data?.title || '', data?.thumbnail || '', data?.url || '');
    }
  });

  ipcMain.handle(IPC_CHANNELS.GET_ACTIVE_TASKS, () => {
    return downloadManager.getActiveTasks();
  });

  ipcMain.on(IPC_CHANNELS.CANCEL_DOWNLOAD, (_, id: string) => {
    downloadManager.cancelDownload(id);
  });

  ipcMain.on(IPC_CHANNELS.PAUSE_DOWNLOAD, (_, id: string) => {
    downloadManager.pauseDownload(id);
  });

  ipcMain.on(IPC_CHANNELS.RESUME_DOWNLOAD, (_, id: string) => {
    downloadManager.resumeDownload(id);
  });

  ipcMain.handle(IPC_CHANNELS.OPEN_FILE, async (_, filePath: string) => {
    await shell.openPath(filePath);
  });

  ipcMain.handle(IPC_CHANNELS.OPEN_FOLDER, async (_, folderPath: string) => {
    shell.showItemInFolder(folderPath);
  });

  ipcMain.handle(IPC_CHANNELS.OPEN_EXTERNAL, async (_, url: string) => {
    if (url && (url.startsWith('https://') || url.startsWith('http://'))) {
      await shell.openExternal(url);
    }
  });

  ipcMain.handle(IPC_CHANNELS.SELECT_FOLDER, async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory']
    });
    if (!result.canceled && result.filePaths.length > 0) {
      return result.filePaths[0];
    }
    return null;
  });

  ipcMain.handle(IPC_CHANNELS.GET_SETTINGS, () => {
    const settings = appStore.getSettings();
    if (!settings.downloadDir) {
      settings.downloadDir = app.getPath('downloads');
      appStore.saveSettings({ downloadDir: settings.downloadDir });
    }
    return settings;
  });

  ipcMain.handle(IPC_CHANNELS.SAVE_SETTINGS, (_, settings: Partial<AppSettings>) => {
    appStore.saveSettings(settings);
    return true;
  });

  ipcMain.handle(IPC_CHANNELS.GET_HISTORY, () => {
    return appStore.getHistory();
  });

  ipcMain.handle(IPC_CHANNELS.CLEAR_HISTORY, () => {
    appStore.clearHistory();
    return true;
  });

  ipcMain.handle(IPC_CHANNELS.DELETE_HISTORY_ITEM, (_, id: string) => {
    appStore.deleteHistoryItem(id);
    return true;
  });

  ipcMain.handle(IPC_CHANNELS.UPDATE_YTDLP, async () => {
    return await YtDlpUpdater.update();
  });

  ipcMain.handle(IPC_CHANNELS.GET_VERSIONS, async () => {
    return {
      app: app.getVersion(),
      electron: process.versions.electron,
      node: process.versions.node,
      v8: process.versions.v8,
    };
  });

  ipcMain.handle(IPC_CHANNELS.LAUNCH_APP_UPDATER, async () => {
    const candidates = [
      path.join(process.resourcesPath, 'bin', 'updater.exe'),
      path.join(path.dirname(process.execPath), 'updater.exe'),
      path.join(process.cwd(), 'release', 'updater.exe'),
      path.join(process.cwd(), 'resources', 'bin', 'updater.exe'),
    ];

    const updaterPath = candidates.find(p => fs.existsSync(p));
    if (!updaterPath) {
      throw new Error('Updater executable (updater.exe) not found.');
    }

    const child = spawn(updaterPath, [app.getVersion()], {
      detached: true,
      stdio: 'ignore'
    });
    child.unref();
    return true;
  });

  ipcMain.handle(IPC_CHANNELS.CHECK_FILE_EXISTS, async (_, data: { title: string; ext: string; outputDir?: string }) => {
    try {
      const settings = appStore.getSettings();
      const dir = data.outputDir || settings.downloadDir || app.getPath('downloads');
      if (!fs.existsSync(dir)) {
        return { exists: false };
      }

      const sanitized = (data.title || 'video').replace(/[\\/:*?"<>|]/g, '_').trim();
      const ext = (data.ext || 'mp4').replace(/^\./, '').toLowerCase();
      const candidateName = `${sanitized}.${ext}`;
      const candidatePath = path.join(dir, candidateName);

      if (fs.existsSync(candidatePath)) {
        return { exists: true, filename: candidateName, path: candidatePath };
      }

      const files = fs.readdirSync(dir);
      const lowerCandidate = candidateName.toLowerCase();
      const found = files.find(f => f.toLowerCase() === lowerCandidate);
      if (found) {
        return { exists: true, filename: found, path: path.join(dir, found) };
      }

      return { exists: false };
    } catch {
      return { exists: false };
    }
  });

  ipcMain.handle(IPC_CHANNELS.GET_APP_VERSION_STATE, async () => {
    const currentVersion = app.getVersion();
    const lastSeenVersion = appStore.getLastSeenVersion();
    const isPostUpdate = lastSeenVersion !== currentVersion;
    return {
      currentVersion,
      lastSeenVersion,
      isPostUpdate,
    };
  });

  ipcMain.handle(IPC_CHANNELS.ACKNOWLEDGE_VERSION, async (_, version: string) => {
    appStore.setLastSeenVersion(version || app.getVersion());
    return true;
  });

  ipcMain.handle(IPC_CHANNELS.CHECK_FOR_APP_UPDATES, async () => {
    return await AutoUpdaterWorker.checkForUpdates();
  });
}
