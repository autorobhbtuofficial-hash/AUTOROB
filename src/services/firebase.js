// Firebase Configuration
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBgfH38WLBF80QxlpQYnrLXnS6hPnLulF8",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "autorob-hbtu.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "autorob-hbtu",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "autorob-hbtu.firebasestorage.app",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "57833177443",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:57833177443:web:1301869fba1a803a45d356",
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-72SRNFMLKY"
};

// Debug: Log to check if env vars are loading (remove in production)
console.log('Firebase Config Check:', {
    hasApiKey: !!firebaseConfig.apiKey,
    apiKeyLength: firebaseConfig.apiKey?.length,
    projectId: firebaseConfig.projectId
});

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;
