/**
 * PullTube — Shared Type Definitions
 * Used by both Electron main process and React renderer.
 */

// ─── Video & Format Info ────────────────────────────────────────────────────

/** Metadata returned by yt-dlp --dump-json for a single video */
export interface VideoInfo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: number;
  durationString: string;
  channel: string;
  channelUrl: string;
  viewCount: number;
  uploadDate: string;
  url: string;
  formats: FormatInfo[];
  subtitles: Record<string, SubtitleInfo[]>;
  chapters: ChapterInfo[];
  webpage_url: string;
  extractor: string;
  like_count?: number;
}

/** A single available format from yt-dlp */
export interface FormatInfo {
  formatId: string;
  formatNote: string;
  ext: string;
  resolution: string;
  width: number | null;
  height: number | null;
  fps: number | null;
  vcodec: string;
  acodec: string;
  filesize: number | null;
  filesizeApprox: number | null;
  tbr: number | null;
  abr: number | null;
  vbr: number | null;
  isVideoOnly: boolean;
  isAudioOnly: boolean;
}

/** Subtitle track info */
export interface SubtitleInfo {
  ext: string;
  url: string;
  name: string;
}

/** Chapter marker in a video */
export interface ChapterInfo {
  startTime: number;
  endTime: number;
  title: string;
}

// ─── Playlist Info ──────────────────────────────────────────────────────────

/** A single item in a playlist */
export interface PlaylistItem {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  duration: number;
  durationString: string;
  channel?: string;
  index: number;
}

/** Playlist metadata from yt-dlp --flat-playlist */
export interface PlaylistInfo {
  id: string;
  title: string;
  description?: string;
  channel?: string;
  thumbnail?: string;
  itemCount: number;
  items: PlaylistItem[];
  url: string;
}

// ─── Download Types ─────────────────────────────────────────────────────────

/** Options the user selects before starting a download */
export interface DownloadOptions {
  url: string;
  formatId?: string;
  outputFormat: string;
  quality: string;
  mode: 'video' | 'audio';
  outputDir: string;
  filenameTemplate: string;
  embedSubtitles: boolean;
  subtitleLangs: string[];
  subtitleFormat: string;
  embedThumbnail: boolean;
  embedMetadata: boolean;
  trim?: boolean;
  trimStart?: string;
  trimEnd?: string;
  splitChapters: boolean;
  extractAudio: boolean;
  audioFormat?: string;
  audioQuality?: string;
  customArgs: string;
  proxyUrl?: string;
}

/** Possible states of a download task */
export type DownloadStatus =
  | 'queued'
  | 'fetching'
  | 'downloading'
  | 'converting'
  | 'merging'
  | 'done'
  | 'error'
  | 'cancelled'
  | 'paused';

/** A single download task tracked by the download manager */
export interface DownloadTask {
  id: string;
  url: string;
  title: string;
  thumbnail: string;
  status: DownloadStatus;
  progress: number;
  speed: string;
  eta: string;
  filesize: string;
  downloadedSize: string;
  outputPath: string;
  options: DownloadOptions;
  error?: string;
  createdAt: number;
  completedAt?: number;
}

/** A completed download stored in history */
export interface DownloadHistory {
  id: string;
  url: string;
  title: string;
  thumbnail: string;
  outputPath: string;
  filesize: string;
  format: string;
  quality: string;
  downloadedAt: number;
}

// ─── App Settings ───────────────────────────────────────────────────────────

/** User-configurable application settings */
export interface AppSettings {
  downloadDir: string;
  concurrentDownloads: number;
  theme: 'dark' | 'light';
  autoUpdateYtdlp: boolean;
  proxyUrl: string;
  proxyEnabled: boolean;
  notificationsEnabled: boolean;
  notificationSoundEnabled: boolean;
  minimizeToTray: boolean;
  closeToTray: boolean;
  startWithWindows: boolean;
  customYtdlpArgs: string;
  defaultFormat: string;
  defaultQuality: string;
  defaultMode: 'video' | 'audio';
}

// ─── Version Info ───────────────────────────────────────────────────────────

/** Version information for app, yt-dlp, and FFmpeg */
export interface VersionInfo {
  app: string;
  ytdlp: string;
  ffmpeg: string;
}

// ─── IPC Types ──────────────────────────────────────────────────────────────

/** Type-safe IPC API exposed via preload */
export interface ElectronAPI {
  fetchVideoInfo(url: string): Promise<VideoInfo>;
  fetchPlaylistInfo(url: string): Promise<PlaylistInfo>;
  startDownload(data: { options: DownloadOptions; title?: string; thumbnail?: string; url?: string } | DownloadOptions): Promise<{ id: string }>;
  cancelDownload(id: string): Promise<void>;
  pauseDownload(id: string): Promise<void>;
  resumeDownload(id: string): Promise<void>;
  getFormats(url: string): Promise<FormatInfo[]>;
  openFile(filePath: string): Promise<void>;
  openFolder(filePath: string): Promise<void>;
  selectFolder(): Promise<string | null>;
  getSettings(): Promise<AppSettings>;
  saveSettings(settings: Partial<AppSettings>): Promise<void>;
  getHistory(): Promise<DownloadHistory[]>;
  clearHistory(): Promise<void>;
  deleteHistoryItem(id: string): Promise<void>;
  updateYtdlp(): Promise<{ version: string }>;
  getVersions(): Promise<VersionInfo>;
  getActiveTasks(): Promise<DownloadTask[]>;
  openExternal(url: string): Promise<void>;
  onDownloadProgress(callback: (task: DownloadTask) => void): () => void;
  onDownloadComplete(callback: (task: DownloadTask) => void): () => void;
  onDownloadError(callback: (data: { id: string; error: string }) => void): () => void;
  onQueueComplete(callback: (data: { total: number }) => void): () => void;
  onNavigateTo(callback: (path: string) => void): () => void;
}

/** Extend the Window interface to include electronAPI */
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
