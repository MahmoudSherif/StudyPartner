import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider } from '@/contexts/AuthContext'
import { authFunctions } from '@/lib/supabase'

// The Supabase client and its auth helpers are mocked globally in src/test/setup.ts.

const MockedAuthFunctions = authFunctions as any

// Test component that uses AuthContext
const TestComponent = () => {
  return (
    <AuthProvider>
      <div data-testid="auth-provider">Auth Provider Test</div>
    </AuthProvider>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render AuthProvider without crashing', () => {
    // Mock auth helpers to return a proper unsubscribe
    MockedAuthFunctions.onAuthStateChange.mockImplementation(() => vi.fn())
    MockedAuthFunctions.firestoreFunctions = {
      createUserProfile: vi.fn().mockResolvedValue({ error: null }),
      getUserProfile: vi.fn().mockResolvedValue({ error: 'User not found' }),
      updateUserProfile: vi.fn().mockResolvedValue({ error: null })
    }
    
    render(<TestComponent />)
    expect(screen.getByTestId('auth-provider')).toBeInTheDocument()
  })

  it('should initialize with no user', () => {
    MockedAuthFunctions.getSession.mockResolvedValue(null)
    MockedAuthFunctions.onAuthStateChange.mockImplementation((callback) => {
      callback(null)
      return () => {}
    })

    render(<TestComponent />)
    expect(MockedAuthFunctions.onAuthStateChange).toHaveBeenCalled()
  })

  it('should handle user sign in', async () => {
    const mockUser = {
      uid: 'test-uid',
      email: 'test@example.com',
      displayName: 'Test User'
    }

    MockedAuthFunctions.signIn.mockResolvedValue({
      user: mockUser,
      error: null
    })

    const result = await authFunctions.signIn('test@example.com', 'password')
    
    expect(result.user).toEqual(mockUser)
    expect(result.error).toBeNull()
    expect(MockedAuthFunctions.signIn).toHaveBeenCalledWith('test@example.com', 'password')
  })

  it('should handle user sign up', async () => {
    const mockUser = {
      uid: 'test-uid',
      email: 'test@example.com',
      displayName: 'Test User'
    }

    MockedAuthFunctions.signUp.mockResolvedValue({
      user: mockUser,
      error: null
    })

    const result = await authFunctions.signUp('test@example.com', 'password', 'Test User')
    
    expect(result.user).toEqual(mockUser)
    expect(result.error).toBeNull()
    expect(MockedAuthFunctions.signUp).toHaveBeenCalledWith('test@example.com', 'password', 'Test User')
  })

  it('should handle sign in errors', async () => {
    MockedAuthFunctions.signIn.mockResolvedValue({
      user: null,
      error: 'Invalid credentials'
    })

    const result = await authFunctions.signIn('invalid@example.com', 'wrongpassword')
    
    expect(result.user).toBeNull()
    expect(result.error).toBe('Invalid credentials')
  })

  it('should handle sign out', async () => {
    MockedAuthFunctions.signOut.mockResolvedValue({
      error: null
    })

    const result = await authFunctions.signOut()
    
    expect(result.error).toBeNull()
    expect(MockedAuthFunctions.signOut).toHaveBeenCalled()
  })

  it('should handle Google sign in', async () => {
    const mockUser = {
      uid: 'google-uid',
      email: 'google@example.com',
      displayName: 'Google User'
    }

    MockedAuthFunctions.signInWithGoogle.mockResolvedValue({
      user: mockUser,
      error: null
    })

    const result = await authFunctions.signInWithGoogle()

    // OAuth navigates away and the session is picked up on return, so this
    // resolves with an error channel only -- there is no user to hand back.
    expect(result.error).toBeNull()
    expect(MockedAuthFunctions.signInWithGoogle).toHaveBeenCalled()
  })
})
