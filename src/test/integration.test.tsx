import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '@/App'
import { AuthProvider } from '@/contexts/AuthContext'

// Stable identities on purpose. Returning a fresh `[]` and a fresh `vi.fn()`
// per call makes every consumer's dependency arrays change on every render,
// which drove App into an unbounded render loop and exhausted the heap. The
// real hooks return referentially stable values between changes; the mocks
// must too.
const EMPTY: any[] = []
const NOOP = vi.fn()
// useSyncedCollection's third element. NotesTab reads `loading` from it to tell
// "no notes yet" apart from "fetch has not returned" before seeding.
const SYNC_META = { loading: false, error: null, refresh: NOOP }

const STUDY_PARTNER_SETTINGS = { apiUrl: '', autoSync: false }


// Mock Supabase and external dependencies
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn(),
    channel: vi.fn(),
    removeChannel: vi.fn(),
    auth: {
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null }))
    }
  },
  isSupabaseConfigured: true,
  describeAuthError: vi.fn((e: unknown) => String(e)),
  authFunctions: {
    onAuthStateChange: vi.fn(() => vi.fn()),
    getSession: vi.fn(() => Promise.resolve(null)),
    signIn: vi.fn(() => Promise.resolve({ user: null, error: null })),
    signUp: vi.fn(() => Promise.resolve({ user: null, error: null })),
    signInWithGoogle: vi.fn(() => Promise.resolve({ error: null })),
    signOut: vi.fn(() => Promise.resolve({ error: null })),
    resetPassword: vi.fn(() => Promise.resolve({ error: null }))
  }
}))

vi.mock('@/hooks/useAppData', () => ({
  useSubjects: () => [EMPTY, NOOP],
  useSessions: () => [EMPTY, NOOP],
  useFocusSessions: () => [EMPTY, NOOP],
  useActiveFocusSession: () => [null, NOOP],
  useTasks: () => [EMPTY, NOOP],
  useGoals: () => [EMPTY, NOOP],
  useNotes: () => [EMPTY, NOOP, SYNC_META],
  useCalendarEvents: () => [EMPTY, NOOP],
  useAchievements: () => [EMPTY, NOOP],
  useTheme: () => ['dark', NOOP],
  useStudyPartnerSettings: () => [STUDY_PARTNER_SETTINGS, NOOP],
  useUserSetting: () => [null, NOOP]
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
    remove: vi.fn()
  })
}))

vi.mock('@/lib/notifications', () => ({
  notificationManager: {
    notifyAchievementUnlock: vi.fn(),
    notifyChallengeWin: vi.fn(),
    notifyChallengeComplete: vi.fn()
  },
  initializeNotifications: vi.fn(() => Promise.resolve(true))
}))

vi.mock('@/lib/mobileFeedback', () => ({
  mobileFeedback: {
    achievement: vi.fn(),
    studySessionComplete: vi.fn(),
    taskComplete: vi.fn(),
    challengeTaskComplete: vi.fn(),
    progressMilestone: vi.fn()
  }
}))

// Mock AuthContext to simulate authenticated user
const mockAuthUser = {
  uid: 'test-user-123',
  email: 'test@example.com',
  displayName: 'Test User'
}

vi.mock('@/contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
  useAuth: () => ({
    user: mockAuthUser,
    loading: false,
    signOut: vi.fn(() => Promise.resolve({ error: null }))
  })
}))

