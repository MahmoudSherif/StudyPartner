// Mock authentication system for demo purposes
// This simulates Firebase Auth functionality but works entirely offline

interface MockUser {
  uid: string
  email: string | null
  displayName: string | null
}

interface AuthResult {
  user: MockUser | null
  error: string | null
}

// Simple event emitter for auth state changes
class AuthStateManager {
  private listeners: ((user: MockUser | null) => void)[] = []
  private currentUser: MockUser | null = null

  constructor() {
    // Check for existing user in localStorage
    const savedUser = localStorage.getItem('mockAuth_user')
    if (savedUser) {
      try {
        this.currentUser = JSON.parse(savedUser)
      } catch (error) {
        localStorage.removeItem('mockAuth_user')
      }
    }
  }

  setUser(user: MockUser | null) {
    this.currentUser = user
    if (user) {
      localStorage.setItem('mockAuth_user', JSON.stringify(user))
    } else {
      localStorage.removeItem('mockAuth_user')
    }
    this.notifyListeners()
  }

  getCurrentUser() {
    return this.currentUser
  }

  onAuthStateChanged(callback: (user: MockUser | null) => void) {
    this.listeners.push(callback)
    // Immediately call with current state
    callback(this.currentUser)
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback)
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.currentUser))
  }
}

const authStateManager = new AuthStateManager()

// Simulate network delay
const simulateDelay = (ms: number = 1000) => 
  new Promise(resolve => setTimeout(resolve, ms))

export const mockAuthFunctions = {
  // Sign up with email and password
  signUp: async (email: string, password: string, displayName?: string): Promise<AuthResult> => {
    await simulateDelay(800)
    
    try {
      // Input sanitization and validation
      const sanitizedEmail = email?.trim().toLowerCase()
      const sanitizedDisplayName = displayName?.trim()
      
      if (!sanitizedEmail || !password) {
        return { user: null, error: 'Email and password are required' }
      }
      
      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(sanitizedEmail)) {
        return { user: null, error: 'Please enter a valid email address' }
      }
      
      // Password strength validation
      if (password.length < 6) {
        return { user: null, error: 'Password must be at least 6 characters long' }
      }
      
      if (password.length > 128) {
        return { user: null, error: 'Password is too long' }
      }
      
      // Display name validation
      if (sanitizedDisplayName && sanitizedDisplayName.length > 50) {
        return { user: null, error: 'Display name is too long' }
      }
      
      // Check if user already exists
      const existingUsers = JSON.parse(localStorage.getItem('mockAuth_users') || '[]')
      if (existingUsers.find((u: any) => u.email === sanitizedEmail)) {
        return { user: null, error: 'This email is already registered. Please sign in instead.' }
      }
      
      // Create new user with sanitized data
      const user: MockUser = {
        uid: 'user_' + Date.now().toString(36) + '_' + Math.random().toString(36),
        email: sanitizedEmail,
        displayName: sanitizedDisplayName || sanitizedEmail.split('@')[0]
      }
      
      // Save user to localStorage
      existingUsers.push(user)
      localStorage.setItem('mockAuth_users', JSON.stringify(existingUsers))
      
      // Set as current user
      authStateManager.setUser(user)
      
      return { user, error: null }
    } catch (error) {
      return { user: null, error: 'An error occurred during sign up' }
    }
  },

  // Sign in with email and password
  signIn: async (email: string, password: string): Promise<AuthResult> => {
    await simulateDelay(800)
    
    try {
      // Input sanitization and validation
      const sanitizedEmail = email?.trim().toLowerCase()
      
      if (!sanitizedEmail || !password) {
        return { user: null, error: 'Email and password are required' }
      }
      
      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(sanitizedEmail)) {
        return { user: null, error: 'Please enter a valid email address' }
      }
      
      // Find user
      const existingUsers = JSON.parse(localStorage.getItem('mockAuth_users') || '[]')
      const user = existingUsers.find((u: any) => u.email === sanitizedEmail)
      
      if (!user) {
        return { user: null, error: 'No account found with this email. Please sign up first.' }
      }
      
      // In a real app, you'd verify the password hash
      // For demo purposes, we'll just check if it's not empty
      if (!password || password.length === 0) {
        return { user: null, error: 'Please enter your password' }
      }
      
      // Set as current user
      authStateManager.setUser(user)
      
      return { user, error: null }
    } catch (error) {
      return { user: null, error: 'Failed to sign in' }
    }
  },

  // Sign in with Google (simulated)
  signInWithGoogle: async (): Promise<AuthResult> => {
    await simulateDelay(1200)
    
    try {
      // Create a demo Google user
      const user: MockUser = {
        uid: 'google_' + Date.now().toString(36),
        email: 'demo@gmail.com',
        displayName: 'Demo User'
      }
      
      // Check if this Google user already exists
      const existingUsers = JSON.parse(localStorage.getItem('mockAuth_users') || '[]')
      const existingUser = existingUsers.find((u: any) => u.email === user.email)
      
      if (existingUser) {
        authStateManager.setUser(existingUser)
        return { user: existingUser, error: null }
      }
      
      // Save new Google user
      existingUsers.push(user)
      localStorage.setItem('mockAuth_users', JSON.stringify(existingUsers))
      
      // Set as current user
      authStateManager.setUser(user)
      
      return { user, error: null }
    } catch (error) {
      return { user: null, error: 'Google sign-in failed' }
    }
  },

  // Sign out
  signOut: async () => {
    await simulateDelay(500)
    
    try {
      authStateManager.setUser(null)
      return { error: null }
    } catch (error) {
      return { error: 'Failed to sign out' }
    }
  },

  // Get current user
  getCurrentUser: () => {
    return authStateManager.getCurrentUser()
  },

  // Listen to auth state changes
  onAuthStateChanged: (callback: (user: MockUser | null) => void) => {
    return authStateManager.onAuthStateChanged(callback)
  }
}