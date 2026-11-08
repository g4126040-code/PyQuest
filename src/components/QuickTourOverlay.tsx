import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Code2, 
  Library, 
  BookOpen, 
  Trophy, 
  Sparkles, 
  ArrowRight, 
  Check, 
  X, 
  Play, 
  Compass, 
  Zap,
  RotateCcw
} from 'lucide-react';
import { playSound, triggerHaptic } from '../lib/sounds';
import { useLanguage } from '../contexts/LanguageContext';

export interface TourStep {
  id: string;
  targetTab: string; // 'learn' | 'playground' | 'library' | 'home' | 'profile'
  title: string;
  badge: string;
  description: string;
  features: string[];
  icon: React.ElementType;
  accentColor: string; // e.g. 'brand', 'emerald', 'cyan', 'amber'
  actionLabel?: string;
  tip?: string;
}

interface QuickTourOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tabId: string) => void;
  activeTab: string;
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome_quest',
    targetTab: 'learn',
    badge: 'Step 1 of 4 • CodeQuest Core',
    title: 'Learn by Doing: Interactive Tracks',
    description: 'Master Python, JavaScript, HTML/CSS, SQL, C++, Flutter, and AI Engineering through bite-sized, gamified interactive coding levels.',
    features: [
      'Hands-on code execution & automated test checks',
      'Earn XP, collect coins, and maintain your daily streak',
      'AI Mentor hints & instant offline code runner'
    ],
    icon: BookOpen,
    accentColor: 'from-indigo-500/20 to-brand-500/30 border-brand-500/40 text-brand-400',
    actionLabel: 'Explore Learn Track',
    tip: 'Click any level node to start instant interactive coding challenges!'
  },
  {
    id: 'feature_playground',
    targetTab: 'playground',
    badge: 'Step 2 of 4 • Free Sandbox',
    title: 'Code Playground & Live Sandbox',
    description: 'Your personal real-time code laboratory. Write, execute, and experiment with Python, JavaScript, HTML, and CSS anytime with zero setup.',
    features: [
      'Multi-language code editor with syntax highlighting',
      'Instant console output & live HTML/CSS web preview',
      'Save your snippets locally and run offline anytime'
    ],
    icon: Code2,
    accentColor: 'from-emerald-500/20 to-teal-500/30 border-emerald-500/40 text-emerald-400',
    actionLabel: 'Open Playground',
    tip: 'Test custom ideas freely without affecting your track levels.'
  },
  {
    id: 'feature_library',
    targetTab: 'library',
    badge: 'Step 3 of 4 • Code Library',
    title: 'Cheat Sheets & Code Library',
    description: 'A rich repository of syntax guides, boilerplate templates, algorithms, and real-world snippets across all supported languages.',
    features: [
      'Curated beginner-to-advanced reference snippets',
      'One-click "Open in Playground" to run code instantly',
      'Copy ready-made functions directly into your clipboard'
    ],
    icon: Library,
    accentColor: 'from-cyan-500/20 to-blue-500/30 border-cyan-500/40 text-cyan-400',
    actionLabel: 'Browse Library',
    tip: 'Whenever you get stuck on syntax, check the Library for fast examples.'
  },
  {
    id: 'community_profile',
    targetTab: 'home',
    badge: 'Step 4 of 4 • Global Arena',
    title: 'Leaderboard, Streaks & Ranks',
    description: 'Compete with developers across the globe, unlock developer badges, climb from Beginner to Master rank, and sync your achievements.',
    features: [
      'Real-time global leaderboard and streak multiplier',
      'Earn certificates upon track completion',
      'Installable PWA for high-speed offline learning on phone & desktop'
    ],
    icon: Trophy,
    accentColor: 'from-amber-500/20 to-orange-500/30 border-amber-500/40 text-amber-400',
    actionLabel: 'View Leaderboard',
    tip: 'You can replay this Quick Tour anytime from Settings!'
  }
];

