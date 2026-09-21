import Store from 'electron-store';
import { AppSettings, DownloadHistory } from '../shared/types';

export const DEFAULT_SETTINGS: AppSettings = {
  downloadDir: '', // Will be set to app.getPath('downloads') in main
  concurrentDownloads: 3,
  theme: 'dark',
  autoUpdateYtdlp: true,
  proxyUrl: '',
  proxyEnabled: false,
  notificationsEnabled: true,
  notificationSoundEnabled: true,
  minimizeToTray: false,
  closeToTray: false,
  startWithWindows: false,
  customYtdlpArgs: '',
  defaultFormat: 'best',
  defaultQuality: '1080p',
  defaultMode: 'video',
};

interface StoreSchema {
  settings: AppSettings;
  history: DownloadHistory[];
  lastSeenVersion?: string;
}

class AppStore {
  private store: Store<StoreSchema>;

  constructor() {
    this.store = new Store<StoreSchema>({
      defaults: {
        settings: DEFAULT_SETTINGS,
        history: [],
      },
    });
  }

  getSettings(): AppSettings {
    return this.store.get('settings');
  }

  saveSettings(settings: Partial<AppSettings>): void {
    const current = this.getSettings();
    this.store.set('settings', { ...current, ...settings });
  }

  getLastSeenVersion(): string | undefined {
    return this.store.get('lastSeenVersion');
  }

  setLastSeenVersion(version: string): void {
    this.store.set('lastSeenVersion', version);
  }

  getHistory(): DownloadHistory[] {
    return this.store.get('history') || [];
  }

  addToHistory(item: DownloadHistory): void {
    const history = this.getHistory();
    history.unshift(item);
    // Keep only last 1000 items to avoid bloated store
    if (history.length > 1000) {
      history.length = 1000;
    }
    this.store.set('history', history);
  }

  deleteHistoryItem(id: string): void {
    const history = this.getHistory();
    this.store.set('history', history.filter(h => h.id !== id));
  }

  clearHistory(): void {
    this.store.set('history', []);
  }
}

export const appStore = new AppStore();
