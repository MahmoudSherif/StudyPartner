// Real-time stats management system
import { StudySession, FocusSession, Task, Challenge, Goal, UserStats, Achievement } from '@/lib/types'
import { calculateStudyStreak } from '@/lib/chartUtils'
import { updateAchievements } from '@/lib/utils'

export interface RealTimeStats {
  userStats: UserStats
  achievements: Achievement[]
  taskProgress: {
    dailyTasks: {
      total: number
      completed: number
      percentage: number
    }
    challengeProgress?: {
      challengeId: string
      challengeTitle: string
      totalTasks: number
      completedTasks: number
      percentage: number
      userRank: number
      totalParticipants: number
      userPoints: number
      maxPoints: number
      pointsPercentage: number
      leaderboard: Array<{
        userId: string
        points: number
        tasksCompleted: number
        rank: number
      }>
      isCompleted: boolean
      winnerId?: string
    }
  }
  weeklyProgress: {
    totalTime: number
    sessions: number
    tasks: number
    streak: number
  }
  monthlyProgress: {
    totalTime: number
    sessions: number
    tasks: number
    averageSessionLength: number
  }
}

export class StatsManager {
  private static instance: StatsManager
  private listeners: Set<(stats: RealTimeStats) => void> = new Set()
  private currentStats: RealTimeStats | null = null

  static getInstance(): StatsManager {
    if (!StatsManager.instance) {
      StatsManager.instance = new StatsManager()
    }
    return StatsManager.instance
  }

  // Subscribe to real-time stats updates
  subscribe(callback: (stats: RealTimeStats) => void): () => void {
    this.listeners.add(callback)
    
    // Immediately call with current stats if available
    if (this.currentStats) {
      callback(this.currentStats)
    }
    
    return () => {
      this.listeners.delete(callback)
    }
  }

  // Update stats and notify all listeners
  updateStats(
    sessions: StudySession[],
    focusSessions: FocusSession[],
    tasks: Task[],
    challenges: Challenge[],
    goals: Goal[],
    achievements: Achievement[],
    currentUserId: string
  ): RealTimeStats {
    const stats = this.calculateAllStats(
      sessions,
      focusSessions,
      tasks,
      challenges,
      goals,
      achievements,
      currentUserId
    )
    
    this.currentStats = stats
    this.notifyListeners(stats)
    return stats
  }

  private notifyListeners(stats: RealTimeStats) {
    this.listeners.forEach(callback => {
      try {
        callback(stats)
      } catch (error) {
        console.error('Error in stats listener:', error)
      }
    })
  }

  private calculateAllStats(
    sessions: StudySession[],
    focusSessions: FocusSession[],
    tasks: Task[],
    challenges: Challenge[],
    goals: Goal[],
    achievements: Achievement[],
    currentUserId: string
  ): RealTimeStats {
    // Calculate user stats
    const userStats = this.calculateUserStats(sessions, focusSessions, tasks, challenges, currentUserId)
    
    // Update achievements
    const updatedAchievements = updateAchievements(achievements, userStats, sessions, focusSessions, goals)
    
    // Calculate task progress
    const taskProgress = this.calculateTaskProgress(tasks, challenges, currentUserId)
    
    // Calculate weekly progress
    const weeklyProgress = this.calculateWeeklyProgress(sessions, focusSessions, tasks, currentUserId)
    
    // Calculate monthly progress
    const monthlyProgress = this.calculateMonthlyProgress(sessions, focusSessions, tasks, currentUserId)
    
    return {
      userStats,
      achievements: updatedAchievements,
      taskProgress,
      weeklyProgress,
      monthlyProgress
    }
  }

