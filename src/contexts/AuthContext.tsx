import React, { createContext, useContext, useEffect, useState } from 'react'
import { authFunctions, firestoreFunctions } from '@/lib/firebase'
import { User as FirebaseUser } from 'firebase/auth'
import { toast } from 'sonner'

interface User {
  uid: string
  email: string | null
  displayName: string | null
  username?: string | null
  photoURL?: string | null
  isFromStudyPartner?: boolean
  avatar?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signUp: (email: string, password: string, displayName?: string, username?: string) => Promise<{ user: User | null; error: string | null }>
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: string | null }>
  signInWithGoogle: () => Promise<{ user: User | null; error: string | null }>
  signOut: () => Promise<{ error: string | null }>
  isConnectedToStudyPartner?: boolean
  checkConnection?: () => Promise<boolean>
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
  const [pendingUsername, setPendingUsername] = useState<string | null>(null)

  // Convert Firebase user to our User interface
  const mapFirebaseUser = (firebaseUser: FirebaseUser | any): User => ({
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL
  })

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = authFunctions.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        // Create/update user profile in Firestore
        try {
          const profileResult = await firestoreFunctions.getUserProfile(firebaseUser.uid)
          let username = null
          
          if (profileResult.error === 'User not found') {
            // Create new user profile with username if available
            const profileData = {
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              username: pendingUsername || null,
              createdAt: new Date(),
              lastLoginAt: new Date()
            }
            await firestoreFunctions.createUserProfile(firebaseUser.uid, profileData)
            username = pendingUsername
            setPendingUsername(null) // Clear pending username
          } else if (profileResult.data) {
            // Update last login and get existing username
            username = profileResult.data.username
            await firestoreFunctions.updateUserProfile(firebaseUser.uid, {
              lastLoginAt: new Date()
            })
            
            // If user doesn't have username, generate a default one
            if (!username) {
              const defaultUsername = `user_${firebaseUser.uid.slice(-6)}`
              await firestoreFunctions.updateUserProfile(firebaseUser.uid, {
                username: defaultUsername
              })
              username = defaultUsername
            }
          }
          
          const user = {
            ...mapFirebaseUser(firebaseUser),
            username
          }
          setUser(user)
        } catch (error) {
          console.warn('Failed to update user profile:', error)
          // Set user without username on error
          setUser(mapFirebaseUser(firebaseUser))
        }
      } else {
        setUser(null)
        setPendingUsername(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, displayName?: string, username?: string) => {
    setLoading(true)
    
    try {
      // Check username availability if provided
      if (username) {
        const usernameCheck = await firestoreFunctions.checkUsernameAvailable(username)
        if (usernameCheck.error) {
          setLoading(false)
          return { user: null, error: 'Failed to check username availability. Please try again.' }
        }
        if (!usernameCheck.available) {
          setLoading(false)
          return { user: null, error: 'Username is already taken. Please choose a different one.' }
        }
        
        // Store username for profile creation
        setPendingUsername(username.toLowerCase())
      }

      const result = await authFunctions.signUp(email, password, displayName)
      
      if (result.user) {
        const user = mapFirebaseUser(result.user)
        setUser(user)
        toast.success('Account created successfully!')
        return { user, error: null }
      } else {
        setPendingUsername(null)
        setLoading(false)
        return { user: null, error: result.error || 'Failed to create account' }
      }
    } catch (error: any) {
      setPendingUsername(null)
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
    signOut,
    isConnectedToStudyPartner: false, // Stub implementation
    checkConnection: async () => false // Stub implementation
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}