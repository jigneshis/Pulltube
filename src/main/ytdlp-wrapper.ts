import { spawn } from 'child_process';
import { app } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { EventEmitter } from 'events';
import { VideoInfo, FormatInfo, DownloadOptions, PlaylistInfo, PlaylistItem } from '../shared/types';
import { ERROR_MESSAGES } from '../shared/constants';
import { getYtdlpPath, getFfmpegPath } from './binary-manager';
import { SpotifyResolver } from './spotify-resolver';

export { getYtdlpPath, getFfmpegPath };

function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0 || isNaN(bytes)) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i] || 'B'}`;
}

export function parseCleanYtdlpError(stderr: string, code: number | null): string {
  if (!stderr) {
    if (code === null) return 'Download was interrupted';
    return `Download failed (exit code ${code})`;
  }

  const lines = stderr.split('\n').map(l => l.trim()).filter(Boolean);
  const errorLines = lines.filter(l => /^ERROR:/i.test(l));

  let candidate = '';
  if (errorLines.length > 0) {
    candidate = errorLines[errorLines.length - 1].replace(/^ERROR:\s*(\[[^\]]+\]\s*)?/i, '');
  } else {
    // Exclude harmless WARNING lines from being displayed as errors
    const nonWarning = lines.filter(l => !/^WARNING:/i.test(l));
    candidate = nonWarning.length > 0
      ? nonWarning.slice(-2).join(' ')
      : (code === null ? 'Download was interrupted' : `Download failed (exit code ${code})`);
  }

  for (const [key, msg] of Object.entries(ERROR_MESSAGES)) {
    if (candidate.toLowerCase().includes(key.toLowerCase()) || stderr.toLowerCase().includes(key.toLowerCase())) {
      return msg;
    }
  }

  return candidate || 'Download failed. Please try again.';
}

export class YtDlpWrapper {
  static async getVideoInfo(url: string): Promise<VideoInfo> {
    if (SpotifyResolver.isSpotifyUrl(url)) {
      try {
        return await SpotifyResolver.resolveTrack(url, (target) => YtDlpWrapper.fetchRawVideoInfo(target));
      } catch (err) {
        console.error('Spotify resolver error:', err);
      }
    }

    return YtDlpWrapper.fetchRawVideoInfo(url);
  }

  private static async fetchRawVideoInfo(target: string): Promise<VideoInfo> {
    return new Promise((resolve, reject) => {
      const ytdlp = spawn(getYtdlpPath(), [
        '--no-warnings',
        '--js-runtimes', 'node',
        '--dump-json',
        target
      ]);
      
      let stdout = '';
      let stderr = '';

      ytdlp.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      ytdlp.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      ytdlp.on('close', (code) => {
        if (code !== 0) {
          const cleanErr = parseCleanYtdlpError(stderr, code);
          reject(new Error(cleanErr));
          return;
        }

        try {
          const raw = JSON.parse(stdout);
          const formats: FormatInfo[] = (raw.formats || []).map((f: any) => ({
            formatId: f.format_id,
            formatNote: f.format_note || '',
            ext: f.ext,
            resolution: f.resolution || `${f.width || '?'}x${f.height || '?'}`,
            width: f.width || null,
            height: f.height || null,
            fps: f.fps || null,
            vcodec: f.vcodec !== 'none' ? f.vcodec : 'none',
            acodec: f.acodec !== 'none' ? f.acodec : 'none',
            filesize: f.filesize || null,
            filesizeApprox: f.filesize_approx || null,
            tbr: f.tbr || null,
            abr: f.abr || null,
            vbr: f.vbr || null,
            isVideoOnly: f.acodec === 'none' && f.vcodec !== 'none',
            isAudioOnly: f.vcodec === 'none' && f.acodec !== 'none',
          }));

          const subtitles: Record<string, any[]> = {};
          if (raw.subtitles) {
            for (const [lang, subs] of Object.entries(raw.subtitles)) {
              subtitles[lang] = (subs as any[]).map(s => ({
                ext: s.ext,
                url: s.url,
                name: s.name || lang
              }));
            }
          }

          const chapters = (raw.chapters || []).map((c: any) => ({
            startTime: c.start_time,
            endTime: c.end_time,
            title: c.title
          }));

          const info: VideoInfo = {
            id: raw.id,
            title: raw.title,
            description: raw.description,
            thumbnail: raw.thumbnail,
            duration: raw.duration,
            durationString: raw.duration_string,
            channel: raw.channel,
            channelUrl: raw.channel_url,
            viewCount: raw.view_count,
            uploadDate: raw.upload_date,
            url: raw.webpage_url || target,
            webpage_url: raw.webpage_url || target,
            extractor: raw.extractor || raw.extractor_key || 'unknown',
            like_count: raw.like_count,
            formats,
            subtitles,
            chapters
          };

          resolve(info);
        } catch (e) {
          reject(new Error(`Failed to parse yt-dlp output: ${e instanceof Error ? e.message : String(e)}`));
        }
      });
    });
  }

  static async getPlaylistInfo(url: string): Promise<PlaylistInfo> {
    if (SpotifyResolver.isSpotifyPlaylistOrAlbum(url)) {
      return SpotifyResolver.resolveCollection(url);
    }

    return new Promise((resolve, reject) => {
      const ytdlp = spawn(getYtdlpPath(), [
        '--no-warnings',
        '--js-runtimes', 'node',
        '--flat-playlist',
        '--dump-single-json',
        url
      ]);
      
      let stdout = '';
      let stderr = '';

      ytdlp.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      ytdlp.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      ytdlp.on('close', (code) => {
        if (code !== 0) {
          const cleanErr = parseCleanYtdlpError(stderr, code);
          reject(new Error(cleanErr));
          return;
        }

        try {
          const raw = JSON.parse(stdout);
          const rawEntries = Array.isArray(raw.entries) ? raw.entries : [];
          
          let playlistThumb = '';
          if (Array.isArray(raw.thumbnails) && raw.thumbnails.length > 0) {
            playlistThumb = raw.thumbnails[raw.thumbnails.length - 1]?.url || '';
          } else if (typeof raw.thumbnail === 'string') {
            playlistThumb = raw.thumbnail;
          }

          const formatDuration = (sec: number): string => {
            if (!sec || isNaN(sec)) return '--:--';
            const m = Math.floor(sec / 60);
            const s = Math.floor(sec % 60);
            if (m >= 60) {
              const h = Math.floor(m / 60);
              const remM = m % 60;
              return `${h}:${remM.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
            }
            return `${m}:${s.toString().padStart(2, '0')}`;
          };

          const items: PlaylistItem[] = rawEntries.map((entry: any, idx: number) => {
            let thumb = '';
            if (Array.isArray(entry.thumbnails) && entry.thumbnails.length > 0) {
              thumb = entry.thumbnails[entry.thumbnails.length - 1]?.url || '';
            } else if (typeof entry.thumbnail === 'string') {
              thumb = entry.thumbnail;
            }

            const durationSec = typeof entry.duration === 'number' ? entry.duration : 0;
            const entryUrl = entry.url
              ? (entry.url.startsWith('http') ? entry.url : `https://www.youtube.com/watch?v=${entry.id || entry.url}`)
              : (entry.id ? `https://www.youtube.com/watch?v=${entry.id}` : url);

            return {
              id: entry.id || String(idx + 1),
              title: entry.title || `Track ${idx + 1}`,
              url: entryUrl,
              thumbnail: thumb || playlistThumb,
              duration: durationSec,
              durationString: entry.duration_string || formatDuration(durationSec),
              channel: entry.channel || entry.uploader || raw.channel || '',
              index: idx + 1,
            };
          });

          if (!playlistThumb && items.length > 0 && items[0].thumbnail) {
            playlistThumb = items[0].thumbnail;
          }

          const playlistInfo: PlaylistInfo = {
            id: raw.id || '',
            title: raw.title || 'Untitled Playlist',
            description: raw.description || '',
            channel: raw.channel || raw.uploader || '',
            thumbnail: playlistThumb,
            itemCount: items.length,
            items,
            url,
          };

          resolve(playlistInfo);
        } catch (e) {
          reject(new Error(`Failed to parse playlist output: ${e instanceof Error ? e.message : String(e)}`));
        }
      });
    });
  }

  static async getFormats(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const ytdlp = spawn(getYtdlpPath(), [
        '--no-warnings',
        '--js-runtimes', 'node',
        '-F',
        url
      ]);
      
      let stdout = '';
      let stderr = '';

      ytdlp.stdout.on('data', (data) => stdout += data.toString());
      ytdlp.stderr.on('data', (data) => stderr += data.toString());

      ytdlp.on('close', (code) => {
        if (code !== 0) reject(new Error(stderr));
        else resolve(stdout);
      });
    });
  }

  static download(options: DownloadOptions): { process: ReturnType<typeof spawn>, events: EventEmitter } {
    const events = new EventEmitter();
    const args: string[] = [];

    // Ffmpeg location
    args.push('--ffmpeg-location', getFfmpegPath());

    // Basic options
    args.push('--newline');
    args.push('--no-warnings');
    args.push('--js-runtimes', 'node');
    args.push('--retries', '10');
    args.push('--fragment-retries', '10');
    args.push('--concurrent-fragments', '4');
    
    // Output directory fallback
    const targetDir = options.outputDir || (app?.getPath ? app.getPath('downloads') : '');
    let filenamePattern = options.filenameTemplate || `%(title)s.%(ext)s`;
    if (options.renameIfConflict) {
      filenamePattern = `%(title)s (%(autonumber)d).%(ext)s`;
      args.push('--autonumber-start', '1');
    }
    const outputPath = path.join(targetDir, filenamePattern);
    args.push('-o', outputPath);

    if (options.overwrite) {
      args.push('--force-overwrites');
    }

    const validVideoContainers = ['mp4', 'mkv', 'webm', 'mov', 'avi'];
    const validAudioFormats = ['mp3', 'm4a', 'wav', 'flac', 'aac', 'ogg', 'opus'];

    // Format selection
    if (options.mode === 'video') {
      if (options.formatId && options.formatId !== 'best') {
        args.push('-f', `${options.formatId}+bestaudio/best`);
      } else {
        const height = (options.quality && options.quality !== 'best') ? options.quality.replace('p', '') : '';
        if (height) {
          args.push('-f', `bestvideo[height<=${height}]+bestaudio/best[height<=${height}]/best`);
        } else {
          args.push('-f', 'bestvideo+bestaudio/best');
        }
      }

      const container = (options.outputFormat || 'mp4').toLowerCase();

      // Prioritize resolution first (so 4K/8K downloads true 4K/8K).
      // Allow HDR (hdr:12) since 8K and high-end 4K are HDR on YouTube, and use H.264/M4A as tiebreaker for 1080p and below.
      args.push('-S', 'res,quality,fps,hdr:12,vcodec:h264,acodec:m4a');

      if (validVideoContainers.includes(container)) {
        args.push('--merge-output-format', container);
      }
    } else {
      args.push('-f', 'bestaudio/best');
      args.push('-x');
      const audioFmt = (options.audioFormat || options.outputFormat || 'mp3').toLowerCase();
      if (validAudioFormats.includes(audioFmt)) {
        args.push('--audio-format', audioFmt);
      } else {
        args.push('--audio-format', 'mp3');
      }
      if (options.audioQuality) {
        args.push('--audio-quality', options.audioQuality);
      }
    }

    // Subtitles
    if (options.embedSubtitles) {
      args.push('--embed-subs');
      if (options.subtitleLangs && options.subtitleLangs.length > 0) {
        args.push('--sub-langs', options.subtitleLangs.join(','));
      } else {
        args.push('--all-subs');
      }
    }

    // Metadata and Thumbnails
    if (options.embedMetadata) args.push('--embed-metadata');
    if (options.embedThumbnail) args.push('--embed-thumbnail');

    // Chapters
    if (options.splitChapters) args.push('--split-chapters');

    // Trimming (using ffmpeg)
    if (options.trimStart || options.trimEnd) {
      const ppArgs = [];
      if (options.trimStart) ppArgs.push(`-ss ${options.trimStart}`);
      if (options.trimEnd) ppArgs.push(`-to ${options.trimEnd}`);
      if (ppArgs.length > 0) {
        args.push('--external-downloader', 'ffmpeg');
        args.push('--external-downloader-args', `ffmpeg_i:${ppArgs.join(' ')}`);
      }
    }

    // Proxy
    if (options.proxyUrl) {
      args.push('--proxy', options.proxyUrl);
    }

    // Custom Args
    if (options.customArgs) {
      const customArgsArray = options.customArgs.match(/(?:[^\s"]+|"[^"]*")+/g) || [];
      args.push(...customArgsArray.map(a => a.replace(/(^"|"$)/g, '')));
    }

    // URL
    args.push(options.url);

    const ytdlp = spawn(getYtdlpPath(), args);

    let lastDestination = '';

    ytdlp.stdout.on('data', (data) => {
      const text = data.toString();
      text.split('\n').forEach((line: string) => {
        const destMatch = line.match(/\[(?:download|ExtractAudio)\] Destination:\s*(.+)$/i);
        if (destMatch) {
          lastDestination = destMatch[1].trim();
          events.emit('destination', lastDestination);
        }
        const mergerMatch = line.match(/\[Merger\] Merging formats into ["']?(.+?)["']?$/i);
        if (mergerMatch) {
          lastDestination = mergerMatch[1].trim();
          events.emit('destination', lastDestination);
        }
        const alreadyMatch = line.match(/\[download\]\s*(.+?)\s*has already been downloaded/i);
        if (alreadyMatch) {
          lastDestination = alreadyMatch[1].trim();
          events.emit('destination', lastDestination);
          try {
            if (fs.existsSync(lastDestination)) {
              const stats = fs.statSync(lastDestination);
              const sizeStr = formatBytes(stats.size);
              events.emit('progress', {
                percent: 100,
                speed: '',
                eta: '',
                downloaded: sizeStr,
                totalSize: sizeStr
              });
            }
          } catch (e) {}
        }

        // [download]  56.7% of ~390.11MiB at  5.67MiB/s ETA 00:25
        const percentMatch = line.match(/\[download\]\s+(?<percent>[\d.]+)%\s+of\s+~?(?<totalSize>[\d.]+[KMGT]?i?B)(?:\s+at\s+(?<speed>[\d.]+[KMGT]?i?B\/s))?(?:\s+ETA\s+(?<eta>[\d:]+))?/i);
        if (percentMatch && percentMatch.groups) {
          const percent = parseFloat(percentMatch.groups.percent || '0');
          const totalSizeStr = percentMatch.groups.totalSize || 'N/A';
          let downloaded = '0 B';

          if (totalSizeStr !== 'N/A') {
            const cleanTotal = totalSizeStr.replace('~', '').trim();
            const sizeMatch = cleanTotal.match(/^([\d.]+)\s*([a-zA-Z]+)$/);
            if (sizeMatch) {
              const totalNum = parseFloat(sizeMatch[1]);
              const unit = sizeMatch[2];
              if (!isNaN(totalNum)) {
                const dlNum = totalNum * (percent / 100);
                downloaded = `${dlNum.toFixed(2)} ${unit}`;
              }
            }
          }

          if (!isNaN(percent)) {
            events.emit('progress', {
              percent,
              speed: percentMatch.groups.speed || 'N/A',
              eta: percentMatch.groups.eta || 'N/A',
              downloaded,
              totalSize: totalSizeStr
            });
          }
        } else {
          // Fallback for unbounded streams
          const rawSizeMatch = line.match(/\[download\]\s+(?<size>~?[\d.]+[KMGT]?i?B)\s+at\s+(?<speed>[\d.]+[KMGT]?i?B\/s)/i);
          if (rawSizeMatch && rawSizeMatch.groups) {
            events.emit('progress', {
              percent: 0,
              speed: rawSizeMatch.groups.speed || 'N/A',
              eta: 'N/A',
              downloaded: rawSizeMatch.groups.size.replace('~', '').trim(),
              totalSize: 'N/A'
            });
          }
        }
      });
    });

    let stderr = '';
    ytdlp.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    ytdlp.on('close', (code) => {
      if (code === 0) {
        events.emit('complete', lastDestination || outputPath);
      } else {
        const cleanErr = parseCleanYtdlpError(stderr, code);
        events.emit('error', new Error(cleanErr));
      }
    });

    return { process: ytdlp, events };
  }
}
