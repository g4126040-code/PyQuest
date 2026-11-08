import React, { createContext, useContext, useState, useEffect } from 'react';
import { challenges, TRACKS } from '../data/challenges';

export interface LanguageProgress {
  unlocked: boolean;
  completed: boolean;
  completedAt?: string;
  currentLevel: number;
  currentChapter: number;
  completedLessons: string[];
}

export interface AppProgress {
  currentLanguage: string;
  completedLanguages: string[];
  unlockedLanguages: string[];
  languageProgress: Record<string, LanguageProgress>;
  completedProjects: string[];
  dailyCompletedLessons: number;
  lastActiveDate: string;
}

interface ProgressContextType {
  progress: AppProgress;
  isTestModeActive: boolean;
  setCurrentLanguage: (lang: string) => void;
  completeLesson: (lessonId: string) => void;
  activateTestMode: () => void;
  resetTestMode: () => void;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [progress, setProgress] = useState<AppProgress>(() => {
    // Migration & Initialization logic here
    const saved = localStorage.getItem('codequest_app_progress');
    if (saved) {
      const parsed = JSON.parse(saved);
      const today = new Date().toISOString().split('T')[0];
      if (parsed.lastActiveDate !== today) {
        parsed.lastActiveDate = today;
        parsed.dailyCompletedLessons = 0;
      }
      return parsed;
    }

    const oldSaved = localStorage.getItem('codequest_progress');
    let completedIds: string[] = [];
    if (oldSaved) {
      try { completedIds = JSON.parse(oldSaved); } catch (e) {}
    }

    // Migrate zombie l21-l30 to l1501-l1510
    const migratedIds = new Set<string>();
    completedIds.forEach(id => {
      if (id.startsWith('l')) {
        const num = parseInt(id.replace('l', ''));
        if (num >= 21 && num <= 30) {
          migratedIds.add('l' + (1500 + num - 20));
        } else {
          migratedIds.add(id);
        }
      } else {
        migratedIds.add(id);
      }
    });
    completedIds = Array.from(migratedIds);

    const state: AppProgress = {
      currentLanguage: 'python',
      completedLanguages: [],
      unlockedLanguages: ['python'],
      languageProgress: {},
      completedProjects: [],
      dailyCompletedLessons: 0,
      lastActiveDate: new Date().toISOString().split('T')[0]
    };

      TRACKS.forEach((track, idx) => {
      state.languageProgress[track.id] = {
        unlocked: idx === 0,
        completed: false,
        completedAt: undefined,
        currentLevel: 1,
        currentChapter: 1,
        completedLessons: []
      };
    });

    const isTestMode = completedIds.some(id => id.startsWith('dummy_test_id') || id.startsWith('test_mode'));
    
    if (isTestMode) {
      TRACKS.forEach((track) => {
        state.languageProgress[track.id].unlocked = true;
        state.languageProgress[track.id].completed = true;
        state.languageProgress[track.id].completedAt = new Date().toISOString().split('T')[0];
        state.languageProgress[track.id].currentLevel = 100;
        state.languageProgress[track.id].currentChapter = 20;
        // fill lessons?
        const trackChallenges = challenges.filter(c => c.trackId === track.id);
        state.languageProgress[track.id].completedLessons = trackChallenges.map(c => c.id);
        if (!state.unlockedLanguages.includes(track.id)) state.unlockedLanguages.push(track.id);
        if (!state.completedLanguages.includes(track.id)) state.completedLanguages.push(track.id);
      });
      state.currentLanguage = 'python'; // or what they had
    } else {
      // normal migration
      completedIds.forEach(id => {
        const challenge = challenges.find(c => c.id === id);
        if (challenge) {
          const trackId = challenge.trackId;
          if (!state.languageProgress[trackId].completedLessons.includes(id)) {
            state.languageProgress[trackId].completedLessons.push(id);
          }
        }
      });
      
      TRACKS.forEach((track, idx) => {
        const trackProg = state.languageProgress[track.id];
        const maxL = track.id === 'python' ? 20 : track.id === 'python_practice' ? 10 : 100;
        if (trackProg.completedLessons.length >= maxL) {
          trackProg.completed = true;
          if (!trackProg.completedAt) trackProg.completedAt = state.lastActiveDate;
          if (!state.completedLanguages.includes(track.id)) state.completedLanguages.push(track.id);
          if (idx + 1 < TRACKS.length) {
            const nextTrack = TRACKS[idx + 1];
            state.languageProgress[nextTrack.id].unlocked = true;
            if (!state.unlockedLanguages.includes(nextTrack.id)) state.unlockedLanguages.push(nextTrack.id);
          }
        }
        let highestLevel = 0;
        trackProg.completedLessons.forEach(cid => {
          const c = challenges.find(ch => ch.id === cid);
          if (c && c.level > highestLevel) highestLevel = c.level;
        });
        const trackMax = track.id === 'python' ? 20 : track.id === 'python_practice' ? 10 : 100;
        trackProg.currentLevel = Math.min(trackMax, highestLevel + 1);
        trackProg.currentChapter = Math.ceil(trackProg.currentLevel / 5);
      });

      // Find current language
      for (let i = TRACKS.length - 1; i >= 0; i--) {
        if (state.languageProgress[TRACKS[i].id].unlocked) {
          state.currentLanguage = TRACKS[i].id;
          break;
        }
      }
    }
    
    return state;
  });

