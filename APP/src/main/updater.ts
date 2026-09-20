import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import { app } from 'electron';
import { getYtdlpPath } from './ytdlp-wrapper';

export class YtDlpUpdater {
  static async getLatestVersion(): Promise<string> {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.github.com',
        path: '/repos/yt-dlp/yt-dlp/releases/latest',
        headers: { 'User-Agent': 'PullTube-App' }
      };

      https.get(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            if (res.statusCode === 200) {
              const release = JSON.parse(data);
              resolve(release.tag_name);
            } else {
              reject(new Error(`GitHub API returned ${res.statusCode}`));
            }
          } catch (e) {
            reject(e);
          }
        });
      }).on('error', reject);
    });
  }

  static async update(): Promise<{ success: boolean; version: string; error?: string }> {
    try {
      const latestVersion = await this.getLatestVersion();
      const binaryPath = getYtdlpPath();
      
      const downloadUrl = process.platform === 'win32' 
        ? `https://github.com/yt-dlp/yt-dlp/releases/download/${latestVersion}/yt-dlp.exe`
        : process.platform === 'darwin'
        ? `https://github.com/yt-dlp/yt-dlp/releases/download/${latestVersion}/yt-dlp_macos`
        : `https://github.com/yt-dlp/yt-dlp/releases/download/${latestVersion}/yt-dlp`;

      await this.downloadBinary(downloadUrl, binaryPath);

      if (process.platform !== 'win32') {
        fs.chmodSync(binaryPath, 0o755); // Ensure executable
      }

      return { success: true, version: latestVersion };
    } catch (e) {
      return { success: false, version: '', error: e instanceof Error ? e.message : String(e) };
    }
  }

  private static downloadBinary(url: string, dest: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(dest);
      
      const request = (targetUrl: string) => {
        https.get(targetUrl, (res) => {
          if (res.statusCode === 301 || res.statusCode === 302) {
            if (res.headers.location) {
              request(res.headers.location);
              return;
            }
          }
          
          if (res.statusCode !== 200) {
            fs.unlink(dest, () => reject(new Error(`Failed to download, status: ${res.statusCode}`)));
            return;
          }

          res.pipe(file);
          
          file.on('finish', () => {
            file.close();
            resolve();
          });
        }).on('error', (err) => {
          fs.unlink(dest, () => reject(err));
        });
      };

      request(url);
    });
  }
}
