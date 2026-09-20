import React from 'react';
import { BrandLogo } from '../ui/BrandLogo';

export default function Titlebar() {
  return (
    <div className="h-8 w-full glass-panel border-x-0 border-t-0 rounded-none flex items-center justify-between px-4 drag-region z-50">
      <div className="flex items-center gap-2 text-white/50 text-xs font-medium">
        <BrandLogo size="xs" />
        <span>PullTube</span>
      </div>
      <div className="flex items-center h-full no-drag">
        {/* Only placeholder for custom window controls if native overlay isn't used */}
      </div>
    </div>
  );
}
