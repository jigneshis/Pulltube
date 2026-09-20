import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, useNavigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import HomePage from './pages/HomePage';
import DownloadsPage from './pages/DownloadsPage';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';
import { useDownloadStore } from './stores/useDownloadStore';
import { useSettingsStore } from './stores/useSettingsStore';
import { useThemeStore } from './stores/useThemeStore';
import { ToastProvider } from './components/ui/Toast';
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
  const theme = useThemeStore(state => state.theme);

  useEffect(() => {
    subscribeToEvents();
    loadSettings();
  }, [subscribeToEvents, loadSettings]);

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
    </ToastProvider>
  );
}