  private calculateUserStats(
    sessions: StudySession[],
    focusSessions: FocusSession[],
    tasks: Task[],
    challenges: Challenge[],
    currentUserId: string
  ): UserStats {
    const completedSessions = sessions.filter(s => s.completed)
    const completedFocusSessions = focusSessions.filter(f => f.completed)
    
    const sessionTime = completedSessions.reduce((total, session) => total + session.duration, 0) // seconds
    const focusTime = completedFocusSessions.reduce((total, session) => total + session.duration * 60, 0) // convert minutes to seconds
    const totalTime = sessionTime + focusTime
    
    // Combine sessions for streak calculation
    const allSessions = [
      ...sessions,
      ...focusSessions.map(fs => ({
        id: fs.id,
        subjectId: 'focus',
        startTime: fs.startTime,
        endTime: fs.endTime || fs.startTime,
        duration: fs.duration,
        completed: fs.completed
      } as StudySession))
    ]
    
    // Use the improved streak calculation from chartUtils
    const streak = calculateStudyStreak(allSessions)

    const totalSessions = completedSessions.length + completedFocusSessions.length

    // Count standard completed tasks
    const tasksCompleted = tasks.filter(t => t.completed).length
    
    // Count challenge tasks completed by current user
    let challengeTasksCompleted = 0
    if (currentUserId) {
      challenges.forEach(ch => {
        ch.tasks.forEach(ct => {
          const completed = (ct.completions?.[currentUserId]?.completed) || ct.completedBy.includes(currentUserId)
          if (completed) challengeTasksCompleted++
        })
      })
    }
    
    return {
      totalStudyTime: Math.round(totalTime / 60), // Convert seconds to minutes
      streak,
      longestStreak: streak, // Simplified for now
      sessionsCompleted: totalSessions,
      averageSessionLength: totalSessions > 0 ? Math.round(totalTime / totalSessions) : 0,
      tasksCompleted,
      challengeTasksCompleted
    }
  }

  private calculateTaskProgress(
    tasks: Task[],
    challenges: Challenge[],
    currentUserId: string
  ) {
    const today = new Date()
    const todayTasks = tasks.filter(task => {
      const taskDate = new Date(task.createdAt)
      return taskDate.toDateString() === today.toDateString()
    })
    
    const completedTodayTasks = todayTasks.filter(task => task.completed)
    
    const dailyProgress = {
      total: todayTasks.length,
      completed: completedTodayTasks.length,
      percentage: todayTasks.length > 0 ? (completedTodayTasks.length / todayTasks.length) * 100 : 0
    }

    // Find active challenge the user is participating in
    const activeChallenge = challenges.find(challenge => 
      challenge.isActive && challenge.participants.includes(currentUserId)
    )

    let challengeProgress: RealTimeStats['taskProgress']['challengeProgress'] = undefined
    if (activeChallenge) {
      const summary = activeChallenge.pointsSummary
      let maxPoints = summary?.maxPoints
      if (maxPoints == null) {
        maxPoints = activeChallenge.tasks.reduce((total, task) => total + task.points, 0)
      }
      
      // Build leaderboard leveraging summary when present
      let leaderboard = activeChallenge.participants.map(participantId => {
        let points = summary?.pointsByUser?.[participantId]
        if (points == null) {
          const completed = activeChallenge.tasks.filter(t => 
            (t.completions?.[participantId]?.completed) || t.completedBy.includes(participantId)
          )
          points = completed.reduce((sum, t) => sum + t.points, 0)
        }
        const tasksCompleted = activeChallenge.tasks.filter(t => 
          (t.completions?.[participantId]?.completed) || t.completedBy.includes(participantId)
        ).length
        return { userId: participantId, points, tasksCompleted, rank: 0 }
      }).sort((a,b) => b.points - a.points)
      
      // Rank assignment with tie handling
      leaderboard.forEach((p, idx) => {
        if (idx === 0) p.rank = 1
        else if (p.points === leaderboard[idx-1].points) p.rank = leaderboard[idx-1].rank
        else p.rank = idx + 1
      })
      
      const userPoints = leaderboard.find(p => p.userId === currentUserId)?.points || 0
      const userCompletedTasks = activeChallenge.tasks.filter(t => 
        (t.completions?.[currentUserId]?.completed) || t.completedBy.includes(currentUserId)
      ).length
      const userRank = leaderboard.find(p => p.userId === currentUserId)?.rank || 1
      const isCompleted = activeChallenge.endDate ? new Date() > new Date(activeChallenge.endDate) : false
      const winnerId = isCompleted && leaderboard.length > 0 ? leaderboard[0].userId : undefined
      
      challengeProgress = {
        challengeId: activeChallenge.id,
        challengeTitle: activeChallenge.title,
        totalTasks: activeChallenge.tasks.length,
        completedTasks: userCompletedTasks,
        percentage: activeChallenge.tasks.length > 0 ? (userCompletedTasks / activeChallenge.tasks.length) * 100 : 0,
        userRank,
        totalParticipants: activeChallenge.participants.length,
        userPoints,
        maxPoints,
        pointsPercentage: (maxPoints || 0) > 0 ? (userPoints / (maxPoints || 0)) * 100 : 0,
        leaderboard,
        isCompleted,
        winnerId
      }
    }

    return {
      dailyTasks: dailyProgress,
      challengeProgress
    }
  }

