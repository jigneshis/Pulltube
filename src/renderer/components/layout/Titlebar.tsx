import React from 'react';
import { BrandLogo } from '../ui/BrandLogo';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { api } from '../../lib/ipc';
import { Sparkles } from 'lucide-react';

export default function Titlebar() {
  const availableUpdate = useSettingsStore(state => state.availableUpdate);

  return (
    <div className="h-8 w-full glass-panel border-x-0 border-t-0 rounded-none flex items-center justify-between px-4 drag-region z-50">
      <div className="flex items-center gap-2 text-white/50 text-xs font-medium">
        <BrandLogo size="xs" />
        <span>PullTube</span>
      </div>
      <div className="flex items-center h-full no-drag pr-32">
        {availableUpdate && (
          <button
            onClick={() => api.launchAppUpdater()}
            className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-violet-600/30 hover:bg-violet-600/50 border border-violet-500/40 text-[11px] font-medium text-violet-200 transition-all hover:scale-105"
            title="Click to launch updater"
          >
            <Sparkles className="w-3 h-3 text-violet-300 animate-pulse" />
            <span>Update v{availableUpdate.version} Available</span>
          </button>
        )}
      </div>
    </div>
  );
}
