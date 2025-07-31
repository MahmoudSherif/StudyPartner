import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA5NwasV9Zq0nD7m1hTIHyBYT1-HvqousU",
  authDomain: "motivemate-6c846.firebaseapp.com",
  projectId: "motivemate-6c846",
  storageBucket: "motivemate-6c846.firebasestorage.app",
  messagingSenderId: "1009214726351",
  appId: "1:1009214726351:web:20b0c745c8222feb5557ba",
  measurementId: "G-360M7L231L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Analytics (optional - only in browser environment)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app; 