import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Share, X } from 'lucide-react';

export const PWAInstallButton: React.FC<{ variant?: 'button' | 'settings_item' }> = ({
  variant = 'button',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Not installable and not iOS (e.g. standard browser that doesn't trigger prompt yet)
  if (!isInstallable && !isIOS) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else if (isIOS) {
      setShowIOSGuide(true);
    }
  };

  const modal = showIOSGuide ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-white/20 p-6 shadow-2xl text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-brand-500/20 text-brand-400">
              <Download className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold">Install CodeQuest</h3>
          </div>
          <button
            onClick={() => setShowIOSGuide(false)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed mb-4">
          Install CodeQuest to your iPhone or iPad for fullscreen offline learning:
        </p>
        <div className="space-y-3 bg-white/5 p-4 rounded-2xl border border-white/10 text-xs text-slate-200">
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-brand-500/30 text-brand-300 flex items-center justify-center font-bold text-xs shrink-0">1</span>
            <span>Tap the <strong className="text-white inline-flex items-center gap-1"><Share className="w-3.5 h-3.5 inline text-sky-400" /> Share</strong> button in Safari</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-brand-500/30 text-brand-300 flex items-center justify-center font-bold text-xs shrink-0">2</span>
            <span>Scroll down and tap <strong className="text-white">Add to Home Screen</strong></span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-brand-500/30 text-brand-300 flex items-center justify-center font-bold text-xs shrink-0">3</span>
            <span>Launch CodeQuest directly from your Home Screen anytime</span>
          </div>
        </div>
        <button
          onClick={() => setShowIOSGuide(false)}
          className="mt-5 w-full rounded-xl bg-brand-500 hover:bg-brand-400 py-3 text-sm font-bold text-white transition-colors"
        >
          Got it
        </button>
      </div>
    </div>
  ) : null;

  if (variant === 'settings_item') {
    return (
      <>
        <div
          onClick={handleInstallClick}
          className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-brand-500/10 text-brand-500">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-content-primary">Install CodeQuest App</p>
              <p className="text-xs text-content-muted">Install to home screen for offline learning</p>
            </div>
          </div>
          <button className="px-3 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-white text-xs font-bold transition-colors">
            Install
          </button>
        </div>
        {modal}
      </>
    );
  }

  return (
    <>
      <button
        onClick={handleInstallClick}
        className="flex items-center gap-2 rounded-xl bg-brand-500 hover:bg-brand-400 px-3.5 py-2 text-xs sm:text-sm font-bold text-white shadow-md transition-all active:scale-95"
      >
        <Download className="w-4 h-4" />
        <span>Install App</span>
      </button>
      {modal}
    </>
  );
};
