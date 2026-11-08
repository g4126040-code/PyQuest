import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Trophy, Medal, User, LogIn } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, orderBy, limit, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { PWAInstallButton } from './PWAInstallButton';

interface LeaderboardUser {
  id: string;
  displayName: string;
  photoURL?: string;
  xp: number;
  rank: string;
}

export default function HomeScreen() {
  const { t } = useLanguage();
  const { user, signIn } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('xp', 'desc'), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const users: LeaderboardUser[] = [];
      snapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() } as LeaderboardUser);
      });
      setLeaderboard(users);
      setLoading(false);
    }, (error) => {
      console.warn("Leaderboard error (offline):", error);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4 flex flex-col gap-8 pb-32">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="liquid-glass rounded-3xl p-8 text-center relative overflow-hidden shadow-xl"
      >
        <Trophy className="w-16 h-16 mx-auto text-yellow-500 mb-4 drop-shadow-lg" />
        <h1 className="text-3xl font-black mb-2 text-content-primary">{t('Global Leaderboard')}</h1>
        <p className="text-content-secondary font-medium">{t('Compete with real learners worldwide.')}</p>
        
        <div className="mt-4 flex justify-center">
          <PWAInstallButton />
        </div>

        {!user && (
          <div className="mt-6">
            <button 
              onClick={signIn}
              className="bg-brand-500 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 mx-auto hover:bg-brand-600 transition-colors"
            >
              <LogIn className="w-5 h-5" />
              {t('Sign In to Join Leaderboard')}
            </button>
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col gap-4"
      >
        {loading ? (
          <div className="text-center p-8 text-content-muted font-bold animate-pulse">
            {t('Loading leaderboard...')}
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center p-8 text-content-muted font-bold liquid-glass rounded-3xl">
            {t('No players available yet.')}
          </div>
        ) : (
          leaderboard.map((player, index) => {
            const isCurrentUser = user && user.uid === player.id;
            
            let rankColor = "text-content-muted";
            if (index === 0) rankColor = "text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]";
            if (index === 1) rankColor = "text-slate-300 drop-shadow-[0_0_8px_rgba(203,213,225,0.5)]";
            if (index === 2) rankColor = "text-amber-600 drop-shadow-[0_0_8px_rgba(217,119,6,0.5)]";

            return (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                key={player.id}
                className={`liquid-glass rounded-3xl p-4 flex items-center gap-4 transition-transform hover:scale-[1.01] ${isCurrentUser ? "ring-2 ring-brand-500 bg-brand-500/10 shadow-lg" : ""}`}
              >
                <div className={`w-10 text-2xl font-black text-center ${rankColor}`}>
                  {index < 3 ? <Medal className="w-8 h-8 mx-auto" /> : `#${index + 1}`}
                </div>
                
                <div className="w-12 h-12 bg-surface-elevated rounded-full overflow-hidden border-2 border-outline flex-shrink-0 flex items-center justify-center">
                  {player.photoURL ? (
                    <img src={player.photoURL} alt={player.displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <User className="w-6 h-6 text-content-muted" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-bold text-lg text-content-primary truncate">
                    {player.displayName} {isCurrentUser && <span className="text-brand-500 text-sm ml-2">({t('You')})</span>}
                  </div>
                  <div className="text-xs font-bold text-brand-500 uppercase tracking-wider">
                    {t(player.rank || 'Beginner')} {t('League')}
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-black text-xl text-yellow-500">{player.xp}</div>
                  <div className="text-[10px] font-bold text-content-muted uppercase tracking-wider">{t('XP')}</div>
                </div>
              </motion.div>
            );
          })
        )}
      </motion.div>
    </div>
  );
}
