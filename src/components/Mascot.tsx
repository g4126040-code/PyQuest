import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSettings } from '../contexts/SettingsContext';
import { useMascot } from '../contexts/MascotContext';

export default function Mascot() {
  const { mascotEnabled } = useSettings();
  const { mascotType, mascotMessage } = useMascot();

  if (!mascotEnabled) return null;

  const getMascotExpression = () => {
    switch (mascotType) {
      case 'welcome': return '👋';
      case 'success': return '🎉';
      case 'encourage': return '💪';
      case 'streak': return '🔥';
      case 'complete': return '🏆';
      default: return '🤖';
    }
  };

  const getDefaultMessage = () => {
    switch (mascotType) {
      case 'welcome': return 'Welcome! Ready to code?';
      case 'success': return 'Great job! You nailed it!';
      case 'encourage': return 'Keep going, you can do this!';
      case 'streak': return 'Your streak is on fire!';
      case 'complete': return 'Language Mastered!';
      default: return 'Hello!';
    }
  };

  return (
    <AnimatePresence>
      {mascotType !== 'idle' && (
        <motion.div
          key="mascot-container"
          initial={{ opacity: 0, y: 50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.8 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="fixed bottom-24 right-4 z-50 flex items-end gap-3 pointer-events-none"
        >
          {/* Chat Bubble */}
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 500, damping: 25 }}
            className="bg-brand-500/90 backdrop-blur-xl border border-white/20 text-white px-5 py-3.5 rounded-3xl rounded-br-none shadow-2xl max-w-[200px] text-center"
          >
            <p className="text-sm font-bold">{mascotMessage || getDefaultMessage()}</p>
          </motion.div>
          
          {/* Character */}
          <motion.div
            animate={{ 
              y: [0, -8, 0],
              rotate: mascotType === 'success' || mascotType === 'complete' ? [0, -10, 10, -10, 10, 0] : 0 
            }}
            transition={{ 
              y: { repeat: Infinity, duration: 1.5, ease: 'easeInOut' },
              rotate: { duration: 0.5 }
            }}
            className="w-16 h-16 liquid-glass border-[3px] border-brand-400 rounded-full flex items-center justify-center text-3xl shadow-2xl overflow-hidden relative"
          >
            <span className="relative z-10">{getMascotExpression()}</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
