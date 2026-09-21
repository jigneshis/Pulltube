/**
 * PullTube — Shared Constants
 * IPC channels, default settings, format mappings, and error messages.
 */

import type { AppSettings } from './types';

// ─── IPC Channel Names ──────────────────────────────────────────────────────

export const IPC_CHANNELS = {
  FETCH_VIDEO_INFO: 'fetch-video-info',
  START_DOWNLOAD: 'start-download',
  CANCEL_DOWNLOAD: 'cancel-download',
  PAUSE_DOWNLOAD: 'pause-download',
  RESUME_DOWNLOAD: 'resume-download',
  DOWNLOAD_PROGRESS: 'download-progress',
  DOWNLOAD_COMPLETE: 'download-complete',
  DOWNLOAD_ERROR: 'download-error',
  GET_FORMATS: 'get-formats',
  OPEN_FILE: 'open-file',
  OPEN_FOLDER: 'open-folder',
  SELECT_FOLDER: 'select-folder',
  GET_SETTINGS: 'get-settings',
  SAVE_SETTINGS: 'save-settings',
  GET_HISTORY: 'get-history',
  CLEAR_HISTORY: 'clear-history',
  DELETE_HISTORY_ITEM: 'delete-history-item',
  UPDATE_YTDLP: 'update-ytdlp',
  GET_VERSIONS: 'get-versions',
  GET_ACTIVE_TASKS: 'get-active-tasks',
  FETCH_PLAYLIST_INFO: 'fetch-playlist-info',
  OPEN_EXTERNAL: 'open-external',
  QUEUE_COMPLETE: 'queue-complete',
  NAVIGATE_TO: 'navigate-to',
  LAUNCH_APP_UPDATER: 'launch-app-updater',
  CHECK_FILE_EXISTS: 'check-file-exists',
  GET_APP_VERSION_STATE: 'get-app-version-state',
  ACKNOWLEDGE_VERSION: 'acknowledge-version',
  CHECK_FOR_APP_UPDATES: 'check-for-app-updates',
  APP_UPDATE_AVAILABLE: 'app-update-available',
} as const;

// ─── Default Settings ───────────────────────────────────────────────────────

export const DEFAULT_SETTINGS: AppSettings = {
  downloadDir: '',
  concurrentDownloads: 3,
  theme: 'dark',
  autoUpdateYtdlp: true,
  proxyUrl: '',
  proxyEnabled: false,
  notificationsEnabled: true,
  notificationSoundEnabled: true,
  minimizeToTray: true,
  closeToTray: false,
  startWithWindows: false,
  customYtdlpArgs: '',
  defaultFormat: 'mp4',
  defaultQuality: 'best',
  defaultMode: 'video',
};

// ─── Video Formats ──────────────────────────────────────────────────────────

export const VIDEO_FORMATS = [
  { value: 'mp4', label: 'MP4 (Universal / Recommended)', ext: 'mp4' },
  { value: 'mp4-h265', label: 'MP4 (H.265/HEVC)', ext: 'mp4' },
  { value: 'webm', label: 'WebM (VP9)', ext: 'webm' },
  { value: 'mkv', label: 'MKV (Matroska)', ext: 'mkv' },
  { value: 'avi', label: 'AVI', ext: 'avi' },
] as const;

export const AUDIO_FORMATS = [
  { value: 'mp3', label: 'MP3', ext: 'mp3' },
  { value: 'aac', label: 'AAC / M4A', ext: 'm4a' },
  { value: 'flac', label: 'FLAC (Lossless)', ext: 'flac' },
  { value: 'wav', label: 'WAV (Uncompressed)', ext: 'wav' },
  { value: 'opus', label: 'OGG / Opus', ext: 'opus' },
  { value: 'alac', label: 'ALAC (Apple Lossless)', ext: 'm4a' },
] as const;

// ─── Quality Presets ────────────────────────────────────────────────────────

export const VIDEO_QUALITIES = [
  { value: 'best', label: 'Best Available', height: null },
  { value: '4320', label: '8K (4320p)', height: 4320 },
  { value: '2160', label: '4K (2160p)', height: 2160 },
  { value: '1440', label: '2K (1440p)', height: 1440 },
  { value: '1080', label: 'Full HD (1080p)', height: 1080 },
  { value: '720', label: 'HD (720p)', height: 720 },
  { value: '480', label: 'SD (480p)', height: 480 },
  { value: '360', label: '360p', height: 360 },
  { value: '240', label: '240p', height: 240 },
  { value: '144', label: '144p', height: 144 },
] as const;

