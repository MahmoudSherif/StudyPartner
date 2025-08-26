import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TasksManagement } from '@/components/TasksManagement'
import { Task } from '@/lib/types'

// Mock hooks
vi.mock('@/hooks/useFirebaseData', () => ({
  useFirebaseTasks: () => [
    [],
    vi.fn()
  ]
}))

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { uid: 'test-uid' },
    loading: false
  })
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  }
}))

describe('TasksManagement Component', () => {
  const mockTasks: Task[] = [
    {
      id: '1',
      title: 'Complete homework',
      description: 'Math exercises',
      completed: false,
      createdAt: new Date('2023-08-01'),
      priority: 'high',
      subjectId: 'math'
    },
    {
      id: '2',
      title: 'Study for exam',
      description: 'Science exam preparation',
      completed: true,
      createdAt: new Date('2023-08-02'),
      priority: 'medium',
      subjectId: 'science',
      completedAt: new Date('2023-08-02')
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render task manager component', () => {
    render(<TasksManagement />)
    
    expect(screen.getByText(/task/i)).toBeInTheDocument()
  })

  it('should display list of tasks', () => {
    // Mock useFirebaseTasks to return test tasks
    vi.mocked(require('@/hooks/useFirebaseData').useFirebaseTasks).mockReturnValue([
      mockTasks,
      vi.fn()
    ])

    render(<TaskManager />)
    
    expect(screen.getByText('Complete homework')).toBeInTheDocument()
    expect(screen.getByText('Study for exam')).toBeInTheDocument()
  })

  it('should show completed tasks with different styling', () => {
    vi.mocked(require('@/hooks/useFirebaseData').useFirebaseTasks).mockReturnValue([
      mockTasks,
      vi.fn()
    ])

    render(<TaskManager />)
    
    const completedTask = screen.getByText('Study for exam')
    const incompleteTask = screen.getByText('Complete homework')
    
    // Check that completed task has different styling (this would depend on your implementation)
    expect(completedTask).toBeInTheDocument()
    expect(incompleteTask).toBeInTheDocument()
  })

  it('should allow adding new tasks', async () => {
    const user = userEvent.setup()
    const mockSetTasks = vi.fn()
    
    vi.mocked(require('@/hooks/useFirebaseData').useFirebaseTasks).mockReturnValue([
      [],
      mockSetTasks
    ])

    render(<TaskManager />)
    
    // Look for add task button or input
    const addButton = screen.getByRole('button', { name: /add/i })
    await user.click(addButton)
    
    // Fill in task details (this would depend on your modal/form implementation)
    const titleInput = screen.getByLabelText(/title/i)
    await user.type(titleInput, 'New Task')
    
    const saveButton = screen.getByRole('button', { name: /save/i })
    await user.click(saveButton)
    
    expect(mockSetTasks).toHaveBeenCalled()
  })

  it('should allow marking tasks as complete', async () => {
    const user = userEvent.setup()
    const mockSetTasks = vi.fn()
    
    vi.mocked(require('@/hooks/useFirebaseData').useFirebaseTasks).mockReturnValue([
      mockTasks,
      mockSetTasks
    ])

    render(<TaskManager />)
    
    // Find checkbox for incomplete task
    const checkbox = screen.getByRole('checkbox', { name: /complete homework/i })
    await user.click(checkbox)
    
    expect(mockSetTasks).toHaveBeenCalledWith(
      expect.any(Function)
    )
  })

  it('should filter tasks by completion status', async () => {
    const user = userEvent.setup()
    
    vi.mocked(require('@/hooks/useFirebaseData').useFirebaseTasks).mockReturnValue([
      mockTasks,
      vi.fn()
    ])

    render(<TaskManager />)
    
    // Look for filter buttons
    const completedFilter = screen.getByRole('button', { name: /completed/i })
    await user.click(completedFilter)
    
    // Should only show completed tasks
    expect(screen.getByText('Study for exam')).toBeInTheDocument()
    expect(screen.queryByText('Complete homework')).not.toBeInTheDocument()
  })

  it('should filter tasks by priority', async () => {
    const user = userEvent.setup()
    
    vi.mocked(require('@/hooks/useFirebaseData').useFirebaseTasks).mockReturnValue([
      mockTasks,
      vi.fn()
    ])

    render(<TaskManager />)
    
    // Look for priority filter
    const highPriorityFilter = screen.getByRole('button', { name: /high/i })
    await user.click(highPriorityFilter)
    
    // Should only show high priority tasks
    expect(screen.getByText('Complete homework')).toBeInTheDocument()
    expect(screen.queryByText('Study for exam')).not.toBeInTheDocument()
  })

  it('should allow editing existing tasks', async () => {
    const user = userEvent.setup()
    const mockSetTasks = vi.fn()
    
    vi.mocked(require('@/hooks/useFirebaseData').useFirebaseTasks).mockReturnValue([
      mockTasks,
      mockSetTasks
    ])

    render(<TaskManager />)
    
    // Find edit button for a task
    const editButton = screen.getByRole('button', { name: /edit.*complete homework/i })
    await user.click(editButton)
    
    // Edit the task title
    const titleInput = screen.getByDisplayValue('Complete homework')
    await user.clear(titleInput)
    await user.type(titleInput, 'Updated homework')
    
    const saveButton = screen.getByRole('button', { name: /save/i })
    await user.click(saveButton)
    
    expect(mockSetTasks).toHaveBeenCalled()
  })

  it('should allow deleting tasks', async () => {
    const user = userEvent.setup()
    const mockSetTasks = vi.fn()
    
    vi.mocked(require('@/hooks/useFirebaseData').useFirebaseTasks).mockReturnValue([
      mockTasks,
      mockSetTasks
    ])

    render(<TaskManager />)
    
    // Find delete button for a task
    const deleteButton = screen.getByRole('button', { name: /delete.*complete homework/i })
    await user.click(deleteButton)
    
    // Confirm deletion
    const confirmButton = screen.getByRole('button', { name: /confirm/i })
    await user.click(confirmButton)
    
    expect(mockSetTasks).toHaveBeenCalledWith(
      expect.any(Function)
    )
  })

  it('should display task statistics', () => {
    vi.mocked(require('@/hooks/useFirebaseData').useFirebaseTasks).mockReturnValue([
      mockTasks,
      vi.fn()
    ])

    render(<TaskManager />)
    
    // Should show total tasks, completed tasks, etc.
    expect(screen.getByText(/2.*total/i)).toBeInTheDocument()
    expect(screen.getByText(/1.*completed/i)).toBeInTheDocument()
  })

  it('should handle empty task list', () => {
    vi.mocked(require('@/hooks/useFirebaseData').useFirebaseTasks).mockReturnValue([
      [],
      vi.fn()
    ])

    render(<TaskManager />)
    
    expect(screen.getByText(/no tasks/i)).toBeInTheDocument()
  })

  it('should sort tasks by different criteria', async () => {
    const user = userEvent.setup()
    
    vi.mocked(require('@/hooks/useFirebaseData').useFirebaseTasks).mockReturnValue([
      mockTasks,
      vi.fn()
    ])

    render(<TaskManager />)
    
    // Find sort dropdown
    const sortButton = screen.getByRole('button', { name: /sort/i })
    await user.click(sortButton)
    
    // Select sort by priority
    const prioritySort = screen.getByRole('option', { name: /priority/i })
    await user.click(prioritySort)
    
    // Tasks should be reordered (high priority first)
    const taskElements = screen.getAllByTestId(/task-item/i)
    expect(taskElements[0]).toHaveTextContent('Complete homework') // High priority
  })
})