  private calculateWeeklyProgress(
    sessions: StudySession[],
    focusSessions: FocusSession[],
    tasks: Task[],
    currentUserId: string
  ) {
    const now = new Date()
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - now.getDay())
    weekStart.setHours(0, 0, 0, 0)
    
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 7)
    
    const weeklySessions = sessions.filter(s => {
      const sessionDate = new Date(s.startTime)
      return sessionDate >= weekStart && sessionDate < weekEnd && s.completed
    })
    
    const weeklyFocusSessions = focusSessions.filter(f => {
      const sessionDate = new Date(f.startTime)
      return sessionDate >= weekStart && sessionDate < weekEnd && f.completed
    })
    
    const weeklyTasks = tasks.filter(t => {
      const taskDate = new Date(t.createdAt)
      return taskDate >= weekStart && taskDate < weekEnd && t.completed
    })
    
    const totalTime = weeklySessions.reduce((sum, s) => sum + s.duration, 0) +
                     weeklyFocusSessions.reduce((sum, f) => sum + f.duration * 60, 0)
    
    return {
      totalTime: Math.round(totalTime / 60), // Convert to minutes
      sessions: weeklySessions.length + weeklyFocusSessions.length,
      tasks: weeklyTasks.length,
      streak: calculateStudyStreak([...weeklySessions, ...weeklyFocusSessions.map(fs => ({
        id: fs.id,
        subjectId: 'focus',
        startTime: fs.startTime,
        endTime: fs.endTime || fs.startTime,
        duration: fs.duration,
        completed: fs.completed
      } as StudySession))])
    }
  }

  private calculateMonthlyProgress(
    sessions: StudySession[],
    focusSessions: FocusSession[],
    tasks: Task[],
    currentUserId: string
  ) {
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    
    const monthlySessions = sessions.filter(s => {
      const sessionDate = new Date(s.startTime)
      return sessionDate >= monthStart && sessionDate <= monthEnd && s.completed
    })
    
    const monthlyFocusSessions = focusSessions.filter(f => {
      const sessionDate = new Date(f.startTime)
      return sessionDate >= monthStart && sessionDate <= monthEnd && f.completed
    })
    
    const monthlyTasks = tasks.filter(t => {
      const taskDate = new Date(t.createdAt)
      return taskDate >= monthStart && taskDate <= monthEnd && t.completed
    })
    
    const totalTime = monthlySessions.reduce((sum, s) => sum + s.duration, 0) +
                     monthlyFocusSessions.reduce((sum, f) => sum + f.duration * 60, 0)
    
    const totalSessions = monthlySessions.length + monthlyFocusSessions.length
    
    return {
      totalTime: Math.round(totalTime / 60), // Convert to minutes
      sessions: totalSessions,
      tasks: monthlyTasks.length,
      averageSessionLength: totalSessions > 0 ? Math.round(totalTime / totalSessions) : 0
    }
  }
}

// Export singleton instance
export const statsManager = StatsManager.getInstance() 