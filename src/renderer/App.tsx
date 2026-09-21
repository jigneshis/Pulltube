import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, useNavigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import HomePage from './pages/HomePage';
import DownloadsPage from './pages/DownloadsPage';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';
import { useDownloadStore } from './stores/useDownloadStore';
import { useSettingsStore } from './stores/useSettingsStore';
import { useThemeStore } from './stores/useThemeStore';
import { ToastProvider, useToast } from './components/ui/Toast';
import { WhatsNewModal } from './components/ui/WhatsNewModal';
import { api } from './lib/ipc';
import { playCompletionSound } from './lib/sound';

function NavigationListener() {
  const navigate = useNavigate();

  useEffect(() => {
    if (api?.onNavigateTo) {
      const unsubscribe = api.onNavigateTo((path: string) => {
        if (path) {
          navigate(path);
        }
      });
      return unsubscribe;
    }
  }, [navigate]);

  return null;
}

export default function App() {
  const subscribeToEvents = useDownloadStore(state => state.subscribeToEvents);
  const loadSettings = useSettingsStore(state => state.loadSettings);
  const setAvailableUpdate = useSettingsStore(state => state.setAvailableUpdate);
  const theme = useThemeStore(state => state.theme);

  const [whatsNewOpen, setWhatsNewOpen] = useState(false);
  const [appVersion, setAppVersion] = useState('1.0.1');

  useEffect(() => {
    subscribeToEvents();
    loadSettings();

    // Check version state on launch
    const checkVersion = async () => {
      try {
        if (api?.getAppVersionState) {
          const state = await api.getAppVersionState();
          setAppVersion(state.currentVersion);
          if (state.isPostUpdate) {
            setWhatsNewOpen(true);
          }
        }
      } catch (err) {
        console.warn('Could not retrieve app version state:', err);
      }
    };
    checkVersion();
  }, [subscribeToEvents, loadSettings]);

  useEffect(() => {
    if (api?.onAppUpdateAvailable) {
      const unsubscribe = api.onAppUpdateAvailable((info) => {
        setAvailableUpdate(info);
      });
      return unsubscribe;
    }
  }, [setAvailableUpdate]);

  useEffect(() => {
    if (api?.onQueueComplete) {
      const unsubscribe = api.onQueueComplete(() => {
        const settings = useSettingsStore.getState();
        if (settings.notificationSoundEnabled) {
          playCompletionSound();
        }
      });
      return unsubscribe;
    }
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [theme]);

  const handleAcknowledgeVersion = async () => {
    try {
      if (api?.acknowledgeVersion) {
        await api.acknowledgeVersion(appVersion);
      }
    } catch {}
    setWhatsNewOpen(false);
  };

  return (
    <ToastProvider>
      <HashRouter>
        <NavigationListener />
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="downloads" element={<DownloadsPage />} />
            <Route path="history" element={<HistoryPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </HashRouter>

      {/* Post-Update "What's New" Welcome Modal */}
      <WhatsNewModal
        isOpen={whatsNewOpen}
        version={appVersion}
        onClose={handleAcknowledgeVersion}
      />
    </ToastProvider>
  );
}
