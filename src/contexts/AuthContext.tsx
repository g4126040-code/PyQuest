import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  logOut: () => Promise<void>;
  updateProfileData: (data: Partial<any>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Create user document if it doesn't exist
        const userRef = doc(db, 'users', currentUser.uid);
        try {
          const userSnap = await getDoc(userRef);
          
          if (!userSnap.exists()) {
            const defaultData = {
              displayName: currentUser.displayName || 'CodeLearner',
              photoURL: currentUser.photoURL || '',
              xp: 0,
              coins: 150,
              rank: 'Beginner',
              streak: 0,
              lastDate: '',
              completedLanguages: [],
              updatedAt: Date.now()
            };
            await setDoc(userRef, defaultData);
          }
        } catch (error) {
          console.warn("Error fetching or creating user document (offline):", error);
        }
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.warn("Sign in error (offline):", error);
    }
  };

  const logOut = async () => {
    await signOut(auth);
  };

  const updateProfileData = async (data: Partial<any>) => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    try {
      await updateDoc(userRef, {
        ...data,
        updatedAt: Date.now()
      });
    } catch (error) {
      console.warn("Error updating profile (offline):", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, logOut, updateProfileData }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
