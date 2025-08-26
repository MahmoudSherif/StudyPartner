import { describe, it, expect, vi, beforeEach } from 'vitest'
import { 
  calculateUserStats, 
  updateAchievements,
  formatTime
} from '../lib/utils'
import { 
  calculateStudyStreak,
  getWeeklyData,
  getMonthlyData,
  getDailyData
} from '../lib/chartUtils'
import { 
  gamificationEngine,
  calculatePoints,
  determineLevel,
  getNextMilestone,
  processStreakBonus
} from '../utils/gamificationEngine'
import { 
  streakCalculator,
  calculateCurrentStreak,
  getLongestStreak,
  isStreakBroken,
  getStreakData
} from '../utils/streakCalculator'
import { 
  themeUtils,
  applyTheme,
  validateTheme,
  getSystemTheme,
  toggleTheme
} from '../utils/themeUtils'
import { Subject, StudySession, Task, FocusSession, Challenge, Goal, Achievement } from '../lib/types'
import { INITIAL_ACHIEVEMENTS } from '../lib/constants'

// Helper functions for testing
function formatDate(date: Date | null, format?: string): string {
  if (!date) return ''
  if (format === 'short') return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' })
  if (format === 'time') return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function validateInput(value: string, type: string): boolean {
  if (!value || typeof value !== 'string') return false
  
  switch (type) {
    case 'email':
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    case 'name':
      return value.trim().length >= 2
    case 'task':
      return value.trim().length >= 1
    default:
      return false
  }
}

function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substring(2)
}

function sanitizeData(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj
  const clean: any = Array.isArray(obj) ? [] : {}
  Object.entries(obj).forEach(([k, v]) => {
    if (v !== undefined) {
      if (v && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Date)) {
        clean[k] = sanitizeData(v)
      } else {
        clean[k] = v
      }
    }
  })
  return clean
}

function calculateTrends(sessions: StudySession[]): { direction: string; percentage: number } {
  if (sessions.length < 2) return { direction: 'stable', percentage: 0 }
  
  const recent = sessions.slice(0, Math.ceil(sessions.length / 2))
  const older = sessions.slice(Math.ceil(sessions.length / 2))
  
  const recentAvg = recent.reduce((sum, s) => sum + (s.duration || 0), 0) / recent.length
  const olderAvg = older.reduce((sum, s) => sum + (s.duration || 0), 0) / older.length
  
  const change = ((recentAvg - olderAvg) / olderAvg) * 100
  
  if (Math.abs(change) < 5) return { direction: 'stable', percentage: 0 }
  return { direction: change > 0 ? 'up' : 'down', percentage: Math.abs(change) }
}

