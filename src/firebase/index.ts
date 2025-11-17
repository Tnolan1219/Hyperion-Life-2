'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, browserSessionPersistence, setPersistence } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

let app: FirebaseApp;
let auth: Auth;
let firestore: Firestore;

// This function is NOT idempotent, so we need to call it only once.
if (!getApps().length) {
  try {
    app = initializeApp();
  } catch (e) {
    if (process.env.NODE_ENV === "production") {
      console.warn('Automatic initialization failed. Falling back to firebase config object.', e);
    }
    app = initializeApp(firebaseConfig);
  }
} else {
  app = getApp();
}

auth = getAuth(app);
firestore = getFirestore(app);

// Set persistence to session before any other auth operations.
// This helps prevent issues with popup-based sign-in flows.
setPersistence(auth, browserSessionPersistence);


export { app as firebaseApp, auth, firestore };

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
    