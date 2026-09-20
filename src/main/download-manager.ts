import { BrowserWindow, app } from 'electron';
import { randomUUID } from 'crypto';
import * as path from 'path';
import * as fs from 'fs';
import { DownloadTask, DownloadOptions, DownloadStatus, DownloadHistory } from '../shared/types';
import { IPC_CHANNELS } from '../shared/constants';
import { YtDlpWrapper } from './ytdlp-wrapper';
import { SpotifyResolver } from './spotify-resolver';
import { appStore } from './store';
import { showNotification } from './tray';

function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0 || isNaN(bytes)) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i] || 'B'}`;
}

interface ResolvedFile {
  filePath: string;
  size: string;
}

function resolveDownloadedFile(filePath: string, title?: string): ResolvedFile | null {
  try {
    if (filePath && fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      if (stats.isFile() && stats.size > 0) {
        return { filePath, size: formatBytes(stats.size) };
      }
      if (stats.isDirectory()) {
        const files = fs.readdirSync(filePath);
        let bestFile: string | null = null;
        let latestMtime = 0;
        for (const f of files) {
          if (f.endsWith('.part') || f.endsWith('.ytdl') || f.endsWith('.temp')) continue;
          const fullPath = path.join(filePath, f);
          try {
            const fStats = fs.statSync(fullPath);
            if (fStats.isFile() && fStats.mtimeMs > latestMtime) {
              latestMtime = fStats.mtimeMs;
              bestFile = fullPath;
            }
          } catch (e) {}
        }
        if (bestFile) {
          const bStats = fs.statSync(bestFile);
          if (bStats.size > 0) {
            return { filePath: bestFile, size: formatBytes(bStats.size) };
          }
        }
      }
    }
  } catch (e) {}
  return null;
}

interface ActiveProcess {
  process: ReturnType<typeof import('child_process').spawn>;
}

class DownloadManager {
  private tasks: Map<string, DownloadTask> = new Map();
  private activeProcesses: Map<string, ActiveProcess> = new Map();
  private queue: string[] = [];
  private mainWindow: BrowserWindow | null = null;
  private pausedTaskIds: Set<string> = new Set();
  private cancelledTaskIds: Set<string> = new Set();

  setMainWindow(window: BrowserWindow) {
    this.mainWindow = window;
  }

  addTask(options: DownloadOptions, title: string, thumbnail: string, url: string): string {
    const settings = appStore.getSettings();
    const baseDir = settings.downloadDir || (app?.getPath ? app.getPath('downloads') : '');
    
    if (!options.outputDir) {
      options.outputDir = baseDir;
    } else if (!path.isAbsolute(options.outputDir)) {
      options.outputDir = path.join(baseDir, options.outputDir);
    }
    
    const effectiveUrl = (url && !url.includes('spotify.com')) ? url : (options.url && !options.url.includes('spotify.com') ? options.url : url);
    options.url = effectiveUrl;

    // Prevent duplicate entries for the same active or completed download
    const existing = Array.from(this.tasks.values()).find(
      (t) => (t.url === effectiveUrl || t.options.url === effectiveUrl) && t.status !== 'cancelled' && t.status !== 'error'
    );
    if (existing) {
      this.broadcastUpdate(existing);
      return existing.id;
    }

    const id = randomUUID();

    const task: DownloadTask = {
      id,
      url: effectiveUrl,
      title: title || 'Media Download',
      thumbnail: thumbnail || '',
      status: 'queued',
      progress: 0,
      speed: '0 B/s',
      eta: '--:--',
      filesize: '0 B',
      downloadedSize: '0 B',
      outputPath: options.outputDir,
      options,
      createdAt: Date.now(),
    };

    this.tasks.set(id, task);
    this.queue.push(id);
    this.broadcastUpdate(task);
    
    this.processQueue();
    return id;
  }

  getActiveTasks(): DownloadTask[] {
    return Array.from(this.tasks.values());
  }

  private processQueue() {
    const settings = appStore.getSettings();
    const concurrentDownloads = settings.concurrentDownloads || 3;
    const activeCount = Array.from(this.tasks.values()).filter(t => t.status === 'downloading' || t.status === 'converting' || t.status === 'merging').length;

    if (activeCount >= concurrentDownloads) {
      return;
    }

    const nextId = this.queue.shift();
    if (!nextId) return;

    this.startDownload(nextId);
  }

  private async startDownload(id: string) {
    const task = this.tasks.get(id);
    if (!task) return;

    task.status = 'downloading';
    this.broadcastUpdate(task);

    // If task URL or options URL is a Spotify URL that hasn't yet been resolved, resolve it to the matched studio master
    if (SpotifyResolver.isSpotifyUrl(task.options.url) || SpotifyResolver.isSpotifyUrl(task.url)) {
      try {
        const spotUrl = SpotifyResolver.isSpotifyUrl(task.options.url) ? task.options.url : task.url;
        const trackData = await SpotifyResolver.getTrackData(spotUrl);
        if (trackData) {
          const matchedUrl = await SpotifyResolver.findBestStudioMatch(trackData);
          task.options.url = matchedUrl;
          if (trackData.thumbnail && (!task.thumbnail || task.thumbnail.includes('youtube.com') || task.thumbnail.includes('ytimg.com'))) {
            task.thumbnail = trackData.thumbnail;
          }
          if (trackData.title && (!task.title || task.title === 'Media Download')) {
            task.title = `${trackData.artist ? trackData.artist + ' - ' : ''}${trackData.title}`;
          }
        }
      } catch (err) {
        console.warn('Could not pre-resolve Spotify track before download:', err);
      }
    } else if (task.url) {
      task.options.url = task.url;
    }

    const { process, events } = YtDlpWrapper.download(task.options);
    this.activeProcesses.set(id, { process });

    events.on('destination', (destPath: string) => {
      task.outputPath = destPath;
      const realInfo = resolveDownloadedFile(destPath, task.title);
      if (realInfo) {
        task.outputPath = realInfo.filePath;
        task.filesize = realInfo.size;
        task.downloadedSize = realInfo.size;
      }
    });

    events.on('progress', (data: any) => {
      task.progress = data.percent;
      task.speed = data.speed;
      task.eta = data.eta;
      if (data.totalSize && data.totalSize !== 'N/A') {
        task.filesize = data.totalSize;
      }
      if (data.downloaded && data.downloaded !== 'N/A') {
        task.downloadedSize = data.downloaded;
      }
      
      // Send progress to renderer
      if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        this.mainWindow.webContents.send(IPC_CHANNELS.DOWNLOAD_PROGRESS, task);
      }
    });

    events.on('complete', (finalPath?: string) => {
      task.status = 'done';
      task.progress = 100;
      task.speed = '';
      task.eta = '';
      task.completedAt = Date.now();
      if (finalPath) {
        task.outputPath = finalPath;
      }
      
      const checkPath = finalPath || task.outputPath;
      const realInfo = resolveDownloadedFile(checkPath, task.title);
      if (realInfo) {
        task.outputPath = realInfo.filePath;
        task.filesize = realInfo.size;
        task.downloadedSize = realInfo.size;
      } else if (task.downloadedSize && task.downloadedSize !== '0 B' && task.downloadedSize !== 'N/A') {
        task.filesize = task.downloadedSize;
      }
      
      this.activeProcesses.delete(id);
      this.addToHistory(task);
      this.broadcastUpdate(task);
      
      if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        this.mainWindow.webContents.send(IPC_CHANNELS.DOWNLOAD_COMPLETE, task);
      }
      
      this.processQueue();

      // Check if all queued and active tasks have finished
      const remainingActive = Array.from(this.tasks.values()).some(
        (t) => t.status === 'queued' || t.status === 'downloading' || t.status === 'fetching' || t.status === 'converting' || t.status === 'merging'
      );

      if (!remainingActive) {
        const totalCompleted = Array.from(this.tasks.values()).filter(t => t.status === 'done').length;
        const msg = totalCompleted === 1 
          ? `"${task.title}" has finished downloading.`
          : `All ${totalCompleted} downloads have finished successfully!`;
        
        showNotification('Downloads Finished', msg);

        if (this.mainWindow && !this.mainWindow.isDestroyed()) {
          this.mainWindow.webContents.send(IPC_CHANNELS.QUEUE_COMPLETE, { total: totalCompleted });
        }
      }
    });

    events.on('error', (error: Error) => {
      // If the task was paused or cancelled by the user, do not mark as error!
      if (this.pausedTaskIds.has(id) || this.cancelledTaskIds.has(id)) {
        return;
      }

      task.status = 'error';
      task.error = error.message;
      this.activeProcesses.delete(id);
      this.broadcastUpdate(task);
      
      if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        this.mainWindow.webContents.send(IPC_CHANNELS.DOWNLOAD_ERROR, { id, error: error.message });
      }
      
      this.processQueue();
    });
  }

  cancelDownload(id: string) {
    const task = this.tasks.get(id);
    if (!task) return;

    this.cancelledTaskIds.add(id);
    this.pausedTaskIds.delete(id);

    if (task.status === 'queued') {
      this.queue = this.queue.filter(taskId => taskId !== id);
      task.status = 'cancelled';
      task.speed = '0 B/s';
      task.eta = '--:--';
      this.broadcastUpdate(task);
      return;
    }

    task.status = 'cancelled';
    task.speed = '0 B/s';
    task.eta = '--:--';

    const active = this.activeProcesses.get(id);
    if (active) {
      try {
        active.process.kill('SIGTERM');
      } catch (err) {
        console.error('Error stopping process for cancel:', err);
      }
      this.activeProcesses.delete(id);
    }

    this.broadcastUpdate(task);
    this.processQueue();
  }

  pauseDownload(id: string) {
    const task = this.tasks.get(id);
    if (!task) return;

    this.pausedTaskIds.add(id);
    this.cancelledTaskIds.delete(id);
    task.status = 'paused';
    task.speed = '0 B/s';
    task.eta = 'Paused';

    const active = this.activeProcesses.get(id);
    if (active) {
      try {
        active.process.kill('SIGTERM');
      } catch (err) {
        console.error('Error stopping process for pause:', err);
      }
      this.activeProcesses.delete(id);
    }

    this.broadcastUpdate(task);
    this.processQueue();
  }

  resumeDownload(id: string) {
    const task = this.tasks.get(id);
    if (!task) return;

    this.pausedTaskIds.delete(id);
    this.cancelledTaskIds.delete(id);

    if (task.status === 'paused' || task.status === 'cancelled' || task.status === 'error') {
      task.status = 'queued';
      task.error = undefined;
      task.speed = '0 B/s';
      task.eta = '--:--';
      // Put at front of queue so user's resumed download continues right away
      this.queue.unshift(id);
      this.broadcastUpdate(task);
      this.processQueue();
    }
  }

  private broadcastUpdate(task: DownloadTask) {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send(IPC_CHANNELS.DOWNLOAD_PROGRESS, task);
    }
  }

  private addToHistory(task: DownloadTask) {
    const historyItem: DownloadHistory = {
      id: task.id,
      url: task.url,
      title: task.title,
      thumbnail: task.thumbnail,
      outputPath: task.outputPath,
      filesize: task.filesize || 'Unknown',
      format: task.options.outputFormat || 'auto',
      quality: task.options.quality || 'auto',
      downloadedAt: task.completedAt || Date.now()
    };
    appStore.addToHistory(historyItem);
  }
}

export const downloadManager = new DownloadManager();
