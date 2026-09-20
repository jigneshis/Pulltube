import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Download, CheckSquare, Square, 
  Search, Video, Music, FolderCheck, 
  Clock, ListFilter, ExternalLink, Check
} from 'lucide-react';
import { PlaylistInfo, PlaylistItem } from '../../../shared/types';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { Input } from '../ui/Input';

interface PlaylistViewProps {
  playlist: PlaylistInfo;
  onBack: () => void;
  onStartBatchDownload: (
    selectedItems: PlaylistItem[],
    config: {
      mode: 'video' | 'audio';
      format: string;
      quality: string;
      folderName: string;
    }
  ) => void;
}

export const PlaylistView: React.FC<PlaylistViewProps> = ({
  playlist,
  onBack,
  onStartBatchDownload,
}) => {
  // All items selected by default
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(playlist.items.map((it) => it.id))
  );

  const isAudioCollection = useMemo(() => {
    return (
      (playlist.url && (playlist.url.includes('spotify.com') || playlist.url.includes('soundcloud.com'))) ||
      (playlist.channel && playlist.channel.toLowerCase().includes('spotify')) ||
      (playlist.description && playlist.description.toLowerCase().includes('spotify'))
    );
  }, [playlist.url, playlist.channel, playlist.description]);

  const [mode, setMode] = useState<'video' | 'audio'>(() => (isAudioCollection ? 'audio' : 'video'));
  const [videoFormat, setVideoFormat] = useState('mp4');
  const [videoQuality, setVideoQuality] = useState('best');
  const [audioFormat, setAudioFormat] = useState('mp3');
  const [audioQuality, setAudioQuality] = useState('320');

  const defaultFolder = useMemo(() => {
    return (playlist.title || 'Playlist')
      .replace(/[\\/:*?"<>|]/g, '_')
      .trim();
  }, [playlist.title]);

  const [folderName, setFolderName] = useState(defaultFolder);
  const [searchQuery, setSearchQuery] = useState('');
  const [rangeFrom, setRangeFrom] = useState<number>(1);
  const [rangeTo, setRangeTo] = useState<number>(Math.min(15, playlist.items.length));

  // Compute total duration of all playlist items
  const totalDurationString = useMemo(() => {
    const totalSeconds = playlist.items.reduce((acc, item) => acc + (item.duration || 0), 0);
    if (!totalSeconds) return '';
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    if (hours > 0) {
      return `${hours} hr ${minutes} min`;
    }
    return `${minutes} min`;
  }, [playlist.items]);

  // Filtered items based on search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return playlist.items;
    const q = searchQuery.toLowerCase();
    return playlist.items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        (item.channel && item.channel.toLowerCase().includes(q))
    );
  }, [playlist.items, searchQuery]);

  const toggleItem = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(playlist.items.map((i) => i.id)));
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  const invertSelection = () => {
    setSelectedIds((prev) => {
      const next = new Set<string>();
      playlist.items.forEach((item) => {
        if (!prev.has(item.id)) {
          next.add(item.id);
        }
      });
      return next;
    });
  };

  const applyRange = () => {
    const start = Math.max(1, rangeFrom);
    const end = Math.min(playlist.items.length, rangeTo);
    if (start > end) return;

    setSelectedIds((prev) => {
      const next = new Set(prev);
      playlist.items.forEach((item) => {
        if (item.index >= start && item.index <= end) {
          next.add(item.id);
        }
      });
      return next;
    });
  };

  const handleStart = () => {
    const selectedItems = playlist.items.filter((item) => selectedIds.has(item.id));
    if (selectedItems.length === 0) return;

    onStartBatchDownload(selectedItems, {
      mode,
      format: mode === 'video' ? videoFormat : audioFormat,
      quality: mode === 'video' ? videoQuality : audioQuality,
      folderName: folderName || defaultFolder,
    });
  };

  const isAllSelected = selectedIds.size === playlist.items.length && playlist.items.length > 0;

  const videoFormatOptions = [
    { value: 'mp4', label: 'MP4 (H.264 - Universal)' },
    { value: 'mkv', label: 'MKV (Matroska)' },
    { value: 'webm', label: 'WebM (VP9/AV1)' },
  ];

  const videoQualityOptions = [
    { value: 'best', label: 'Best Available' },
    { value: '1080', label: '1080p Full HD' },
    { value: '720', label: '720p HD' },
    { value: '480', label: '480p SD' },
    { value: '360', label: '360p' },
  ];

  const audioFormatOptions = [
    { value: 'mp3', label: 'MP3 (Universal)' },
    { value: 'flac', label: 'FLAC (Lossless Quality)' },
    { value: 'm4a', label: 'M4A / AAC (Apple Friendly)' },
    { value: 'wav', label: 'WAV (Uncompressed)' },
  ];

  const audioQualityOptions = [
    { value: '320', label: '320 kbps (High Quality)' },
    { value: '256', label: '256 kbps' },
    { value: '192', label: '192 kbps (Standard)' },
    { value: '128', label: '128 kbps (Compact)' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="flex flex-col gap-6 pb-28 max-w-5xl mx-auto w-full"
    >
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-sm transition-colors border border-white/10"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Input</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-white/40">
          <span>Batch Playlist Downloader</span>
        </div>
      </div>

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1A1A2E]/90 via-[#16162A]/90 to-[#0F0F14]/90 border border-white/10 p-6 shadow-2xl backdrop-blur-xl">
        {/* Background ambient glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row gap-6 items-start md:items-center">
          {/* Playlist Cover Art */}
          <div className="w-32 h-32 md:w-36 md:h-36 rounded-xl overflow-hidden bg-black/40 border border-white/15 shrink-0 shadow-lg relative group">
            {playlist.thumbnail ? (
              <img
                src={playlist.thumbnail}
                alt={playlist.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/30">
                <Video className="w-10 h-10" />
              </div>
            )}
            <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[11px] font-semibold text-white/90 border border-white/10">
              {playlist.itemCount} items
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 flex flex-col gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 text-xs font-semibold uppercase tracking-wider">
                Playlist
              </span>
              {totalDurationString && (
                <span className="flex items-center gap-1 text-xs text-white/50 px-2 py-0.5 rounded-full bg-white/5">
                  <Clock className="w-3 h-3" />
                  {totalDurationString}
                </span>
              )}
            </div>

            <h1 className="text-2xl font-bold text-white leading-tight">
              {playlist.title}
            </h1>

            {playlist.channel && (
              <p className="text-sm text-white/60 font-medium">
                By {playlist.channel}
              </p>
            )}

            {playlist.description && (
              <p className="text-xs text-white/40 line-clamp-2 mt-1 max-w-2xl leading-relaxed">
                {playlist.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Batch Format & Output Configuration Panel */}
      <div className="rounded-2xl bg-[#16162A]/60 border border-white/10 p-5 backdrop-blur-xl shadow-xl flex flex-col gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <FolderCheck className="w-4 h-4 text-violet-400" />
            <span className="text-sm font-semibold text-white">Batch Format & Quality</span>
          </div>
          <span className="text-xs text-white/40">Applies to all selected items</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          {/* Mode Toggle */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-white/60">Mode</label>
            <div className="grid grid-cols-2 p-1 bg-white/5 border border-white/10 rounded-xl">
              <button
                type="button"
                onClick={() => setMode('video')}
                className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  mode === 'video'
                    ? 'bg-violet-600 text-white shadow-md'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>Video</span>
              </button>
              <button
                type="button"
                onClick={() => setMode('audio')}
                className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  mode === 'audio'
                    ? 'bg-violet-600 text-white shadow-md'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <Music className="w-3.5 h-3.5" />
                <span>Audio</span>
              </button>
            </div>
          </div>

          {/* Format Selection */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-white/60">Format</label>
            {mode === 'video' ? (
              <Select
                options={videoFormatOptions}
                value={videoFormat}
                onChange={setVideoFormat}
              />
            ) : (
              <Select
                options={audioFormatOptions}
                value={audioFormat}
                onChange={setAudioFormat}
              />
            )}
          </div>

          {/* Quality Selection */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-white/60">Quality</label>
            {mode === 'video' ? (
              <Select
                options={videoQualityOptions}
                value={videoQuality}
                onChange={setVideoQuality}
              />
            ) : (
              <Select
                options={audioQualityOptions}
                value={audioQuality}
                onChange={setAudioQuality}
              />
            )}
          </div>

          {/* Subfolder Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-white/60">Organize In Folder</label>
            <Input
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="Folder name"
              className="py-2 text-xs"
            />
          </div>
        </div>

        {/* Subfolder & Numbering Note */}
        <div className="text-[11px] text-white/40 flex items-center gap-1.5 bg-white/[0.02] p-2.5 rounded-xl border border-white/5">
          <span className="font-semibold text-violet-400">File Output:</span>
          <span className="truncate">
            Downloads / <span className="text-white/80">{folderName || defaultFolder}</span> / 01 - Title.{mode === 'video' ? videoFormat : audioFormat}
          </span>
          <span className="ml-auto text-white/40 italic hidden sm:inline">(Numbered sequentially)</span>
        </div>
      </div>

      {/* Playlist Item Controls & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Selection Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={isAllSelected ? deselectAll : selectAll}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-medium border border-white/10 transition-colors"
          >
            {isAllSelected ? (
              <>
                <Square className="w-3.5 h-3.5 text-white/50" />
                <span>Deselect All</span>
              </>
            ) : (
              <>
                <CheckSquare className="w-3.5 h-3.5 text-violet-400" />
                <span>Select All</span>
              </>
            )}
          </button>

          <button
            onClick={invertSelection}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-medium border border-white/10 transition-colors"
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span>Invert</span>
          </button>

          {/* Range Quick Selector */}
          <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl px-2 py-1 text-xs text-white/60">
            <span>Range:</span>
            <input
              type="number"
              min={1}
              max={playlist.items.length}
              value={rangeFrom}
              onChange={(e) => setRangeFrom(parseInt(e.target.value) || 1)}
              className="w-10 px-1 py-0.5 text-center bg-white/10 border border-white/10 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
            <span>to</span>
            <input
              type="number"
              min={1}
              max={playlist.items.length}
              value={rangeTo}
              onChange={(e) => setRangeTo(parseInt(e.target.value) || 1)}
              className="w-10 px-1 py-0.5 text-center bg-white/10 border border-white/10 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
            <button
              onClick={applyRange}
              className="ml-1 px-2 py-0.5 rounded bg-violet-600/60 hover:bg-violet-600 text-white text-[11px] font-medium transition-colors"
            >
              Pick
            </button>
          </div>
        </div>

        {/* Search Filter */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search playlist tracks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
          />
        </div>
      </div>

      {/* Selected Counter & List Header */}
      <div className="flex items-center justify-between text-xs text-white/50 px-1">
        <div>
          Showing <span className="text-white font-medium">{filteredItems.length}</span> of {playlist.items.length} items
        </div>
        <div>
          Selected:{' '}
          <span className="text-violet-300 font-semibold">
            {selectedIds.size}
          </span>{' '}
          / {playlist.items.length}
        </div>
      </div>

      {/* Items Checklist List */}
      <div className="flex flex-col gap-2">
        {filteredItems.map((item) => {
          const isSelected = selectedIds.has(item.id);
          return (
            <div
              key={item.id}
              onClick={() => toggleItem(item.id)}
              className={`group flex items-center gap-3.5 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                isSelected
                  ? 'bg-violet-950/20 hover:bg-violet-900/30 border-violet-500/30 shadow-sm'
                  : 'bg-[#16162A]/40 hover:bg-[#16162A]/70 border-white/5 hover:border-white/10 opacity-75'
              }`}
            >
              {/* Checkbox button */}
              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all shrink-0 ${
                  isSelected
                    ? 'bg-violet-600 border-violet-500 text-white shadow-sm shadow-violet-500/50'
                    : 'border-white/20 bg-white/5 group-hover:border-white/40 text-transparent'
                }`}
              >
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>

              {/* Number Index */}
              <div className="w-7 text-xs font-mono text-white/40 font-medium shrink-0 text-center">
                #{String(item.index).padStart(2, '0')}
              </div>

              {/* Video Thumbnail */}
              <div className="w-20 h-12 rounded-lg bg-black/40 overflow-hidden shrink-0 relative border border-white/10">
                {item.thumbnail ? (
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/20">
                    <Video className="w-4 h-4" />
                  </div>
                )}
                {item.durationString && (
                  <div className="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-black/80 backdrop-blur-xs text-[10px] font-mono text-white/80">
                    {item.durationString}
                  </div>
                )}
              </div>

              {/* Title & Channel */}
              <div className="flex-1 min-w-0 pr-2">
                <div className={`text-sm font-medium leading-snug truncate transition-colors ${
                  isSelected ? 'text-white' : 'text-white/60'
                }`}>
                  {item.title}
                </div>
                {item.channel && (
                  <div className="text-xs text-white/40 truncate mt-0.5">
                    {item.channel}
                  </div>
                )}
              </div>

              {/* Action: Open in Browser */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (item.url) {
                    window.open(item.url, '_blank');
                  }
                }}
                title="View original link"
                className="p-1.5 rounded-lg text-white/20 hover:text-white/80 hover:bg-white/10 transition-colors shrink-0"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}

        {filteredItems.length === 0 && (
          <div className="p-8 text-center rounded-2xl bg-white/[0.02] border border-white/5 text-white/40 text-sm">
            No items match &quot;{searchQuery}&quot;.
          </div>
        )}
      </div>

      {/* Floating Sticky Bottom Action Bar */}
      <div className="fixed bottom-4 left-4 right-4 max-w-5xl mx-auto z-40">
        <div className="p-4 rounded-2xl bg-[#16162A]/90 backdrop-blur-2xl border border-white/15 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-left w-full sm:w-auto">
            <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-300 shrink-0">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">
                Download {selectedIds.size} {selectedIds.size === 1 ? 'item' : 'items'}
              </div>
              <div className="text-xs text-white/50 flex items-center gap-2">
                <span className="uppercase font-medium text-violet-300">
                  {mode === 'video' ? videoFormat : audioFormat} • {mode === 'video' ? videoQuality : `${audioQuality}kbps`}
                </span>
                <span>•</span>
                <span className="truncate max-w-[200px]">/{folderName || defaultFolder}/</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <Button
              variant="secondary"
              size="md"
              onClick={onBack}
              className="px-4 text-xs"
            >
              Cancel
            </Button>

            <Button
              variant="primary"
              size="lg"
              icon={Download}
              disabled={selectedIds.size === 0}
              onClick={handleStart}
              className="w-full sm:w-auto shadow-lg shadow-violet-500/25 px-6 font-semibold"
            >
              Start Batch Download ({selectedIds.size})
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
