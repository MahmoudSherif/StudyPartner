import React, { createContext, useContext, useEffect, useState } from 'react'
import { authFunctions, firestoreFunctions } from '@/lib/firebase'
import { User as FirebaseUser } from 'firebase/auth'
import { toast } from 'sonner'

interface User {
  uid: string
  email: string | null
  displayName: string | null
  photoURL?: string | null
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signUp: (email: string, password: string, displayName?: string) => Promise<{ user: User | null; error: string | null }>
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: string | null }>
  signInWithGoogle: () => Promise<{ user: User | null; error: string | null }>
  signOut: () => Promise<{ error: string | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Convert Firebase user to our User interface
  const mapFirebaseUser = (firebaseUser: FirebaseUser): User => ({
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL
  })

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = authFunctions.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        const user = mapFirebaseUser(firebaseUser)
        setUser(user)
        
        // Create/update user profile in Firestore
        try {
          const profileResult = await firestoreFunctions.getUserProfile(firebaseUser.uid)
          if (profileResult.error === 'User not found') {
            // Create new user profile
            await firestoreFunctions.createUserProfile(firebaseUser.uid, {
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              createdAt: new Date(),
              lastLoginAt: new Date()
            })
          } else {
            // Update last login
            await firestoreFunctions.updateUserProfile(firebaseUser.uid, {
              lastLoginAt: new Date()
            })
          }
        } catch (error) {
          console.warn('Failed to update user profile:', error)
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, displayName?: string) => {
    setLoading(true)
    
    try {
      const result = await authFunctions.signUp(email, password, displayName)
      
      if (result.user) {
        const user = mapFirebaseUser(result.user)
        setUser(user)
        toast.success('Account created successfully!')
        return { user, error: null }
      } else {
        setLoading(false)
        return { user: null, error: result.error || 'Failed to create account' }
      }
    } catch (error: any) {
      setLoading(false)
      return { user: null, error: error.message || 'Failed to create account' }
    }
  }

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    
    try {
      const result = await authFunctions.signIn(email, password)
      
      if (result.user) {
        const user = mapFirebaseUser(result.user)
        setUser(user)
        toast.success('Signed in successfully!')
        return { user, error: null }
      } else {
        setLoading(false)
        return { user: null, error: result.error || 'Failed to sign in' }
      }
    } catch (error: any) {
      setLoading(false)
      return { user: null, error: error.message || 'Failed to sign in' }
    }
  }

  const signInWithGoogle = async () => {
    setLoading(true)
    
    try {
      const result = await authFunctions.signInWithGoogle()
      
      if (result.user) {
        const user = mapFirebaseUser(result.user)
        setUser(user)
        toast.success('Signed in with Google successfully!')
        return { user, error: null }
      } else {
        setLoading(false)
        return { user: null, error: result.error || 'Failed to sign in with Google' }
      }
    } catch (error: any) {
      setLoading(false)
      return { user: null, error: error.message || 'Failed to sign in with Google' }
    }
  }

  const signOut = async () => {
    setLoading(true)
    
    try {
      const result = await authFunctions.signOut()
      
      if (!result.error) {
        setUser(null)
        toast.success('Signed out successfully!')
        setLoading(false)
        return { error: null }
      } else {
        setLoading(false)
        return { error: result.error }
      }
    } catch (error: any) {
      setLoading(false)
      return { error: error.message || 'Failed to sign out' }
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}