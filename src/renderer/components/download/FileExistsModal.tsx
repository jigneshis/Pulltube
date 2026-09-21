import React from 'react';
import { Modal } from '../ui/Modal';
import { AlertTriangle, RefreshCw, Copy, X, FolderCheck } from 'lucide-react';

interface FileExistsModalProps {
  isOpen: boolean;
  fileName: string;
  folderPath?: string;
  onOverwrite: () => void;
  onKeepBoth: () => void;
  onCancel: () => void;
}

export const FileExistsModal: React.FC<FileExistsModalProps> = ({
  isOpen,
  fileName,
  folderPath,
  onOverwrite,
  onKeepBoth,
  onCancel,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title="File Already Exists">
      <div className="flex flex-col gap-4">
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-amber-500/20 text-amber-300 flex-shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold text-amber-200 uppercase tracking-wider">
              Duplicate Detected
            </div>
            <div className="text-sm font-medium text-white truncate mt-0.5" title={fileName}>
              {fileName}
            </div>
            {folderPath && (
              <div className="text-[11px] text-white/40 truncate mt-1 flex items-center gap-1">
                <FolderCheck className="w-3.5 h-3.5 text-white/30 flex-shrink-0" />
                <span className="truncate">{folderPath}</span>
              </div>
            )}
          </div>
        </div>

        <p className="text-xs text-white/60 leading-relaxed">
          A file with this name already exists in your destination folder. How would you like to proceed?
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
          {/* Choice 1: Keep Both */}
          <button
            onClick={onKeepBoth}
            className="group flex flex-col items-start p-4 rounded-xl bg-violet-600/15 hover:bg-violet-600/25 border border-violet-500/30 hover:border-violet-500/60 transition-all text-left relative overflow-hidden"
          >
            <div className="p-2 rounded-lg bg-violet-500/20 text-violet-300 mb-2 group-hover:scale-105 transition-transform">
              <Copy className="w-4 h-4" />
            </div>
            <div className="font-semibold text-xs text-white group-hover:text-violet-200 transition-colors">
              Keep Both (Auto-Rename)
            </div>
            <div className="text-[11px] text-white/50 mt-1 leading-normal">
              Saves as a new copy with an incremented number (e.g. filename (1).mp4).
            </div>
          </button>

          {/* Choice 2: Overwrite */}
          <button
            onClick={onOverwrite}
            className="group flex flex-col items-start p-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 hover:border-red-500/50 transition-all text-left relative overflow-hidden"
          >
            <div className="p-2 rounded-lg bg-red-500/20 text-red-300 mb-2 group-hover:scale-105 transition-transform">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div className="font-semibold text-xs text-white group-hover:text-red-200 transition-colors">
              Overwrite Existing File
            </div>
            <div className="text-[11px] text-white/50 mt-1 leading-normal">
              Replaces the old file in your download folder with this fresh download.
            </div>
          </button>
        </div>

        <div className="flex justify-end items-center gap-2 mt-2 pt-2 border-t border-white/5">
          <button
            onClick={onCancel}
            className="flex items-center gap-1 px-4 py-2 rounded-lg text-xs font-medium text-white/50 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            <span>Cancel Download</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
