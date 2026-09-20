import { ipcMain, dialog, shell, BrowserWindow, app } from 'electron';
import { IPC_CHANNELS } from '../shared/constants';
import { YtDlpWrapper } from './ytdlp-wrapper';
import { downloadManager } from './download-manager';
import { appStore } from './store';
import { YtDlpUpdater } from './updater';
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
}
