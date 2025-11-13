// firebase.js or firebaseConfig.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyACMVvqqeaUPEp6KoGina_NBoyVWYgoNcg",
  authDomain: "keralasellers.firebaseapp.com",
  projectId: "keralasellers",
  storageBucket: "keralasellers.firebasestorage.app",
  messagingSenderId: "658585155781",
  appId: "1:658585155781:cbbf780e89e0b18ac",
  measurementId: "G-NQZ0NQEP71"
};

// Initialize Firebase App (only once)
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// ✅ IMPORTANT: Enable phone auth settings for development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // This helps with testing phone auth locally
  auth.settings.appVerificationDisabledForTesting = false; // Set to true only for test numbers
}

// Conditionally initialize Analytics on client only
export let analytics = null;

if (typeof window !== 'undefined') {
  import('firebase/analytics').then(({ getAnalytics }) => {
    analytics = getAnalytics(app);
    console.log('✅ Firebase Analytics initialized');
  }).catch((e) => {
    console.warn('⚠️ Firebase analytics failed to load:', e);
  });
}

// Export the app instance (useful for other Firebase services)
export default app;

// Debug log (remove in production)
if (typeof window !== 'undefined') {
  console.log('🔥 Firebase initialized successfully');
  console.log('🔐 Auth Domain:', firebaseConfig.authDomain);
}