  useEffect(() => {
    localStorage.setItem('codequest_app_progress', JSON.stringify(progress));
  }, [progress]);

  const setCurrentLanguage = (lang: string) => {
    setProgress(p => ({ ...p, currentLanguage: lang }));
  };

  const completeLesson = (lessonId: string) => {
    setProgress(p => {
      const challenge = challenges.find(c => c.id === lessonId);
      if (!challenge) return p;

      const trackId = challenge.trackId;
      const newState = { ...p };
      newState.languageProgress = { ...p.languageProgress };
      newState.languageProgress[trackId] = { ...p.languageProgress[trackId] };
      const trackProg = newState.languageProgress[trackId];

      if (!trackProg.completedLessons.includes(lessonId)) {
        trackProg.completedLessons = [...trackProg.completedLessons, lessonId];
        const today = new Date().toISOString().split('T')[0];
        if (newState.lastActiveDate !== today) {
          newState.lastActiveDate = today;
          newState.dailyCompletedLessons = 1;
        } else {
          newState.dailyCompletedLessons = (newState.dailyCompletedLessons || 0) + 1;
        }
      }

      let highestLevel = 0;
      trackProg.completedLessons.forEach(cid => {
        const c = challenges.find(ch => ch.id === cid);
        if (c && c.level > highestLevel) highestLevel = c.level;
      });
      const trackMax = trackId === 'python' ? 20 : trackId === 'python_practice' ? 10 : 100;
      trackProg.currentLevel = Math.min(trackMax, highestLevel + 1);
      trackProg.currentChapter = Math.ceil(trackProg.currentLevel / 5);

      const maxL = trackId === 'python' ? 20 : trackId === 'python_practice' ? 10 : 100;
      if (trackProg.completedLessons.length >= maxL && !trackProg.completed) {
        trackProg.completed = true;
        trackProg.completedAt = new Date().toISOString().split('T')[0];
        if (!newState.completedLanguages.includes(trackId)) {
          newState.completedLanguages = [...newState.completedLanguages, trackId];
        }
        const trackIdx = TRACKS.findIndex(t => t.id === trackId);
        if (trackIdx !== -1 && trackIdx + 1 < TRACKS.length) {
          const nextTrackId = TRACKS[trackIdx + 1].id;
          newState.languageProgress[nextTrackId] = { ...newState.languageProgress[nextTrackId], unlocked: true };
          if (!newState.unlockedLanguages.includes(nextTrackId)) {
            newState.unlockedLanguages = [...newState.unlockedLanguages, nextTrackId];
          }
          // newState.currentLanguage = nextTrackId; // Removed to keep user pinned to active track
        }
      }
      return newState;
    });
  };