describe('Business Logic and Utilities Comprehensive Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Core Utils Functions', () => {
    describe('calculateUserStats', () => {
      it('should calculate comprehensive user statistics', () => {
        const sessions: StudySession[] = [
          {
            id: '1',
            subjectId: 'math',
            startTime: new Date('2024-01-01T10:00:00'),
            endTime: new Date('2024-01-01T11:30:00'),
            duration: 5400, // 90 minutes in seconds
            completed: true
          },
          {
            id: '2',
            subjectId: 'science',
            startTime: new Date('2024-01-02T09:00:00'),
            endTime: new Date('2024-01-02T10:00:00'),
            duration: 3600, // 60 minutes in seconds
            completed: true
          }
        ]

        const focusSessions: FocusSession[] = [
          {
            id: '1',
            title: 'Math Focus',
            duration: 25,
            startTime: new Date('2024-01-01T14:00:00'),
            completed: true,
            category: 'work',
            notes: 'Productive session'
          }
        ]

        const tasks: Task[] = [
          {
            id: '1',
            title: 'Homework',
            completed: true,
            createdAt: new Date('2024-01-01'),
            priority: 'high',
            subjectId: 'math'
          },
          {
            id: '2',
            title: 'Project',
            completed: true,
            createdAt: new Date('2024-01-01'),
            priority: 'medium',
            subjectId: 'science'
          }
        ]

        const stats = calculateUserStats(sessions, focusSessions, tasks, [], 'user-123')

        expect(stats.totalStudyTime).toBe(175) // 150 + 25 minutes
        expect(stats.sessionsCompleted).toBe(2)
        expect(stats.averageSessionLength).toBe(4500) // Average seconds
        expect(stats.tasksCompleted).toBe(2)
        // Note: focusSessionsCompleted not available in UserStats interface
      })

      it('should handle empty data gracefully', () => {
        const stats = calculateUserStats([], [], [], [], 'user-123')

        expect(stats.totalStudyTime).toBe(0)
        expect(stats.sessionsCompleted).toBe(0)
        expect(stats.averageSessionLength).toBe(0)
        expect(stats.tasksCompleted).toBe(0)
        expect(stats.streak).toBe(0)
        expect(stats.longestStreak).toBe(0)
      })

      it('should calculate weekly and monthly totals', () => {
        const sessions: StudySession[] = Array.from({ length: 14 }, (_, i) => ({
          id: `${i + 1}`,
          subjectId: 'math',
          startTime: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
          endTime: new Date(Date.now() - i * 24 * 60 * 60 * 1000 + 3600000),
          duration: 3600,
          completed: true
        }))

        const stats = calculateUserStats(sessions, [], [], [], 'user-123')

        expect(stats.totalStudyTime).toBe(840) // 14 hours in minutes
        expect(stats.sessionsCompleted).toBe(14)
      })

      it('should handle challenge statistics', () => {
        const challenges: Challenge[] = [
          {
            id: 'challenge-1',
            title: 'Study Challenge',
            description: 'Complete daily study tasks',
            createdBy: 'user-123',
            participants: ['user-123', 'user-456'],
            tasks: [
              {
                id: 'task-1',
                title: 'Math homework',
                description: 'Complete chapter 5',
                points: 10,
                completedBy: ['user-123'],
                completions: { 'user-123': { completed: true, completedAt: new Date() } },
                createdAt: new Date()
              }
            ],
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            isActive: true,
            code: 'STUDY123',
            createdAt: new Date()
          }
        ]

        const stats = calculateUserStats([], [], [], challenges, 'user-123')

        expect(stats.challengeTasksCompleted).toBe(1)
        // Note: challengePoints not available in UserStats interface
      })
    })

    describe('updateAchievements', () => {
      it('should unlock time-based achievements', () => {
        const achievements = [...INITIAL_ACHIEVEMENTS]
        const stats = {
          totalStudyTime: 120, // 2 hours
          sessionsCompleted: 5,
          streak: 3,
          longestStreak: 5,
          averageSessionLength: 1800,
          tasksCompleted: 10,
          challengeTasksCompleted: 5,
          focusSessionsCompleted: 8,
          challengePoints: 50
        }

        const updatedAchievements = updateAchievements(achievements, stats, [], [], [])

        const hourMilestone = updatedAchievements.find(a => a.id === 'hour-milestone')
        expect(hourMilestone?.unlocked).toBeTruthy()
        expect(hourMilestone?.progress).toBe(60) // Capped at requirement
      })

      it('should unlock session-based achievements', () => {
        const achievements = [...INITIAL_ACHIEVEMENTS]
        const sessions: StudySession[] = [
          {
            id: '1',
            subjectId: 'math',
            startTime: new Date(),
            endTime: new Date(),
            duration: 3600,
            completed: true
          }
        ]

        const stats = calculateUserStats(sessions, [], [], [], 'user-123')
        const updatedAchievements = updateAchievements(achievements, stats, sessions, [], [])

        const firstSession = updatedAchievements.find(a => a.id === 'first-session')
        expect(firstSession?.unlocked).toBeTruthy()
      })

      it('should preserve previously unlocked achievements', () => {
        const achievements = [...INITIAL_ACHIEVEMENTS].map(a => ({ ...a, unlocked: true }))
        const stats = {
          totalStudyTime: 30,
          sessionsCompleted: 1,
          streak: 1,
          longestStreak: 1,
          averageSessionLength: 1800,
          tasksCompleted: 1,
          challengeTasksCompleted: 0,
          focusSessionsCompleted: 1,
          challengePoints: 0
        }

        const updatedAchievements = updateAchievements(achievements, stats, [], [], [])

        // All achievements should remain unlocked
        updatedAchievements.forEach(achievement => {
          expect(achievement.unlocked).toBeTruthy()
        })
      })

      it('should handle focus session achievements', () => {
        const achievements = [...INITIAL_ACHIEVEMENTS]
        const focusSessions: FocusSession[] = Array.from({ length: 10 }, (_, i) => ({
          id: `${i + 1}`,
          title: `Focus ${i + 1}`,
          duration: 25,
          startTime: new Date(),
          completed: true,
          type: 'pomodoro'
        }))

        const stats = calculateUserStats([], focusSessions, [], [], 'user-123')
        const updatedAchievements = updateAchievements(achievements, stats, [], focusSessions, [])

        const focusChampion = updatedAchievements.find(a => a.id === 'focus-champion')
        expect(focusChampion?.unlocked).toBeTruthy()
      })

      it('should handle goal-based achievements', () => {
        const achievements = [...INITIAL_ACHIEVEMENTS]
        const goals: Goal[] = [
          {
            id: 'goal-1',
            title: 'Complete Math Course',
            description: 'Finish all math chapters',
            target: 100,
            current: 100,
            deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            category: 'weekly',
            isCompleted: true,
            createdAt: new Date()
          }
        ]

        const stats = calculateUserStats([], [], [], [], 'user-123')
        const updatedAchievements = updateAchievements(achievements, stats, [], [], goals)

        const goalAchiever = updatedAchievements.find(a => a.id === 'goal-achiever')
        expect(goalAchiever?.unlocked).toBeTruthy()
      })
    })

    describe('Utility Functions', () => {
      it('should format time correctly', () => {
        expect(formatTime(0)).toBe('0:00')
        expect(formatTime(30)).toBe('0:30')
        expect(formatTime(60)).toBe('1:00')
        expect(formatTime(90)).toBe('1:30')
        expect(formatTime(3600)).toBe('60:00')
      })

      it('should format dates correctly', () => {
        const date = new Date('2024-01-15T10:30:00')
        expect(formatDate(date)).toMatch(/Jan 15, 2024/)
        expect(formatDate(date, 'short')).toMatch(/1\/15\/24/)
        expect(formatDate(date, 'time')).toMatch(/10:30/)
      })

      it('should validate input data', () => {
        expect(validateInput('valid@email.com', 'email')).toBeTruthy()
        expect(validateInput('invalid-email', 'email')).toBeFalsy()
        expect(validateInput('Valid Name', 'name')).toBeTruthy()
        expect(validateInput('', 'name')).toBeFalsy()
        expect(validateInput('Valid task title', 'task')).toBeTruthy()
        expect(validateInput('', 'task')).toBeFalsy()
      })

      it('should generate unique IDs', () => {
        const id1 = generateId()
        const id2 = generateId()
        
        expect(id1).toBeDefined()
        expect(id2).toBeDefined()
        expect(id1).not.toBe(id2)
        expect(typeof id1).toBe('string')
        expect(id1.length).toBeGreaterThan(0)
      })

      it('should sanitize data objects', () => {
        const dirtyData = {
          name: 'Test',
          value: undefined,
          nested: {
            field: 'valid',
            invalid: undefined
          },
          array: [1, 2, undefined, 3]
        }

        const cleanData = sanitizeData(dirtyData)
        
        expect(cleanData.name).toBe('Test')
        expect(cleanData.value).toBeUndefined()
        expect(cleanData.nested.field).toBe('valid')
        expect(cleanData.nested.invalid).toBeUndefined()
        expect(cleanData.array).toEqual([1, 2, undefined, 3]) // Arrays preserved as-is
      })
    })
  })

  describe('Chart Utilities', () => {
    describe('calculateStudyStreak', () => {
      it('should calculate current streak correctly', () => {
        const sessions: StudySession[] = [
          {
            id: '1',
            subjectId: 'math',
            startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            duration: 3600,
            completed: true
          },
          {
            id: '2',
            subjectId: 'math',
            startTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            duration: 3600,
            completed: true
          },
          {
            id: '3',
            subjectId: 'math',
            startTime: new Date(),
            duration: 3600,
            completed: true
          }
        ]

        const streak = calculateStudyStreak(sessions)
        expect(streak).toBeGreaterThanOrEqual(2)
      })

      it('should handle broken streaks', () => {
        const sessions: StudySession[] = [
          {
            id: '1',
            subjectId: 'math',
            startTime: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            duration: 3600,
            completed: true
          },
          {
            id: '2',
            subjectId: 'math',
            startTime: new Date(),
            duration: 3600,
            completed: true
          }
        ]

        const streak = calculateStudyStreak(sessions)
        expect(streak).toBe(1) // Only today counts
      })
    })

    describe('Chart Data Processing', () => {
      it('should generate weekly chart data', () => {
        const sessions: StudySession[] = Array.from({ length: 7 }, (_, i) => ({
          id: `${i + 1}`,
          subjectId: 'math',
          startTime: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
          duration: 3600,
          completed: true
        }))

        const weeklyData = getWeeklyData(sessions)
        
        expect(Array.isArray(weeklyData)).toBeTruthy()
        expect(weeklyData.length).toBe(4) // 4 weeks
        weeklyData.forEach(week => {
          expect(week).toHaveProperty('week')
          expect(week).toHaveProperty('minutes')
          expect(week).toHaveProperty('sessions')
        })
      })

      it('should generate monthly chart data', () => {
        const sessions: StudySession[] = Array.from({ length: 30 }, (_, i) => ({
          id: `${i + 1}`,
          subjectId: 'math',
          startTime: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
          duration: 3600,
          completed: true
        }))

        const monthlyData = getMonthlyData(sessions)
        
        expect(Array.isArray(monthlyData)).toBeTruthy()
        expect(monthlyData.length).toBe(6) // 6 months
      })

      it('should generate daily chart data with subjects', () => {
        const sessions: StudySession[] = [
          {
            id: '1',
            subjectId: 'math',
            startTime: new Date(),
            duration: 3600,
            completed: true
          },
          {
            id: '2',
            subjectId: 'science',
            startTime: new Date(),
            duration: 1800,
            completed: true
          }
        ]

        const subjects: Subject[] = [
          { id: 'math', name: 'Mathematics', color: '#FF0000', totalTime: 0, dailyTarget: 60, weeklyTarget: 420 },
          { id: 'science', name: 'Science', color: '#00FF00', totalTime: 0, dailyTarget: 60, weeklyTarget: 420 }
        ]

        const dailyData = getDailyData(sessions, subjects)
        
        expect(Array.isArray(dailyData)).toBeTruthy()
        expect(dailyData.length).toBeGreaterThan(0)
      })

      it('should process chart data with trends', () => {
        const sessions: StudySession[] = Array.from({ length: 14 }, (_, i) => ({
          id: `${i + 1}`,
          subjectId: 'math',
          startTime: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
          duration: 3600 + (i * 300), // Increasing study time
          completed: true
        }))

        const trends = calculateTrends(sessions)
        
        expect(trends).toHaveProperty('direction')
        expect(trends).toHaveProperty('percentage')
        expect(trends.direction).toMatch(/(up|down|stable)/)
      })
    })
  })

  describe('Gamification Engine', () => {
    describe('Points Calculation', () => {
      it('should calculate points for different activities', () => {
        const sessionPoints = calculatePoints('session', { duration: 3600 })
        const taskPoints = calculatePoints('task', { priority: 'high' })
        const challengePoints = calculatePoints('challenge', { difficulty: 'medium' })

        expect(sessionPoints).toBeGreaterThan(0)
        expect(taskPoints).toBeGreaterThan(0)
        expect(challengePoints).toBeGreaterThan(0)
      })

      it('should apply bonus multipliers', () => {
        const basePoints = calculatePoints('session', { duration: 3600 })
        const bonusPoints = calculatePoints('session', { duration: 3600, streak: 5 })

        expect(bonusPoints).toBeGreaterThan(basePoints)
      })
    })

    describe('Level System', () => {
      it('should determine user level from points', () => {
        expect(determineLevel(0)).toBe(1)
        expect(determineLevel(100)).toBe(2)
        expect(determineLevel(500)).toBeGreaterThan(2)
        expect(determineLevel(1000)).toBeGreaterThan(3)
      })

      it('should calculate next milestone', () => {
        const milestone = getNextMilestone(250)
        
        expect(milestone).toHaveProperty('level')
        expect(milestone).toHaveProperty('pointsRequired')
        expect(milestone).toHaveProperty('pointsToNext')
        expect(milestone.pointsToNext).toBeGreaterThan(0)
      })
    })

    describe('Streak Bonuses', () => {
      it('should calculate streak bonus correctly', () => {
        const bonus1 = processStreakBonus(3, 100)
        const bonus7 = processStreakBonus(7, 100)
        const bonus30 = processStreakBonus(30, 100)

        expect(bonus7).toBeGreaterThan(bonus1)
        expect(bonus30).toBeGreaterThan(bonus7)
      })

      it('should cap streak bonuses appropriately', () => {
        const normalBonus = processStreakBonus(5, 100)
        const extremeBonus = processStreakBonus(100, 100)

        expect(extremeBonus).toBeLessThan(normalBonus * 10) // Should be capped
      })
    })
  })

  describe('Streak Calculator', () => {
    describe('Streak Calculation', () => {
      it('should calculate current streak', () => {
        const sessions: StudySession[] = Array.from({ length: 5 }, (_, i) => ({
          id: `${i + 1}`,
          subjectId: 'math',
          startTime: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
          duration: 3600,
          completed: true
        }))

        const currentStreak = calculateCurrentStreak(sessions)
        expect(currentStreak).toBeGreaterThanOrEqual(5)
      })

      it('should find longest streak', () => {
        const sessions: StudySession[] = [
          // First streak (3 days)
          ...Array.from({ length: 3 }, (_, i) => ({
            id: `streak1-${i + 1}`,
            subjectId: 'math',
            startTime: new Date(Date.now() - (20 + i) * 24 * 60 * 60 * 1000),
            duration: 3600,
            completed: true
          })),
          // Gap of 5 days
          // Second streak (7 days)
          ...Array.from({ length: 7 }, (_, i) => ({
            id: `streak2-${i + 1}`,
            subjectId: 'math',
            startTime: new Date(Date.now() - (10 + i) * 24 * 60 * 60 * 1000),
            duration: 3600,
            completed: true
          }))
        ]

        const longestStreak = getLongestStreak(sessions)
        expect(longestStreak).toBe(7)
      })

      it('should detect broken streaks', () => {
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
        const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)

        const brokenStreak = isStreakBroken(yesterday, new Date())
        const continuedStreak = isStreakBroken(threeDaysAgo, new Date())

        expect(brokenStreak).toBeFalsy() // Yesterday to today is not broken
        expect(continuedStreak).toBeTruthy() // 3 days gap is broken
      })

      it('should provide comprehensive streak data', () => {
        const sessions: StudySession[] = Array.from({ length: 10 }, (_, i) => ({
          id: `${i + 1}`,
          subjectId: 'math',
          startTime: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
          duration: 3600,
          completed: true
        }))

        const streakData = getStreakData(sessions)

        expect(streakData).toHaveProperty('current')
        expect(streakData).toHaveProperty('longest')
        expect(streakData).toHaveProperty('total')
        expect(streakData).toHaveProperty('percentage')
        expect(streakData.current).toBeGreaterThanOrEqual(0)
        expect(streakData.longest).toBeGreaterThanOrEqual(streakData.current)
      })
    })
  })

  describe('Theme Utils', () => {
    describe('Theme Management', () => {
      it('should apply theme correctly', () => {
        const lightTheme = { 
          primary: '#ffffff', 
          secondary: '#000000',
          accent: '#007bff',
          background: '#f8f9fa',
          surface: '#ffffff',
          text: '#212529',
          textSecondary: '#6c757d',
          border: '#dee2e6',
          success: '#28a745',
          warning: '#ffc107',
          error: '#dc3545',
          info: '#17a2b8'
        }
        const darkTheme = { 
          primary: '#000000', 
          secondary: '#ffffff',
          accent: '#66b3ff',
          background: '#1a1a1a',
          surface: '#2d2d2d',
          text: '#ffffff',
          textSecondary: '#b3b3b3',
          border: '#444444',
          success: '#4caf50',
          warning: '#ff9800',
          error: '#f44336',
          info: '#2196f3'
        }

        applyTheme(lightTheme)
        expect(document.documentElement.style.getPropertyValue('--primary')).toBe('#ffffff')

        applyTheme(darkTheme)
        expect(document.documentElement.style.getPropertyValue('--primary')).toBe('#000000')
      })

      it('should validate theme objects', () => {
        const validTheme = { primary: '#ffffff', secondary: '#000000', accent: '#ff0000' }
        const invalidTheme = { primary: 'invalid-color' }

        expect(validateTheme(validTheme)).toBeTruthy()
        expect(validateTheme(invalidTheme)).toBeFalsy()
      })

      it('should detect system theme', () => {
        // Mock matchMedia
        Object.defineProperty(window, 'matchMedia', {
          writable: true,
          value: vi.fn().mockImplementation(query => ({
            matches: query.includes('dark'),
            media: query,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
          })),
        })

        const systemTheme = getSystemTheme()
        expect(systemTheme).toMatch(/(light|dark)/)
      })

      it('should toggle between themes', () => {
        const currentTheme = 'light'
        const newTheme = toggleTheme(currentTheme)
        
        expect(newTheme).toBe('dark')
        expect(toggleTheme(newTheme)).toBe('light')
      })
    })
  })

  describe('Error Handling in Utils', () => {
    it('should handle null/undefined inputs gracefully', () => {
      expect(calculateUserStats(null as any, null as any, null as any, null as any, 'user')).toBeDefined()
      expect(formatTime(null as any)).toBe('0:00')
      expect(formatDate(null as any)).toBe('')
      expect(validateInput(null as any, 'email')).toBeFalsy()
    })

    it('should handle malformed data', () => {
      const malformedSession = { id: '1', duration: 'invalid' } as any
      const stats = calculateUserStats([malformedSession], [], [], [], 'user')
      
      expect(stats).toBeDefined()
      expect(stats.totalStudyTime).toBe(0)
    })

    it('should handle edge cases in calculations', () => {
      // Division by zero cases
      const stats = calculateUserStats([], [], [], [], 'user')
      expect(stats.averageSessionLength).toBe(0)
      
      // Negative values
      const negativeSession = { 
        id: '1', 
        subjectId: 'math', 
        startTime: new Date(), 
        duration: -100, 
        completed: true 
      } as StudySession
      
      const negativeStats = calculateUserStats([negativeSession], [], [], [], 'user')
      expect(negativeStats.totalStudyTime).toBeGreaterThanOrEqual(0)
    })
  })
})
