import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Download, Clock, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { useDownloadStore } from '../../stores/useDownloadStore';
import { Badge } from '../ui/Badge';
import { BrandLogo } from '../ui/BrandLogo';

export default function Sidebar() {
  const [expanded, setExpanded] = useState(false);
  const activeCount = useDownloadStore(state => state.activeCount);

  const navItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/downloads', icon: Download, label: 'Downloads', badge: activeCount > 0 ? activeCount : null },
    { to: '/history', icon: Clock, label: 'History' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <motion.aside
      initial={false}
      animate={{ width: expanded ? 256 : 80 }}
      className="h-full glass-panel border-y-0 border-l-0 rounded-none flex flex-col bg-[#16162A]/80 z-10"
    >
      <div className="h-20 flex items-center justify-center px-4 mb-4">
        <NavLink
          to="/"
          className="flex items-center gap-3 overflow-hidden whitespace-nowrap group hover:opacity-90 transition-opacity"
          title="PullTube Home"
        >
          <motion.div
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            <BrandLogo size="md" />
          </motion.div>
          {expanded && (
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70 group-hover:from-white group-hover:to-violet-200 transition-all"
            >
              PullTube
            </motion.span>
          )}
        </NavLink>
      </div>

      <nav className="flex-1 flex flex-col gap-2 px-3">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `relative flex items-center gap-4 px-3 py-3 rounded-xl transition-colors duration-200 overflow-hidden ${
                isActive
                  ? 'text-white font-medium'
                  : 'text-white/40 hover:text-white/80'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="activeNavPill"
                    className="absolute inset-0 bg-gradient-to-r from-violet-600/30 to-purple-600/20 border border-violet-500/40 rounded-xl shadow-[0_0_15px_rgba(139,92,246,0.25)]"
                    transition={{ type: "spring", stiffness: 420, damping: 32 }}
                  />
                )}
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className="relative z-10 shrink-0 flex items-center justify-center w-6"
                >
                  <item.icon size={22} className={isActive ? 'text-violet-400' : ''} />
                  {item.badge && !expanded && (
                    <span className="absolute -top-2 -right-3 w-4 h-4 bg-violet-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold shadow-[0_0_8px_rgba(139,92,246,0.8)]">
                      {item.badge}
                    </span>
                  )}
                </motion.div>
                {expanded && (
                  <span className="relative z-10 font-medium whitespace-nowrap flex-1">{item.label}</span>
                )}
                {expanded && item.badge && (
                  <Badge variant="downloading" className="relative z-10 shrink-0">{item.badge}</Badge>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 flex justify-center mt-auto">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white/40 hover:bg-white/10 hover:text-white transition-colors"
        >
          {expanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>
    </motion.aside>
  );
}