  const isTestModeActive = React.useMemo(() => {
    const flag = localStorage.getItem('codequest_test_mode_active') === 'true';
    const hasBackup = Boolean(
      localStorage.getItem('codequest_app_progress_backup') ||
      localStorage.getItem('codequest_progress_backup')
    );
    const allTracksDone =
      TRACKS.length > 0 &&
      TRACKS.every(t => progress.completedLanguages.includes(t.id));
    return flag || hasBackup || allTracksDone;
  }, [progress]);

  const activateTestMode = () => {
    const allTracksDone =
      TRACKS.length > 0 &&
      TRACKS.every(t => progress.completedLanguages.includes(t.id));
    if (!localStorage.getItem('codequest_app_progress_backup') && !allTracksDone) {
      localStorage.setItem('codequest_app_progress_backup', JSON.stringify(progress));
    }
    localStorage.setItem('codequest_test_mode_active', 'true');
    setProgress(p => {
      const newState = { ...p };
      newState.languageProgress = { ...p.languageProgress };
      newState.completedLanguages = [...p.completedLanguages];
      newState.unlockedLanguages = [...p.unlockedLanguages];

      TRACKS.forEach(track => {
        newState.languageProgress[track.id] = {
          unlocked: true,
          completed: true,
          completedAt: new Date().toISOString().split('T')[0],
          currentLevel: 100,
          currentChapter: 20,
          completedLessons: challenges.filter(c => c.trackId === track.id).map(c => c.id)
        };
        if (!newState.completedLanguages.includes(track.id)) newState.completedLanguages.push(track.id);
        if (!newState.unlockedLanguages.includes(track.id)) newState.unlockedLanguages.push(track.id);
      });
      localStorage.setItem('codequest_app_progress', JSON.stringify(newState));
      return newState;
    });
  };

  const resetTestMode = () => {
    const backup =
      localStorage.getItem('codequest_app_progress_backup') ||
      localStorage.getItem('codequest_progress_backup');

    localStorage.removeItem('codequest_app_progress_backup');
    localStorage.removeItem('codequest_progress_backup');
    localStorage.removeItem('codequest_test_mode_active');

    if (backup) {
      try {
        const parsed = JSON.parse(backup);
        const backupIsTestSnapshot =
          Array.isArray(parsed?.completedLanguages) &&
          TRACKS.length > 0 &&
          TRACKS.every(t => parsed.completedLanguages.includes(t.id));
        if (parsed && typeof parsed === 'object' && parsed.languageProgress && !backupIsTestSnapshot) {
          localStorage.setItem('codequest_app_progress', JSON.stringify(parsed));
          setProgress(parsed);
          return;
        }
      } catch (e) {
        // Fallback to clean state below if backup is corrupted
      }
    }

    // Fallback if no backup was stored prior to test mode
    const cleanState: AppProgress = {
      currentLanguage: 'python',
      completedLanguages: [],
      unlockedLanguages: ['python'],
      languageProgress: {},
      completedProjects: [],
      dailyCompletedLessons: 0,
      lastActiveDate: new Date().toISOString().split('T')[0]
    };
    TRACKS.forEach((track, idx) => {
      cleanState.languageProgress[track.id] = {
        unlocked: idx === 0,
        completed: false,
        completedAt: undefined,
        currentLevel: 1,
        currentChapter: 1,
        completedLessons: []
      };
    });
    localStorage.setItem('codequest_app_progress', JSON.stringify(cleanState));
    setProgress(cleanState);
  };

  return (
    <ProgressContext.Provider value={{ progress, isTestModeActive, setCurrentLanguage, completeLesson, activateTestMode, resetTestMode }}>
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider');
  return ctx;
};
