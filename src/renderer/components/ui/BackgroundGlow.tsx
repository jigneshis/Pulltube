import React from 'react';
import { motion } from 'framer-motion';

export const BackgroundGlow: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* Top-Right Floating Violet Orb */}
      <motion.div
        className="absolute -top-32 -right-32 w-[550px] h-[550px] rounded-full bg-gradient-to-br from-violet-600/15 via-purple-600/10 to-transparent blur-[130px]"
        animate={{
          x: [0, 40, -20, 0],
          y: [0, -30, 20, 0],
          scale: [1, 1.1, 0.95, 1],
        }}
        transition={{
          repeat: Infinity,
          duration: 18,
          ease: 'easeInOut',
        }}
      />

      {/* Bottom-Left Floating Indigo/Fuchsia Orb */}
      <motion.div
        className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-indigo-600/12 via-fuchsia-600/8 to-transparent blur-[140px]"
        animate={{
          x: [0, -35, 25, 0],
          y: [0, 25, -25, 0],
          scale: [1, 0.94, 1.08, 1],
        }}
        transition={{
          repeat: Infinity,
          duration: 22,
          ease: 'easeInOut',
        }}
      />

      {/* Center Subtle Atmospheric Accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full bg-violet-900/[0.04] blur-[150px]" />
    </div>
  );
};
