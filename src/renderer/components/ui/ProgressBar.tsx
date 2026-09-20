import React from 'react';
import { motion } from 'framer-motion';

const cn = (...classes: (string | boolean | undefined | null)[]) => classes.filter(Boolean).join(' ');

export interface ProgressBarProps {
  progress?: number; // 0 to 100, undefined for indeterminate
  showLabel?: boolean;
  height?: 'thin' | 'default' | 'thick';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  showLabel = false,
  height = 'default',
  className
}) => {
  const isIndeterminate = progress === undefined;
  
  const heights = {
    thin: 'h-0.5',
    default: 'h-2',
    thick: 'h-3',
  };

  return (
    <div className={cn("w-full flex flex-col gap-1.5", className)}>
      {showLabel && !isIndeterminate && (
        <div className="flex justify-end">
          <span className="text-xs font-medium text-white/70">{Math.round(progress)}%</span>
        </div>
      )}
      <div className={cn("w-full bg-white/10 rounded-full overflow-hidden", heights[height])}>
        {isIndeterminate ? (
          <motion.div
            className="h-full bg-gradient-to-r from-violet-600/0 via-violet-500 to-violet-600/0 w-1/2"
            animate={{ x: ['-100%', '200%'] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
          />
        ) : (
          <motion.div
            className="h-full bg-gradient-to-r from-violet-600 via-purple-500 to-fuchsia-400 relative"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ type: 'spring', bounce: 0, duration: 0.5 }}
          >
            <div className="absolute top-0 right-0 bottom-0 left-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent)] bg-[length:200%_100%] animate-[shimmer_2s_infinite]" />
            {progress > 0 && progress < 100 && (
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,1),0_0_14px_rgba(168,85,247,0.9)]" />
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};
