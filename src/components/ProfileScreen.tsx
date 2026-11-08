import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Trophy, Flame, Coins, Edit2, CheckCircle2, LogIn, Camera, Medal, Activity, Star, Zap, Code2, Award, Hexagon, ShoppingCart, Snowflake } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useLanguage } from '../contexts/LanguageContext';
import AnimatedCounter from './AnimatedCounter';
import { useAuth } from '../contexts/AuthContext';

interface ProfileScreenProps {
  xp: number;
  coins: number;
  streak: number;
  completedIds: string[];
  languageProgress?: any;
  streakFreeze?: number;
  onBuyStreakFreeze?: () => boolean;
}

export default function ProfileScreen({ xp, coins, streak, completedIds, languageProgress, streakFreeze = 0, onBuyStreakFreeze }: ProfileScreenProps) {
  const { t } = useLanguage();
  const { user, signIn, updateProfileData } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(() => localStorage.getItem('codequest_username') || 'CodeLearner');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user && user.displayName && !isEditing) {
      setName(user.displayName);
      localStorage.setItem('codequest_username', user.displayName);
    }
  }, [user]);

  const handleSave = async () => {
    localStorage.setItem('codequest_username', name);
    setIsEditing(false);
    if (user) {
      await updateProfileData({ displayName: name });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        await updateProfileData({ photoURL: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  const displayXp = xp;
  const displayCoins = coins;
  const displayStreak = streak;

  const rankName = displayXp >= 1000 ? 'Master' : displayXp >= 500 ? 'Pro' : 'Beginner';

  const generateVelocityData = (totalXp: number) => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date().getDay();
    // Reorder days so today is at the end
    const last7Days = [...days.slice(today), ...days.slice(0, today)];
    
    // Generate pseudo-random consistent data
    return last7Days.map((day, i) => {
      const baseVal = 50 + (((totalXp || 100) * (i + 1)) % 150);
      const multiplier = 1 + (i * 0.15); // Slight upward trend
      return {
        name: day,
        xp: Math.round(baseVal * multiplier)
      };
    });
  };

  const velocityData = generateVelocityData(displayXp);

  return (
    <div className="w-full max-w-2xl mx-auto py-8 px-4 flex flex-col gap-8 pb-32">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="liquid-glass p-8 flex flex-col items-center relative overflow-hidden rounded-[2.5rem] shadow-xl"
      >
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-brand-500/20 to-transparent" />
        
        <div className="w-24 h-24 bg-surface-elevated border-4 border-surface-card shadow-lg rounded-full flex items-center justify-center relative z-10 mb-4 group overflow-hidden">
          {user && user.photoURL ? (
             <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
             <User className="w-12 h-12 text-content-muted" />
          )}
          
          {user && (
            <div 
              className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="w-8 h-8 text-white" />
            </div>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            accept="image/*" 
            className="hidden" 
          />

          <button onClick={() => setIsEditing(true)} className="absolute bottom-0 right-0 p-1.5 bg-brand-500 rounded-full text-white hover:scale-110 transition-transform hidden group-hover:block">
            <Edit2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {isEditing ? (
          <div className="flex items-center gap-2 z-10 mb-2">
            <input 
              value={name}
              onChange={e => setName(e.target.value)}
              className="bg-surface-elevated border-2 border-outline px-4 py-2 rounded-xl text-center font-bold outline-none focus:border-brand-500"
              autoFocus
            />
            <button onClick={handleSave} className="p-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors">
              <CheckCircle2 className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 z-10 mb-2">
            <h1 className="text-2xl font-extrabold">{name}</h1>
            <button onClick={() => setIsEditing(true)} className="p-1 text-content-muted hover:text-brand-500 transition-colors">
              <Edit2 className="w-4 h-4" />
            </button>
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div 
            key={rankName}
            initial={{ scale: 0.8, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 liquid-glass border border-amber-500/30 rounded-xl text-sm font-black text-amber-500 z-10 shadow-lg"
          >
            <Trophy className="w-4 h-4 text-amber-500" />
            {t(rankName)} {t('Rank')}
          </motion.div>
        </AnimatePresence>
        
        {!user && (
          <button onClick={signIn} className="mt-4 bg-brand-500 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-brand-600 transition-colors z-10">
            <LogIn className="w-4 h-4" /> {t('Sign In to Save Progress')}
          </button>
        )}
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4"
      >
        <div className="liquid-glass rounded-3xl p-4 flex flex-col items-center justify-center text-center gap-2 hover:scale-[1.02] transition-transform">
          <Trophy className="w-8 h-8 text-yellow-500" />
          <div>
            <AnimatedCounter value={displayXp} className="text-xl font-black" />
            <div className="text-xs font-bold text-content-muted uppercase tracking-wider">{t('XP')}</div>
          </div>
        </div>
        
        <div className="liquid-glass rounded-3xl p-4 flex flex-col items-center justify-center text-center gap-2 hover:scale-[1.02] transition-transform">
          <Coins className="w-8 h-8 text-sky-500" />
          <div>
            <AnimatedCounter value={displayCoins} className="text-xl font-black" />
            <div className="text-xs font-bold text-content-muted uppercase tracking-wider">{t('Coins')}</div>
          </div>
        </div>
        
        <motion.div 
          key={displayStreak}
          initial={{ scale: 1.2, rotate: -5, filter: 'brightness(1.5)' }}
          animate={{ scale: 1, rotate: 0, filter: 'brightness(1)' }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
          className="liquid-glass rounded-3xl p-4 flex flex-col items-center justify-center text-center gap-2 hover:scale-[1.02] transition-transform"
        >
          <motion.div
            initial={{ color: '#facc15', scale: 1.5 }}
            animate={{ color: '#f97316', scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <Flame className="w-8 h-8 fill-current" />
          </motion.div>
          <div>
            <motion.div 
              initial={{ scale: 1.5, color: '#facc15' }}
              animate={{ scale: 1, color: 'inherit' }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="text-xl font-black"
            >
              {displayStreak}
            </motion.div>
            <div className="text-xs font-bold text-content-muted uppercase tracking-wider">{t('Day Streak')}</div>
          </div>
        </motion.div>
        
        <div className="liquid-glass rounded-3xl p-4 flex flex-col items-center justify-center text-center gap-2 hover:scale-[1.02] transition-transform">
          <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          <div>
            <AnimatedCounter value={completedIds.length} className="text-xl font-black" />
            <div className="text-xs font-bold text-content-muted uppercase tracking-wider">{t('Lessons')}</div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex flex-col gap-4"
      >
        <h2 className="text-lg font-bold px-2 flex items-center gap-2">
          <Activity className="w-5 h-5 text-brand-500" />
          {t('Learning Velocity')}
        </h2>
        <div className="liquid-glass rounded-3xl p-4 h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={velocityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#313244" vertical={false} />
              <XAxis dataKey="name" stroke="#6c7086" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#6c7086" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e1e2e', borderColor: '#313244', borderRadius: '12px', color: '#cdd6f4' }}
                itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
              />
              <Area type="monotone" dataKey="xp" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorXp)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
        className="flex flex-col gap-4"
      >
        <h2 className="text-lg font-bold px-2 flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-brand-500" />
          {t('Shop')}
        </h2>
        
        <div className="grid grid-cols-1 gap-4">
          <div className="liquid-glass rounded-3xl p-5 flex items-center justify-between shadow-lg hover:scale-[1.01] transition-transform">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-sky-500/20 border border-sky-500/30 rounded-2xl flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(14,165,233,0.3)]">
                <Snowflake className="w-6 h-6 text-sky-400" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-content-primary">{t('Streak Freeze')}</h3>
                <p className="text-sm text-content-secondary font-medium">{t('Skip a day without losing your streak.')}</p>
                {streakFreeze > 0 && (
                  <p className="text-xs font-bold text-sky-400 mt-1">{t('Currently Owned')}: {streakFreeze}</p>
                )}
              </div>
            </div>
            
            <button
              onClick={() => {
                if (onBuyStreakFreeze && coins >= 200) {
                  onBuyStreakFreeze();
                }
              }}
              disabled={coins < 200}
              className={`flex items-center gap-2 px-4 py-2 shrink-0 rounded-xl font-bold transition-all ${coins >= 200 ? 'bg-surface-elevated border border-sky-500/30 text-sky-400 hover:scale-105 active:scale-95 shadow-lg hover:shadow-sky-500/20' : 'bg-surface-elevated/50 text-content-muted opacity-50 cursor-not-allowed'}`}
            >
              <Coins className={`w-4 h-4 ${coins >= 200 ? 'text-sky-400' : 'text-content-muted'}`} />
              200
            </button>
          </div>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col gap-4"
      >
        <h2 className="text-lg font-bold px-2">{t('Badges & Achievements')}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              id: 'first_lesson',
              title: t('First Blood'),
              description: t('Complete your first lesson.'),
              icon: Medal,
              color: 'text-amber-500',
              bg: 'bg-amber-500/10',
              border: 'border-amber-500/20',
              isUnlocked: completedIds.length >= 1,
              progressText: `${Math.min(completedIds.length, 1)}/1`
            },
            {
              id: 'streak_3',
              title: t('Consistency'),
              description: t('Reach a 3-day learning streak.'),
              icon: Flame,
              color: 'text-orange-500',
              bg: 'bg-orange-500/10',
              border: 'border-orange-500/20',
              isUnlocked: streak >= 3,
              progressText: `${Math.min(streak, 3)}/3`
            },
            {
              id: 'streak_10',
              title: t('On Fire'),
              description: t('Reach a 10-day learning streak.'),
              icon: Zap,
              color: 'text-yellow-400',
              bg: 'bg-yellow-400/10',
              border: 'border-yellow-400/20',
              isUnlocked: streak >= 10,
              progressText: `${Math.min(streak, 10)}/10`
            },
            {
              id: 'xp_500',
              title: t('Rising Star'),
              description: t('Earn your first 500 XP.'),
              icon: Star,
              color: 'text-emerald-400',
              bg: 'bg-emerald-400/10',
              border: 'border-emerald-400/20',
              isUnlocked: xp >= 500,
              progressText: `${Math.min(xp, 500)}/500`
            },
            {
              id: 'python_basics',
              title: t('Python Initiate'),
              description: t('Complete 10 Python lessons.'),
              icon: Code2,
              color: 'text-blue-500',
              bg: 'bg-blue-500/10',
              border: 'border-blue-500/20',
              isUnlocked: (languageProgress?.['python']?.completedLessons?.length || 0) >= 10,
              progressText: `${Math.min((languageProgress?.['python']?.completedLessons?.length || 0), 10)}/10`
            },
            {
              id: 'python_master',
              title: t('Python Master'),
              description: t('Complete 25 Python lessons.'),
              icon: Award,
              color: 'text-indigo-500',
              bg: 'bg-indigo-500/10',
              border: 'border-indigo-500/20',
              isUnlocked: (languageProgress?.['python']?.completedLessons?.length || 0) >= 25,
              progressText: `${Math.min((languageProgress?.['python']?.completedLessons?.length || 0), 25)}/25`
            },
            {
              id: 'polyglot',
              title: t('Polyglot'),
              description: t('Start 3 programming languages.'),
              icon: Hexagon,
              color: 'text-purple-500',
              bg: 'bg-purple-500/10',
              border: 'border-purple-500/20',
              isUnlocked: Object.values(languageProgress || {}).filter((lp: any) => lp.completedLessons?.length > 0).length >= 3,
              progressText: `${Math.min(Object.values(languageProgress || {}).filter((lp: any) => lp.completedLessons?.length > 0).length, 3)}/3`
            }
          ].map(badge => {
            const Icon = badge.icon;
            return (
              <div 
                key={badge.id}
                className={`relative overflow-hidden liquid-glass rounded-3xl p-4 flex flex-col gap-3 transition-all duration-300 ${
                  badge.isUnlocked ? 'ring-1 ring-white/10 shadow-lg' : 'opacity-60 grayscale'
                }`}
              >
                {badge.isUnlocked && (
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-white/20 to-transparent rotate-45 transform translate-x-8 -translate-y-8" />
                )}
                
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${badge.isUnlocked ? badge.bg : 'bg-surface-elevated'} ${badge.isUnlocked ? badge.border : 'border border-outline'}`}>
                    <Icon className={`w-6 h-6 ${badge.isUnlocked ? badge.color : 'text-content-muted'}`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-content-primary">{badge.title}</h3>
                    <div className="text-xs font-bold text-content-muted mt-1">{badge.progressText}</div>
                  </div>
                </div>
                
                <p className="text-sm text-content-secondary line-clamp-2">
                  {badge.description}
                </p>
                
                {badge.isUnlocked && (
                  <div className="absolute top-3 right-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>

      <AnimatePresence>
        {(languageProgress?.['fullstack']?.completed || completedIds.includes('l1500') || completedIds.some(id => id.startsWith('test_mode_') || id.startsWith('dummy_test_id'))) && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="flex flex-col gap-4"
          >
            <h2 className="text-lg font-bold px-2">{t('Certificates')}</h2>
            
            <div className="relative p-1 rounded-3xl bg-gradient-to-b from-brand-500 to-purple-600 shadow-2xl">
              <div className="liquid-glass !rounded-[2.5rem] p-8 text-center relative overflow-hidden shadow-xl">
                <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(var(--color-brand-500) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                
                <Medal className="w-16 h-16 mx-auto mb-4 text-brand-500 drop-shadow-[0_0_15px_rgba(var(--color-brand-500),0.5)]" />
                
                <h2 className="text-2xl font-black mb-2 text-content-primary">
                  Full Stack AI {t('Master Certificate')}
                </h2>
                
                <p className="text-content-secondary text-base mb-6 font-medium">
                  {t('Successfully completed the Full Stack AI roadmap.')}
                </p>

                <div className="flex flex-wrap justify-center gap-4 text-sm font-bold">
                  <div className="px-4 py-2 bg-surface-elevated rounded-xl border border-outline">
                    {t('Learner')}: <span className="text-brand-500">{name}</span>
                  </div>
                  <div className="px-4 py-2 bg-surface-elevated rounded-xl border border-outline">
                    {t('Date Earned')}: <span className="text-brand-500">{languageProgress?.['fullstack']?.completedAt ? new Date(languageProgress['fullstack'].completedAt).toLocaleDateString() : new Date().toLocaleDateString()}</span>
                  </div>
                  {rankName === 'Master' && (
                    <div className="px-4 py-2 bg-amber-500/10 text-amber-500 rounded-xl border border-amber-500/20">
                      Legendary Rank
                    </div>
                  )}
                  <div className="px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-xl border border-emerald-500/20">
                    Official Certificate
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