export default function QuickTourOverlay({
  isOpen,
  onClose,
  onNavigateTab,
  activeTab
}: QuickTourOverlayProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const { t } = useLanguage();

  const currentStep = TOUR_STEPS[currentStepIndex];

  // Auto switch tab when step changes so the user sees the real screen behind the tour
  useEffect(() => {
    if (isOpen && currentStep) {
      onNavigateTab(currentStep.targetTab);
    }
  }, [isOpen, currentStepIndex]);

  if (!isOpen) return null;

  const handleNext = () => {
    playSound('click');
    triggerHaptic('light');
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    playSound('click');
    triggerHaptic('light');
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleFinish = () => {
    playSound('coin');
    triggerHaptic('medium');
    localStorage.setItem('codequest_tour_completed', 'true');
    onClose();
  };

  const handleSkip = () => {
    playSound('click');
    triggerHaptic('light');
    localStorage.setItem('codequest_tour_completed', 'true');
    onClose();
  };

  const StepIcon = currentStep.icon;

  return (
    <AnimatePresence>
      <motion.div
        key="quick-tour-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md overflow-y-auto"
      >
        {/* Specular Liquid Glass Modal */}
        <motion.div
          key={currentStep.id}
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ type: 'spring', stiffness: 420, damping: 32 }}
          className="relative w-full max-w-lg rounded-3xl overflow-hidden liquid-glass bg-surface-card/95 dark:bg-[#0c1222]/95 border border-white/40 dark:border-white/15 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] p-6 sm:p-7 text-content-primary"
        >
          {/* Top Sheen Highlight */}
          <div className="absolute top-0 inset-x-8 h-[1px] bg-gradient-to-r from-transparent via-white/50 dark:via-white/20 to-transparent pointer-events-none" />

          {/* Header Row: Step counter pill & close button */}
          <div className="flex items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-brand-500/15 text-brand-600 dark:text-brand-300 border border-brand-500/30">
                <Sparkles className="w-3.5 h-3.5 animate-pulse text-brand-500" />
                <span>{currentStep.badge}</span>
              </span>
            </div>

            <button
              onClick={handleSkip}
              className="p-1.5 rounded-full text-content-muted hover:text-content-primary hover:bg-white/10 dark:hover:bg-white/5 transition-colors"
              title="Close tour"
              aria-label="Close tour"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Hero Visual Card with dynamic gradient & Icon */}
          <div className={`rounded-2xl p-4 sm:p-5 mb-5 bg-gradient-to-br ${currentStep.accentColor} border relative overflow-hidden backdrop-blur-xl shadow-inner`}>
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 dark:bg-black/30 backdrop-blur-md flex items-center justify-center shrink-0 shadow-lg border border-white/30 dark:border-white/10">
                <StepIcon className="w-7 h-7" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl sm:text-2xl font-black text-content-primary leading-tight">
                  {currentStep.title}
                </h3>
                <p className="text-xs sm:text-sm text-content-secondary font-medium mt-1.5 leading-relaxed">
                  {currentStep.description}
                </p>
              </div>
            </div>

            {/* Tip pill */}
            {currentStep.tip && (
              <div className="mt-4 pt-3 border-t border-white/15 dark:border-white/10 flex items-center gap-2 text-xs font-bold text-content-primary/90">
                <Zap className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                <span>{currentStep.tip}</span>
              </div>
            )}
          </div>

          {/* Key Features Bullet List */}
          <div className="space-y-2.5 mb-6">
            <div className="text-[11px] font-black uppercase tracking-wider text-content-muted">
              Key Capabilities:
            </div>
            {currentStep.features.map((feat, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 text-xs sm:text-sm font-semibold text-content-secondary bg-surface-elevated/40 dark:bg-white/5 p-2.5 rounded-xl border border-outline/30"
              >
                <div className="w-4 h-4 rounded-full bg-brand-500/20 text-brand-500 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span>{feat}</span>
              </div>
            ))}
          </div>

          {/* Progress Indicators & Navigation Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-outline/30">
            {/* Step Dots */}
            <div className="flex items-center gap-1.5">
              {TOUR_STEPS.map((step, idx) => (
                <button
                  key={step.id}
                  onClick={() => {
                    playSound('click');
                    triggerHaptic('light');
                    setCurrentStepIndex(idx);
                  }}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === currentStepIndex
                      ? 'w-7 bg-brand-500'
                      : 'w-2 bg-content-muted/30 hover:bg-content-muted/60'
                  }`}
                  aria-label={`Go to step ${idx + 1}`}
                />
              ))}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {currentStepIndex > 0 && (
                <button
                  onClick={handlePrev}
                  className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-surface-elevated/60 hover:bg-surface-elevated text-content-secondary hover:text-content-primary border border-outline/40 transition-colors"
                >
                  Back
                </button>
              )}

              <button
                onClick={handleSkip}
                className="px-3 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-content-muted hover:text-content-primary transition-colors"
              >
                Skip
              </button>

              <button
                onClick={handleNext}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm bg-brand-500 hover:bg-brand-600 text-white shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center gap-1.5 active:scale-95"
              >
                <span>{currentStepIndex === TOUR_STEPS.length - 1 ? 'Get Started' : 'Next'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
