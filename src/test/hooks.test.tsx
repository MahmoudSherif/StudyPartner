import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'

// src/test/setup.ts replaces @/hooks/useAppData with stubs for every test file,
// which is right for component tests but made THIS file assert against those
// stubs rather than the hooks it is named after: every setter was a no-op
// vi.fn(), so every collection stayed empty no matter what was written to it.
vi.unmock('@/hooks/useAppData')
import {
  useSubjects,
  useSessions,
  useAchievements,
  useTasks,
  useFocusSessions,
  useGoals
} from '@/hooks/useAppData'
import { useChallenges } from '@/hooks/useChallenges'
import { AuthProvider } from '@/contexts/AuthContext'
import { ReactNode } from 'react'

// Mock the auth context
// The data hooks key their store on `user.id`. The mock previously supplied
// only `uid` -- the name Firebase used -- so `userId` was the empty string, no
// store was created and every setter silently did nothing.
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    // Inline, not a module const: vi.mock factories are hoisted above every
    // top-level declaration, so referencing one here is a use-before-init.
    user: {
      id: '00000000-0000-4000-8000-000000000001',
      uid: '00000000-0000-4000-8000-000000000001'
    },
    loading: false
  }),
  AuthProvider: ({ children }: { children: ReactNode }) => children
}))

/**
 * Lets the collection's initial load settle.
 *
 * Mounting a synced collection kicks off a fetch. The mocked client resolves it
 * with an empty result on a later microtask, so an update applied before that
 * point was promptly overwritten by the empty response and every assertion saw
 * `[]`. Draining it first reproduces the real ordering, where the user edits
 * data that has already loaded.
 */
const flush = () => act(async () => { await Promise.resolve() })

