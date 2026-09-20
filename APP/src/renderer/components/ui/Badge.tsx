import React from 'react';
import { motion } from 'framer-motion';

const cn = (...classes: (string | boolean | undefined | null)[]) => classes.filter(Boolean).join(' ');

export type BadgeVariant = 'downloading' | 'converting' | 'merging' | 'done' | 'error' | 'queued' | 'paused' | 'cancelled';

export interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  size?: 'sm' | 'default';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ variant, children, size = 'default', className }) => {
  const styles = {
    downloading: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
    converting: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    merging: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    done: 'bg-green-500/20 text-green-300 border-green-500/30',
    error: 'bg-red-500/20 text-red-300 border-red-500/30',
    queued: 'bg-white/10 text-white/70 border-white/20',
    paused: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    cancelled: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
  };

  const dotColors = {
    downloading: 'bg-violet-400',
    converting: 'bg-amber-400',
    merging: 'bg-blue-400',
    done: 'bg-green-400',
    error: 'bg-red-400',
    queued: 'bg-white/40',
    paused: 'bg-orange-400',
    cancelled: 'bg-gray-400',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    default: 'px-2.5 py-1 text-sm',
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border backdrop-blur-sm font-medium",
        styles[variant],
        sizes[size],
        className
      )}
    >
      <span className="relative flex h-2 w-2">
        {variant === 'downloading' && (
          <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", dotColors[variant])} />
        )}
        <span className={cn("relative inline-flex rounded-full h-2 w-2", dotColors[variant])} />
      </span>
      {children}
    </div>
  );
};
