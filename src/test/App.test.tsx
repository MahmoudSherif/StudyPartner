import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import App from '@/App'
import { useAuth } from '@/contexts/AuthContext'

// Mock all the dependencies
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn(),
    channel: vi.fn(),
    removeChannel: vi.fn(),
    auth: {
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null })),
    },
  },
  isSupabaseConfigured: true,
  describeAuthError: vi.fn((e: unknown) => String(e)),
  authFunctions: {
    onAuthStateChange: vi.fn(() => () => {}),
    getSession: vi.fn(() => Promise.resolve(null)),
  }
}))

vi.mock('@/hooks/useAppData', () => ({
  useSubjects: () => [[], vi.fn()],
  useSessions: () => [[], vi.fn()],
  useAchievements: () => [[], vi.fn()],
  useTasks: () => [[], vi.fn()],
  useFocusSessions: () => [[], vi.fn()],
  useActiveFocusSession: () => [null, vi.fn()],
  useGoals: () => [[], vi.fn()],
  useNotes: () => [[], vi.fn()],
  useCalendarEvents: () => [[], vi.fn()],
  useTheme: () => ['dark', vi.fn()],
  useStudyPartnerSettings: () => [{ apiUrl: '', autoSync: false }, vi.fn()],
  useUserSetting: () => [null, vi.fn()],
}))

vi.mock('@/hooks/useChallenges', () => ({
  useChallenges: () => ({
    challenges: [],
    activeChallenge: null,
    members: {},
    nameFor: (id: string) => id,
    loading: false,
    error: null,
    refresh: vi.fn(),
    create: vi.fn(),
    join: vi.fn(),
    addTask: vi.fn(),
    removeTask: vi.fn(),
    toggleTask: vi.fn(),
    end: vi.fn(),
    leave: vi.fn(),
    remove: vi.fn(),
  }),
}))

// useAuth must be a vi.fn so individual cases can re-point it. As a plain
// arrow function there was nothing for vi.mocked(...).mockReturnValue to
// configure, and every case saw the signed-out default.
vi.mock('@/contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
  useAuth: vi.fn(() => ({
    user: null,
    loading: false,
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
  }))
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
  Toaster: () => null,
}))

// Mock PWA components
vi.mock('@/components/PWAInstallPrompt', () => ({
  PWAInstallPrompt: () => null
}))

vi.mock('@/components/PWAIndicator', () => ({
  PWAIndicator: () => null
}))

vi.mock('@/components/OfflineIndicator', () => ({
  OfflineIndicator: () => null
}))

// Mock other complex components
vi.mock('@/components/SpaceBackground', () => ({
  SpaceBackground: () => <div data-testid="space-background">Space Background</div>
}))

vi.mock('@/components/QuotesBar', () => ({
  QuotesBar: () => <div data-testid="quotes-bar">Quotes Bar</div>
}))

vi.mock('@/components/AuthScreen', () => ({
  AuthScreen: () => <div data-testid="auth-screen">Auth Screen</div>
}))

describe('App Component Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // clearAllMocks strips the factory's default implementation too.
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    } as any)
  })

  it('should render the app without crashing', () => {
    render(<App />)
    
    // App should render without throwing errors
    expect(document.body).toBeTruthy()
  })

  it('should show auth screen when user is not authenticated', async () => {
    // Mock unauthenticated state
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    } as any)

    render(<App />)
    
    await waitFor(() => {
      expect(screen.getByTestId('auth-screen')).toBeInTheDocument()
    })
  })

  it('should show main app when user is authenticated', async () => {
    // Mock authenticated state
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'test-uid', uid: 'test-uid', email: 'test@example.com', displayName: 'Test' },
      loading: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    } as any)

    render(<App />)
    
    await waitFor(() => {
      // Should show main navigation tabs
      expect(screen.getByRole('tablist')).toBeInTheDocument()
    })
  })

  it('should render background components', async () => {
    // Signed out, App short-circuits to <AuthScreen /> and never reaches the
    // background layers, so this has to authenticate first.
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'test-uid', uid: 'test-uid', email: 'test@example.com', displayName: 'Test' },
      loading: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    } as any)

    render(<App />)
    
    await waitFor(() => {
      expect(screen.getByTestId('space-background')).toBeInTheDocument()
      expect(screen.getByTestId('quotes-bar')).toBeInTheDocument()
    })
  })

  it('should handle loading state', async () => {
    // Mock loading state
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: true,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    } as any)

    render(<App />)
    
    // Should show loading state or not crash
    expect(document.body).toBeTruthy()
  })

  // The auth-state listener is deliberately not asserted here: this file
  // replaces AuthProvider with a pass-through, so the real provider -- the only
  // thing that subscribes -- never runs and the assertion could only ever fail.
  // src/test/auth.test.tsx exercises the provider itself.

  it('should render with responsive navigation tabs', async () => {
    // Mock authenticated state
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'test-uid', uid: 'test-uid', email: 'test@example.com', displayName: 'Test' },
      loading: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    } as any)

    render(<App />)
    
    await waitFor(() => {
      // Look for tab navigation
      const tabList = screen.queryByRole('tablist')
      if (tabList) {
        expect(tabList).toBeInTheDocument()
      }
    })
  })
})
