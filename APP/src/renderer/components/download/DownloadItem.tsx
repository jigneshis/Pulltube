import React from 'react';
import { Play, Pause, X, FolderOpen, FileVideo } from 'lucide-react';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';
import { Badge, BadgeVariant } from '../ui/Badge';
import { Button } from '../ui/Button';
import { DownloadTask } from '../../../shared/types';
import { formatUserFacingError } from '../../lib/error-formatter';

const cn = (...classes: (string | boolean | undefined | null)[]) => classes.filter(Boolean).join(' ');

interface DownloadItemProps {
  task: DownloadTask;
  onPauseResume?: (id: string) => void;
  onCancel?: (id: string) => void;
  onOpenFile?: (id: string) => void;
  onOpenFolder?: (id: string) => void;
}

export const DownloadItem: React.FC<DownloadItemProps> = ({
  task,
  onPauseResume,
  onCancel,
  onOpenFile,
  onOpenFolder
}) => {
  const { id, title, thumbnail, status, progress, speed, eta, downloadedSize, filesize } = task;

  const getBadgeVariant = (): BadgeVariant => {
    switch(status) {
      case 'downloading': return 'downloading';
      case 'converting': return 'converting';
      case 'done': return 'done';
      case 'error': return 'error';
      case 'paused': return 'paused';
      case 'cancelled': return 'cancelled';
      case 'queued':
      default: return 'queued';
    }
  };

  const formatSize = (bytes?: number | string) => {
    if (!bytes || bytes === 'Unknown' || bytes === 'N/A' || bytes === '0 B' || bytes === '0.00 B') return '0 B';
    if (typeof bytes === 'string') {
      const trimmed = bytes.trim();
      if (/^0+(\.0+)?\s*[a-zA-Z]*$/.test(trimmed)) return '0 B';
      if (/[a-zA-Z]/.test(trimmed)) return trimmed;
      const num = parseFloat(trimmed);
      if (isNaN(num)) return trimmed;
      bytes = num;
    }
    const numBytes = Number(bytes);
    if (numBytes <= 0 || isNaN(numBytes)) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(numBytes) / Math.log(k));
    return parseFloat((numBytes / Math.pow(k, i)).toFixed(1)) + ' ' + (sizes[i] || 'B');
  };

  const formatSpeed = (bytesPerSec?: number | string) => {
    if (!bytesPerSec || bytesPerSec === 'N/A') return '';
    if (typeof bytesPerSec === 'string') {
      if (bytesPerSec.includes('/s')) return bytesPerSec;
      return `${formatSize(bytesPerSec)}/s`;
    }
    return `${formatSize(bytesPerSec)}/s`;
  };

  const getComputedDownloaded = () => {
    if (status === 'done' && filesize && filesize !== '0 B') {
      return formatSize(filesize);
    }
    if (downloadedSize && downloadedSize !== '0 B' && downloadedSize !== 'N/A') {
      return formatSize(downloadedSize);
    }
    if (filesize && filesize !== 'N/A' && filesize !== '0 B' && progress > 0) {
      const match = String(filesize).replace('~', '').trim().match(/^([\d.]+)\s*([a-zA-Z]+)$/);
      if (match) {
        const total = parseFloat(match[1]);
        const unit = match[2];
        if (!isNaN(total)) {
          return `${(total * (progress / 100)).toFixed(2)} ${unit}`;
        }
      }
    }
    return '0 B';
  };

  const displayFileSize = filesize && filesize !== '0 B' && filesize !== 'N/A'
    ? formatSize(filesize)
    : (downloadedSize && downloadedSize !== '0 B' && downloadedSize !== 'N/A' ? formatSize(downloadedSize) : null);

  return (
    <Card padding="sm" className="relative group overflow-hidden">
      {status === 'downloading' && (
        <div 
          className="absolute inset-0 bg-violet-500/5 opacity-50"
          style={{ width: `${progress}%`, transition: 'width 0.5s ease' }}
        />
      )}
      
      <div className="relative flex items-center gap-4">
        <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-white/5">
          {thumbnail ? (
             <img src={thumbnail} alt={title} className="w-full h-full object-cover" />
          ) : (
             <FileVideo className="w-8 h-8 m-4 text-white/20" />
          )}
        </div>

        <div className="flex flex-col flex-1 min-w-0 py-1">
          <div className="flex items-center justify-between mb-1 gap-4">
            <h3 className="text-white font-medium truncate" title={title}>{title}</h3>
            <Badge variant={getBadgeVariant()} size="sm" className="capitalize shrink-0">
              {status}
            </Badge>
          </div>
          
          <ProgressBar progress={status === 'done' ? 100 : progress} height="thin" className="my-1.5" />
          
          <div className="flex items-center justify-between text-xs text-white/50 mt-1">
            {status === 'error' ? (
              <span
                className="text-rose-400 font-medium truncate max-w-full"
                title={task.error ? formatUserFacingError(task.error).rawDetails : 'Download failed'}
              >
                {task.error
                  ? formatUserFacingError(task.error).explanation
                  : 'Download failed. Click play to retry.'}
              </span>
            ) : status === 'done' ? (
              <div className="flex items-center gap-2 text-white/60">
                <span className="font-medium text-emerald-400">Complete</span>
                {displayFileSize && (
                  <>
                    <span>•</span>
                    <span className="text-white/80 font-medium">{displayFileSize}</span>
                  </>
                )}
                {task.options?.outputFormat && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-violet-500/20 text-violet-300 border border-violet-500/30">
                    {task.options.outputFormat}
                  </span>
                )}
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  {(downloadedSize || filesize) && (
                    <span>{getComputedDownloaded()} / {formatSize(filesize)}</span>
                  )}
                  {speed && <span>• {formatSpeed(speed)}</span>}
                </div>
                {eta && status === 'downloading' && <span>ETA: {eta}</span>}
              </>
            )}
          </div>
        </div>

        <div className={cn(
          "flex items-center gap-2 shrink-0 transition-opacity pr-2",
          status === 'done' ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )}>
          {status === 'done' ? (
            <div className="flex items-center gap-2">
              <Button 
                size="sm" 
                variant="secondary" 
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white/90 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg transition-all"
                onClick={() => onOpenFile?.(id)} 
                title="Open file"
              >
                <Play className="w-3.5 h-3.5 fill-current text-violet-400" />
                <span>Open</span>
              </Button>
              <Button 
                size="sm" 
                variant="secondary" 
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg transition-all"
                onClick={() => onOpenFolder?.(id)} 
                title="Show in Folder"
              >
                <FolderOpen className="w-3.5 h-3.5" />
                <span>Folder</span>
              </Button>
              {onCancel && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="p-1.5 text-white/40 hover:text-white/80 hover:bg-white/10 rounded-lg transition-all"
                  onClick={() => onCancel(id)}
                  title="Dismiss from list"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          ) : (
            <>
              {(status === 'downloading' || status === 'paused' || status === 'error') && (
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="p-2" 
                  onClick={() => onPauseResume?.(id)}
                  title={status === 'paused' ? 'Resume' : (status === 'error' ? 'Retry Download' : 'Pause')}
                >
                  {status === 'paused' || status === 'error' ? <Play className="w-4 h-4 text-green-400" /> : <Pause className="w-4 h-4 text-amber-400" />}
                </Button>
              )}
              {status !== 'cancelled' && (
                <Button size="sm" variant="ghost" className="p-2" onClick={() => onCancel?.(id)} title="Cancel Download">
                  <X className="w-4 h-4 text-red-400" />
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </Card>
  );
};
