import { app, BrowserWindow } from 'electron';
import * as https from 'https';
import { IPC_CHANNELS } from '../shared/constants';
import { AppUpdateCheckResult } from '../shared/types';

export class AutoUpdaterWorker {
  private static mainWindow: BrowserWindow | null = null;
  private static timer: NodeJS.Timeout | null = null;
  private static isChecking = false;

  static init(window: BrowserWindow) {
    this.mainWindow = window;

    // Run initial check 6 seconds after launch to ensure window is fully loaded
    setTimeout(() => {
      this.checkAndNotify();
    }, 6000);

    // Periodically check every 4 hours
    this.timer = setInterval(() => {
      this.checkAndNotify();
    }, 4 * 60 * 60 * 1000);
  }

  static async checkForUpdates(): Promise<AppUpdateCheckResult> {
    if (this.isChecking) {
      return { hasUpdate: false, latestVersion: app.getVersion() };
    }

    this.isChecking = true;
    try {
      const release = await this.fetchLatestRelease();
      const currentVersion = app.getVersion().trim().replace(/^v/i, '');
      const latestTag = (release.tag_name || '').trim().replace(/^v/i, '');

      if (!latestTag) {
        return { hasUpdate: false, latestVersion: currentVersion, error: 'No tag found on GitHub release' };
      }

      const hasUpdate = this.isNewer(latestTag, currentVersion);
      let downloadUrl = '';
      if (Array.isArray(release.assets)) {
        const exeAsset = release.assets.find(
          (a: any) => a.name?.endsWith('.exe') && !a.name.toLowerCase().includes('updater')
        );
        if (exeAsset) {
          downloadUrl = exeAsset.browser_download_url;
        }
      }

      return {
        hasUpdate,
        latestVersion: latestTag,
        releaseNotes: release.body || '',
        downloadUrl,
      };
    } catch (err: any) {
      return {
        hasUpdate: false,
        latestVersion: app.getVersion(),
        error: err?.message || 'Failed to check GitHub releases',
      };
    } finally {
      this.isChecking = false;
    }
  }

  private static async checkAndNotify() {
    const result = await this.checkForUpdates();
    if (result.hasUpdate && this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send(IPC_CHANNELS.APP_UPDATE_AVAILABLE, {
        version: result.latestVersion,
        releaseNotes: result.releaseNotes || '',
      });
    }
  }

  private static fetchLatestRelease(): Promise<any> {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.github.com',
        path: '/repos/jigneshis/Pulltube/releases/latest',
        headers: {
          'User-Agent': 'PullTube-App',
          Accept: 'application/vnd.github.v3+json',
        },
      };

      const req = https.get(options, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            if (res.statusCode === 200) {
              resolve(JSON.parse(data));
            } else if (res.statusCode === 404) {
              resolve({ tag_name: app.getVersion() });
            } else {
              reject(new Error(`GitHub API returned status ${res.statusCode}`));
            }
          } catch (e) {
            reject(e);
          }
        });
      });

      req.on('error', (err) => reject(err));
      req.setTimeout(10000, () => {
        req.destroy();
        reject(new Error('Update check request timed out'));
      });
    });
  }

  private static isNewer(latest: string, current: string): boolean {
    const parse = (v: string) => v.split('.').map((p) => parseInt(p, 10) || 0);
    const [lMaj = 0, lMin = 0, lPat = 0] = parse(latest);
    const [cMaj = 0, cMin = 0, cPat = 0] = parse(current);

    if (lMaj > cMaj) return true;
    if (lMaj < cMaj) return false;
    if (lMin > cMin) return true;
    if (lMin < cMin) return false;
    return lPat > cPat;
  }
}
