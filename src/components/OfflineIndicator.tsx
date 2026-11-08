import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-2 sm:top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-amber-500/95 dark:bg-amber-600/95 backdrop-blur-md text-white shadow-xl flex items-center gap-2.5 text-xs sm:text-sm font-bold border border-amber-300/40"
        >
          <div className="p-1 rounded-full bg-white/20 animate-pulse">
            <WifiOff className="w-3.5 h-3.5" />
          </div>
          <span>Offline Mode Active</span>
          <span className="hidden sm:inline opacity-90">• Challenges & Code Execution cached</span>
          <div className="flex items-center gap-1 bg-black/20 px-2 py-0.5 rounded-lg text-[10px] tracking-wide font-mono">
            <Zap className="w-3 h-3 text-yellow-200 fill-current" />
            STANDALONE
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
