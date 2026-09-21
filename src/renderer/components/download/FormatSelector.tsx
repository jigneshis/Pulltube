import React from 'react';
import { motion } from 'framer-motion';
import { Video, Headphones } from 'lucide-react';
import { Select } from '../ui/Select';
import { FormatInfo } from '../../../shared/types'; // Assuming this exists

const cn = (...classes: (string | boolean | undefined | null)[]) => classes.filter(Boolean).join(' ');

export type DownloadMode = 'video' | 'audio';

interface FormatSelectorProps {
  formats: FormatInfo[];
  mode: DownloadMode;
  onModeChange: (mode: DownloadMode) => void;
  selectedFormatId: string;
  onFormatSelect: (formatId: string) => void;
  selectedQualityId: string;
  onQualitySelect: (qualityId: string) => void;
}

export const FormatSelector: React.FC<FormatSelectorProps> = ({
  formats,
  mode,
  onModeChange,
  selectedFormatId,
  onFormatSelect,
  selectedQualityId,
  onQualitySelect
}) => {
  const videoFormats = [
    { label: 'MP4 (Universal / Recommended)', value: 'mp4' },
    { label: 'MKV (Matroska)', value: 'mkv' },
    { label: 'WebM (VP9)', value: 'webm' },
  ];
  
  const audioFormats = [
    { label: 'MP3', value: 'mp3' },
    { label: 'M4A', value: 'm4a' },
    { label: 'WAV', value: 'wav' },
    { label: 'FLAC', value: 'flac' },
  ];

  const currentFormats = mode === 'video' ? videoFormats : audioFormats;
  const safeFormats = Array.isArray(formats) ? formats : [];

  const videoTiers = [
    { height: 4320, label: '8K Ultra HD (4320p)', value: '4320p' },
    { height: 2160, label: '4K Ultra HD (2160p)', value: '2160p' },
    { height: 1440, label: '2K Quad HD (1440p)', value: '1440p' },
    { height: 1080, label: '1080p Full HD', value: '1080p' },
    { height: 720, label: '720p HD', value: '720p' },
    { height: 480, label: '480p Standard', value: '480p' },
    { height: 360, label: '360p Medium', value: '360p' },
    { height: 240, label: '240p Low', value: '240p' },
    { height: 144, label: '144p Very Low', value: '144p' },
  ];

  const audioTiers = [
    { label: 'Best Quality (320 kbps)', value: '320k' },
    { label: 'High Quality (256 kbps)', value: '256k' },
    { label: 'Standard Quality (192 kbps)', value: '192k' },
    { label: 'Compact Quality (128 kbps)', value: '128k' },
  ];

  let qualityOptions: { label: string; value: string }[] = [];

  if (mode === 'audio') {
    qualityOptions = [
      { label: 'Best Available (Recommended)', value: 'best' },
      ...audioTiers,
    ];
  } else {
    const maxHeight = safeFormats.reduce((max, f) => Math.max(max, f.height || 0), 0);
    const filteredTiers = maxHeight > 0
      ? videoTiers.filter(t => t.height <= maxHeight)
      : videoTiers;

    qualityOptions = [
      { label: 'Best Available (Recommended)', value: 'best' },
      ...filteredTiers.map(t => ({ label: t.label, value: t.value })),
    ];
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex p-1 bg-white/5 border border-white/10 rounded-xl w-fit">
        <button
          onClick={() => onModeChange('video')}
          className={cn(
            "flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300",
            mode === 'video' ? "bg-violet-500 text-white shadow-lg" : "text-white/50 hover:text-white"
          )}
        >
          <Video className="w-4 h-4" />
          Video
        </button>
        <button
          onClick={() => onModeChange('audio')}
          className={cn(
            "flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300",
            mode === 'audio' ? "bg-violet-500 text-white shadow-lg" : "text-white/50 hover:text-white"
          )}
        >
          <Headphones className="w-4 h-4" />
          Audio
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-white/70 mb-1.5">Format</label>
          <Select
            options={currentFormats}
            value={selectedFormatId}
            onChange={onFormatSelect}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white/70 mb-1.5">Quality / Resolution</label>
          <Select
            options={qualityOptions}
            value={selectedQualityId}
            onChange={onQualitySelect}
            placeholder="Select Quality..."
          />
        </div>
      </div>
    </div>
  );
};
