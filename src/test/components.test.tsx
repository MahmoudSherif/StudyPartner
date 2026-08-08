import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AchieveTab } from '@/components/AchieveTab'
import { TasksManagement } from '@/components/TasksManagement'
import { Calendar } from '@/components/Calendar'
import { NotesTab } from '@/components/NotesTab'
import { ProfileTab } from '@/components/ProfileTab'
import { Achievements } from '@/components/Achievements'
import { InspirationCarousel } from '@/components/InspirationCarousel'
import { INITIAL_ACHIEVEMENTS } from '@/lib/constants'
import { Task, Challenge, Subject, TaskProgress, UserStats } from '@/lib/types'

// These cases were written against a UI that does not exist: buttons named
// "Save" and "Add Goal", a label "Goal title", a placeholder "Enter note
// content", a "25:00" timer readout. None of it appears in any component, so
// every case failed on its first query rather than on a real regression. They
// are rewritten here against the markup the components actually render.

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

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: 'test-user',
      uid: 'test-user',
      email: 'test@example.com',
      displayName: 'Test User'
    },
    loading: false,
    signOut: vi.fn()
  })
}))

vi.mock('@/hooks/useAppData', () => ({
  useGoals: () => [EMPTY, NOOP],
  useFocusSessions: () => [EMPTY, NOOP],
  useActiveFocusSession: () => [null, NOOP],
  useSubjects: () => [EMPTY, NOOP],
  useSessions: () => [EMPTY, NOOP],
  useTasks: () => [EMPTY, NOOP],
  useNotes: () => [EMPTY, NOOP, SYNC_META],
  useCalendarEvents: () => [EMPTY, NOOP],
  useTheme: () => ['dark', NOOP],
  useStudyPartnerSettings: () => [STUDY_PARTNER_SETTINGS, NOOP],
  useUserSetting: () => [null, NOOP],
  useAchievements: () => [INITIAL_ACHIEVEMENTS, NOOP]
}))

