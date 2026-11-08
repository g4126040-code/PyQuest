import React, { createContext, useContext, useState, useEffect } from 'react';

export type MascotType = 'idle' | 'welcome' | 'success' | 'encourage' | 'streak' | 'complete';

interface MascotContextType {
  mascotType: MascotType;
  mascotMessage: string;
  triggerMascot: (type: MascotType, message?: string) => void;
}

const MascotContext = createContext<MascotContextType | undefined>(undefined);

export function MascotProvider({ children }: { children: React.ReactNode }) {
  const [mascotType, setMascotType] = useState<MascotType>('idle');
  const [mascotMessage, setMascotMessage] = useState('');

  const triggerMascot = (type: MascotType, message: string = '') => {
    setMascotType(type);
    setMascotMessage(message);
    
    // Auto reset is handled by the component, or we can do it here
    if (type !== 'idle') {
      setTimeout(() => {
        setMascotType('idle');
      }, 5000);
    }
  };

  return (
    <MascotContext.Provider value={{ mascotType, mascotMessage, triggerMascot }}>
      {children}
    </MascotContext.Provider>
  );
}

export function useMascot() {
  const context = useContext(MascotContext);
  if (context === undefined) {
    throw new Error('useMascot must be used within a MascotProvider');
  }
  return context;
}
