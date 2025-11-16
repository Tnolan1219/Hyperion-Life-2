'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { onAuthStateChanged, User, Auth } from 'firebase/auth';
import { useAuth as useFirebaseAuth, useFirestore } from '@/firebase/provider';
import { doc, getDoc } from 'firebase/firestore';

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  onboardingComplete: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const auth = useFirebaseAuth();
  const firestore = useFirestore();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  useEffect(() => {
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        setUser(user);
        if (user && firestore) {
          const preferencesRef = doc(firestore, `users/${user.uid}/preferences`, user.uid);
          try {
            const docSnap = await getDoc(preferencesRef);
            if (docSnap.exists() && docSnap.data().onboardingComplete) {
              setOnboardingComplete(true);
            } else {
              setOnboardingComplete(false);
            }
          } catch (error) {
            console.error("Error checking onboarding status:", error);
            setOnboardingComplete(false);
          }
        } else {
          setOnboardingComplete(false);
        }
        setIsLoading(false);
      });
      return () => unsubscribe();
    } else {
      setIsLoading(false);
    }
  }, [auth, firestore]);

  return (
    <UserContext.Provider value={{ user, isLoading, onboardingComplete }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
