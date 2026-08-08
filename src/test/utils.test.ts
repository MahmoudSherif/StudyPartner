import { describe, it, expect, vi } from 'vitest'
import { calculateUserStats, updateAchievements } from '@/lib/utils'
import { Subject, StudySession, Achievement, Task, FocusSession } from '@/lib/types'
import { INITIAL_ACHIEVEMENTS } from '@/lib/constants'

describe('Utils Functions', () => {
  describe('calculateUserStats', () => {
    it('should calculate stats from empty data', () => {
      const stats = calculateUserStats([], [], [], [])
      
      expect(stats.totalStudyTime).toBe(0)
      expect(stats.streak).toBe(0)
      expect(stats.longestStreak).toBe(0)
      expect(stats.sessionsCompleted).toBe(0)
      expect(stats.averageSessionLength).toBe(0)
      expect(stats.tasksCompleted).toBe(0)
    })

    it('should calculate stats from study sessions', () => {
      const sessions: StudySession[] = [
        {
          id: '1',
          subjectId: 'math',
          startTime: new Date('2023-08-01T10:00:00'),
          endTime: new Date('2023-08-01T11:00:00'),
          duration: 3600, // 1 hour
          completed: true
        },
        {
          id: '2',
          subjectId: 'science',
          startTime: new Date('2023-08-02T10:00:00'),
          endTime: new Date('2023-08-02T10:30:00'),
          duration: 1800, // 30 minutes
          completed: true
        }
      ]

      const stats = calculateUserStats(sessions, [], [], [])
      
      expect(stats.totalStudyTime).toBe(90) // 1.5 hours in minutes
      expect(stats.sessionsCompleted).toBe(2)
      expect(stats.averageSessionLength).toBe(2700) // 45 minutes in seconds
    })

    it('should calculate stats from completed tasks', () => {
      const tasks: Task[] = [
        {
          id: '1',
          title: 'Math homework',
          completed: true,
          createdAt: new Date(),
          priority: 'high'
        },
        {
          id: '2',
          title: 'Science project',
          completed: false,
          createdAt: new Date(),
          priority: 'medium'
        },
        {
          id: '3',
          title: 'History essay',
          completed: true,
          createdAt: new Date(),
          priority: 'low'
        }
      ]

      const stats = calculateUserStats([], [], tasks, [])
      
      expect(stats.tasksCompleted).toBe(2)
    })

    it('should calculate stats from focus sessions', () => {
      const focusSessions: FocusSession[] = [
        {
          id: '1',
          title: 'Math Focus',
          duration: 25,
          startTime: new Date(),
          completed: true
        },
        {
          id: '2',
          title: 'Science Focus',
          duration: 25,
          startTime: new Date(),
          completed: true
        },
        {
          id: '3',
          title: 'Incomplete Focus',
          duration: 25,
          startTime: new Date(),
          completed: false
        }
      ]

      const stats = calculateUserStats([], focusSessions, [], [])
      
      expect(stats.totalStudyTime).toBe(50) // 50 minutes from focus sessions
    })
  })

  describe('updateAchievements', () => {
    it('should unlock session-based achievements', () => {
      const currentAchievements = [...INITIAL_ACHIEVEMENTS]
      const sessions: StudySession[] = [
        {
          id: '1',
          subjectId: 'math',
          startTime: new Date(),
          duration: 3600,
          completed: true
        }
      ]

      const stats = calculateUserStats(sessions, [], [], [])
      const updatedAchievements = updateAchievements(currentAchievements, stats, [], [])

      const firstSessionAchievement = updatedAchievements.find(a => a.id === 'first-session')
      expect(firstSessionAchievement?.unlocked).toBeTruthy()
      expect(firstSessionAchievement?.progress).toBe(1)
    })

    it('should update progress for time-based achievements', () => {
      const currentAchievements = [
        { 
          id: 'hour-milestone', 
          requirement: 60, 
          progress: 0, 
          unlocked: false, 
          category: 'time' as const, 
          title: 'Hour Milestone', 
          description: 'Study for 60 minutes',
          icon: '⏰'
        }
      ]
      
      const stats = { totalStudyTime: 180, sessionsCompleted: 1, streak: 1, longestStreak: 1, averageSessionLength: 0, tasksCompleted: 0, challengeTasksCompleted: 0 }
      const updatedAchievements = updateAchievements(currentAchievements, stats, [], [], [])
      
      const studyTimeAchievement = updatedAchievements.find(a => a.id === 'hour-milestone')
      expect(studyTimeAchievement?.progress).toBe(60) // Should be capped at requirement
      expect(studyTimeAchievement?.unlocked).toBeTruthy()
    })

    it('should unlock task-based achievements', () => {
      const currentAchievements = [...INITIAL_ACHIEVEMENTS]
      const tasks: Task[] = Array.from({ length: 5 }, (_, i) => ({
        id: `${i + 1}`,
        title: `Task ${i + 1}`,
        completed: true,
        createdAt: new Date(),
        priority: 'medium' as const
      }))

      const stats = calculateUserStats([], [], tasks, [])
      // 4th parameter is focusSessions, not tasks; task counts reach it via stats.
      const updatedAchievements = updateAchievements(currentAchievements, stats, [], [])

      const taskStarterAchievement = updatedAchievements.find(a => a.id === 'task-starter')
      expect(taskStarterAchievement?.unlocked).toBeTruthy()
      expect(taskStarterAchievement?.progress).toBe(5)
    })

    it('should unlock focus-based achievements', () => {
      const currentAchievements = [...INITIAL_ACHIEVEMENTS]
      const focusSessions: FocusSession[] = Array.from({ length: 10 }, (_, i) => ({
        id: `${i + 1}`,
        title: `Focus ${i + 1}`,
        duration: 25,
        startTime: new Date(),
        completed: true
      }))

      const stats = calculateUserStats([], focusSessions, [], [])
      const updatedAchievements = updateAchievements(currentAchievements, stats, [], focusSessions)

      const focusChampionAchievement = updatedAchievements.find(a => a.id === 'focus-champion')
      expect(focusChampionAchievement?.unlocked).toBeTruthy()
      expect(focusChampionAchievement?.progress).toBe(10)
    })

    it('should not unlock achievements that do not meet requirements', () => {
      const currentAchievements = [...INITIAL_ACHIEVEMENTS]
      const sessions: StudySession[] = [
        {
          id: '1',
          subjectId: 'math',
          startTime: new Date(),
          duration: 1800, // 30 minutes
          completed: true
        }
      ]

      const stats = calculateUserStats(sessions, [], [], [])
      const updatedAchievements = updateAchievements(currentAchievements, stats, [], [])

      // Should unlock first session but not hour-milestone (requires 60 minutes)
      const firstSessionAchievement = updatedAchievements.find(a => a.id === 'first-session')
      const studyTimeAchievement = updatedAchievements.find(a => a.id === 'hour-milestone')
      
      expect(firstSessionAchievement?.unlocked).toBeTruthy()
      expect(studyTimeAchievement?.unlocked).toBeFalsy()
      expect(studyTimeAchievement?.progress).toBe(30) // 30 minutes progress
    })

    it('should preserve already unlocked achievements', () => {
      const currentAchievements = [...INITIAL_ACHIEVEMENTS]
      // Unlock first achievement
      currentAchievements[0].unlocked = true
      currentAchievements[0].unlockedAt = new Date()

      const updatedAchievements = updateAchievements(currentAchievements, { 
        totalStudyTime: 0, 
        streak: 0, 
        longestStreak: 0, 
        sessionsCompleted: 0, 
        averageSessionLength: 0,
        tasksCompleted: 0 
      }, [], [])

      expect(updatedAchievements[0].unlocked).toBeTruthy()
      expect(updatedAchievements[0].unlockedAt).toBeDefined()
    })
  })
})
