import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSettingsStore } from '../stores/useSettingsStore';
import { useThemeStore } from '../stores/useThemeStore';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Toggle } from '../components/ui/Toggle';
import { Slider } from '../components/ui/Slider';
import { FolderSearch, Download, Moon, Sun, Settings2, Shield, RefreshCw, Bell, Volume2, ArrowUpCircle } from 'lucide-react';
import { api } from '../lib/ipc';
import { BrandLogo } from '../components/ui/BrandLogo';
import { playCompletionSound } from '../lib/sound';
import { useToast } from '../components/ui/Toast';

export default function SettingsPage() {
  const settings = useSettingsStore();
  const themeState = useThemeStore();
  const [versions, setVersions] = useState({ app: '', ytdlp: '', ffmpeg: '' });

  const [checkingAppUpdate, setCheckingAppUpdate] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    api.getVersions().then(setVersions).catch(console.error);
  }, []);

  const handleUpdateYtdlp = async () => {
    try {
      const res = await api.updateYtdlp();
      setVersions(prev => ({ ...prev, ytdlp: res.version }));
      toast({ type: 'success', title: 'Core updated', message: `yt-dlp is now at ${res.version}` });
    } catch (e: any) {
      console.error(e);
      toast({ type: 'error', title: 'Update failed', message: e.message || String(e) });
    }
  };

  const handleLaunchAppUpdater = async () => {
    setCheckingAppUpdate(true);
    try {
      if (api?.checkForAppUpdates) {
        toast({ type: 'info', title: 'Checking for updates...', message: 'Connecting to GitHub releases' });
        const check = await api.checkForAppUpdates();
        if (check.hasUpdate) {
          toast({
            type: 'success',
            title: `Update v${check.latestVersion} Available!`,
            message: 'Launching updater...',
          });
          await api.launchAppUpdater();
        } else {
          toast({
            type: 'success',
            title: 'You are up to date!',
            message: `PullTube v${versions.app || check.latestVersion} is the latest version.`,
          });
        }
      } else {
        await api.launchAppUpdater();
      }
    } catch (e: any) {
      console.error(e);
      toast({ type: 'error', title: 'Update check failed', message: e.message || String(e) });
    } finally {
      setCheckingAppUpdate(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 8 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.18, ease: 'easeOut' }} 
      className="py-8 pb-16 h-full flex flex-col overflow-y-auto pr-4"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-white">
          Settings
        </h1>
        <p className="text-white/50 text-sm mt-1">Configure your PullTube experience</p>
      </div>

      <div className="space-y-6">
        <section>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Download size={20} className="text-violet-400" />
            General
          </h2>
          <Card className="p-5 space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-white/80">Download Location</label>
              <div className="flex gap-2">
                <Input 
                  value={settings.downloadDir} 
                  readOnly 
                  className="flex-1 font-mono text-sm"
                />
                <Button variant="secondary" icon={FolderSearch} onClick={settings.selectDownloadDir}>
                  Browse
                </Button>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-white/80">Concurrent Downloads</label>
                <span className="text-violet-400 font-medium">{settings.concurrentDownloads}</span>
              </div>
              <Slider 
                min={1} max={5} step={1} 
                value={settings.concurrentDownloads} 
                onChange={(val) => settings.updateSetting('concurrentDownloads', val)} 
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <div>
                <div className="text-sm font-medium text-white/90">Default Color Dynamic Range</div>
                <div className="text-xs text-white/50">
                  {settings.defaultColorRange === 'hdr'
                    ? 'HDR selected: Prioritizes 10-bit color, with smart SDR fallback.'
                    : 'SDR selected: Universal player compatibility (smartly falls back to HDR if only HDR exists).'}
                </div>
              </div>
              <div className="flex items-center p-1 bg-white/5 rounded-xl border border-white/10 text-xs">
                <button
                  type="button"
                  onClick={() => settings.updateSetting('defaultColorRange', 'sdr')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                    (!settings.defaultColorRange || settings.defaultColorRange === 'sdr')
                      ? 'bg-violet-600 text-white shadow-md'
                      : 'text-white/50 hover:text-white'
                  }`}
                >
                  SDR (Default)
                </button>
                <button
                  type="button"
                  onClick={() => settings.updateSetting('defaultColorRange', 'hdr')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                    settings.defaultColorRange === 'hdr'
                      ? 'bg-violet-600 text-white shadow-md'
                      : 'text-white/50 hover:text-white'
                  }`}
                >
                  HDR
                </button>
              </div>
            </div>

            <Toggle 
              label="Start with Windows" 
              checked={settings.startWithWindows} 
              onChange={(val) => settings.updateSetting('startWithWindows', val)} 
            />
          </Card>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Sun size={20} className="text-violet-400" />
            Appearance
          </h2>
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Dark Mode</div>
                <div className="text-sm text-white/50">Toggle between dark and light themes</div>
              </div>
              <Toggle 
                checked={themeState.theme === 'dark'} 
                onChange={themeState.toggleTheme} 
              />
            </div>
          </Card>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Bell size={20} className="text-violet-400" />
            Notifications & Sound
          </h2>
          <Card className="p-5 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Desktop Notifications</div>
                <div className="text-sm text-white/50">Show a desktop alert when all downloads in the queue finish</div>
              </div>
              <Toggle 
                checked={settings.notificationsEnabled} 
                onChange={(val) => settings.updateSetting('notificationsEnabled', val)} 
              />
            </div>

            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
              <div>
                <div className="font-medium">Completion Chime</div>
                <div className="text-sm text-white/50">Play a satisfying sound effect when all downloads finish</div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  variant="secondary"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-violet-300 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 rounded-lg transition-all"
                  onClick={() => playCompletionSound()}
                  title="Test notification sound"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Preview</span>
                </Button>
                <Toggle 
                  checked={settings.notificationSoundEnabled} 
                  onChange={(val) => settings.updateSetting('notificationSoundEnabled', val)} 
                />
              </div>
            </div>
          </Card>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Shield size={20} className="text-violet-400" />
            Network
          </h2>
          <Card className="p-5 space-y-4">
            <Toggle 
              label="Enable Proxy" 
              checked={settings.proxyEnabled} 
              onChange={(val) => settings.updateSetting('proxyEnabled', val)} 
            />
            {settings.proxyEnabled && (
              <Input 
                placeholder="http://127.0.0.1:8080" 
                value={settings.proxyUrl} 
                onChange={(e) => settings.updateSetting('proxyUrl', e.target.value)} 
              />
            )}
          </Card>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Settings2 size={20} className="text-violet-400" />
            Advanced
          </h2>
          <Card className="p-5 space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-white/80">Custom yt-dlp Arguments</label>
              <Input 
                placeholder="--limit-rate 5M" 
                value={settings.customYtdlpArgs} 
                onChange={(e) => settings.updateSetting('customYtdlpArgs', e.target.value)} 
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Auto-update yt-dlp</div>
                <div className="text-sm text-white/50">Keep the core downloader updated automatically</div>
              </div>
              <Toggle 
                checked={settings.autoUpdateYtdlp} 
                onChange={(val) => settings.updateSetting('autoUpdateYtdlp', val)} 
              />
            </div>

            <div className="pt-4 border-t border-white/10 flex justify-between items-center">
              <div>
                <div className="text-sm text-white/70">App Version: {versions.app || '...'}</div>
                <div className="text-sm text-white/70">yt-dlp: {versions.ytdlp || '...'}</div>
                <div className="text-sm text-white/70">FFmpeg: {versions.ffmpeg || '...'}</div>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="secondary" 
                  icon={ArrowUpCircle} 
                  onClick={handleLaunchAppUpdater}
                  disabled={checkingAppUpdate}
                >
                  {checkingAppUpdate ? 'Checking GitHub...' : 'Check for App Update'}
                </Button>
                <Button variant="secondary" icon={RefreshCw} onClick={handleUpdateYtdlp}>
                  Update Core
                </Button>
              </div>
            </div>
          </Card>
        </section>

        <section>
          <Card className="p-5 flex items-center gap-4 bg-white/[0.03] border-white/10">
            <BrandLogo size="lg" />
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                PullTube
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 font-medium">
                  v{versions.app || '1.1.2'}
                </span>
              </h3>
              <p className="text-xs text-white/50 mt-1">
                Universal desktop video & audio downloader powered by yt-dlp & FFmpeg.
              </p>
            </div>
          </Card>
        </section>
      </div>
    </motion.div>
  );
}
