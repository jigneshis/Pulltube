import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '../shared/constants';
import { AppSettings, DownloadOptions, DownloadTask } from '../shared/types';

const electronAPI = {
  fetchVideoInfo: (url: string) => ipcRenderer.invoke(IPC_CHANNELS.FETCH_VIDEO_INFO, url),
  fetchPlaylistInfo: (url: string) => ipcRenderer.invoke(IPC_CHANNELS.FETCH_PLAYLIST_INFO, url),
  getFormats: (url: string) => ipcRenderer.invoke(IPC_CHANNELS.GET_FORMATS, url),
  
  startDownload: (data: { options: DownloadOptions, title: string, thumbnail: string, url: string }) => 
    ipcRenderer.invoke(IPC_CHANNELS.START_DOWNLOAD, data),
  cancelDownload: (id: string) => ipcRenderer.send(IPC_CHANNELS.CANCEL_DOWNLOAD, id),
  pauseDownload: (id: string) => ipcRenderer.send(IPC_CHANNELS.PAUSE_DOWNLOAD, id),
  resumeDownload: (id: string) => ipcRenderer.send(IPC_CHANNELS.RESUME_DOWNLOAD, id),
  
  onDownloadProgress: (callback: (task: DownloadTask) => void) => {
    const listener = (_: any, task: DownloadTask) => callback(task);
    ipcRenderer.on(IPC_CHANNELS.DOWNLOAD_PROGRESS, listener);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.DOWNLOAD_PROGRESS, listener);
  },
  
  onDownloadComplete: (callback: (task: DownloadTask) => void) => {
    const listener = (_: any, task: DownloadTask) => callback(task);
    ipcRenderer.on(IPC_CHANNELS.DOWNLOAD_COMPLETE, listener);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.DOWNLOAD_COMPLETE, listener);
  },
  
  onDownloadError: (callback: (data: { id: string, error: string }) => void) => {
    const listener = (_: any, data: { id: string, error: string }) => callback(data);
    ipcRenderer.on(IPC_CHANNELS.DOWNLOAD_ERROR, listener);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.DOWNLOAD_ERROR, listener);
  },

  onQueueComplete: (callback: (data: { total: number }) => void) => {
    const listener = (_: any, data: { total: number }) => callback(data);
    ipcRenderer.on(IPC_CHANNELS.QUEUE_COMPLETE, listener);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.QUEUE_COMPLETE, listener);
  },

  onNavigateTo: (callback: (path: string) => void) => {
    const listener = (_: any, path: string) => callback(path);
    ipcRenderer.on(IPC_CHANNELS.NAVIGATE_TO, listener);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.NAVIGATE_TO, listener);
  },

  openFile: (filePath: string) => ipcRenderer.invoke(IPC_CHANNELS.OPEN_FILE, filePath),
  openFolder: (folderPath: string) => ipcRenderer.invoke(IPC_CHANNELS.OPEN_FOLDER, folderPath),
  selectFolder: () => ipcRenderer.invoke(IPC_CHANNELS.SELECT_FOLDER),
  
  getSettings: () => ipcRenderer.invoke(IPC_CHANNELS.GET_SETTINGS),
  saveSettings: (settings: Partial<AppSettings>) => ipcRenderer.invoke(IPC_CHANNELS.SAVE_SETTINGS, settings),
  
  getHistory: () => ipcRenderer.invoke(IPC_CHANNELS.GET_HISTORY),
  clearHistory: () => ipcRenderer.invoke(IPC_CHANNELS.CLEAR_HISTORY),
  deleteHistoryItem: (id: string) => ipcRenderer.invoke(IPC_CHANNELS.DELETE_HISTORY_ITEM, id),
  
  updateYtdlp: () => ipcRenderer.invoke(IPC_CHANNELS.UPDATE_YTDLP),
  getVersions: () => ipcRenderer.invoke(IPC_CHANNELS.GET_VERSIONS),
  getActiveTasks: () => ipcRenderer.invoke(IPC_CHANNELS.GET_ACTIVE_TASKS),
  openExternal: (url: string) => ipcRenderer.invoke(IPC_CHANNELS.OPEN_EXTERNAL, url),
  launchAppUpdater: () => ipcRenderer.invoke(IPC_CHANNELS.LAUNCH_APP_UPDATER),

  checkFileExists: (data: { title: string; ext: string; outputDir?: string }) =>
    ipcRenderer.invoke(IPC_CHANNELS.CHECK_FILE_EXISTS, data),
  getAppVersionState: () => ipcRenderer.invoke(IPC_CHANNELS.GET_APP_VERSION_STATE),
  acknowledgeVersion: (version: string) => ipcRenderer.invoke(IPC_CHANNELS.ACKNOWLEDGE_VERSION, version),
  checkForAppUpdates: () => ipcRenderer.invoke(IPC_CHANNELS.CHECK_FOR_APP_UPDATES),
  onAppUpdateAvailable: (callback: (info: { version: string; releaseNotes: string }) => void) => {
    const listener = (_: any, info: { version: string; releaseNotes: string }) => callback(info);
    ipcRenderer.on(IPC_CHANNELS.APP_UPDATE_AVAILABLE, listener);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.APP_UPDATE_AVAILABLE, listener);
  },
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

export type ElectronAPI = typeof electronAPI;
