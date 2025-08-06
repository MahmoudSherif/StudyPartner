import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '../config/firebase';

interface AuthContextType {
  currentUser: User | null;
  signup: (email: string, password: string) => Promise<any>;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  function signup(email: string, password: string) {
    // In development, handle Firebase connection issues gracefully
    if (import.meta.env.DEV) {
      try {
        return createUserWithEmailAndPassword(auth, email, password);
      } catch (error: any) {
        console.warn('Firebase connection blocked in development:', error);
        throw error;
      }
    }
    return createUserWithEmailAndPassword(auth, email, password);
  }

  function login(email: string, password: string) {
    // In development, if Firebase is blocked, log the error but don't crash
    if (import.meta.env.DEV) {
      try {
        return signInWithEmailAndPassword(auth, email, password);
      } catch (error: any) {
        console.warn('Firebase connection blocked in development:', error);
        // For development testing, you can uncomment the next line to simulate login
        // return Promise.resolve({ user: { email, uid: 'dev-user-id' } });
        throw error;
      }
    }
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logout() {
    return signOut(auth);
  }

  function resetPassword(email: string) {
    return sendPasswordResetEmail(auth, email);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, 
      (user) => {
        setCurrentUser(user);
        setLoading(false);
      },
      (error) => {
        // Handle auth state change errors (like network issues)
        console.warn('Auth state change error:', error);
        if (import.meta.env.DEV) {
          console.log('Firebase may be blocked by ad blocker or network security');
        }
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    logout,
    resetPassword,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 