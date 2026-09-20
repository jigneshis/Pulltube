import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Eye, Calendar, User } from 'lucide-react';
import { Card } from '../ui/Card';
import { VideoInfo } from '../../../shared/types'; // Assuming this exists

const cn = (...classes: (string | boolean | undefined | null)[]) => classes.filter(Boolean).join(' ');

interface VideoPreviewProps {
  info: VideoInfo | null;
}

export const VideoPreview: React.FC<VideoPreviewProps> = ({ info }) => {
  if (!info) return null;

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [h, m > 9 ? m : h ? '0' + m : m || '0', s > 9 ? s : '0' + s].filter(Boolean).join(':');
  };

  const formatViews = (views?: number) => {
    if (!views) return '';
    return new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(views) + ' views';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="flex flex-col sm:flex-row gap-5 p-4 items-start">
        <div className="relative w-full sm:w-64 aspect-video rounded-xl overflow-hidden shrink-0 bg-white/5 border border-white/10 group">
          <img
            src={info.thumbnail}
            alt={info.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {info.duration && (
            <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 backdrop-blur-md rounded-lg text-xs font-medium text-white flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDuration(info.duration)}
            </div>
          )}
        </div>
        
        <div className="flex flex-col flex-1 min-w-0 py-1 gap-2">
          <h2 className="text-xl font-bold text-white line-clamp-2 leading-tight" title={info.title}>
            {info.title}
          </h2>
          
          <div className="flex items-center gap-2 text-white/70 hover:text-white transition-colors w-fit">
            <User className="w-4 h-4" />
            <span className="font-medium">{info.channel}</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-white/40 mt-auto">
            {info.viewCount && (
              <div className="flex items-center gap-1.5">
                <Eye className="w-4 h-4" />
                <span>{formatViews(info.viewCount)}</span>
              </div>
            )}
            {info.uploadDate && (
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span>{info.uploadDate}</span>
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