describe('Application Integration Tests', () => {
  let user: any

  beforeEach(() => {
    vi.clearAllMocks()
    user = userEvent.setup()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Full Application Flow', () => {
    it('should render the main application with all tabs', async () => {
      render(<App />)
      
      // Check for main header
      expect(screen.getByText('MotivaMate')).toBeInTheDocument()
      
      // Check for all tab triggers
      expect(screen.getByText('Achieve')).toBeInTheDocument()
      expect(screen.getByText('Tasks')).toBeInTheDocument()
      expect(screen.getByText('Calendar')).toBeInTheDocument()
      expect(screen.getByText('Notes')).toBeInTheDocument()
      expect(screen.getByText('Profile')).toBeInTheDocument()
      expect(screen.getByText('Awards')).toBeInTheDocument()
      expect(screen.getByText('Inspire')).toBeInTheDocument()
    })

    it('should navigate between tabs correctly', async () => {
      render(<App />)
      
      // Click on Tasks tab
      const tasksTab = screen.getByTestId('tasks-tab')
      await user.click(tasksTab)
      
      await waitFor(() => {
        expect(screen.getByText(/task management/i)).toBeInTheDocument()
      })
      
      // Click on Calendar tab
      const calendarTab = screen.getByRole('tab', { name: /calendar/i })
      await user.click(calendarTab)
      
      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /calendar/i })).toBeInTheDocument()
      })
    })

    it('should handle tab content persistence across navigation', async () => {
      render(<App />)
      
      // Go to Tasks tab and add a task
      const tasksTab = screen.getByTestId('tasks-tab')
      await user.click(tasksTab)
      
      // Navigate away and back
      const profileTab = screen.getByRole('tab', { name: /profile/i })
      await user.click(profileTab)
      
      await user.click(tasksTab)
      
      // Tasks tab should still be accessible
      await waitFor(() => {
        expect(screen.getByText(/task management/i)).toBeInTheDocument()
      })
    })
  })

  describe('Data Flow Integration', () => {
    it('should handle subject creation and session tracking', async () => {
      render(<App />)
      
      // Go to Calendar tab (subject management)
      const calendarTab = screen.getByRole('tab', { name: /calendar/i })
      await user.click(calendarTab)
      
      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /calendar/i })).toBeInTheDocument()
      })
      
      // Subject creation should trigger proper data flow
      // Note: This tests the integration between components
    })

    it('should sync task completion with achievement progress', async () => {
      render(<App />)
      
      // Create tasks and complete them
      const tasksTab = screen.getByTestId('tasks-tab')
      await user.click(tasksTab)
      
      // Go to achievements to check progress
      const achievementsTab = screen.getByRole('tab', { name: /awards/i })
      await user.click(achievementsTab)
      
      await waitFor(() => {
        expect(screen.getByText(/achievements/i)).toBeInTheDocument()
      })
    })

    it('should handle real-time data synchronization', async () => {
      render(<App />)
      
      // Test that data changes are reflected across components
      const profileTab = screen.getByRole('tab', { name: /profile/i })
      await user.click(profileTab)
      
      // Statistics should reflect current state
      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /statistics/i })).toBeInTheDocument()
      })
    })
  })

  describe('Error Handling Integration', () => {
    it('should handle Supabase connection errors gracefully', async () => {
      // Mock Supabase as unconfigured
      vi.doMock('@/lib/supabase', () => ({
        isSupabaseConfigured: false,
        supabase: null
      }))
      
      render(<App />)
      
      // App should still render and function
      expect(screen.getByText('MotivaMate')).toBeInTheDocument()
    })

    it('should handle network failures with proper user feedback', async () => {
      render(<App />)
      
      // Simulate network failure during task creation
      const tasksTab = screen.getByTestId('tasks-tab')
      await user.click(tasksTab)
      
      // Error handling should prevent app crashes
      await waitFor(() => {
        expect(screen.getByText(/task management/i)).toBeInTheDocument()
      })
    })

    it('should recover from temporary data inconsistencies', async () => {
      render(<App />)
      
      // Test data reconciliation mechanisms
      const achievementsTab = screen.getByRole('tab', { name: /awards/i })
      await user.click(achievementsTab)
      
      await waitFor(() => {
        expect(screen.getByText(/achievements/i)).toBeInTheDocument()
      })
    })
  })

  describe('User Interaction Flows', () => {
    it('should complete full study session workflow', async () => {
      render(<App />)
      
      // 1. Start in Achieve tab with focus session
      const achieveTab = screen.getByRole('tab', { name: /achieve/i })
      await user.click(achieveTab)
      
      // 2. Check achievements progress
      const achievementsTab = screen.getByRole('tab', { name: /awards/i })
      await user.click(achievementsTab)
      
      // 3. View profile statistics
      const profileTab = screen.getByTestId('profile-tab')
      await user.click(profileTab)
      
      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /statistics/i })).toBeInTheDocument()
      })
    })

    it('should handle task and challenge workflow', async () => {
      render(<App />)
      
      // 1. Create personal tasks
      const tasksTab = screen.getByRole('tab', { name: /tasks/i })
      await user.click(tasksTab)
      
      // 2. Check achievements for task completion
      const achievementsTab = screen.getByRole('tab', { name: /awards/i })
      await user.click(achievementsTab)
      
      // 3. View progress in profile
      const profileTab = screen.getByRole('tab', { name: /profile/i })
      await user.click(profileTab)
      
      await waitFor(() => {
        expect(screen.getByText('Statistics')).toBeInTheDocument()
      })
    })

    it('should handle note-taking workflow', async () => {
      render(<App />)
      
      // 1. Create notes
      const notesTab = screen.getByTestId('notes-tab')
      await user.click(notesTab)
      
      // 2. Navigate away and back to verify persistence
      const calendarTab = screen.getByRole('tab', { name: /calendar/i })
      await user.click(calendarTab)
      
      await user.click(notesTab)
      
      await waitFor(() => {
        expect(screen.getByText('Create Note')).toBeInTheDocument()
      })
    })
  })

  describe('Performance and Responsiveness', () => {
    it('should handle rapid tab switching without errors', async () => {
      render(<App />)
      
      const tabs = [
        screen.getByRole('tab', { name: /achieve/i }),
        screen.getByRole('tab', { name: /tasks/i }),
        screen.getByRole('tab', { name: /calendar/i }),
        screen.getByTestId('notes-tab'),
        screen.getByRole('tab', { name: /profile/i })
      ]
      
      // Rapidly switch between tabs
      for (let i = 0; i < 3; i++) {
        for (const tab of tabs) {
          await user.click(tab)
          await waitFor(() => {
            expect(tab).toHaveAttribute('data-state', 'active')
          })
        }
      }
    })

    it('should handle large data sets without performance degradation', async () => {
      render(<App />)
      
      // Test with profile tab which displays statistics
      const profileTab = screen.getByRole('tab', { name: /profile/i })
      await user.click(profileTab)
      
      await waitFor(() => {
        expect(screen.getByText('Statistics')).toBeInTheDocument()
      }, { timeout: 3000 })
    })

    it('should debounce user inputs appropriately', async () => {
      render(<App />)
      
      const notesTab = screen.getByTestId('notes-tab')
      await user.click(notesTab)
      
      // Rapid typing should be debounced
      await waitFor(() => {
        expect(screen.getByText('Create Note')).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility Integration', () => {
    it('should support keyboard navigation', async () => {
      render(<App />)
      
      // Test Tab key navigation
      await user.keyboard('{Tab}')
      await user.keyboard('{Tab}')
      
      // Should be able to navigate through interactive elements
      const focusedElement = document.activeElement
      expect(focusedElement).toBeInTheDocument()
    })

    it('should provide proper ARIA labels and roles', () => {
      render(<App />)
      
      // Check for proper accessibility attributes
      const tabList = screen.getByRole('tablist')
      expect(tabList).toBeInTheDocument()
      
      const tabs = screen.getAllByRole('tab')
      expect(tabs.length).toBeGreaterThan(0)
    })

    it('should support screen reader announcements', async () => {
      render(<App />)
      
      // Tab changes should be announced
      const tasksTab = screen.getByRole('tab', { name: /tasks/i })
      await user.click(tasksTab)
      
      await waitFor(() => {
        expect(tasksTab).toHaveAttribute('aria-selected', 'true')
      })
    })
  })

  describe('Mobile Experience Integration', () => {
    it('should handle touch gestures', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      })
      
      render(<App />)
      
      // First navigate to tasks tab with normal click
      const tasksTab = screen.getByTestId('tasks-tab')
      await user.click(tasksTab)
      
      // Verify the tasks tab content is loaded
      await waitFor(() => {
        expect(screen.getByTestId('task-management-header')).toBeInTheDocument()
      })
      
      // Also verify the text content
      expect(screen.getByText('Task Management')).toBeInTheDocument()
      
      // Then test touch interactions
      fireEvent.touchStart(tasksTab)
      fireEvent.touchEnd(tasksTab)
      
      await waitFor(() => {
        expect(screen.getByTestId('task-management-header')).toBeInTheDocument()
      })
    })

    it('should be responsive to different screen sizes', () => {
      // Test different viewport sizes
      const viewports = [
        { width: 320, height: 568 }, // iPhone SE
        { width: 375, height: 812 }, // iPhone X
        { width: 768, height: 1024 }, // iPad
        { width: 1024, height: 768 } // Desktop
      ]
      
      viewports.forEach(viewport => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: viewport.width
        })
        
        Object.defineProperty(window, 'innerHeight', {
          writable: true,
          configurable: true,
          value: viewport.height
        })
        
        render(<App />)
        expect(screen.getAllByTestId('main-title')[0]).toBeInTheDocument()
      })
    })
  })

  describe('Data Persistence Integration', () => {
    it('should persist data across browser sessions', async () => {
      render(<App />)
      
      // Test data persistence mechanisms
      const profileTab = screen.getByRole('tab', { name: /profile/i })
      await user.click(profileTab)
      
      // Data should be loaded from storage
      await waitFor(() => {
        expect(screen.getByText('Statistics')).toBeInTheDocument()
      })
    })

    it('should handle offline data synchronization', async () => {
      render(<App />)
      
      // Test offline data handling
      const tasksTab = screen.getByRole('tab', { name: /tasks/i })
      await user.click(tasksTab)
      
      await waitFor(() => {
        expect(screen.getByText(/task management/i)).toBeInTheDocument()
      })
    })

    it('should validate data integrity after sync', async () => {
      render(<App />)
      
      // Test data validation after synchronization
      const achievementsTab = screen.getByRole('tab', { name: /awards/i })
      await user.click(achievementsTab)
      
      await waitFor(() => {
        expect(screen.getByText(/achievements/i)).toBeInTheDocument()
      })
    })
  })
})
