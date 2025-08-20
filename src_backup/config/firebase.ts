// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Firebase configuration with environment variables and fallback
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyA5NwasV9Zq0nD7m1hTIHyBYT1-HvqousU",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "motivemate-6c846.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "motivemate-6c846",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "motivemate-6c846.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1009214726351",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1009214726351:web:20b0c745c8222feb5557ba",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-360M7L231L"
};

// Only validate environment variables in production
if (import.meta.env.PROD) {
  // In production, log a warning if environment variables are not set
  const requiredEnvVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN', 
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID'
  ];

  const missingVars = requiredEnvVars.filter(varName => !import.meta.env[varName]);
  
  if (missingVars.length > 0) {
    console.warn(
      `Using fallback Firebase configuration. For better security, please set these environment variables in Netlify: ${missingVars.join(', ')}`
    );
  }
}

// Validate configuration values
if (firebaseConfig.apiKey && !firebaseConfig.apiKey.startsWith('AIza')) {
  console.warn('Firebase API key format appears invalid');
}

if (firebaseConfig.projectId && !firebaseConfig.projectId.match(/^[a-z0-9-]+$/)) {
  console.warn('Firebase project ID format appears invalid');
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Analytics and get a reference to the service
// Only initialize analytics if measurementId is provided and in browser environment
let analytics = null;
if (typeof window !== 'undefined' && firebaseConfig.measurementId) {
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.warn('Analytics initialization failed:', error);
  }
}

export { analytics };
export default app; 