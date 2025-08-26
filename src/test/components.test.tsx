import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AchieveTab } from '@/components/AchieveTab'
import { TasksManagement } from '@/components/TasksManagement'
import { Calendar } from '@/components/Calendar'
import { NotesTab } from '@/components/NotesTab'
import { ProfileTab } from '@/components/ProfileTab'
import { Achievements } from '@/components/Achievements'
import { InspirationCarousel } from '@/components/InspirationCarousel'
import { INITIAL_ACHIEVEMENTS } from '@/lib/constants'

// Mock components dependencies
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { uid: 'test-user', email: 'test@example.com', displayName: 'Test User' },
    loading: false,
    signOut: vi.fn()
  })
}))

vi.mock('@/hooks/useFirebaseData', () => ({
  useFirebaseGoals: () => [[], vi.fn()],
  useFirebaseFocusSessions: () => [[], vi.fn()],
  useFirebaseSubjects: () => [[], vi.fn()],
  useFirebaseSessions: () => [[], vi.fn()],
  useFirebaseTasks: () => [[], vi.fn()],
  useFirebaseAchievements: () => [INITIAL_ACHIEVEMENTS, vi.fn()]
}))

describe('Tab Components Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('AchieveTab Component', () => {
    const defaultProps = {
      achievements: INITIAL_ACHIEVEMENTS,
      onUpdateAchievements: vi.fn()
    }

    it('should render without crashing', () => {
      render(<AchieveTab {...defaultProps} />)
      expect(screen.getByText(/achieve/i)).toBeInTheDocument()
    })

    it('should display achievements', () => {
      render(<AchieveTab {...defaultProps} />)
      expect(screen.getByText(/unlocked achievements/i)).toBeInTheDocument()
    })

    it('should handle goal creation', async () => {
      render(<AchieveTab {...defaultProps} />)
      
      // Find and click add goal button
      const addGoalButton = screen.getByRole('button', { name: /add goal/i })
      fireEvent.click(addGoalButton)
      
      // Fill goal form
      const titleInput = screen.getByLabelText(/goal title/i)
      fireEvent.change(titleInput, { target: { value: 'Test Goal' } })
      
      const saveButton = screen.getByRole('button', { name: /save/i })
      fireEvent.click(saveButton)
      
      await waitFor(() => {
        expect(defaultProps.onUpdateAchievements).toHaveBeenCalled()
      })
    })

    it('should validate goal input', async () => {
      render(<AchieveTab {...defaultProps} />)
      
      const addGoalButton = screen.getByRole('button', { name: /add goal/i })
      fireEvent.click(addGoalButton)
      
      // Try to save without title
      const saveButton = screen.getByRole('button', { name: /save/i })
      fireEvent.click(saveButton)
      
      await waitFor(() => {
        expect(screen.getByText(/goal title is required/i)).toBeInTheDocument()
      })
    })

    it('should handle focus session timer', async () => {
      render(<AchieveTab {...defaultProps} />)
      
      const startButton = screen.getByRole('button', { name: /start focus/i })
      fireEvent.click(startButton)
      
      await waitFor(() => {
        expect(screen.getByText(/25:00/)).toBeInTheDocument()
      })
    })
  })

  describe('TasksManagement Component', () => {
    const mockSubjects = [
      { id: '1', name: 'Math', color: '#FF0000', totalTime: 0, dailyTarget: 60, weeklyTarget: 420 }
    ]
    
    const defaultProps = {
      tasks: [],
      challenges: [],
      subjects: mockSubjects,
      taskProgress: {
        dailyTasks: { total: 0, completed: 0, percentage: 0 }
      },
      currentUserId: 'test-user',
      onAddTask: vi.fn(),
      onToggleTask: vi.fn(),
      onDeleteTask: vi.fn(),
      onCreateChallenge: vi.fn(),
      onJoinChallenge: vi.fn(),
      onAddChallengeTask: vi.fn(),
      onToggleChallengeTask: vi.fn(),
      onSwitchProgressView: vi.fn(),
      onEndChallenge: vi.fn(),
      userNames: {}
    }

    it('should render task management interface', () => {
      render(<TasksManagement {...defaultProps} />)
      expect(screen.getByText(/task management/i)).toBeInTheDocument()
    })

    it('should allow adding new tasks', async () => {
      render(<TasksManagement {...defaultProps} />)
      
      const addTaskButton = screen.getByRole('button', { name: /add task/i })
      fireEvent.click(addTaskButton)
      
      const titleInput = screen.getByLabelText(/task title/i)
      fireEvent.change(titleInput, { target: { value: 'New Task' } })
      
      const saveButton = screen.getByRole('button', { name: /save/i })
      fireEvent.click(saveButton)
      
      await waitFor(() => {
        expect(defaultProps.onAddTask).toHaveBeenCalledWith(
          expect.objectContaining({ title: 'New Task' })
        )
      })
    })

    it('should validate task creation', async () => {
      render(<TasksManagement {...defaultProps} />)
      
      const addTaskButton = screen.getByRole('button', { name: /add task/i })
      fireEvent.click(addTaskButton)
      
      // Try to save without title
      const saveButton = screen.getByRole('button', { name: /save/i })
      fireEvent.click(saveButton)
      
      await waitFor(() => {
        expect(screen.getByText(/task title is required/i)).toBeInTheDocument()
      })
    })

    it('should handle challenge creation', async () => {
      render(<TasksManagement {...defaultProps} />)
      
      const createChallengeButton = screen.getByRole('button', { name: /create challenge/i })
      fireEvent.click(createChallengeButton)
      
      const titleInput = screen.getByLabelText(/challenge title/i)
      fireEvent.change(titleInput, { target: { value: 'Study Challenge' } })
      
      const saveButton = screen.getByRole('button', { name: /create/i })
      fireEvent.click(saveButton)
      
      await waitFor(() => {
        expect(defaultProps.onCreateChallenge).toHaveBeenCalled()
      })
    })

    it('should handle joining challenges', async () => {
      render(<TasksManagement {...defaultProps} />)
      
      const joinButton = screen.getByRole('button', { name: /join challenge/i })
      fireEvent.click(joinButton)
      
      const codeInput = screen.getByLabelText(/challenge code/i)
      fireEvent.change(codeInput, { target: { value: 'ABC123' } })
      
      const submitButton = screen.getByRole('button', { name: /join/i })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(defaultProps.onJoinChallenge).toHaveBeenCalledWith('ABC123')
      })
    })
  })

  describe('Calendar Component', () => {
    const mockSubjects = [
      { id: '1', name: 'Math', color: '#FF0000', totalTime: 120, dailyTarget: 60, weeklyTarget: 420 }
    ]

    it('should render calendar view', () => {
      render(<Calendar subjects={mockSubjects} />)
      expect(screen.getByText(/calendar/i)).toBeInTheDocument()
    })

    it('should display subjects in calendar', () => {
      render(<Calendar subjects={mockSubjects} />)
      expect(screen.getByText('Math')).toBeInTheDocument()
    })

    it('should allow navigation between months', async () => {
      render(<Calendar subjects={mockSubjects} />)
      
      const nextButton = screen.getByRole('button', { name: /next/i })
      fireEvent.click(nextButton)
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument()
      })
    })

    it('should show study session details on date click', async () => {
      render(<Calendar subjects={mockSubjects} />)
      
      // Click on a calendar date
      const dateCell = screen.getByText('15') // assuming 15th is clickable
      fireEvent.click(dateCell)
      
      await waitFor(() => {
        expect(screen.getByText(/study sessions/i)).toBeInTheDocument()
      })
    })
  })

  describe('NotesTab Component', () => {
    it('should render notes interface', () => {
      render(<NotesTab />)
      expect(screen.getByText(/notes/i)).toBeInTheDocument()
    })

    it('should allow creating new notes', async () => {
      render(<NotesTab />)
      
      const addNoteButton = screen.getByRole('button', { name: /add note/i })
      fireEvent.click(addNoteButton)
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/enter note content/i)).toBeInTheDocument()
      })
    })

    it('should save note content', async () => {
      render(<NotesTab />)
      
      const addNoteButton = screen.getByRole('button', { name: /add note/i })
      fireEvent.click(addNoteButton)
      
      const textarea = screen.getByPlaceholderText(/enter note content/i) as HTMLTextAreaElement
      fireEvent.change(textarea, { target: { value: 'Test note content' } })
      
      await waitFor(() => {
        expect(textarea.value).toBe('Test note content')
      })
    })

    it('should handle note deletion', async () => {
      render(<NotesTab />)
      
      // First create a note
      const addNoteButton = screen.getByRole('button', { name: /add note/i })
      fireEvent.click(addNoteButton)
      
      // Then delete it
      const deleteButton = screen.getByRole('button', { name: /delete/i })
      fireEvent.click(deleteButton)
      
      await waitFor(() => {
        expect(screen.queryByPlaceholderText(/enter note content/i)).not.toBeInTheDocument()
      })
    })
  })

  describe('ProfileTab Component', () => {
    const mockStats = {
      totalStudyTime: 120,
      sessionsCompleted: 5,
      streak: 3,
      longestStreak: 7,
      averageSessionLength: 1800,
      tasksCompleted: 10,
      challengeTasksCompleted: 3
    }

    const defaultProps = {
      stats: mockStats,
      achievements: INITIAL_ACHIEVEMENTS,
      sessions: [],
      focusSessions: [],
      tasks: [],
      challenges: []
    }

    it('should render user profile', () => {
      render(<ProfileTab {...defaultProps} />)
      expect(screen.getByText(/profile/i)).toBeInTheDocument()
    })

    it('should display user statistics', () => {
      render(<ProfileTab {...defaultProps} />)
      expect(screen.getByText('120')).toBeInTheDocument() // total study time
      expect(screen.getByText('5')).toBeInTheDocument() // sessions completed
    })

    it('should show achievement progress', () => {
      render(<ProfileTab {...defaultProps} />)
      expect(screen.getByText(/achievements/i)).toBeInTheDocument()
    })

    it('should handle profile updates', async () => {
      render(<ProfileTab {...defaultProps} />)
      
      const settingsTab = screen.getByRole('tab', { name: /settings/i })
      fireEvent.click(settingsTab)
      
      await waitFor(() => {
        expect(screen.getByText(/notification settings/i)).toBeInTheDocument()
      })
    })

    it('should generate sample data', async () => {
      render(<ProfileTab {...defaultProps} />)
      
      const generateButton = screen.getByRole('button', { name: /generate sample data/i })
      fireEvent.click(generateButton)
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /clear sample data/i })).toBeInTheDocument()
      })
    })
  })

  describe('Achievements Component', () => {
    it('should render achievements list', () => {
      render(<Achievements achievements={INITIAL_ACHIEVEMENTS} />)
      expect(screen.getByText(/achievements/i)).toBeInTheDocument()
    })

    it('should display achievement categories', () => {
      render(<Achievements achievements={INITIAL_ACHIEVEMENTS} />)
      expect(screen.getByText(/time/i)).toBeInTheDocument()
      expect(screen.getByText(/sessions/i)).toBeInTheDocument()
    })

    it('should show unlocked achievements', () => {
      const unlockedAchievements = INITIAL_ACHIEVEMENTS.map(a => ({ ...a, unlocked: true }))
      render(<Achievements achievements={unlockedAchievements} />)
      
      unlockedAchievements.forEach(achievement => {
        expect(screen.getByText(achievement.title)).toBeInTheDocument()
      })
    })

    it('should filter achievements by category', async () => {
      render(<Achievements achievements={INITIAL_ACHIEVEMENTS} />)
      
      const timeFilter = screen.getByRole('button', { name: /time/i })
      fireEvent.click(timeFilter)
      
      await waitFor(() => {
        const timeAchievements = INITIAL_ACHIEVEMENTS.filter(a => a.category === 'time')
        timeAchievements.forEach(achievement => {
          expect(screen.getByText(achievement.title)).toBeInTheDocument()
        })
      })
    })
  })

  describe('InspirationCarousel Component', () => {
    it('should render inspiration content', () => {
      render(<InspirationCarousel />)
      expect(screen.getByText(/inspiration/i)).toBeInTheDocument()
    })

    it('should display motivational quotes', () => {
      render(<InspirationCarousel />)
      expect(screen.getByText(/success/i)).toBeInTheDocument()
    })

    it('should allow navigation through content', async () => {
      render(<InspirationCarousel />)
      
      const nextButton = screen.getByRole('button', { name: /next/i })
      fireEvent.click(nextButton)
      
      await waitFor(() => {
        expect(nextButton).toBeInTheDocument()
      })
    })

    it('should auto-rotate content', async () => {
      vi.useFakeTimers()
      render(<InspirationCarousel />)
      
      // Advance timers to trigger auto-rotation
      vi.advanceTimersByTime(5000)
      
      await waitFor(() => {
        expect(screen.getByText(/inspiration/i)).toBeInTheDocument()
      })
      
      vi.useRealTimers()
    })
  })
})
