/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import ChallengeView from './components/ChallengeView';
import WelcomeScreen from './components/WelcomeScreen';
import { challenges, TRACKS } from './data/challenges';
import { useProgress } from './contexts/ProgressContext';
import { X, Moon, Sun, Coins, Home, LayoutGrid } from 'lucide-react';
import { useLanguage } from './contexts/LanguageContext';
import { useTheme } from './contexts/ThemeContext';
import { useAuth } from './contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { playSound, triggerHaptic } from './lib/sounds';
import BottomNav from './components/BottomNav';
import SettingsScreen from './components/SettingsScreen';
import ProfileScreen from './components/ProfileScreen';
import HomeScreen from './components/HomeScreen';
import PlaygroundScreen from './components/PlaygroundScreen';
import LibraryScreen from './components/LibraryScreen';
import Mascot from './components/Mascot';
import { useMascot } from './contexts/MascotContext';
import confetti from 'canvas-confetti';
import AnimatedCounter from "./components/AnimatedCounter";
import AIAgentGate from './components/AIAgentGate';
import SourceCodeExplorer from './components/SourceCodeExplorer';
import { Bot, Sparkles, Code2 } from 'lucide-react';
import { OfflineIndicator } from './components/OfflineIndicator';
import { evaluateOffline, runOffline } from './lib/offlineRunner';
import QuickTourOverlay from './components/QuickTourOverlay';

const PlaceholderScreen = ({ title, icon: Icon }: { title: string, icon: any }) => {
  const { t } = useLanguage();
  return (
    <div className="flex-grow flex flex-col items-center justify-center p-8 text-center pb-32">
      <div className="w-24 h-24 bg-surface-elevated rounded-full flex items-center justify-center mb-6 shadow-soft">
        <Icon className="w-12 h-12 text-brand-500/50" />
      </div>
      <h1 className="text-3xl font-extrabold mb-4">{t(title)}</h1>
      <p className="text-content-secondary font-medium max-w-sm">
        {t('This section is coming soon! Keep learning and check back later.')}
      </p>
    </div>
  );
};

