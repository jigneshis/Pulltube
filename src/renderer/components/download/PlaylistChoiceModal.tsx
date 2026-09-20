import React from 'react';
import { Modal } from '../ui/Modal';
import { Film, ListVideo, ArrowRight } from 'lucide-react';

interface PlaylistChoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSingle: () => void;
  onSelectPlaylist: () => void;
}

export const PlaylistChoiceModal: React.FC<PlaylistChoiceModalProps> = ({
  isOpen,
  onClose,
  onSelectSingle,
  onSelectPlaylist,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Playlist Link Detected">
      <div className="flex flex-col gap-4">
        <p className="text-sm text-white/60">
          This link includes an individual video as part of a playlist. How would you like to proceed?
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
          {/* Option 1: Single Video */}
          <button
            onClick={() => {
              onClose();
              onSelectSingle();
            }}
            className="group flex flex-col items-start p-5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-violet-500/40 transition-all text-left relative overflow-hidden"
          >
            <div className="p-3 rounded-lg bg-white/5 group-hover:bg-violet-500/20 text-white/80 group-hover:text-violet-300 mb-3 transition-colors">
              <Film className="w-6 h-6" />
            </div>
            <div className="font-semibold text-white group-hover:text-violet-200 transition-colors">
              Single Video
            </div>
            <div className="text-xs text-white/50 mt-1 leading-relaxed">
              Process only this current video with single quality and subtitle selection.
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Choose video</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </button>

          {/* Option 2: Entire Playlist */}
          <button
            onClick={() => {
              onClose();
              onSelectPlaylist();
            }}
            className="group flex flex-col items-start p-5 rounded-xl bg-violet-950/20 hover:bg-violet-900/30 border border-violet-500/30 hover:border-violet-500/60 transition-all text-left relative overflow-hidden shadow-lg shadow-violet-950/20"
          >
            <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-violet-500/20 text-[10px] font-medium text-violet-300 border border-violet-500/30">
              Batch
            </div>
            <div className="p-3 rounded-lg bg-violet-500/20 text-violet-300 mb-3 group-hover:scale-105 transition-transform">
              <ListVideo className="w-6 h-6" />
            </div>
            <div className="font-semibold text-white group-hover:text-violet-200 transition-colors">
              Entire Playlist
            </div>
            <div className="text-xs text-white/50 mt-1 leading-relaxed">
              Load all items in this playlist, select which ones to keep, and batch download.
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-violet-300 opacity-90 group-hover:opacity-100 transition-opacity">
              <span>Open playlist</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </button>
        </div>

        <div className="flex justify-end mt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-white/40 hover:text-white/80 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
};
