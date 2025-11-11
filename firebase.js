// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyACMVvqqeaUPEp6KoGina_NBoyVWYgoNcg",
  authDomain: "keralasellers.firebaseapp.com",
  projectId: "keralasellers",
  storageBucket: "keralasellers.firebasestorage.app",
  messagingSenderId: "658585155781",
  appId: "1:658585155781:web:33559cbbf780e89e0b18ac",
  measurementId: "G-NQZ0NQEP71"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Conditionally initialize Analytics on client only (optional)
export let analytics = null;

if (typeof window !== 'undefined') {
  import('firebase/analytics').then(({ getAnalytics }) => {
    analytics = getAnalytics(app);
  }).catch((e) => {
    console.warn('Firebase analytics failed to load:', e);
  });
}
