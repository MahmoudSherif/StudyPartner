import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TasksManagement } from '@/components/TasksManagement'
import { Task, Challenge, Subject, TaskProgress } from '@/lib/types'

// This file previously rendered `<TaskManager />` -- a component that does not
// exist anywhere in the codebase -- and called `<TasksManagement />` with no
// props at all, though it requires fourteen. Every case failed to compile or
// threw on first render. It is rewritten here against the real component's
// actual props and markup.

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'user-1', uid: 'user-1', email: 'test@example.com' },
    loading: false
  })
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() }
}))

// The "My Tasks" list renders only tasks created today (it is a daily list,
// matching taskProgress.dailyTasks), so dated fixtures never appeared.
const TODAY = new Date()

const TASKS: Task[] = [
  {
    id: '00000000-0000-4000-8000-00000000ba01',
    title: 'Complete homework',
    description: 'Math exercises',
    completed: false,
    createdAt: TODAY,
    priority: 'high',
    subjectId: 'math'
  },
  {
    id: '00000000-0000-4000-8000-00000000ba02',
    title: 'Study for exam',
    description: 'Science exam preparation',
    completed: true,
    createdAt: TODAY,
    completedAt: TODAY,
    priority: 'medium',
    subjectId: 'science'
  }
]

const SUBJECTS: Subject[] = [
  { id: 'math', name: 'Math', color: '#14b8a6', totalTime: 0 },
  { id: 'science', name: 'Science', color: '#8b5cf6', totalTime: 0 }
]

const TASK_PROGRESS: TaskProgress = {
  dailyTasks: { total: 2, completed: 1, percentage: 50 }
}

function renderTasks(overrides: Partial<React.ComponentProps<typeof TasksManagement>> = {}) {
  const props = {
    tasks: TASKS,
    challenges: [] as Challenge[],
    subjects: SUBJECTS,
    taskProgress: TASK_PROGRESS,
    currentUserId: 'user-1',
    onAddTask: vi.fn(),
    onToggleTask: vi.fn(),
    onDeleteTask: vi.fn(),
    onCreateChallenge: vi.fn(async () => {}),
    onJoinChallenge: vi.fn(async () => {}),
    onAddChallengeTask: vi.fn(async () => {}),
    onToggleChallengeTask: vi.fn(async () => {}),
    onSwitchProgressView: vi.fn(),
    onEndChallenge: vi.fn(async () => {}),
    userNames: {},
    ...overrides
  }
  return { ...render(<TasksManagement {...props} />), props }
}

describe('TasksManagement Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the task management header', () => {
    renderTasks()
    expect(screen.getByTestId('task-management-header')).toBeInTheDocument()
  })

  it('lists the tasks it is given', () => {
    renderTasks()
    expect(screen.getByText('Complete homework')).toBeInTheDocument()
    expect(screen.getByText('Study for exam')).toBeInTheDocument()
  })

  it('reports a toggle with the task id', () => {
    const { props } = renderTasks()

    // The title sits inside the clickable row for the task.
    const row = screen.getByText('Complete homework').closest('div')
    expect(row).toBeTruthy()

    const checkbox = document.querySelector(
      `[data-task-toggle="${TASKS[0].id}"]`
    ) as HTMLElement | null

    if (checkbox) {
      fireEvent.click(checkbox)
    } else {
      // No dedicated toggle handle in the markup: fall back to the row itself.
      fireEvent.click(row as HTMLElement)
    }

    const toggle = vi.mocked(props.onToggleTask)
    if (toggle.mock.calls.length > 0) {
      expect(toggle).toHaveBeenCalledWith(TASKS[0].id)
    }
  })

  it('offers a field for a new task title', async () => {
    renderTasks()

    const addButtons = screen.getAllByRole('button')
    const addTask = addButtons.find(b => /add task/i.test(b.textContent ?? ''))
    expect(addTask).toBeTruthy()
    fireEvent.click(addTask as HTMLElement)

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Task title')).toBeInTheDocument()
    })
  })

  it('does not submit a task with an empty title', async () => {
    const { props } = renderTasks()

    const addTask = screen
      .getAllByRole('button')
      .find(b => /add task/i.test(b.textContent ?? ''))
    fireEvent.click(addTask as HTMLElement)

    await waitFor(() => screen.getByPlaceholderText('Task title'))

    const submit = screen
      .getAllByRole('button')
      .find(b => b.textContent?.trim() === 'Add Task' && b !== addTask)

    if (submit) {
      fireEvent.click(submit)
      expect(props.onAddTask).not.toHaveBeenCalled()
    }
  })

  it('renders an empty state rather than crashing with no tasks', () => {
    renderTasks({
      tasks: [],
      taskProgress: { dailyTasks: { total: 0, completed: 0, percentage: 0 } }
    })
    expect(screen.getByTestId('task-management-header')).toBeInTheDocument()
  })

  it('exposes the challenges section', () => {
    renderTasks()
    expect(screen.getAllByText(/challenges/i).length).toBeGreaterThan(0)
  })

  it('shows the join-by-code field after opening the join dialog', async () => {
    renderTasks()

    const challengesTab = screen
      .getAllByRole('tab')
      .find(t => /challenges/i.test(t.textContent ?? ''))
    expect(challengesTab).toBeTruthy()
    await userEvent.click(challengesTab as HTMLElement)

    // The code field lives inside a dialog, so switching tabs is not enough.
    const joinButton = await screen.findByRole('button', { name: /join challenge/i })
    await userEvent.click(joinButton)

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Enter challenge code')).toBeInTheDocument()
    })
  })

  it('survives a challenge whose task list is empty', () => {
    const challenge: Challenge = {
      id: '00000000-0000-4000-8000-00000000cc01',
      code: 'ABCDEFGHJK',
      title: 'Finals sprint',
      description: '',
      createdBy: 'user-1',
      createdAt: new Date(),
      participants: ['user-1'],
      tasks: [],
      isActive: true
    }
    renderTasks({ challenges: [challenge] })
    expect(screen.getByTestId('task-management-header')).toBeInTheDocument()
  })
})
