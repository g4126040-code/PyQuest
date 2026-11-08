import React from 'react';
import { motion } from 'motion/react';
import {
  Home,
  BookOpen,
  LayoutGrid,
  User,
  Settings,
  Code,
  Library
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { playSound, triggerHaptic } from '../lib/sounds';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function BottomNav({ activeTab, setActiveTab }: BottomNavProps) {
  const { t } = useLanguage();

  const handleSelectTab = (tabId: string) => {
    if (tabId === activeTab) {
      document.getElementById('codequest-main-scroll')?.scrollTo({ top: 0, behavior: 'smooth' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    playSound('click');
    triggerHaptic('light');
    setActiveTab(tabId);
  };

  // ALL ORIGINAL TABS PRESERVED EXACTLY
  const tabs = [
    { id: 'home', icon: Home, label: 'Home', desc: 'Global leaderboard & highlights' },
    { id: 'learn', icon: BookOpen, label: 'Learn', desc: 'Interactive coding tracks' },
    { id: 'playground', icon: Code, label: 'Play', desc: 'Code editor & live sandbox' },
    { id: 'library', icon: Library, label: 'Library', desc: 'Snippets & references' },
    { id: 'projects', icon: LayoutGrid, label: 'Projects', desc: 'Showcase projects' },
    { id: 'profile', icon: User, label: 'Profile', desc: 'Stats, badges & achievements' },
    { id: 'settings', icon: Settings, label: 'Settings', desc: 'Themes, audio & preferences' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 sm:bottom-4 sm:left-1/2 sm:-translate-x-1/2 sm:w-[680px] sm:max-w-[calc(100vw-2rem)] sm:min-w-0 z-50 pointer-events-none">
      {/* Outer Liquid Glass Navigation Container */}
      <nav
        aria-label="CodeQuest Application Navigation"
        className="pointer-events-auto relative rounded-t-[28px] sm:rounded-[32px] bg-surface-card/90 dark:bg-[#0c111e]/90 backdrop-blur-2xl border-t border-white/40 dark:border-white/15 sm:border sm:border-white/40 sm:dark:border-white/20 shadow-[0_-8px_32px_rgba(0,0,0,0.18)] sm:shadow-[0_15px_45px_rgba(0,0,0,0.25)] overflow-hidden liquid-glass"
        style={{
          paddingBottom: 'max(0.35rem, env(safe-area-inset-bottom, 0px))'
        }}
      >
        {/* Subtle specular reflection line */}
        <div className="absolute top-0 inset-x-8 h-[1px] bg-gradient-to-r from-transparent via-white/40 dark:via-white/20 to-transparent pointer-events-none" />

        {/* The 7 CodeQuest App Tabs */}
        <div className="flex items-center justify-between px-1.5 pt-2 pb-1 sm:px-3 sm:pt-2.5 sm:pb-1.5 w-full">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;

            return (
              <motion.button
                key={tab.id}
                onClick={() => handleSelectTab(tab.id)}
                className="flex flex-col items-center justify-center py-1 px-1 sm:px-2 rounded-2xl transition-all relative flex-1 min-w-0 group select-none cursor-pointer"
                whileTap={{ scale: 0.88 }}
                aria-label={tab.label}
              >
                {/* Active Capsule / Pill Indicator */}
                {isActive && (
                  <motion.div
                    layoutId="codequest-tab-active-pill"
                    className="absolute inset-0 bg-brand-500/15 dark:bg-brand-500/25 rounded-2xl border border-brand-500/30"
                    transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                  />
                )}

                {/* Icon with micro bounce on active */}
                <div className="relative z-10 flex items-center justify-center">
                  <motion.div
                    animate={isActive ? { scale: [1, 1.18, 1], y: [0, -1, 0] } : { scale: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`${
                      isActive
                        ? 'text-brand-500 dark:text-brand-400 drop-shadow-[0_2px_8px_rgba(99,102,241,0.4)]'
                        : 'text-content-muted group-hover:text-content-primary transition-colors'
                    }`}
                  >
                    <Icon className="w-5 h-5 sm:w-5.5 sm:h-5.5 shrink-0" />
                  </motion.div>
                </div>

                {/* Label */}
                <span
                  className={`text-[9px] sm:text-[10px] font-bold z-10 relative mt-0.5 truncate max-w-full text-center tracking-tight transition-colors ${
                    isActive
                      ? 'text-brand-600 dark:text-brand-300 font-extrabold'
                      : 'text-content-muted group-hover:text-content-primary'
                  }`}
                >
                  {t(tab.label)}
                </span>

                {/* Tiny Active Dot Indicator */}
                {isActive && (
                  <motion.span
                    layoutId="codequest-tab-active-dot"
                    className="w-1 h-1 rounded-full bg-brand-500 dark:bg-brand-400 mt-0.5 z-10"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