export const AUDIO_QUALITIES = [
  { value: 'best', label: 'Best Available' },
  { value: '320', label: '320 kbps' },
  { value: '256', label: '256 kbps' },
  { value: '192', label: '192 kbps' },
  { value: '128', label: '128 kbps' },
  { value: '64', label: '64 kbps' },
] as const;

// ─── Subtitle Formats ───────────────────────────────────────────────────────

export const SUBTITLE_FORMATS = [
  { value: 'srt', label: 'SRT' },
  { value: 'vtt', label: 'WebVTT' },
  { value: 'ass', label: 'ASS / SSA' },
] as const;

// ─── Error Messages ─────────────────────────────────────────────────────────

export const ERROR_MESSAGES: Record<string, string> = {
  'Video unavailable': 'This video is unavailable. It may have been removed or made private.',
  'Private video': 'This video is private. You need permission from the owner to view it.',
  'Sign in to confirm your age': 'This video is age-restricted. Try using cookies or browser authentication.',
  'is not a valid URL': 'The URL you entered doesn\'t appear to be valid. Please check and try again.',
  'Unable to extract': 'Could not extract video information. The URL may not be supported.',
  'HTTP Error 403': 'Access denied (403 Forbidden). The content may be geo-restricted or require authentication.',
  'HTTP Error 404': 'Content not found (404). The video may have been removed.',
  'HTTP Error 429': 'Too many requests. Please wait a moment and try again.',
  'No video formats found': 'No downloadable formats found for this video.',
  'Unsupported URL': 'This URL is not supported by yt-dlp.',
  'network': 'Network error. Please check your internet connection and try again.',
  'CERTIFICATE_VERIFY_FAILED': 'SSL certificate error. Try disabling your proxy or VPN.',
  'Login required': 'This content requires login. Authentication is not currently supported.',
  'Geo-restricted': 'This content is not available in your region. Try using a VPN or proxy.',
};

// ─── Filename Template Tokens ───────────────────────────────────────────────

export const FILENAME_TEMPLATE_DEFAULT = '%(title)s.%(ext)s';

export const FILENAME_TOKENS = [
  { token: '%(title)s', description: 'Video title' },
  { token: '%(id)s', description: 'Video ID' },
  { token: '%(ext)s', description: 'File extension' },
  { token: '%(resolution)s', description: 'Video resolution' },
  { token: '%(channel)s', description: 'Channel name' },
  { token: '%(upload_date)s', description: 'Upload date (YYYYMMDD)' },
] as const;

// ─── App Constants ──────────────────────────────────────────────────────────

export const APP_NAME = 'PullTube';
export const APP_VERSION = '1.0.1';
export const YTDLP_RELEASES_URL = 'https://api.github.com/repos/yt-dlp/yt-dlp/releases/latest';
export const YTDLP_BINARY_NAME = 'yt-dlp.exe';
export const FFMPEG_BINARY_NAME = 'ffmpeg.exe';
export const FFPROBE_BINARY_NAME = 'ffprobe.exe';

// ─── Progress Parsing ───────────────────────────────────────────────────────

/** Regex to parse yt-dlp download progress output */
export const PROGRESS_REGEX = /\[download\]\s+(\d+\.?\d*)%\s+of\s+~?\s*(\S+)\s+at\s+(\S+)\s+ETA\s+(\S+)/;

/** Regex to parse yt-dlp merge/convert output */
export const MERGE_REGEX = /\[Merger\]||\[ExtractAudio\]|\[VideoConvertor\]/;

/** Regex to detect download completion */
export const COMPLETE_REGEX = /\[download\]\s+100%/;

/** Regex to detect destination file path */
export const DESTINATION_REGEX = /\[download\]\s+Destination:\s+(.+)/;

/** Regex to detect already downloaded */
export const ALREADY_DOWNLOADED_REGEX = /\[download\]\s+(.+)\s+has already been downloaded/;
