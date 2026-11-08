import React, { createContext, useContext, useState, useEffect } from 'react';

interface SettingsContextType {
  mascotEnabled: boolean;
  setMascotEnabled: (val: boolean) => void;
  soundsEnabled: boolean;
  setSoundsEnabled: (val: boolean) => void;
  hapticsEnabled: boolean;
  setHapticsEnabled: (val: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [mascotEnabled, setMascotEnabled] = useState(() => {
    const saved = localStorage.getItem('codequest_mascot');
    return saved !== null ? saved === 'true' : true;
  });
  
  const [soundsEnabled, setSoundsEnabled] = useState(() => {
    const saved = localStorage.getItem('codequest_sounds');
    return saved !== null ? saved === 'true' : true;
  });
  
  const [hapticsEnabled, setHapticsEnabled] = useState(() => {
    const saved = localStorage.getItem('codequest_haptics');
    return saved !== null ? saved === 'true' : true;
  });

  useEffect(() => {
    localStorage.setItem('codequest_mascot', String(mascotEnabled));
  }, [mascotEnabled]);

  useEffect(() => {
    localStorage.setItem('codequest_sounds', String(soundsEnabled));
  }, [soundsEnabled]);

  useEffect(() => {
    localStorage.setItem('codequest_haptics', String(hapticsEnabled));
  }, [hapticsEnabled]);

  return (
    <SettingsContext.Provider value={{
      mascotEnabled, setMascotEnabled,
      soundsEnabled, setSoundsEnabled,
      hapticsEnabled, setHapticsEnabled
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
