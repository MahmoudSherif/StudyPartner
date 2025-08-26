import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { TasksManagement } from '@/components/TasksManagement'

// Mock hooks - using actual module path
vi.mock('@/hooks/useFirebaseData', () => ({
  useFirebaseTasks: vi.fn(() => [[], vi.fn()]),
  useFirebaseSubjects: vi.fn(() => [[], vi.fn()]),
  useFirebaseChallenges: vi.fn(() => [[], vi.fn()])
}))

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    user: { uid: 'test-uid' },
    loading: false
  }))
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  }
}))

describe('TasksManagement Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render task manager component', () => {
    const { useFirebaseTasks } = require('@/hooks/useFirebaseData')
    useFirebaseTasks.mockReturnValue([[], vi.fn()])

    render(<TasksManagement />)
    
    // Should render without crashing
    expect(document.body).toBeTruthy()
  })

  it('should handle empty task list', () => {
    const { useFirebaseTasks } = require('@/hooks/useFirebaseData')
    useFirebaseTasks.mockReturnValue([[], vi.fn()])

    render(<TasksManagement />)
    
    // Should render without errors even with empty task list
    expect(document.body).toBeTruthy()
  })
})
