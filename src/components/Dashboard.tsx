import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Lock, Code2, Flame, Star, Trophy, PenTool, LayoutTemplate, LayoutGrid, Globe, Crown, Coins, Shield, Medal, Target, Sparkles, Zap } from 'lucide-react';
import { challenges, Challenge, TRACKS, genericConcepts, pythonConcepts, htmlConcepts, cssConcepts, jsConcepts, sqlConcepts, cConcepts, cppConcepts, javaConcepts, dartConcepts, flutterConcepts, gitConcepts, firebaseConcepts, restConcepts, geminiConcepts, fullstackConcepts } from '../data/challenges';
import { useLanguage, Language } from '../contexts/LanguageContext';
import { playSound, triggerHaptic } from '../lib/sounds';
import { useProgress } from '../contexts/ProgressContext';
import AnimatedCounter from './AnimatedCounter';

interface DashboardProps {
  completedChallengeIds: string[];
  onSelectChallenge: (id: string) => void;
  streak: number;
  longestStreak: number;
  coins: number;
}


const getChapterRank = (chapterNum: number) => {
  switch (chapterNum) {
    case 1: return { name: 'Bronze', color: 'text-orange-700 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-950/30', border: 'border-orange-200 dark:border-orange-500/20', icon: Shield };
    case 2: return { name: 'Silver', color: 'text-slate-600 dark:text-slate-300', bg: 'bg-slate-100 dark:bg-slate-800/50', border: 'border-slate-300 dark:border-slate-600/50', icon: Shield };
    case 3: return { name: 'Gold', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-950/30', border: 'border-yellow-200 dark:border-yellow-500/20', icon: Medal };
    case 4: return { name: 'Platinum', color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-50 dark:bg-teal-950/30', border: 'border-teal-200 dark:border-teal-500/20', icon: Medal };
    case 5: return { name: 'Diamond', color: 'text-cyan-500 dark:text-cyan-400', bg: 'bg-cyan-50 dark:bg-cyan-950/30', border: 'border-cyan-200 dark:border-cyan-500/20', icon: Trophy };
    case 6: return { name: 'Emerald', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-200 dark:border-emerald-500/20', icon: Trophy };
    case 7: return { name: 'Ruby', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/30', border: 'border-rose-200 dark:border-rose-500/20', icon: Crown };
    case 8: return { name: 'Master', color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-950/30', border: 'border-violet-200 dark:border-violet-500/20', icon: Crown };
    case 9: return { name: 'Grandmaster', color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/30', border: 'border-indigo-200 dark:border-indigo-500/20', icon: Crown };
    case 10: return { name: 'Legendary', color: 'text-fuchsia-600 dark:text-fuchsia-400', bg: 'bg-fuchsia-50 dark:bg-fuchsia-950/30', border: 'border-fuchsia-200 dark:border-fuchsia-500/20', icon: Crown };
    default: return null;
  }
};

const getRank = (xp: number) => {
  if (xp >= 2500) return { name: 'Diamond', color: 'text-cyan-500 dark:text-cyan-400', bg: 'bg-cyan-50 dark:bg-cyan-950/30', border: 'border-cyan-200 dark:border-cyan-500/20', icon: Trophy };
  if (xp >= 1000) return { name: 'Gold', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-950/30', border: 'border-yellow-200 dark:border-yellow-500/20', icon: Medal };
  if (xp >= 250) return { name: 'Silver', color: 'text-slate-600 dark:text-slate-300', bg: 'bg-slate-100 dark:bg-slate-800/50', border: 'border-slate-300 dark:border-slate-600/50', icon: Shield };
  return { name: 'Bronze', color: 'text-orange-700 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-950/30', border: 'border-orange-200 dark:border-orange-500/20', icon: Shield };
};

const XP_MILESTONES = [250, 500, 1000, 1500, 2000, 2500, 3500, 5000, 7500, 10000];

const getXPMilestoneInfo = (xp: number) => {
  let prevMilestone = 0;
  let nextMilestone = 250;

  for (let i = 0; i < XP_MILESTONES.length; i++) {
    if (xp < XP_MILESTONES[i]) {
      nextMilestone = XP_MILESTONES[i];
      prevMilestone = i === 0 ? 0 : XP_MILESTONES[i - 1];
      break;
    }
    if (i === XP_MILESTONES.length - 1) {
      prevMilestone = Math.floor(xp / 2500) * 2500;
      nextMilestone = prevMilestone + 2500;
    }
  }

  const tierSpan = Math.max(1, nextMilestone - prevMilestone);
  const tierProgress = Math.min(100, Math.max(0, ((xp - prevMilestone) / tierSpan) * 100));
  const nextRankName =
    nextMilestone <= 250
      ? 'Silver Rank'
      : nextMilestone <= 1000
        ? 'Gold Rank'
        : nextMilestone <= 2500
          ? 'Diamond Rank'
          : `${nextMilestone.toLocaleString()} XP Milestone`;

  return {
    prevMilestone,
    nextMilestone,
    tierProgress,
    xpRemaining: Math.max(0, nextMilestone - xp),
    nextRankName
  };
};

export default function Dashboard({ completedChallengeIds, onSelectChallenge, streak, longestStreak, coins }: DashboardProps) {
  const { t } = useLanguage();
  const currentXP = completedChallengeIds.length * 50;
  const rank = getRank(currentXP);
  
  const { progress, setCurrentLanguage } = useProgress();
  const selectedTrackId = progress.currentLanguage;
  const setSelectedTrackId = setCurrentLanguage;

  const [showLangSelector, setShowLangSelector] = useState(false);

  const activeTrack = TRACKS.find(t => t.id === selectedTrackId) || TRACKS[0];
  const trackChallenges = challenges.filter(c => c.trackId === selectedTrackId);
  const trackChallengesCompleted = trackChallenges.filter(c => completedChallengeIds.includes(c.id)).length;
  const currentChapter = Math.min(10, Math.floor(trackChallengesCompleted / 5));
  const trackRank = currentChapter > 0 ? getChapterRank(currentChapter) : getChapterRank(1);

  const conceptMap: Record<string, string[]> = {
    python_practice: ["Practice Part 1", "Practice Part 2"],
    python: pythonConcepts, html: htmlConcepts, css: cssConcepts, js: jsConcepts,
    sql: sqlConcepts, c: cConcepts, cpp: cppConcepts, java: javaConcepts,
    dart: dartConcepts, flutter: flutterConcepts, git: gitConcepts,
    firebase: firebaseConcepts, rest: restConcepts, gemini: geminiConcepts, fullstack: fullstackConcepts
  };
  const trackConcepts = conceptMap[activeTrack.id] || genericConcepts;

  const chapterCount = Math.ceil(trackChallenges.length / 5);
  const CHAPTERS = Array.from({ length: chapterCount }, (_, i) => {
    const chapterNum = i + 1;
    const startLevel = (chapterNum - 1) * 5 + 1;
    const endLevel = chapterNum * 5;
    const icons = [LayoutTemplate, LayoutGrid, PenTool, Trophy];
    const colorSets = [
      { text: "text-brand-500", bg: "bg-brand-500/80 backdrop-blur-xl border border-white/20", ring: "ring-brand-500/30", shadow: "shadow-sm" },
      { text: "text-purple-500", bg: "bg-purple-500/80 backdrop-blur-xl border border-white/20", ring: "ring-purple-500/30", shadow: "shadow-sm" },
      { text: "text-rose-500", bg: "bg-rose-500/80 backdrop-blur-xl border border-white/20", ring: "ring-rose-500/30", shadow: "shadow-sm" },
      { text: "text-amber-500", bg: "bg-amber-500/80 backdrop-blur-xl border border-white/20", ring: "ring-amber-500/30", shadow: "shadow-sm" }
    ];
    
    const styleIdx = i % 4;
    
    return {
      id: chapterNum,
      conceptKey: trackConcepts[i] || 'Concept',
      startLevel,
      endLevel,
      icon: icons[styleIdx],
      colors: colorSets[styleIdx]
    };
  });
  
  // Group challenges by chapter
  const challengesByStage: Record<number, Challenge[]> = {};
  CHAPTERS.forEach(s => challengesByStage[s.id] = []);
  trackChallenges.forEach(c => {
    if (challengesByStage[c.stage]) {
      challengesByStage[c.stage].push(c);
    }
  });

  let firstLockedFound = false;
  const isFinalTrack = activeTrack.id === 'fullstack';
  const currentTrackMax = activeTrack.id === 'python' ? 20 : activeTrack.id === 'python_practice' ? 10 : 100;
  const hasCompletedCurrentTrack = completedChallengeIds.includes(`l${activeTrack.offset + currentTrackMax}`);
  const hasCompletedAll = completedChallengeIds.includes(`l1500`);
  const today = new Date().toISOString().split('T')[0];
  const dailyCompleted = progress.lastActiveDate === today ? (progress.dailyCompletedLessons || 0) : 0;
  const targetCompleted = Math.min(3, dailyCompleted);
  const dailyProgressPercent = (targetCompleted / 3) * 100;

  // XP Milestone & Track Completion metrics
  const xpMilestoneInfo = getXPMilestoneInfo(currentXP);
  const totalTrackCount = Math.max(1, trackChallenges.length);
  const trackProgressPercent = Math.min(100, Math.round((trackChallengesCompleted / totalTrackCount) * 100));

  // Remember previous XP and track completion in sessionStorage so returning from ChallengeView animates smoothly from old -> new
  const [prevMetrics] = useState(() => {
    try {
      const savedXP = sessionStorage.getItem('codequest_dash_prev_xp');
      const savedTrack = sessionStorage.getItem(`codequest_dash_prev_track_${selectedTrackId}`);
      const savedDaily = sessionStorage.getItem('codequest_dash_prev_daily');
      const prevXPVal = savedXP !== null ? parseInt(savedXP, 10) : currentXP;
      const prevTrackVal = savedTrack !== null ? parseInt(savedTrack, 10) : trackChallengesCompleted;
      const prevDailyVal = savedDaily !== null ? parseInt(savedDaily, 10) : targetCompleted;
      return {
        xp: isNaN(prevXPVal) ? currentXP : prevXPVal,
        trackDone: isNaN(prevTrackVal) ? trackChallengesCompleted : prevTrackVal,
        dailyDone: isNaN(prevDailyVal) ? targetCompleted : prevDailyVal
      };
    } catch {
      return { xp: currentXP, trackDone: trackChallengesCompleted, dailyDone: targetCompleted };
    }
  });

  const xpGained = Math.max(0, currentXP - prevMetrics.xp);
  const crossedMilestone = React.useMemo(() => {
    if (xpGained <= 0) return null;
    for (const m of XP_MILESTONES) {
      if (prevMetrics.xp < m && currentXP >= m) return m;
    }
    if (Math.floor(currentXP / 250) > Math.floor(prevMetrics.xp / 250)) {
      return Math.floor(currentXP / 250) * 250;
    }
    return null;
  }, [prevMetrics.xp, currentXP, xpGained]);

  const [showCelebrationPulse, setShowCelebrationPulse] = useState(() => xpGained > 0);

  useEffect(() => {
    try {
      sessionStorage.setItem('codequest_dash_prev_xp', currentXP.toString());
      sessionStorage.setItem(`codequest_dash_prev_track_${selectedTrackId}`, trackChallengesCompleted.toString());
      sessionStorage.setItem('codequest_dash_prev_daily', targetCompleted.toString());
    } catch {}

    if (xpGained > 0) {
      setShowCelebrationPulse(true);
      const timer = setTimeout(() => setShowCelebrationPulse(false), 3800);
      return () => clearTimeout(timer);
    }
  }, [currentXP, trackChallengesCompleted, targetCompleted, selectedTrackId, xpGained]);

  const prevXPMilestonePercent = crossedMilestone
    ? 0
    : getXPMilestoneInfo(prevMetrics.xp).tierProgress;
  const prevTrackPercent = Math.min(100, Math.round((prevMetrics.trackDone / totalTrackCount) * 100));
  const prevDailyPercent = (Math.min(3, prevMetrics.dailyDone) / 3) * 100;

  return (
    <div className="w-full max-w-4xl mx-auto py-6 sm:py-10 px-4 flex flex-col items-center pb-32 sm:pb-36">
      {/* Top Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className={`w-full flex flex-col items-center liquid-glass rounded-3xl p-3 sm:p-4 mb-8 sticky top-4 z-50 transition-all transform-gpu shadow-xl ${
          showCelebrationPulse ? 'ring-2 ring-amber-400/60 shadow-[0_0_35px_rgba(251,191,36,0.25)]' : ''
        }`}
      >
        <div className="flex items-center justify-between w-full mb-2 sm:mb-3 relative">
          {/* Top Left: XP Counter */}
          <motion.div
            animate={showCelebrationPulse ? { scale: [1, 1.12, 1] } : { scale: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="flex items-center gap-1.5 sm:gap-2 text-yellow-600 dark:text-yellow-400 font-black bg-yellow-50 dark:bg-yellow-950/30 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl border border-yellow-200 dark:border-yellow-500/20 text-sm sm:text-base shadow-sm relative"
          >
            <Crown className="w-4 sm:w-5 h-4 sm:h-5 fill-current" />
            <AnimatedCounter value={currentXP} />
            <span className="hidden sm:inline">{t('XP')}</span>
            <AnimatePresence>
              {showCelebrationPulse && xpGained > 0 && (
                <motion.span
                  initial={{ opacity: 0, y: 8, scale: 0.8 }}
                  animate={{ opacity: 1, y: -18, scale: 1 }}
                  exit={{ opacity: 0, y: -26 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 20 }}
                  className="absolute -top-2 right-0 bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-md pointer-events-none whitespace-nowrap"
                >
                  +{xpGained} XP
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
          
          {/* Center: Language Selector */}
          <div className="absolute left-1/2 -translate-x-1/2 z-[100]">
            <button 
              onClick={() => setShowLangSelector(!showLangSelector)} 
              className="flex items-center gap-1.5 sm:gap-2 font-black px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl border bg-surface-elevated border-outline/50 shadow-sm transition-transform hover:scale-105"
            >
              <Code2 className="w-4 sm:w-5 h-4 sm:h-5 text-brand-500" />
              <span className="text-sm sm:text-base whitespace-nowrap">{activeTrack.name}</span>
            </button>
            {showLangSelector && (
              <>
                <div 
                  className="fixed inset-0 z-40 bg-black/20"
                  onClick={() => setShowLangSelector(false)}
                />
                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-56 bg-surface-elevated border border-outline/50 rounded-2xl shadow-xl z-50 max-h-64 overflow-y-auto no-scrollbar">
                  {TRACKS.map(track => {
                    let Icon = Code2;
                    if (['html', 'css', 'js', 'rest'].includes(track.id)) Icon = Globe;
                    if (['sql', 'flutter'].includes(track.id)) Icon = LayoutGrid;
                    if (track.id === 'firebase') Icon = Flame;
                    if (track.id === 'gemini') Icon = Star;
                    
                    return (
                      <button 
                        key={track.id} 
                        onClick={() => { 
                          playSound('click'); 
                          triggerHaptic('light');
                          setSelectedTrackId(track.id); 
                          setShowLangSelector(false); 
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }} 
                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold border-b border-outline/20 last:border-0 hover:bg-surface-hover transition-colors ${selectedTrackId === track.id ? 'bg-brand-500/10 text-brand-500' : 'text-content-primary'}`}
                      >
                        <Icon className="w-4 h-4" />
                        {track.name}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
          
          {/* Top Right: Daily Streak */}
          <motion.div 
            key={streak}
            initial={{ scale: 1.5, rotate: -15, filter: 'brightness(1.5)', y: -10 }}
            animate={{ scale: 1, rotate: 0, filter: 'brightness(1)', y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 12 }}
            className="flex items-center gap-1.5 sm:gap-2 text-orange-500 font-black bg-orange-50 dark:bg-orange-950/30 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl border border-orange-200 dark:border-orange-500/20 group relative cursor-help text-sm sm:text-base shadow-sm"
          >
            <motion.div
              initial={{ color: '#facc15', scale: 1.5 }}
              animate={{ color: '#f97316', scale: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <Flame className="w-4 sm:w-5 h-4 sm:h-5 fill-current" />
            </motion.div>
            <motion.span
              initial={{ scale: 1.5, color: '#facc15' }}
              animate={{ scale: 1, color: '#f97316' }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              {streak}
            </motion.span>
            <div className="absolute -bottom-10 sm:-bottom-12 right-0 opacity-0 group-hover:opacity-100 transition-opacity liquid-glass !rounded-xl text-content-primary px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold whitespace-nowrap pointer-events-none z-20 shadow-lg">
              {t('Current')}: {streak} | {t('Longest')}: {longestStreak}
            </div>
          </motion.div>
        </div>
        
        {/* Below them, Center: Rank Badge */}
        <div className="flex flex-wrap items-center justify-center gap-2 w-full">
          <div className={`flex items-center gap-1.5 sm:gap-2 font-black px-4 sm:px-5 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl border ${trackRank?.bg || rank.bg} ${trackRank?.border || rank.border} ${trackRank?.color || rank.color} text-xs sm:text-sm uppercase tracking-wider shadow-sm transition-transform hover:scale-105`}>
            {(trackRank?.icon || rank.icon) && React.createElement(trackRank?.icon || rank.icon, { className: "w-4 sm:w-5 h-4 sm:h-5 fill-current" })}
            <span>{trackRank ? trackRank.name : rank.name} {t('Rank')} ({activeTrack.name})</span>
          </div>

          <AnimatePresence>
            {crossedMilestone && showCelebrationPulse && (
              <motion.div
                initial={{ opacity: 0, scale: 0.85, y: -6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/25 border border-amber-400/50 text-amber-500 dark:text-amber-300 text-xs font-black shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>{crossedMilestone} XP Milestone Reached!</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Smooth Progress Bars Grid: XP Milestone & Active Track + Daily Goal */}
        <div className="w-full mt-2.5 sm:mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4 px-1">
          {/* 1. XP Milestone Progress Bar */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <span className="text-[11px] sm:text-xs font-bold text-content-secondary flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>Next: {xpMilestoneInfo.nextRankName}</span>
              </span>
              <span className="text-[11px] sm:text-xs font-black text-amber-600 dark:text-amber-400">
                {currentXP} / {xpMilestoneInfo.nextMilestone} {t('XP')}
              </span>
            </div>
            <div className="w-full bg-surface-elevated/60 border border-outline/30 rounded-full h-2.5 sm:h-3 overflow-hidden shadow-inner relative">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-500 relative overflow-hidden shadow-[0_0_12px_rgba(245,158,11,0.5)]"
                initial={{ width: `${prevXPMilestonePercent}%` }}
                animate={{ width: `${xpMilestoneInfo.tierProgress}%` }}
                transition={{ type: 'spring', stiffness: 120, damping: 20, mass: 0.9 }}
              >
                {/* Animated specular light sweep */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ repeat: Infinity, duration: 2.2, ease: 'linear' }}
                />
              </motion.div>
            </div>
          </div>

          {/* 2. Active Track & Daily Goal Progress Bar */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <span className="text-[11px] sm:text-xs font-bold text-content-secondary flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-brand-500" />
                <span>{t('Daily Goal')} ({dailyCompleted}/3) • {activeTrack.name}</span>
              </span>
              <span className="text-[11px] sm:text-xs font-black text-brand-600 dark:text-brand-400">
                {trackChallengesCompleted}/{trackChallenges.length} ({trackProgressPercent}%)
              </span>
            </div>
            <div className="w-full bg-surface-elevated/60 border border-outline/30 rounded-full h-2.5 sm:h-3 overflow-hidden shadow-inner relative">
              {/* Background Track Completion Fill */}
              <motion.div
                className="absolute inset-y-0 left-0 bg-emerald-500/35 rounded-full"
                initial={{ width: `${prevTrackPercent}%` }}
                animate={{ width: `${trackProgressPercent}%` }}
                transition={{ type: 'spring', stiffness: 110, damping: 22 }}
              />
              {/* Foreground Daily Goal Fill */}
              <motion.div 
                className="bg-gradient-to-r from-brand-500 via-indigo-500 to-purple-500 h-full rounded-full relative overflow-hidden shadow-[0_0_12px_rgba(99,102,241,0.45)]" 
                initial={{ width: `${prevDailyPercent}%` }}
                animate={{ width: `${dailyProgressPercent}%` }}
                transition={{ type: 'spring', stiffness: 130, damping: 20, delay: 0.1 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/45 to-transparent"
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ repeat: Infinity, duration: 2.4, ease: 'linear' }}
                />
              </motion.div>
            </div>
          </div>
        </div>
        {dailyCompleted >= 3 && (
          <motion.p 
            initial={{ opacity: 0, y: -5 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="text-[10px] sm:text-xs text-brand-500 font-bold mt-1 text-center"
          >
            {t('Goal Reached!')}
          </motion.p>
        )}
      </motion.div>

      <div className="flex flex-col w-full gap-16 items-center justify-center">
        {CHAPTERS.map((stageData, stageIndex) => {
          const stageChallenges = challengesByStage[stageData.id];
          if (stageChallenges.length === 0) return null;
          const stageCompletedCount = stageChallenges.filter(c => completedChallengeIds.includes(c.id)).length;
          const stageProgressPercent = Math.round((stageCompletedCount / stageChallenges.length) * 100);

          return (
            
            <div key={stageData.id} className="w-full flex flex-col items-center">
              {stageData.id === 11 && (
                <div className="w-full max-w-2xl mx-auto mb-14 text-center bg-gradient-to-r from-fuchsia-500 to-purple-600 rounded-3xl p-8 text-white shadow-xl shadow-purple-500/30 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-full opacity-20" style={{ backgroundImage: 'radial-gradient(circle at center, white 1px, transparent 1px)', backgroundSize: '10px 10px' }} />
                  <Crown className="w-14 h-14 mx-auto mb-3 text-yellow-300 relative z-10 drop-shadow-md" />
                  <h3 className="text-3xl font-black mb-2 relative z-10">{t('Foundation Phase Complete!')}</h3>
                  <p className="text-white/90 font-semibold relative z-10 text-lg">{t('You have earned the Legendary rank. Welcome to the Advanced curriculum.')}</p>
                </div>
              )}
              {/* Stage Header */}

              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className={`w-full max-w-2xl p-8 rounded-[2rem] ${stageData.colors.bg} ${stageData.colors.shadow} mb-14 text-white flex flex-col items-center text-center relative overflow-hidden transform-gpu`}
              >
                <div className="absolute -right-8 -top-8 opacity-10 mix-blend-overlay">
                  <stageData.icon className="w-56 h-56" />
                </div>
                <div className="bg-white/20 p-3 rounded-2xl mb-4 backdrop-blur-sm">
                  <stageData.icon className="w-8 h-8 text-white" />
                </div>
                
<h2 className="text-3xl sm:text-4xl font-extrabold mb-2 tracking-tight">{t('Chapter')} {stageData.id}: {t(stageData.conceptKey)}</h2>
{stageData.id <= 10 && getChapterRank(stageData.id) && (
  <div className="mt-2 mb-2 bg-white/20 px-4 py-1.5 rounded-full backdrop-blur-md text-sm font-bold shadow-sm uppercase tracking-wider">
    {getChapterRank(stageData.id)?.name} Rank
  </div>
)}

                <p className="text-white/90 font-semibold text-lg">{t('Levels')} {stageData.startLevel}–{stageData.endLevel}</p>

                {/* Smooth Chapter Progress Bar */}
                <div className="w-full max-w-md mt-4 flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-xs font-bold text-white/90 px-1">
                    <span>{t('Chapter')} Progress</span>
                    <span>{stageCompletedCount} / {stageChallenges.length} ({stageProgressPercent}%)</span>
                  </div>
                  <div className="w-full h-2.5 bg-black/25 rounded-full overflow-hidden p-0.5 backdrop-blur-sm border border-white/20">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-white via-emerald-200 to-emerald-300 relative overflow-hidden"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${stageProgressPercent}%` }}
                      viewport={{ once: true }}
                      transition={{ type: 'spring', stiffness: 120, damping: 20, delay: 0.1 }}
                    />
                  </div>
                </div>
              </motion.div>

              {/* Challenges Map */}
              <div className="relative flex flex-col items-center w-full gap-12 py-4">
                {stageChallenges.map((challenge, index) => {
                  const isCompleted = completedChallengeIds.includes(challenge.id);
                  let isUnlocked = false;
                  
                  if (!firstLockedFound) {
                    isUnlocked = true;
                    if (!isCompleted) {
                      firstLockedFound = true;
                    }
                  }
                  
                  const isCurrent = isUnlocked && !isCompleted;
                  const offset = index % 2 === 0 ? -60 : 60;
                  const hasNext = index < stageChallenges.length - 1;
                  const nextIsCompleted = hasNext && completedChallengeIds.includes(stageChallenges[index+1].id);

                  return (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8, y: 20 }}
                      whileInView={{ opacity: 1, scale: 1, y: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ type: "spring", stiffness: 400, damping: 25, delay: index * 0.05 }}
                      key={challenge.id}
                      className="relative w-full flex flex-col items-center transform-gpu"
                      style={{ left: `${offset}px` }}
                    >
                      {/* Connection Line */}
                      {hasNext && (
                        <div 
                          className={`absolute top-20 w-4 ${nextIsCompleted ? 'bg-emerald-400 dark:bg-emerald-500' : 'bg-outline'} rounded-full`}
                          style={{ 
                            height: 'calc(100% + 2rem)',
                            transform: index % 2 === 0 ? 'rotate(-25deg)' : 'rotate(25deg)',
                            transformOrigin: 'top center',
                            left: '50%',
                            marginLeft: '-2px',
                            zIndex: 0,
                          }}
                        />
                      )}

                      {/* Node */}
                      <motion.button
                        layoutId={`challenge-wrapper-${challenge.id}`}
                        whileTap={isUnlocked ? { scale: 0.95 } : {}}
                        disabled={!isUnlocked}
                        onClick={() => {
                          playSound('click'); triggerHaptic('light');
                          onSelectChallenge(challenge.id);
                        }}
                        className="relative z-10 flex flex-col items-center group cursor-pointer disabled:cursor-not-allowed outline-none"
                      >
                        {/* Tooltip */}
                        <div className="absolute -top-16 opacity-0 group-hover:opacity-100 transition-opacity liquid-glass !rounded-2xl text-content-primary px-5 py-3 text-sm font-bold whitespace-nowrap pointer-events-none z-20 shadow-lg">
                          {t('Level')} {challenge.level}: {t(challenge.title)}
                        </div>

                        {/* Bubble */}
                        <motion.div 
                          layoutId={`challenge-${challenge.id}`}
                          className={`
                            w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center btn-node transform-gpu liquid-glass
                            ${isUnlocked ? 'cursor-pointer' : 'opacity-60 cursor-not-allowed grayscale'}
                            ${isCompleted 
                              ? 'bg-emerald-500/90 text-white border-emerald-400' 
                              : isCurrent 
                                ? `${stageData.colors.bg} text-white border-white/40 ring-4 ${stageData.colors.ring}` 
                                : 'text-content-muted border-outline'}
                          `}
                        >
                          {isCompleted ? (
                            <Check className="w-12 h-12 stroke-[3]" />
                          ) : isUnlocked ? (
                            <Star className="w-12 h-12 fill-current stroke-[2]" />
                          ) : (
                            <Lock className="w-10 h-10" />
                          )}
                        </motion.div>
                        {/* Current marker bouncing */}
                        {isCurrent && (
                          <motion.div 
                            animate={{ y: [0, -8, 0] }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                            className="absolute -top-14 bg-content-primary text-surface-main text-sm font-extrabold px-5 py-2.5 rounded-2xl shadow-2xl z-20 tracking-wide uppercase"
                          >
                            {t('Start')}
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-content-primary rotate-45" />
                          </motion.div>
                        )}
                      </motion.button>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Course Completion & Next Track */}
        <div className="max-w-4xl mx-auto px-4 mt-20 mb-32 relative z-10 w-full">
          <div className="relative p-1 rounded-3xl bg-gradient-to-b from-brand-500 to-purple-600 shadow-2xl">
            <div className="liquid-glass !rounded-[2.5rem] p-10 text-center relative overflow-hidden shadow-xl">
              <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(var(--color-brand-500) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
              
              <Crown className={`w-20 h-20 mx-auto mb-6 ${hasCompletedCurrentTrack ? 'text-brand-500 drop-shadow-[0_0_15px_rgba(var(--color-brand-500),0.5)]' : 'text-content-muted grayscale opacity-50'}`} />
              
              <h2 className="text-3xl font-black mb-4 text-content-primary">
                {activeTrack.name} {t('Master Certificate')}
              </h2>
              
              <p className="text-content-secondary text-lg mb-8 max-w-2xl mx-auto font-medium">
                {hasCompletedCurrentTrack 
                  ? t('Congratulations! You have completed this track. Your badge and certificate have been awarded.')
                  : t(`Complete all ${currentTrackMax} levels to earn your Master Certificate and exclusive Badge.`)}
              </p>

              {hasCompletedCurrentTrack && (
                <div className="flex flex-wrap justify-center gap-4 mb-12">
                  <div className="bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 px-6 py-3 rounded-2xl font-black text-lg border-2 border-amber-300 dark:border-amber-700 flex items-center gap-3">
                    <Medal className="w-6 h-6" /> {activeTrack.name} {t('Badge')}
                  </div>
                  <div className="bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 px-6 py-3 rounded-2xl font-black text-lg border-2 border-emerald-300 dark:border-emerald-700 flex items-center gap-3">
                    <PenTool className="w-6 h-6" /> {t('Official Certificate')}
                  </div>
                </div>
              )}

              {hasCompletedAll && isFinalTrack && (
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 p-8 rounded-3xl text-white shadow-2xl mt-12 border-4 border-yellow-300"
                >
                  <Trophy className="w-24 h-24 mx-auto mb-6 drop-shadow-xl" />
                  <h2 className="text-4xl font-black mb-4 drop-shadow-md">Master AI Developer</h2>
                  <p className="text-xl font-bold mb-6 drop-shadow">You have completed the entire 1500-level roadmap!</p>
                  <div className="flex justify-center gap-4 text-2xl font-black">
                    <span className="bg-black/20 px-6 py-3 rounded-xl backdrop-blur-sm">+50,000 XP</span>
                    <span className="bg-black/20 px-6 py-3 rounded-xl backdrop-blur-sm">+10,000 Coins</span>
                  </div>
                </motion.div>
              )}

              <div className="mt-8 flex flex-col gap-4">
                <h3 className="text-2xl font-black mb-4 mt-8">{t('Learning Tracks')}</h3>
                {TRACKS.map((track, idx) => {
                  
  const trackStartLevel = track.offset + 1;
  const maxL = track.id === 'python' ? 20 : track.id === 'python_practice' ? 10 : 100;
  
  let isUnlocked = true;
  if (track.id === 'python_practice') {
    isUnlocked = completedChallengeIds.includes('l20');
  }
  
  const isCompleted = completedChallengeIds.includes(`l${track.offset + maxL}`);
  
                  
                  let Icon = Code2;
                  if (['html', 'css', 'js', 'rest'].includes(track.id)) Icon = Globe;
                  if (['sql', 'flutter'].includes(track.id)) Icon = LayoutGrid;
                  if (track.id === 'firebase') Icon = Flame;
                  if (track.id === 'gemini') Icon = Star;
                  
                  return (
                    <div 
                      key={track.id} 
                      onClick={() => {
                        if (isUnlocked) {
                          playSound('click'); triggerHaptic('light');
                          setSelectedTrackId(track.id);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                      }}
                      className={`p-6 rounded-3xl border transition-all text-left liquid-glass ${isUnlocked ? "cursor-pointer hover:shadow-lg hover:scale-[1.02]" : "grayscale opacity-60"} ${selectedTrackId === track.id ? "bg-brand-500/15 border-brand-400 shadow-xl" : "border-white/10"}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                          <div className={`p-4 rounded-2xl ${isUnlocked ? (isCompleted ? 'bg-amber-500 text-white' : 'bg-brand-500 text-white shadow-lg') : 'bg-surface-elevated text-content-muted'}`}>
                            {isCompleted ? <Medal className="w-8 h-8" /> : <Icon className="w-8 h-8" />}
                          </div>
                          <div>
                            <h3 className={`text-xl font-black mb-1 ${isUnlocked ? 'text-content-primary' : 'text-content-muted'}`}>
                              {track.name}
                            </h3>
                            <p className="text-content-secondary font-medium text-sm">
                              {isCompleted ? t('Completed!') : isUnlocked ? t('Unlocked - Click to view') : t('Locked. Complete previous language to unlock.')}
                            </p>
                          </div>
                        </div>
                        {!isUnlocked && (
                          <Lock className="w-6 h-6 text-content-muted" />
                        )}
                        {isUnlocked && selectedTrackId === track.id && (
                          <Check className="w-6 h-6 text-brand-500" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

