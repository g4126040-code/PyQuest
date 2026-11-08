import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Globe, Moon, Sun, Bell, Volume2, Vibrate,
  Clock, Info, Shield, HelpCircle, Smartphone, User, Terminal, Code, Sparkles
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useSettings } from '../contexts/SettingsContext';
import { challenges } from '../data/challenges';
import { useProgress } from '../contexts/ProgressContext';
import { PWAInstallButton } from './PWAInstallButton';

interface SettingsScreenProps {
  onOpenSourceCode?: () => void;
  onStartTour?: () => void;
}

export default function SettingsScreen({ onOpenSourceCode, onStartTour }: SettingsScreenProps) {
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { mascotEnabled, setMascotEnabled, soundsEnabled, setSoundsEnabled, hapticsEnabled, setHapticsEnabled } = useSettings();

  const { isTestModeActive, activateTestMode: contextActivateTestMode, resetTestMode: contextResetTestMode } = useProgress();
  const [clickCount, setClickCount] = React.useState(0);
  // Developer test mode is always visible per user request
  const devModeVisible = true;
  const [showConfirm, setShowConfirm] = React.useState<'activate' | 'reset' | null>(null);

  const handleVersionClick = () => {
    setClickCount(c => c + 1);
    if (clickCount >= 4) {
      /* Developer mode is always visible */
    }
  };

  const activateTestMode = () => {
    contextActivateTestMode();
    setShowConfirm(null);
    setTimeout(() => window.location.reload(), 100);
  };

  const resetTestMode = () => {
    contextResetTestMode();
    setShowConfirm(null);
    setTimeout(() => window.location.reload(), 100);
  };

  const settingsGroups = [
    {
      title: 'Preferences',
      items: [
        {
          id: 'language',
          icon: Globe,
          label: 'Language',
          type: 'select',
          value: language,
          options: [
            { value: 'en', label: 'English' },
            { value: 'hi', label: 'Hindi' },
            { value: 'gu', label: 'Gujarati' },
            { value: 'hinglish', label: 'Hinglish' }
          ],
          onChange: (v: string) => setLanguage(v as any)
        },
        {
          id: 'theme',
          icon: theme === 'dark' ? Moon : Sun,
          label: 'Theme',
          type: 'toggle',
          value: theme === 'dark',
          onChange: toggleTheme
        },
        {
          id: 'mascot',
          icon: User,
          label: 'Learning Mascot',
          type: 'toggle',
          value: mascotEnabled,
          onChange: () => setMascotEnabled(!mascotEnabled)
        }
      ]
    },
    {
      title: 'Notifications & Sounds',
      items: [
        { id: 'sounds', icon: Volume2, label: 'Sound Effects', type: 'toggle', value: soundsEnabled, onChange: () => setSoundsEnabled(!soundsEnabled) },
        { id: 'haptic', icon: Vibrate, label: 'Haptic Feedback', type: 'toggle', value: hapticsEnabled, onChange: () => setHapticsEnabled(!hapticsEnabled) }
      ]
    },
    {
      title: 'About & Support',
      items: [
        ...(onStartTour ? [{ id: 'tour', icon: Sparkles, label: 'Quick App Tour', type: 'link', onClick: onStartTour }] : []),
        { id: 'about', icon: Info, label: 'About App', type: 'link' },
        { id: 'privacy', icon: Shield, label: 'Privacy', type: 'link' },
        { id: 'support', icon: HelpCircle, label: 'Help & Support', type: 'link' },
        { id: 'version', icon: Smartphone, label: 'App Version', type: 'text', value: '1.0.0' }
      ]
    }
  ];

  return (
    <div className="w-full max-w-2xl mx-auto py-8 px-4 flex flex-col gap-8 pb-32">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center text-center gap-2"
      >
        <h1 className="text-3xl font-extrabold">{t('Settings')}</h1>
        <p className="text-content-secondary font-medium">{t('Manage your app preferences and settings.')}</p>
      </motion.div>

      <div className="flex flex-col gap-8">
        {settingsGroups.map((group, gIndex) => (
          <motion.div 
            key={group.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: gIndex * 0.1 }}
            className="flex flex-col gap-3"
          >
            <h2 className="text-sm font-bold text-content-muted uppercase tracking-wider px-2">
              {t(group.title)}
            </h2>
            <div className="liquid-glass rounded-3xl flex flex-col overflow-hidden shadow-xl">
              {group.items.map((item, iIndex) => (
                <motion.div whileTap={item.type === "link" || item.onClick ? { scale: 0.98 } : {}} 
                        key={item.id}
                  className={`flex items-center justify-between p-4 ${iIndex < group.items.length - 1 ? 'border-b border-outline/50' : ''} ${(item as any).onClick && item.type === 'link' ? 'cursor-pointer hover:bg-white/5 transition-colors' : ''}`}
                  onClick={(item as any).onClick && item.type === 'link' ? (item as any).onClick : undefined}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-brand-500/10 text-brand-500 rounded-xl">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-content-primary">{t(item.label)}</span>
                  </div>
                  
                  {item.type === 'select' && item.options && item.onChange && (
                    <select 
                      value={item.value as string} 
                      onChange={(e) => item.onChange(e.target.value)}
                      className="bg-surface-elevated border border-outline rounded-xl px-3 py-1.5 text-sm font-bold text-content-primary outline-none focus:border-brand-500 appearance-none"
                    >
                      {item.options.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  )}
                  
                  {item.type === 'toggle' && item.onChange && (
                    <button 
                      onClick={item.onChange as any}
                      className="w-12 h-6 bg-surface-elevated border-2 border-outline rounded-full relative transition-colors duration-300 flex items-center px-1"
                    >
                      <motion.div 
                        layout
                        className="w-4 h-4 bg-brand-500 rounded-full"
                        animate={{ x: item.value ? 24 : 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    </button>
                  )}
                  
                  {item.type === 'switch' && (
                    <div className="w-12 h-6 bg-surface-elevated border-2 border-outline rounded-full relative flex items-center px-1 opacity-50 cursor-not-allowed">
                      <div className={`w-4 h-4 rounded-full ${item.value ? 'bg-brand-500 translate-x-[24px]' : 'bg-content-muted'} transition-transform`} />
                    </div>
                  )}

                  {item.type === 'link' && (
                    <div className="text-content-muted text-sm font-bold">
                      ›
                    </div>
                  )}

                  {item.type === 'text' && (
                    <div className="text-content-muted text-sm font-bold" onClick={item.id === 'version' ? handleVersionClick : undefined}>
                      {item.value as string}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}

        {/* PWA App Installation Item */}
        <div className="liquid-glass rounded-3xl flex flex-col overflow-hidden shadow-xl border border-white/10">
          <PWAInstallButton variant="settings_item" />
        </div>
      </div>
    </div>
  );
}
