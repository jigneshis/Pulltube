import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings2,
  ChevronDown,
  Subtitles,
  Image as ImageIcon,
  Tags,
  Bookmark,
  Scissors,
  Clock,
  SunMedium,
} from 'lucide-react';
import { Toggle } from '../ui/Toggle';
import { DownloadOptions as IDownloadOptions } from '../../../shared/types';

const cn = (...classes: (string | boolean | undefined | null)[]) => classes.filter(Boolean).join(' ');

interface DownloadOptionsProps {
  options: IDownloadOptions;
  onChange: (options: IDownloadOptions) => void;
}

export const DownloadOptions: React.FC<DownloadOptionsProps> = ({ options, onChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateOption = (key: keyof IDownloadOptions, value: any) => {
    onChange({ ...options, [key]: value });
  };

  const activeCount = [
    options.embedSubtitles,
    options.embedThumbnail,
    options.embedMetadata,
    options.splitChapters,
    options.trim,
  ].filter(Boolean).length;

  return (
    <div className="bg-white/[0.04] border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md transition-colors">
      {/* Header Accordion Button */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full p-4 text-white hover:bg-white/[0.04] transition-colors group cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-violet-500/15 border border-violet-500/25 flex items-center justify-center text-violet-400 group-hover:scale-105 transition-transform">
            <Settings2 className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2.5">
            <span className="font-semibold text-white/90 group-hover:text-white text-sm transition-colors">
              Advanced Options
            </span>
            {activeCount > 0 && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 font-medium border border-violet-500/30">
                {activeCount} active
              </span>
            )}
          </div>
        </div>

        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-white/50 group-hover:text-white transition-colors"
        >
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </button>

      {/* Accordion Content */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-1 border-t border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option: Color Dynamic Range (SDR / HDR) */}
              {options.mode !== 'audio' && (
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-white/5 bg-white/[0.02] sm:col-span-2 select-none">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
                      <SunMedium className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white/90 flex items-center gap-2">
                        <span>Color Dynamic Range</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/70 font-bold uppercase tracking-wider">
                          {options.colorRange === 'hdr' ? 'HDR' : 'SDR'}
                        </span>
                      </div>
                      <div className="text-xs text-white/40">
                        {options.colorRange === 'hdr'
                          ? 'High Dynamic Range (vibrant 10-bit color, HDR10/HLG)'
                          : 'Standard Dynamic Range (maximum compatibility, recommended)'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center p-1 bg-black/40 rounded-xl border border-white/10 text-xs shrink-0">
                    <button
                      type="button"
                      onClick={() => updateOption('colorRange', 'sdr')}
                      className={cn(
                        "px-3 py-1 rounded-lg font-semibold transition-all",
                        (!options.colorRange || options.colorRange === 'sdr')
                          ? "bg-violet-600 text-white shadow-sm"
                          : "text-white/50 hover:text-white"
                      )}
                    >
                      SDR
                    </button>
                    <button
                      type="button"
                      onClick={() => updateOption('colorRange', 'hdr')}
                      className={cn(
                        "px-3 py-1 rounded-lg font-semibold transition-all",
                        options.colorRange === 'hdr'
                          ? "bg-violet-600 text-white shadow-sm"
                          : "text-white/50 hover:text-white"
                      )}
                    >
                      HDR
                    </button>
                  </div>
                </div>
              )}

              {/* Option 1: Embed Subtitles */}
              <div
                onClick={() => updateOption('embedSubtitles', !options.embedSubtitles)}
                className={cn(
                  "flex items-center justify-between p-3.5 rounded-xl border transition-all duration-200 cursor-pointer select-none",
                  options.embedSubtitles
                    ? "bg-violet-500/[0.08] border-violet-500/30 shadow-[0_0_15px_rgba(139,92,246,0.06)]"
                    : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/10"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-violet-500/15 text-violet-400 flex items-center justify-center shrink-0">
                    <Subtitles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white/90">Embed Subtitles</div>
                    <div className="text-xs text-white/40">Include captions if available</div>
                  </div>
                </div>
                <Toggle
                  checked={options.embedSubtitles || false}
                  onChange={(c) => updateOption('embedSubtitles', c)}
                />
              </div>

              {/* Option 2: Embed Thumbnail */}
              <div
                onClick={() => updateOption('embedThumbnail', !options.embedThumbnail)}
                className={cn(
                  "flex items-center justify-between p-3.5 rounded-xl border transition-all duration-200 cursor-pointer select-none",
                  options.embedThumbnail
                    ? "bg-violet-500/[0.08] border-violet-500/30 shadow-[0_0_15px_rgba(139,92,246,0.06)]"
                    : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/10"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-pink-500/15 text-pink-400 flex items-center justify-center shrink-0">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white/90">Embed Thumbnail</div>
                    <div className="text-xs text-white/40">Attach cover art into media file</div>
                  </div>
                </div>
                <Toggle
                  checked={options.embedThumbnail || false}
                  onChange={(c) => updateOption('embedThumbnail', c)}
                />
              </div>

              {/* Option 3: Embed Metadata */}
              <div
                onClick={() => updateOption('embedMetadata', !options.embedMetadata)}
                className={cn(
                  "flex items-center justify-between p-3.5 rounded-xl border transition-all duration-200 cursor-pointer select-none",
                  options.embedMetadata
                    ? "bg-violet-500/[0.08] border-violet-500/30 shadow-[0_0_15px_rgba(139,92,246,0.06)]"
                    : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/10"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/15 text-indigo-400 flex items-center justify-center shrink-0">
                    <Tags className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white/90">Embed Metadata</div>
                    <div className="text-xs text-white/40">Artist, album & track tags</div>
                  </div>
                </div>
                <Toggle
                  checked={options.embedMetadata || false}
                  onChange={(c) => updateOption('embedMetadata', c)}
                />
              </div>

              {/* Option 4: Split by Chapters */}
              <div
                onClick={() => updateOption('splitChapters', !options.splitChapters)}
                className={cn(
                  "flex items-center justify-between p-3.5 rounded-xl border transition-all duration-200 cursor-pointer select-none",
                  options.splitChapters
                    ? "bg-violet-500/[0.08] border-violet-500/30 shadow-[0_0_15px_rgba(139,92,246,0.06)]"
                    : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/10"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
                    <Bookmark className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white/90">Split by Chapters</div>
                    <div className="text-xs text-white/40">Export chapters as separate files</div>
                  </div>
                </div>
                <Toggle
                  checked={options.splitChapters || false}
                  onChange={(c) => updateOption('splitChapters', c)}
                />
              </div>

              {/* Option 5: Trim Media (Full Width) */}
              <div
                className={cn(
                  "col-span-1 sm:col-span-2 p-3.5 rounded-xl border transition-all duration-200 select-none",
                  options.trim
                    ? "bg-violet-500/[0.08] border-violet-500/30 shadow-[0_0_15px_rgba(139,92,246,0.06)]"
                    : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/10"
                )}
              >
                <div
                  onClick={() => updateOption('trim', !options.trim)}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                      <Scissors className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white/90">Trim Media</div>
                      <div className="text-xs text-white/40">Specify custom start and end timestamps</div>
                    </div>
                  </div>
                  <Toggle
                    checked={options.trim || false}
                    onChange={(c) => updateOption('trim', c)}
                  />
                </div>

                {/* Sub-options for Trimming */}
                <AnimatePresence>
                  {options.trim && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-3.5 mt-3.5 border-t border-white/10 flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-lg border border-white/10 focus-within:border-violet-500/60 transition-colors">
                          <Clock className="w-3.5 h-3.5 text-white/40" />
                          <span className="text-xs text-white/50 font-medium">Start:</span>
                          <input
                            type="text"
                            placeholder="00:00:00"
                            value={options.trimStart || ''}
                            onChange={(e) => updateOption('trimStart', e.target.value)}
                            className="w-20 bg-transparent text-xs font-mono text-white text-center focus:outline-none placeholder-white/20"
                          />
                        </div>

                        <span className="text-white/30 text-xs font-medium">to</span>

                        <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-lg border border-white/10 focus-within:border-violet-500/60 transition-colors">
                          <Clock className="w-3.5 h-3.5 text-white/40" />
                          <span className="text-xs text-white/50 font-medium">End:</span>
                          <input
                            type="text"
                            placeholder="00:00:00"
                            value={options.trimEnd || ''}
                            onChange={(e) => updateOption('trimEnd', e.target.value)}
                            className="w-20 bg-transparent text-xs font-mono text-white text-center focus:outline-none placeholder-white/20"
                          />
                        </div>

                        <span className="text-[11px] text-white/35 ml-1">
                          Format: HH:MM:SS or MM:SS
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