describe('Tab Components Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('AchieveTab Component', () => {
    // goals/focusSessions are required props. Omitting them made every
    // AchieveTab case fail on `goals.filter of undefined` before it reached
    // its own assertion.
    const defaultProps = {
      achievements: INITIAL_ACHIEVEMENTS,
      onUpdateAchievements: vi.fn(),
      goals: [],
      setGoals: vi.fn(),
      focusSessions: [],
      setFocusSessions: vi.fn()
    }

    it('renders the goals and focus sections', () => {
      render(<AchieveTab {...defaultProps} />)
      expect(screen.getByText('Current Goals')).toBeInTheDocument()
      expect(screen.getByText('Focus Session')).toBeInTheDocument()
    })

    it('shows achievement progress for the locked catalogue', () => {
      render(<AchieveTab {...defaultProps} />)
      expect(screen.getByText('Achievement Progress')).toBeInTheDocument()
      expect(screen.getByText('Getting Started')).toBeInTheDocument()
    })

    it('prompts for a first goal when there are none', () => {
      render(<AchieveTab {...defaultProps} />)
      expect(screen.getByText('No active goals yet')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /add your first goal/i })).toBeInTheDocument()
    })

    it('refuses to start a focus session with no title', async () => {
      render(<AchieveTab {...defaultProps} />)

      await userEvent.click(screen.getByRole('button', { name: /start focus session/i }))

      // The session row is only written once a title is supplied.
      expect(defaultProps.setFocusSessions).not.toHaveBeenCalled()
    })

    it('offers the focus title field', () => {
      render(<AchieveTab {...defaultProps} />)
      expect(screen.getByPlaceholderText('What are you focusing on?')).toBeInTheDocument()
    })
  })

  describe('TasksManagement Component', () => {
    const tasks: Task[] = [
      {
        id: '00000000-0000-4000-8000-00000000da01',
        title: 'Read chapter 4',
        completed: false,
        // The list is a daily one, so a dated fixture would not appear.
        createdAt: new Date(),
        priority: 'high'
      }
    ]
    const subjects: Subject[] = [{ id: 'math', name: 'Math', color: '#14b8a6', totalTime: 0 }]
    const taskProgress: TaskProgress = {
      dailyTasks: { total: 1, completed: 0, percentage: 0 }
    }

    const props = {
      tasks,
      challenges: [] as Challenge[],
      subjects,
      taskProgress,
      currentUserId: 'test-user',
      onAddTask: vi.fn(),
      onToggleTask: vi.fn(),
      onDeleteTask: vi.fn(),
      onCreateChallenge: vi.fn(async () => {}),
      onJoinChallenge: vi.fn(async () => {}),
      onAddChallengeTask: vi.fn(async () => {}),
      onToggleChallengeTask: vi.fn(async () => {}),
      onSwitchProgressView: vi.fn(),
      onEndChallenge: vi.fn(async () => {}),
      userNames: {}
    }

    it('renders the task management interface', () => {
      render(<TasksManagement {...props} />)
      expect(screen.getByTestId('task-management-header')).toBeInTheDocument()
    })

    it("lists today's tasks", () => {
      render(<TasksManagement {...props} />)
      expect(screen.getByText('Read chapter 4')).toBeInTheDocument()
    })

    it('opens the add-task dialog', async () => {
      render(<TasksManagement {...props} />)
      const addTask = screen
        .getAllByRole('button')
        .find(b => /add task/i.test(b.textContent ?? ''))
      await userEvent.click(addTask as HTMLElement)
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Task title')).toBeInTheDocument()
      })
    })

    it('exposes both the tasks and challenges tabs', () => {
      render(<TasksManagement {...props} />)
      const tabs = screen.getAllByRole('tab').map(t => t.textContent ?? '')
      expect(tabs.some(t => /my tasks/i.test(t))).toBeTruthy()
      expect(tabs.some(t => /challenges/i.test(t))).toBeTruthy()
    })
  })

  describe('Calendar Component', () => {
    it('renders the calendar view', () => {
      render(<Calendar subjects={[]} />)
      expect(screen.getByText('Calendar')).toBeInTheDocument()
      expect(screen.getByText('Plan your study schedule')).toBeInTheDocument()
    })

    it('renders the weekday header row', () => {
      render(<Calendar subjects={[]} />)
      ;['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(day => {
        expect(screen.getByText(day)).toBeInTheDocument()
      })
    })

    it('offers an add-event action', () => {
      render(<Calendar subjects={[]} />)
      expect(screen.getByRole('button', { name: /add event/i })).toBeInTheDocument()
    })
  })

  describe('NotesTab Component', () => {
    it('renders the notes interface', () => {
      render(<NotesTab />)
      expect(screen.getByText('No notes yet')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Search notes...')).toBeInTheDocument()
    })

    it('opens the note composer', async () => {
      render(<NotesTab />)
      await userEvent.click(screen.getByRole('button', { name: /create note/i }))
      await waitFor(() => {
        // The composer adds title and content fields to the search box.
        expect(screen.getAllByRole('textbox').length).toBeGreaterThan(1)
      })
    })
  })

  describe('ProfileTab Component', () => {
    const stats: UserStats = {
      totalStudyTime: 120,
      streak: 3,
      longestStreak: 5,
      sessionsCompleted: 4,
      averageSessionLength: 1800,
      tasksCompleted: 2,
      challengeTasksCompleted: 1
    }

    const profileProps = {
      stats,
      achievements: INITIAL_ACHIEVEMENTS,
      sessions: [],
      focusSessions: [],
      tasks: [],
      challenges: []
    }

    it('renders the signed-in user', () => {
      render(<ProfileTab {...profileProps} />)
      expect(screen.getByText('Test User')).toBeInTheDocument()
      expect(screen.getByText('test@example.com')).toBeInTheDocument()
    })

    it('shows the headline statistics', () => {
      render(<ProfileTab {...profileProps} />)
      expect(screen.getByText('Total Study Time')).toBeInTheDocument()
      expect(screen.getByText('Day Streak')).toBeInTheDocument()
      expect(screen.getByText('Sessions')).toBeInTheDocument()
    })

    // Radix TabsTriggers: a <button> element, but role "tab" to assistive tech.
    it('offers statistics and settings views', () => {
      render(<ProfileTab {...profileProps} />)
      expect(screen.getByRole('tab', { name: /statistics/i })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /settings/i })).toBeInTheDocument()
    })

    it('offers sample data generation when there is nothing to chart', () => {
      render(<ProfileTab {...profileProps} />)
      expect(screen.getByText('No Study Data Available')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /generate sample data/i })).toBeInTheDocument()
    })
  })

  describe('Achievements Component', () => {
    it('renders the achievements list', () => {
      render(<Achievements achievements={INITIAL_ACHIEVEMENTS} />)
      expect(screen.getByText('Achievements')).toBeInTheDocument()
      expect(screen.getByText('Getting Started')).toBeInTheDocument()
    })

    it('shows the unlocked count against the catalogue size', () => {
      render(<Achievements achievements={INITIAL_ACHIEVEMENTS} />)
      expect(screen.getByText(`0 / ${INITIAL_ACHIEVEMENTS.length}`)).toBeInTheDocument()
    })

    it('offers the category filters', () => {
      render(<Achievements achievements={INITIAL_ACHIEVEMENTS} />)
      ;[/^all$/i, /^unlocked$/i, /^progress$/i, /^categories$/i].forEach(name => {
        expect(screen.getByRole('tab', { name })).toBeInTheDocument()
      })
    })

    it('filters down to unlocked achievements', async () => {
      const withOneUnlocked = INITIAL_ACHIEVEMENTS.map((a, i) =>
        i === 0 ? { ...a, unlocked: true, progress: a.requirement } : a
      )
      render(<Achievements achievements={withOneUnlocked} />)

      await userEvent.click(screen.getByRole('tab', { name: /^unlocked$/i }))

      await waitFor(() => {
        expect(screen.getByText(withOneUnlocked[0].title)).toBeInTheDocument()
      })
    })
  })

  describe('InspirationCarousel Component', () => {
    it('renders inspiration content', () => {
      render(<InspirationCarousel />)
      expect(screen.getByText('Daily Inspiration')).toBeInTheDocument()
    })

    it('shows a figure and their quote', () => {
      render(<InspirationCarousel />)
      expect(screen.getAllByText('Albert Einstein').length).toBeGreaterThan(0)
      expect(screen.getByText(/imagination is more important/i)).toBeInTheDocument()
    })

    it('advances to the next entry', async () => {
      render(<InspirationCarousel />)
      expect(screen.getByText('1 of 26')).toBeInTheDocument()

      await userEvent.click(screen.getByRole('button', { name: /next/i }))

      await waitFor(() => {
        expect(screen.getByText('2 of 26')).toBeInTheDocument()
      })
    })

    // Synchronous, and restores the clock in `finally`.
    //
    // This previously awaited `waitFor` with fake timers installed. waitFor
    // polls on a timer, so with the clock frozen it could never settle: the
    // test hit its 5s limit and `vi.useRealTimers()` -- the last line, never
    // reached -- left the fake clock installed for the REST OF THE RUN. Every
    // later file then queued timer callbacks that nothing ever drained, which
    // is what exhausted the heap and crashed `vitest run` outright.
    it('auto-rotates content', () => {
      vi.useFakeTimers()
      try {
        render(<InspirationCarousel />)
        act(() => {
          vi.advanceTimersByTime(10000)
        })
        expect(screen.getAllByText(/of 26/).length).toBeGreaterThan(0)
      } finally {
        vi.useRealTimers()
      }
    })
  })
})
