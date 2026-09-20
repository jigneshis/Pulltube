import { 
  VideoInfo, FormatInfo, DownloadOptions, 
  DownloadTask, DownloadHistory, AppSettings 
} from '../../shared/types';

import { ElectronAPI } from '../../shared/types';

// Type-safe wrapper with dev fallback
export const api: ElectronAPI = typeof window !== 'undefined' && window.electronAPI 
  ? window.electronAPI 
  : new Proxy({} as ElectronAPI, {
      get() {
        return () => { throw new Error('Electron API is not available in this environment'); };
      }
    });
