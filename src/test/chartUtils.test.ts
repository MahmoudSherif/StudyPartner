import { describe, it, expect, vi } from 'vitest'
import { calculateStudyStreak, getWeeklyData, getMonthlyData, getDailyData } from '@/lib/chartUtils'
import { StudySession } from '@/lib/types'

describe('Chart Utils', () => {
  describe('calculateStudyStreak', () => {
    it('should calculate current streak correctly', () => {
      const sessions: StudySession[] = [
        {
          id: '1',
          subjectId: 'math',
          startTime: new Date('2023-08-01'),
          duration: 3600,
          completed: true
        },
        {
          id: '2',
          subjectId: 'science',
          startTime: new Date('2023-08-02'),
          duration: 1800,
          completed: true
        },
        {
          id: '3',
          subjectId: 'math',
          startTime: new Date('2023-08-03'),
          duration: 2400,
          completed: true
        }
      ]

      const streak = calculateStudyStreak(sessions)
      expect(streak).toBeGreaterThanOrEqual(0)
      expect(typeof streak).toBe('number')
    })

    it('should return 0 for empty sessions', () => {
      const streak = calculateStudyStreak([])
      expect(streak).toBe(0)
    })

    it('should handle incomplete sessions', () => {
      const sessions: StudySession[] = [
        {
          id: '1',
          subjectId: 'math',
          startTime: new Date('2023-08-01'),
          duration: 3600,
          completed: false
        }
      ]

      const streak = calculateStudyStreak(sessions)
      expect(streak).toBe(0)
    })
  })

  describe('getWeeklyData', () => {
    it('should generate weekly data from sessions', () => {
      const sessions: StudySession[] = [
        {
          id: '1',
          subjectId: 'math',
          startTime: new Date('2023-08-01'),
          duration: 3600,
          completed: true
        },
        {
          id: '2',
          subjectId: 'science',
          startTime: new Date('2023-08-02'),
          duration: 1800,
          completed: true
        }
      ]

      const weeklyData = getWeeklyData(sessions)
      expect(Array.isArray(weeklyData)).toBeTruthy()
      expect(weeklyData.length).toBe(4) // Should return 4 weeks
      
      weeklyData.forEach(week => {
        expect(week).toHaveProperty('week')
        expect(week).toHaveProperty('minutes')
        expect(week).toHaveProperty('sessions')
        expect(typeof week.minutes).toBe('number')
        expect(typeof week.sessions).toBe('number')
      })
    })

    it('should handle empty sessions array', () => {
      const weeklyData = getWeeklyData([])
      expect(Array.isArray(weeklyData)).toBeTruthy()
      expect(weeklyData.length).toBe(4)
      
      weeklyData.forEach(week => {
        expect(week.minutes).toBe(0)
        expect(week.sessions).toBe(0)
      })
    })
  })

  describe('getMonthlyData', () => {
    it('should generate monthly data from sessions', () => {
      const sessions: StudySession[] = [
        {
          id: '1',
          subjectId: 'math',
          startTime: new Date('2023-08-01'),
          duration: 3600,
          completed: true
        }
      ]

      const monthlyData = getMonthlyData(sessions)
      expect(Array.isArray(monthlyData)).toBeTruthy()
      expect(monthlyData.length).toBe(6) // Should return 6 months
    })
  })

  describe('getDailyData', () => {
    it('should generate daily data from sessions', () => {
      const sessions: StudySession[] = [
        {
          id: '1',
          subjectId: 'math',
          startTime: new Date(),
          duration: 3600,
          completed: true
        }
      ]

      const subjects = [
        {
          id: 'math',
          name: 'Mathematics',
          color: '#FF5733',
          totalTime: 0
        }
      ]

      const dailyData = getDailyData(sessions, subjects)
      expect(Array.isArray(dailyData)).toBeTruthy()
      expect(dailyData.length).toBe(7) // Should return 7 days
    })
  })
})
