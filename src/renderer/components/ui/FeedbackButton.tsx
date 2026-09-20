import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquareHeart, ExternalLink, Sparkles } from 'lucide-react';
import { api } from '../../lib/ipc';

interface FeedbackButtonProps {
  url?: string;
  className?: string;
}

export const FeedbackButton: React.FC<FeedbackButtonProps> = ({
  url = 'https://tally.so/r/yPOGa4',
  className = '',
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = async () => {
    try {
      if (api?.openExternal) {
        await api.openExternal(url);
      } else {
        window.open(url, '_blank');
      }
    } catch (err) {
      console.error('Failed to open feedback URL:', err);
      window.open(url, '_blank');
    }
  };

  return (
    <div className={`fixed bottom-5 right-6 z-40 select-none ${className}`}>
      {/* Floating Tooltip */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute bottom-full right-0 mb-2.5 pointer-events-none whitespace-nowrap"
          >
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#14121F]/95 backdrop-blur-xl border border-violet-500/30 text-white/90 text-xs shadow-[0_8px_30px_rgba(0,0,0,0.6),0_0_15px_rgba(139,92,246,0.25)]">
              <Sparkles className="w-3.5 h-3.5 text-violet-400 animate-pulse shrink-0" />
              <span>Have an idea or feedback? <strong className="text-violet-300 font-semibold">Tell us!</strong></span>
              {/* Arrow */}
              <div className="absolute top-full right-6 -mt-[1px] border-4 border-transparent border-t-[#14121F]/95" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Pill Button */}
      <motion.button
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        initial={{ opacity: 0, scale: 0.85, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="group relative flex items-center gap-2 px-3.5 py-2 rounded-full overflow-hidden
                   bg-gradient-to-r from-[#171427]/90 via-[#1B1830]/90 to-[#141224]/90
                   hover:from-[#211B3B]/95 hover:via-[#261F45]/95 hover:to-[#1C1733]/95
                   backdrop-blur-xl border border-violet-500/25 hover:border-violet-400/60
                   shadow-[0_4px_20px_rgba(0,0,0,0.5),0_0_12px_rgba(139,92,246,0.15)]
                   hover:shadow-[0_8px_28px_rgba(0,0,0,0.65),0_0_24px_rgba(139,92,246,0.4)]
                   transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
        title="Share your feedback"
        aria-label="Give feedback on PullTube"
      >
        {/* Shimmer / light sweep effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent
                        -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />

        {/* Ambient violet ping dot */}
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-gradient-to-r from-violet-400 to-fuchsia-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
        </span>

        {/* Feedback Icon */}
        <MessageSquareHeart className="w-4 h-4 text-violet-300 group-hover:text-pink-300 transition-colors duration-200 shrink-0" />

        {/* Label */}
        <span className="text-xs font-semibold tracking-wide text-white/85 group-hover:text-white transition-colors duration-200">
          Feedback
        </span>

        {/* External Link icon subtle indicator */}
        <ExternalLink className="w-3 h-3 text-white/35 group-hover:text-violet-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200 shrink-0" />
      </motion.button>
    </div>
  );
};
