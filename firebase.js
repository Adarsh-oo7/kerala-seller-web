// firebase.js or firebaseConfig.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyACMVvqqeaUPEp6KoGina_NBoyVWYgoNcg",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "keralasellers.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "keralasellers",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "keralasellers.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "658585155781",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:658585155781:web:33559cbbf780e89e0b18ac",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-NQZ0NQEP71"
};


// Initialize Firebase

const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// ✅ IMPORTANT: Enable phone auth settings for development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // This helps with testing phone auth locally
  auth.settings.appVerificationDisabledForTesting = false; // Must use test phone numbers in Firebase Console
}

// Conditionally initialize Analytics on client only (Disabled in development to avoid 400 errors)
export let analytics = null;

if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'development') {
  import('firebase/analytics').then(({ getAnalytics }) => {
    analytics = getAnalytics(app);
    console.log('Firebase Analytics initialized');
  }).catch((e) => {
    if (process.env.NODE_ENV !== 'development') {
        console.warn('Firebase analytics failed to load:', e);
    }
  });
}

// Export the app instance (useful for other Firebase services)
export default app;

// Debug log (remove in production)
if (typeof window !== 'undefined') {
  console.log(' Firebase initialized successfully');
  console.log(' Auth Domain:', firebaseConfig.authDomain);
}
