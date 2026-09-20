import { app } from 'electron';
import * as path from 'path';

export function getYtdlpPath(): string {
  const isPackaged = typeof app !== 'undefined' && app && app.isPackaged;
  const binaryName = process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp';
  
  if (isPackaged && process.resourcesPath) {
    return path.join(process.resourcesPath, 'bin', binaryName);
  }
  return path.join(__dirname, '../../resources/bin', binaryName);
}

export function getFfmpegPath(): string {
  const isPackaged = typeof app !== 'undefined' && app && app.isPackaged;
  const binaryName = process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg';
  
  if (isPackaged && process.resourcesPath) {
    return path.join(process.resourcesPath, 'bin', binaryName);
  }
  return path.join(__dirname, '../../resources/bin', binaryName);
}