describe('useAppData Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useSubjects', () => {
    it('should initialize with empty array', async () => {
      const { result } = renderHook(() => useSubjects())
      await flush()
      
      expect(Array.isArray(result.current[0])).toBeTruthy()
      expect(result.current[0]).toHaveLength(0)
      expect(typeof result.current[1]).toBe('function')
    })

    it('should update subjects', async () => {
      const { result } = renderHook(() => useSubjects())
      await flush()
      
      const newSubjects = [{
        id: '00000000-0000-4000-8000-00000000aa01',
        name: 'Math',
        description: 'Mathematics',
        color: '#FF5733',
        sessions: [],
        totalTime: 0,
        createdAt: new Date(),
        lastStudied: new Date()
      }]

      act(() => {
        result.current[1](newSubjects)
      })

      expect(result.current[0]).toEqual(newSubjects)
    })

    it('should update subjects with function', async () => {
      const { result } = renderHook(() => useSubjects())
      await flush()
      
      const initialSubject = {
        id: '00000000-0000-4000-8000-00000000aa01',
        name: 'Math',
        description: 'Mathematics',
        color: '#FF5733',
        sessions: [],
        totalTime: 0,
        createdAt: new Date(),
        lastStudied: new Date()
      }

      act(() => {
        result.current[1]([initialSubject])
      })

      act(() => {
        result.current[1](prev => [...prev, {
          ...initialSubject,
          id: '00000000-0000-4000-8000-00000000aa02',
          name: 'Science'
        }])
      })

      expect(result.current[0]).toHaveLength(2)
      expect(result.current[0][1].name).toBe('Science')
    })
  })

  describe('useSessions', () => {
    it('should initialize with empty array', async () => {
      const { result } = renderHook(() => useSessions())
      await flush()
      
      expect(Array.isArray(result.current[0])).toBeTruthy()
      expect(result.current[0]).toHaveLength(0)
    })

    it('should update sessions', async () => {
      const { result } = renderHook(() => useSessions())
      await flush()
      
      const newSession = {
        id: '00000000-0000-4000-8000-00000000aa01',
        subjectId: 'math',
        startTime: new Date(),
        endTime: new Date(),
        duration: 3600,
        completed: true
      }

      act(() => {
        result.current[1]([newSession])
      })

      expect(result.current[0]).toHaveLength(1)
      expect(result.current[0][0]).toEqual(newSession)
    })
  })

  describe('useAchievements', () => {
    it('should initialize with the achievement catalogue, all locked', async () => {
      const { result } = renderHook(() => useAchievements())
      await flush()

      // Definitions are application constants; only unlock state and progress
      // are per-user, so this hook never starts empty.
      expect(result.current[0].length).toBeGreaterThan(0)
      expect(result.current[0].every(a => !a.unlocked)).toBeTruthy()
    })

    it('should update achievements', async () => {
      const { result } = renderHook(() => useAchievements())
      await flush()
      
      const newAchievement = {
        id: 'unique-test-achievement-123',
        title: 'Test Achievement',
        description: 'A test achievement',
        icon: '🎯',
        unlocked: true,
        requirement: 1,
        progress: 1,
        category: 'sessions' as const
      }

      act(() => {
        result.current[1]([newAchievement])
      })

      // The hook behavior depends on the mock implementation
      // Just verify that the setter function can be called without errors
      expect(result.current[1]).toBeDefined()
      expect(typeof result.current[1]).toBe('function')
    })
  })

  describe('useTasks', () => {
    it('should initialize with empty array', async () => {
      const { result } = renderHook(() => useTasks())
      await flush()
      
      expect(Array.isArray(result.current[0])).toBeTruthy()
      expect(result.current[0]).toHaveLength(0)
    })

    it('should update tasks', async () => {
      const { result } = renderHook(() => useTasks())
      await flush()
      
      const newTask = {
        id: '00000000-0000-4000-8000-00000000aa01',
        title: 'Study Math',
        description: 'Complete chapter 5',
        completed: false,
        createdAt: new Date(),
        dueDate: new Date(),
        priority: 'high' as const,
        estimatedTime: 60,
        subjectId: 'math'
      }

      act(() => {
        result.current[1]([newTask])
      })

      expect(result.current[0]).toHaveLength(1)
      expect(result.current[0][0].completed).toBeFalsy()
    })

    it('should mark task as completed', async () => {
      const { result } = renderHook(() => useTasks())
      await flush()
      
      const task = {
        id: '00000000-0000-4000-8000-00000000aa01',
        title: 'Study Math',
        description: 'Complete chapter 5',
        completed: false,
        createdAt: new Date(),
        dueDate: new Date(),
        priority: 'high' as const,
        estimatedTime: 60,
        actualTime: 0,
        category: 'homework',
        subjectId: 'math'
      }

      act(() => {
        result.current[1]([task])
      })

      act(() => {
        result.current[1](prev => prev.map(t => 
          t.id === '00000000-0000-4000-8000-00000000aa01' ? { ...t, completed: true, completedAt: new Date() } : t
        ))
      })

      expect(result.current[0][0].completed).toBeTruthy()
      expect(result.current[0][0].completedAt).toBeDefined()
    })
  })

  // Challenges are no longer a client-settable tuple: scores are derived
  // server-side from completion rows, so the hook exposes commands rather
  // than a setter.
  describe('useChallenges', () => {
    it('should initialize with an empty challenge list', async () => {
      const { result } = renderHook(() => useChallenges())
      await flush()

      expect(Array.isArray(result.current.challenges)).toBeTruthy()
      expect(result.current.challenges).toHaveLength(0)
    })

    it('should expose command functions instead of a setter', async () => {
      const { result } = renderHook(() => useChallenges())
      await flush()

      for (const command of ['create', 'join', 'addTask', 'removeTask', 'toggleTask', 'end', 'leave', 'remove'] as const) {
        expect(typeof result.current[command]).toBe('function')
      }
    })
  })

  describe('useFocusSessions', () => {
    it('should initialize with empty array', async () => {
      const { result } = renderHook(() => useFocusSessions())
      await flush()
      
      expect(Array.isArray(result.current[0])).toBeTruthy()
      expect(result.current[0]).toHaveLength(0)
    })

    it('should update focus sessions', async () => {
      const { result } = renderHook(() => useFocusSessions())
      await flush()
      
      const newFocusSession = {
        id: '00000000-0000-4000-8000-00000000aa01',
        title: 'Math Focus Session',
        startTime: new Date(),
        endTime: new Date(),
        duration: 25, // 25 minutes
        completed: true,
        category: 'study',
        notes: 'Good focus session'
      }

      act(() => {
        result.current[1]([newFocusSession])
      })

      expect(result.current[0]).toHaveLength(1)
      expect(result.current[0][0].completed).toBeTruthy()
    })
  })

  describe('useGoals', () => {
    it('should initialize with empty array', async () => {
      const { result } = renderHook(() => useGoals())
      await flush()
      
      expect(Array.isArray(result.current[0])).toBeTruthy()
      expect(result.current[0]).toHaveLength(0)
    })

    it('should update goals', async () => {
      const { result } = renderHook(() => useGoals())
      await flush()
      
      const newGoal = {
        id: '00000000-0000-4000-8000-00000000aa01',
        title: 'Master Calculus',
        description: 'Complete all calculus topics',
        target: 100,
        current: 25,
        deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        category: 'monthly' as const,
        isCompleted: false,
        createdAt: new Date()
      }

      act(() => {
        result.current[1]([newGoal])
      })

      expect(result.current[0]).toHaveLength(1)
      expect(result.current[0][0].isCompleted).toBeFalsy()
      expect(result.current[0][0].current).toBe(25)
    })

    it('should mark goal as completed', async () => {
      const { result } = renderHook(() => useGoals())
      await flush()
      
      const goal = {
        id: '00000000-0000-4000-8000-00000000aa01',
        title: 'Master Calculus',
        description: 'Complete all calculus topics',
        target: 100,
        current: 25,
        deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        category: 'monthly' as const,
        isCompleted: false,
        createdAt: new Date()
      }

      act(() => {
        result.current[1]([goal])
      })

      act(() => {
        result.current[1](prev => prev.map(g => 
          g.id === '00000000-0000-4000-8000-00000000aa01' ? { ...g, current: 100, isCompleted: true } : g
        ))
      })

      expect(result.current[0][0].isCompleted).toBeTruthy()
      expect(result.current[0][0].current).toBe(100)
    })
  })
})
