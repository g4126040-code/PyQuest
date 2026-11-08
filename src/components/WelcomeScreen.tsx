import React from 'react';
import { motion } from 'motion/react';
import { useLanguage, Language } from '../contexts/LanguageContext';
import { Code2, Globe } from 'lucide-react';
import { playSound, triggerHaptic } from '../lib/sounds';

interface WelcomeScreenProps {
  onComplete: () => void;
}

export default function WelcomeScreen({ onComplete }: WelcomeScreenProps) {
  const { setLanguage } = useLanguage();

  const handleStart = () => {
    playSound('click'); triggerHaptic('light');
    localStorage.setItem('codequest_welcome_completed', 'true');
    onComplete();
  };

  return (
    <div className="min-h-[100dvh] bg-surface-main text-content-primary flex flex-col items-center justify-center p-6 selection:bg-brand-500/30">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="max-w-md w-full liquid-glass rounded-3xl p-8 text-center relative overflow-hidden transform-gpu shadow-2xl"
      >
        <div className="w-20 h-20 bg-brand-500 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-brand-500/30 mb-6">
          <Code2 className="w-10 h-10 text-white" />
        </div>
        
        <h1 className="text-3xl font-black mb-2">Welcome to CodeQuest</h1>
        <p className="text-content-secondary mb-8 font-medium">Ready to start your coding journey?</p>
        
        <button 
          onClick={handleStart}
          className="w-full p-4 bg-brand-500 text-white rounded-xl font-bold btn-game shadow-lg shadow-brand-500/30 text-lg flex items-center justify-center gap-2"
        >
          Start Learning
        </button>
      </motion.div>
    </div>
  );
}
