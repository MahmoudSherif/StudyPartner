// Firebase authentication and Firestore functions for production
import { initializeApp } from 'firebase/app'
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  User
} from 'firebase/auth'
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  serverTimestamp
} from 'firebase/firestore'
import { mockAuthFunctions } from '@/lib/mockAuth'

// Firebase configuration - using StudyPartner project credentials
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyA5NwasV9Zq0nD7m1hTIHyBYT1-HvqousU",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "motivemate-6c846.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "motivemate-6c846",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "motivemate-6c846.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1009214726351",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1009214726351:web:20b0c745c8222feb5557ba"
}

// Validate that we have the required configuration
const hasValidConfig = firebaseConfig.apiKey && 
                      firebaseConfig.apiKey !== "demo-api-key" &&
                      firebaseConfig.apiKey !== "AIzaSyCVwRQCqoR7fYY3_YYY3_YYY3_YYY3_YYY3_Y" &&
                      firebaseConfig.authDomain && 
                      firebaseConfig.projectId && 
                      firebaseConfig.storageBucket && 
                      firebaseConfig.messagingSenderId && 
                      firebaseConfig.appId

if (!hasValidConfig) {
  console.warn('Firebase configuration incomplete. Using offline mode.')
}

// Initialize Firebase with error handling
let app: any
let auth: any
let db: any
let isFirebaseAvailable = false

try {
  if (hasValidConfig) {
    app = initializeApp(firebaseConfig)
    auth = getAuth(app)
    db = getFirestore(app)
    isFirebaseAvailable = true
    console.log('✅ Firebase initialized successfully')
  } else {
    throw new Error('Invalid Firebase configuration')
  }
} catch (error) {
  console.warn('⚠️ Firebase initialization failed, using offline mode:', error)
  // Create mock objects for development
  auth = null
  db = null
  isFirebaseAvailable = false
}

export { auth, db, isFirebaseAvailable }

// Google provider
const googleProvider = new GoogleAuthProvider()

// Auth functions for production
export const authFunctions = {
  // Sign up with email and password
  signUp: async (email: string, password: string, displayName?: string) => {
    try {
      if (!isFirebaseAvailable) {
        // Use mock auth system
        return await mockAuthFunctions.signUp(email, password, displayName)
      }
      
      if (!auth) {
        throw new Error('Firebase authentication not available')
      }
      
      const result = await createUserWithEmailAndPassword(auth, email, password)
      
      // Update user profile with display name
      if (displayName && result.user) {
        await updateProfile(result.user, { displayName })
      }
      
      return { user: result.user, error: null }
    } catch (error: any) {
      return { user: null, error: error.message }
    }
  },

  // Sign in with email and password
  signIn: async (email: string, password: string) => {
    try {
      if (!isFirebaseAvailable) {
        // Use mock auth system
        return await mockAuthFunctions.signIn(email, password)
      }
      
      if (!auth) {
        throw new Error('Firebase authentication not available')
      }
      
      const result = await signInWithEmailAndPassword(auth, email, password)
      return { user: result.user, error: null }
    } catch (error: any) {
      return { user: null, error: error.message }
    }
  },

  // Sign in with Google
  signInWithGoogle: async () => {
    try {
      if (!isFirebaseAvailable) {
        // Use mock auth system
        return await mockAuthFunctions.signInWithGoogle()
      }
      
      if (!auth) {
        throw new Error('Firebase authentication not available')
      }
      
      const result = await signInWithPopup(auth, googleProvider)
      return { user: result.user, error: null }
    } catch (error: any) {
      return { user: null, error: error.message }
    }
  },

  // Sign out
  signOut: async () => {
    try {
      if (!isFirebaseAvailable) {
        // Use mock auth system
        return await mockAuthFunctions.signOut()
      }
      
      if (!auth) {
        throw new Error('Firebase authentication not available')
      }
      
      await firebaseSignOut(auth)
      return { error: null }
    } catch (error: any) {
      return { error: error.message }
    }
  },

  // Get current user
  getCurrentUser: () => {
    if (!isFirebaseAvailable) {
      return mockAuthFunctions.getCurrentUser()
    }
    return auth?.currentUser || null
  },

  // Listen to auth state changes
  onAuthStateChanged: (callback: (user: User | null) => void) => {
    if (!isFirebaseAvailable) {
      // Use mock auth system
      return mockAuthFunctions.onAuthStateChanged(callback as any)
    }
    
    if (!auth) {
      callback(null)
      return () => {} // Return empty unsubscribe function
    }
    return onAuthStateChanged(auth, callback)
  }
}

// Firestore functions for production
export const firestoreFunctions = {
  // Get user profile
  getUserProfile: async (uid: string) => {
    try {
      if (!isFirebaseAvailable || !db) {
        // Return mock data for offline mode
        return { 
          data: {
            email: mockAuthFunctions.getCurrentUser()?.email || null,
            displayName: mockAuthFunctions.getCurrentUser()?.displayName || null,
            createdAt: new Date(),
            lastLoginAt: new Date()
          }, 
          error: null 
        }
      }
      
      const docRef = doc(db, 'users', uid)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        return { data: docSnap.data(), error: null }
      } else {
        return { data: null, error: 'User not found' }
      }
    } catch (error: any) {
      return { data: null, error: error.message }
    }
  },

  // Update user profile
  updateUserProfile: async (uid: string, data: any) => {
    try {
      if (!isFirebaseAvailable || !db) {
        // Silently succeed in offline mode
        return { error: null }
      }
      
      const docRef = doc(db, 'users', uid)
      await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() })
      return { error: null }
    } catch (error: any) {
      return { error: error.message }
    }
  },

  // Create user profile
  createUserProfile: async (uid: string, data: any) => {
    try {
      if (!isFirebaseAvailable || !db) {
        // Silently succeed in offline mode
        return { error: null }
      }
      
      const docRef = doc(db, 'users', uid)
      await setDoc(docRef, { 
        ...data, 
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      return { error: null }
    } catch (error: any) {
      return { error: error.message }
    }
  }
}