export default function App() {
  const { triggerMascot } = useMascot();
  const [showWelcome, setShowWelcome] = useState(() => {
    return !localStorage.getItem('codequest_welcome_completed');
  });

  const [showTour, setShowTour] = useState(() => {
    // If user already finished welcome screen in the past and hasn't seen the tour yet, or is brand new
    const welcomeDone = localStorage.getItem('codequest_welcome_completed');
    const tourDone = localStorage.getItem('codequest_tour_completed');
    // If welcome is already completed previously but tour was never seen, offer the tour
    return Boolean(welcomeDone && !tourDone);
  });

  // Global Ripple Effect
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const button = target.closest('button');
      if (button) {
        const circle = document.createElement('span');
        const diameter = Math.max(button.clientWidth, button.clientHeight);
        const radius = diameter / 2;
        
        const rect = button.getBoundingClientRect();
        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${e.clientX - rect.left - radius}px`;
        circle.style.top = `${e.clientY - rect.top - radius}px`;
        circle.classList.add('ripple-element');
        
        // Remove existing ripples to keep DOM clean
        const existingRipple = button.querySelector('.ripple-element');
        if (existingRipple) {
          existingRipple.remove();
        }
        
        button.appendChild(circle);
      }
    };
    
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);
  
  const [activeTab, setActiveTab] = useState('learn');
  const { progress, completeLesson, setCurrentLanguage } = useProgress();
  const completedIds = React.useMemo(() => {
    let ids: string[] = [];
    Object.values(progress.languageProgress).forEach(lp => {
      ids = ids.concat(lp.completedLessons);
    });
    return ids;
  }, [progress]);
  const [activeChallengeId, setActiveChallengeId] = useState<string | null>(null);
  const [playgroundLang, setPlaygroundLang] = useState('python');
  
  const [streakData, setStreakData] = useState(() => {
    const saved = localStorage.getItem('codequest_streak');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (typeof parsed.streakFreeze === 'undefined') {
        parsed.streakFreeze = 0;
      }
      return parsed;
    }
    return { current: 0, longest: 0, lastDate: null, claimed: [], streakFreeze: 0 };
  });
  
  const [coins, setCoins] = useState(() => {
    const saved = localStorage.getItem('codequest_coins');
    return saved ? parseInt(saved, 10) : 150; // Mock initial coins for returning users
  });
  
  const { t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { user, updateProfileData } = useAuth();

  // Dual Gate Architecture: Human Gate (Interactive UI) vs AI Agent Gate (Headless Non-Click Protocol)
  const [currentGate, setCurrentGate] = useState<'human' | 'ai'>(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('gate') === 'ai') return 'ai';
    }
    return (localStorage.getItem('codequest_gate') as 'human' | 'ai') || 'human';
  });

  // Source Code & Backup Vault Explorer state
  const [showSourceCode, setShowSourceCode] = useState(false);

  const switchGate = (newGate: 'human' | 'ai') => {
    setCurrentGate(newGate);
    localStorage.setItem('codequest_gate', newGate);
    playSound('click');
    triggerHaptic('medium');
  };

  // Expose headless window.AI_GATE so browser agents and ChatGPT tools can operate without clicking
  useEffect(() => {
    (window as any).AI_GATE = {
      version: '2.0.0',
      description: 'CodeQuest Headless Non-Click Agent Protocol',
      getGate: () => currentGate,
      setGate: (g: 'human' | 'ai') => switchGate(g),
      getTracks: () => TRACKS,
      getChallenges: (trackId?: string) => (trackId ? challenges.filter((c) => c.trackId === trackId) : challenges),
      getChallenge: (id: string) => challenges.find((c) => c.id === id),
      getCurrentChallenge: () => activeChallengeId ? challenges.find((c) => c.id === activeChallengeId) : null,
      submitCode: async (challengeId: string, code: string) => {
        let data: any;
        try {
          const res = await fetch('/api/agent/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ challengeId, code })
          });
          data = await res.json();
        } catch (e) {
          const challenge = challenges.find((c) => c.id === challengeId);
          if (challenge) {
            data = evaluateOffline(challenge, code, 0);
          } else {
            throw e;
          }
        }
        if (data.correct) {
          completeLesson(challengeId);
          playSound('coin');
          triggerHaptic('light');
        }
        return data;
      },
      runCode: async (code: string, language: string = 'python') => {
        try {
          const res = await fetch('/api/run', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, programmingLanguage: language })
          });
          return await res.json();
        } catch (e) {
          return runOffline(code, language);
        }
      },
      executeCommand: async (command: string, args: any = {}) => {
        const res = await fetch('/api/agent/command', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ command, args })
        });
        return await res.json();
      },
      getProgress: () => ({
        completedIds,
        totalCompleted: completedIds.length,
        xp: completedIds.length * 50,
        coins,
        streak: streakData.current
      })
    };
  }, [currentGate, activeChallengeId, completedIds, coins, streakData]);





  const handleComplete = async () => {
    playSound('coin'); triggerHaptic('medium');
    triggerMascot('success', 'Great job! You nailed it!');
    
    confetti({
      particleCount: 200,
      spread: 120,
      origin: { y: 0.6 },
      colors: ['#34d399', '#6366f1', '#f43f5e', '#fbbf24', '#0ea5e9']
    });

    if (activeChallengeId) {
      completeLesson(activeChallengeId);
      
      let earnedCoins = 20;
      // Handle Streak
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const newStreakData = { ...streakData };
      if (newStreakData.lastDate !== today) {
        if (newStreakData.lastDate) {
          const lastDateObj = new Date(newStreakData.lastDate);
          const todayObj = new Date(today);
          const diffTime = Math.abs(todayObj.getTime() - lastDateObj.getTime());
          let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          while (diffDays > 1 && newStreakData.streakFreeze > 0) {
            newStreakData.streakFreeze -= 1;
            diffDays -= 1;
          }

          if (diffDays <= 1) {
            newStreakData.current += 1;
          } else {
            newStreakData.current = 1; // Reset if missed a day and no freezes left
          }
        } else {
          newStreakData.current = 1;
        }
        
        newStreakData.lastDate = today;
        if (newStreakData.current > newStreakData.longest) {
          newStreakData.longest = newStreakData.current;
        }

        // Check milestones
        const milestones = [7, 30, 100, 365];
        if (milestones.includes(newStreakData.current) && !newStreakData.claimed.includes(newStreakData.current)) {
          newStreakData.claimed.push(newStreakData.current);
          earnedCoins += 100; // Milestone bonus
          setTimeout(() => triggerMascot('streak', `Wow! ${newStreakData.current} day streak!`), 2500);
        }
        
        setStreakData(newStreakData);
        localStorage.setItem('codequest_streak', JSON.stringify(newStreakData));
      }

      const newCoins = coins + earnedCoins;
      setCoins(newCoins);
      localStorage.setItem('codequest_coins', newCoins.toString());
      
      if (user) {
        await updateProfileData({ 
          coins: newCoins,
          streak: newStreakData.current,
          lastDate: newStreakData.lastDate,
          rank: completedIds.length * 50 >= 1000 ? 'Master' : completedIds.length * 50 >= 500 ? 'Pro' : 'Beginner'
        });
      }

      // Automatically load next lesson inside the CURRENT track
      const currentTrackId = challenges.find(c => c.id === activeChallengeId)?.trackId;
      const trackChallenges = challenges.filter(c => c.trackId === currentTrackId);
      const currentIndex = trackChallenges.findIndex(c => c.id === activeChallengeId);
      
      if (currentIndex !== -1 && currentIndex < trackChallenges.length - 1) {
        setActiveChallengeId(trackChallenges[currentIndex + 1].id);
      } else {
        setTimeout(() => triggerMascot('complete', 'You completed all challenges for this track!'), 1500);
        setActiveChallengeId(null);
      }
    } else {
      setActiveChallengeId(null);
    }
  };


  
  // Validation Layer: Ensure active challenge matches the selected language track
  useEffect(() => {
    if (activeChallengeId) {
      const challenge = challenges.find(c => c.id === activeChallengeId);
      if (challenge && challenge.trackId !== progress.currentLanguage) {
        // Automatically sync current language to match the active challenge's track
        setCurrentLanguage(challenge.trackId);
      }
    }
  }, [activeChallengeId, progress.currentLanguage, setCurrentLanguage]);

  const handleBuyStreakFreeze = () => {
    if (coins >= 200) {
      const newCoins = coins - 200;
      setCoins(newCoins);
      localStorage.setItem('codequest_coins', newCoins.toString());
      
      const newStreakData = { ...streakData, streakFreeze: (streakData.streakFreeze || 0) + 1 };
      setStreakData(newStreakData);
      localStorage.setItem('codequest_streak', JSON.stringify(newStreakData));
      return true;
    }
    return false;
  };

  const handleTabSelect = (tab: string) => {
    if (activeChallengeId) {
      setActiveChallengeId(null);
    }
    setActiveTab(tab);
    document.getElementById('codequest-main-scroll')?.scrollTo({ top: 0, behavior: 'auto' });
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  useEffect(() => {
    if (activeChallengeId) {
      document.getElementById('codequest-main-scroll')?.scrollTo({ top: 0, behavior: 'auto' });
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [activeChallengeId]);

  const activeChallenge = challenges.find(c => c.id === activeChallengeId);

  if (showWelcome) {
    return <WelcomeScreen onComplete={() => {
      setShowWelcome(false);
      setShowTour(true);
      setTimeout(() => triggerMascot('welcome', 'Welcome! Ready to code?'), 1000);
    }} />;
  }

  if (currentGate === 'ai') {
    return (
      <>
        <AIAgentGate
          onSwitchToHuman={() => switchGate('human')}
          completedIds={completedIds}
          onOpenSourceCode={() => setShowSourceCode(true)}
          onCompleteLesson={(id) => {
            completeLesson(id);
            playSound('coin');
            triggerHaptic('light');
          }}
        />
        <SourceCodeExplorer isOpen={showSourceCode} onClose={() => setShowSourceCode(false)} />
      </>
    );
  }

  return (
    <div className="h-[100dvh] max-h-[100dvh] w-full flex flex-col overflow-hidden relative bg-surface-main mesh-bg text-content-primary selection:bg-brand-500/30 font-sans transition-colors duration-300">
      {/* Floating Gate Indicator for switching between Human Gate & AI Agent Gate & Source Code */}
      <div className="fixed top-3 right-4 z-40">
        <div className="liquid-glass border border-white/40 dark:border-white/10 rounded-full p-1 pl-3 pr-1 shadow-md flex items-center gap-1.5 sm:gap-2 backdrop-blur-xl">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-content-secondary">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Gate: <strong className="text-content-primary">Human 👤</strong></span>
          </div>
          <button
            onClick={() => switchGate('ai')}
            title="Switch to AI Agent Gate (Headless non-click protocol for ChatGPT)"
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-500/15 hover:bg-brand-500/25 text-brand-600 dark:text-brand-300 text-[10px] font-extrabold transition-all active:scale-95 border border-brand-500/30"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>AI Gate 🤖</span>
          </button>
          <button
            onClick={() => {
              playSound('click');
              triggerHaptic('light');
              setShowSourceCode(true);
            }}
            title="Inspect Complete Source Code & Backup Vault"
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-600 dark:text-indigo-300 text-[10px] font-extrabold transition-all active:scale-95 border border-indigo-500/30"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Source Code & Backups</span>
            <span className="sm:hidden">Code 💻</span>
          </button>
        </div>
      </div>

      {/* Offline Status Toast / Banner */}
      <OfflineIndicator />

      {/* Main Application Scroll Container */}
      <main
        id="codequest-main-scroll"
        className="flex-1 w-full overflow-y-auto overflow-x-hidden relative smooth-scroll"
      >
        <AnimatePresence mode="wait">
          {activeChallenge ? (
            <motion.div 
              key="challenge"
              layoutId={`challenge-${activeChallenge.id}`}
              initial={{ opacity: 0, scale: 0.98, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 350, damping: 30, mass: 0.8 }}
              className="min-h-full w-full flex flex-col bg-surface-main relative z-10 pb-28 sm:pb-32 lg:pb-6"
            >
              {/* Top App Bar */}
              <div className="h-16 sticky top-0 z-30 flex items-center px-4 liquid-glass shadow-sm">
                <button 
                  onClick={() => {
                    playSound('click'); triggerHaptic('light');
                    setActiveChallengeId(null);
                  }}
                  className="text-content-secondary hover:text-content-primary p-2 -ml-2 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
                
                <div className="flex-grow flex flex-col items-center justify-center">
                  <div className="text-xs font-bold text-content-muted uppercase tracking-wider">{t(TRACKS.find(t => t.id === activeChallenge.trackId)?.name || 'CodeQuest')}</div>
                  <div className="text-sm font-bold text-content-primary">
                    {t('Chapter')} {activeChallenge.stage} • {t('Level')} {activeChallenge.level}
                  </div>
                </div>

                <div className="flex items-center gap-1 font-bold text-amber-500">
                  <AnimatedCounter value={completedIds.length * 50} className="text-sm" />
                  <span className="text-xs">{t('XP')}</span>
                </div>
              </div>
              
              {/* Content */}
              <div className="flex-grow flex flex-col min-h-0">
                <ChallengeView 
                  key={activeChallenge.id}
                  challenge={activeChallenge} 
                  onComplete={handleComplete} 
                />
              </div>
            </motion.div>
          ) : (
            <div className="flex flex-col min-h-full w-full">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 30, mass: 0.8 }}
                  className="flex flex-col flex-grow w-full smooth-scroll"
                >
                  {activeTab === 'home' && <HomeScreen />}
                  {activeTab === 'learn' && (
                    <Dashboard 
                      completedChallengeIds={completedIds} 
                      onSelectChallenge={setActiveChallengeId} 
                      streak={streakData.current}
                      longestStreak={streakData.longest}
                      coins={coins}
                    />
                  )}
                  {activeTab === 'playground' && <PlaygroundScreen />}
                  {activeTab === 'library' && (
                    <LibraryScreen 
                      onOpenInPlayground={(lang, code) => {
                        setPlaygroundLang(lang);
                        setActiveTab('playground');
                      }} 
                    />
                  )}
                  {activeTab === 'projects' && <PlaceholderScreen title="Projects" icon={LayoutGrid} />}
                  {activeTab === 'profile' && (
                    <ProfileScreen
                      xp={completedIds.length * 50}
                      coins={coins}
                      streak={streakData.current}
                      completedIds={completedIds}
                      languageProgress={progress.languageProgress}
                      streakFreeze={streakData.streakFreeze || 0}
                      onBuyStreakFreeze={handleBuyStreakFreeze}
                    />
                  )}
                  {activeTab === 'settings' && (
                    <SettingsScreen 
                      onOpenSourceCode={() => setShowSourceCode(true)} 
                      onStartTour={() => setShowTour(true)}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Mascot */}
      <Mascot />

      {/* Persistent Viewport-Fixed CodeQuest Bottom Navigation */}
      <BottomNav activeTab={activeChallenge ? 'learn' : activeTab} setActiveTab={handleTabSelect} />

      {/* Quick Tour Overlay for New Users and Manual Replay */}
      <QuickTourOverlay
        isOpen={showTour}
        onClose={() => setShowTour(false)}
        onNavigateTab={(tab) => {
          handleTabSelect(tab);
        }}
        activeTab={activeTab}
      />

      {/* Developer Source Code & Backups Explorer */}
      <SourceCodeExplorer isOpen={showSourceCode} onClose={() => setShowSourceCode(false)} />
    </div>
  );
}
