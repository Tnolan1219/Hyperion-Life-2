'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { onAuthStateChanged, User, Auth } from 'firebase/auth';
import { useAuth as useFirebaseAuth, useFirestore } from '@/firebase/provider';
import { doc, onSnapshot } from 'firebase/firestore';

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
    if (!auth) {
      setIsLoading(false);
      return;
    }

    // This listener handles changes in the user's login state.
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (!user) {
        // If there's no user, they can't have completed onboarding.
        setOnboardingComplete(false);
        setIsLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, [auth]);

  useEffect(() => {
    // If no user is logged in, we don't need to check for onboarding.
    if (!user || !firestore) {
      return;
    }

    // Set up a real-time listener for the user's preferences document.
    const preferencesRef = doc(firestore, `users/${user.uid}/preferences`, user.uid);
    const unsubscribeSnapshot = onSnapshot(
      preferencesRef,
      (docSnap) => {
        // Check for the onboardingComplete flag in the document.
        if (docSnap.exists() && docSnap.data().onboardingComplete) {
          setOnboardingComplete(true);
        } else {
          setOnboardingComplete(false);
        }
        // We're done loading once we get the first snapshot after a user is authenticated.
        setIsLoading(false);
      },
      (error) => {
        console.error("Error listening to onboarding status:", error);
        // In case of error (e.g., permissions), assume onboarding is not complete.
        setOnboardingComplete(false);
        setIsLoading(false);
      }
    );

    // Clean up the real-time listener when the user logs out or the component unmounts.
    return () => unsubscribeSnapshot();

  }, [user, firestore]);

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
