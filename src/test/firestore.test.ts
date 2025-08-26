import { describe, it, expect, vi, beforeEach } from 'vitest'
import { firestoreService } from '@/lib/firestore'
import { Subject, StudySession, Achievement, Task, Challenge, Goal, FocusSession } from '@/lib/types'

// Mock Firebase
vi.mock('@/lib/firebase', () => ({
  db: null,
  isFirebaseAvailable: false,
}))

describe('FirestoreService', () => {
  const mockUserId = 'test-user-id'
  
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('User Data Management', () => {
    it('should save and retrieve user data', async () => {
      const testData = { name: 'Test User', preferences: { theme: 'dark' } }
      
      const saveResult = await firestoreService.saveUserData(mockUserId, 'profile', testData)
      expect(saveResult.error).toBeNull()
      
      const getResult = await firestoreService.getUserData(mockUserId, 'profile')
      expect(getResult.error).toBeNull()
    })

    it('should handle save errors gracefully', async () => {
      const invalidData = undefined as any
      
      const result = await firestoreService.saveUserData(mockUserId, 'profile', invalidData)
      expect(result.error).toBeNull() // Should handle undefined data
    })
  })

  describe('Subjects Management', () => {
    it('should save and retrieve subjects', async () => {
      const subjects: Subject[] = [
        {
          id: '1',
          name: 'Mathematics',
          description: 'Advanced calculus',
          color: '#FF5733',
          sessions: [],
          totalTime: 0,
          createdAt: new Date(),
          lastStudied: new Date()
        }
      ]
      
      const saveResult = await firestoreService.saveSubjects(mockUserId, subjects)
      expect(saveResult.error).toBeNull()
      
      const getResult = await firestoreService.getSubjects(mockUserId)
      expect(getResult.error).toBeNull()
    })

    it('should handle empty subjects array', async () => {
      const subjects: Subject[] = []
      
      const result = await firestoreService.saveSubjects(mockUserId, subjects)
      expect(result.error).toBeNull()
    })
  })

  describe('Study Sessions Management', () => {
    it('should save and retrieve study sessions', async () => {
      const sessions: StudySession[] = [
        {
          id: '1',
          subjectId: 'math',
          duration: 3600,
          date: new Date(),
          notes: 'Productive session',
          type: 'study'
        }
      ]
      
      const saveResult = await firestoreService.saveSessions(mockUserId, sessions)
      expect(saveResult.error).toBeNull()
      
      const getResult = await firestoreService.getSessions(mockUserId)
      expect(getResult.error).toBeNull()
    })
  })

  describe('Achievements Management', () => {
    it('should save and retrieve achievements', async () => {
      const achievements: Achievement[] = [
        {
          id: 'first-session',
          title: 'First Session',
          description: 'Complete your first study session',
          icon: '🎯',
          unlocked: true,
          requirement: 1,
          progress: 1,
          category: 'sessions'
        }
      ]
      
      const saveResult = await firestoreService.saveAchievements(mockUserId, achievements)
      expect(saveResult.error).toBeNull()
      
      const getResult = await firestoreService.getAchievements(mockUserId)
      expect(getResult.error).toBeNull()
    })
  })

  describe('Tasks Management', () => {
    it('should save and retrieve tasks', async () => {
      const tasks: Task[] = [
        {
          id: '1',
          title: 'Complete homework',
          description: 'Math exercises 1-10',
          completed: false,
          createdAt: new Date(),
          dueDate: new Date(),
          priority: 'high',
          estimatedTime: 60,
          actualTime: 0,
          category: 'homework',
          subjectId: 'math'
        }
      ]
      
      const saveResult = await firestoreService.saveTasks(mockUserId, tasks)
      expect(saveResult.error).toBeNull()
      
      const getResult = await firestoreService.getTasks(mockUserId)
      expect(getResult.error).toBeNull()
    })
  })

  describe('Challenges Management', () => {
    it('should save and retrieve challenges', async () => {
      const challenges: Challenge[] = [
        {
          id: '1',
          title: '30-Day Study Challenge',
          description: 'Study for 30 consecutive days',
          createdBy: mockUserId,
          participants: [mockUserId],
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          tasks: [],
          completions: {},
          points: {},
          isActive: true,
          code: 'STUDY30'
        }
      ]
      
      const saveResult = await firestoreService.saveChallenges(mockUserId, challenges)
      expect(saveResult.error).toBeNull()
      
      const getResult = await firestoreService.getChallenges(mockUserId)
      expect(getResult.error).toBeNull()
    })

    it('should get discoverable challenges', async () => {
      const result = await firestoreService.getDiscoverableChallenges()
      expect(result.error).toBeNull()
      expect(Array.isArray(result.data)).toBeTruthy()
    })
  })

  describe('Focus Sessions Management', () => {
    it('should save and retrieve focus sessions', async () => {
      const focusSessions: FocusSession[] = [
        {
          id: '1',
          startTime: new Date(),
          endTime: new Date(),
          duration: 1500, // 25 minutes
          type: 'pomodoro',
          subjectId: 'math',
          notes: 'Good focus session'
        }
      ]
      
      const saveResult = await firestoreService.saveFocusSessions(mockUserId, focusSessions)
      expect(saveResult.error).toBeNull()
      
      const getResult = await firestoreService.getFocusSessions(mockUserId)
      expect(getResult.error).toBeNull()
    })
  })

  describe('Goals Management', () => {
    it('should save and retrieve goals', async () => {
      const goals: Goal[] = [
        {
          id: '1',
          title: 'Master Calculus',
          description: 'Complete all calculus topics',
          targetValue: 100,
          currentValue: 25,
          unit: 'hours',
          deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          category: 'academic',
          priority: 'high',
          isCompleted: false,
          createdAt: new Date()
        }
      ]
      
      const saveResult = await firestoreService.saveGoals(mockUserId, goals)
      expect(saveResult.error).toBeNull()
      
      const getResult = await firestoreService.getGoals(mockUserId)
      expect(getResult.error).toBeNull()
    })
  })

  describe('User Profile Management', () => {
    it('should create user profile', async () => {
      const profileData = {
        email: 'test@example.com',
        displayName: 'Test User',
        preferences: {
          theme: 'dark',
          notifications: true
        }
      }
      
      const result = await firestoreService.createUserProfile(mockUserId, profileData)
      expect(result.error).toBeNull()
    })

    it('should update user profile', async () => {
      const updateData = {
        displayName: 'Updated User',
        preferences: {
          theme: 'light'
        }
      }
      
      const result = await firestoreService.updateUserProfile(mockUserId, updateData)
      expect(result.error).toBeNull()
    })

    it('should get user profile', async () => {
      const result = await firestoreService.getUserProfile(mockUserId)
      expect(result.error).toBeNull()
    })
  })

  describe('Data Sanitization', () => {
    it('should handle undefined values in data', async () => {
      const dataWithUndefined = {
        name: 'Test',
        undefinedField: undefined,
        validField: 'valid'
      }
      
      const result = await firestoreService.saveUserData(mockUserId, 'test', dataWithUndefined)
      expect(result.error).toBeNull()
    })

    it('should handle null values in data', async () => {
      const dataWithNull = {
        name: 'Test',
        nullField: null,
        validField: 'valid'
      }
      
      const result = await firestoreService.saveUserData(mockUserId, 'test', dataWithNull)
      expect(result.error).toBeNull()
    })
  })
})
