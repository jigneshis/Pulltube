import { create } from 'zustand';
import { AppSettings } from '../../shared/types';
import { api } from '../lib/ipc';

interface SettingsState extends AppSettings {
  isLoaded: boolean;
  loadSettings: () => Promise<void>;
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => Promise<void>;
  selectDownloadDir: () => Promise<void>;
}

const defaultSettings: AppSettings = {
  downloadDir: '',
  concurrentDownloads: 3,
  startWithWindows: false,
  theme: 'dark',
  proxyEnabled: false,
  proxyUrl: '',
  customYtdlpArgs: '',
  autoUpdateYtdlp: true,
  notificationsEnabled: true,
  notificationSoundEnabled: true,
  defaultFormat: 'best',
  defaultQuality: 'best',
  defaultMode: 'video',
  minimizeToTray: false,
  closeToTray: false
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  ...defaultSettings,
  isLoaded: false,
  
  loadSettings: async () => {
    try {
      const settings = await api.getSettings();
      set({ ...defaultSettings, ...settings, isLoaded: true });
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  },
  
  updateSetting: async (key, value) => {
    set({ [key]: value });
    try {
      await api.saveSettings({ [key]: value });
    } catch (err) {
      console.error(`Failed to save setting ${key}:`, err);
    }
  },
  
  selectDownloadDir: async () => {
    try {
      const folder = await api.selectFolder();
      if (folder) {
        await get().updateSetting('downloadDir', folder);
      }
    } catch (err) {
      console.error('Failed to select folder:', err);
    }
  }
}));
