import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Achievement, Subject, StudySession, UserStats, SubjectProgress, TargetNotification, FocusSession, Goal, Task, Challenge } from './types'
import { INITIAL_ACHIEVEMENTS } from './constants'
import { calculateStudyStreak } from './chartUtils'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Non-negative finite number, or 0.
 *
 * Durations reach this function from local cache and, historically, from a
 * backend with no validation, so a NaN or a negative value is possible. One bad
 * row used to poison the lifetime total for every screen that showed it.
 */
function safeDuration(value: unknown): number {
  const n = Number(value)
  return Number.isFinite(n) && n > 0 ? n : 0
}

export function calculateUserStats(
  sessions: StudySession[],
  focusSessions: FocusSession[] = [],
  tasks: Task[] = [],
  challenges: Challenge[] = [],
  currentUserId?: string
): UserStats {
  // Callers include effects that run before their collection has loaded, so a
  // null here is ordinary rather than exceptional.
  const safeSessions = Array.isArray(sessions) ? sessions : []
  const safeFocusSessions = Array.isArray(focusSessions) ? focusSessions : []
  const safeTasks = Array.isArray(tasks) ? tasks : []
  const safeChallenges = Array.isArray(challenges) ? challenges : []

  const completedSessions = safeSessions.filter(s => s?.completed)
  const completedFocusSessions = safeFocusSessions.filter(f => f?.completed)

  const sessionTime = completedSessions.reduce((total, session) => total + safeDuration(session.duration), 0) // seconds
  const focusTime = completedFocusSessions.reduce((total, session) => total + safeDuration(session.duration) * 60, 0) // convert minutes to seconds
  const totalTime = sessionTime + focusTime
  
  // Combine sessions for streak calculation
  const allSessions = [
    ...safeSessions,
    ...safeFocusSessions.map(fs => ({
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
  const tasksCompleted = safeTasks.filter(t => t?.completed).length
  // Count challenge tasks completed by current user
  let challengeTasksCompleted = 0
  if (currentUserId) {
    safeChallenges.forEach(ch => {
      ;(ch?.tasks ?? []).forEach(ct => {
        const completed = (ct.completions?.[currentUserId]?.completed) || (ct.completedBy ?? []).includes(currentUserId)
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

export function updateAchievements(
  currentAchievements: Achievement[],
  stats: UserStats,
  sessions: StudySession[],
  focusSessions: FocusSession[] = [],
  goals: Goal[] = []
): Achievement[] {
  return currentAchievements.map(achievement => {
    let progress = 0
    
    switch (achievement.category) {
      case 'sessions':
        switch (achievement.id) {
          case 'first-session':
          case 'focus-master':
            progress = stats.sessionsCompleted
            break
        }
        break
        
      case 'time':
        switch (achievement.id) {
          case 'hour-milestone':
          case 'century-club':
            progress = stats.totalStudyTime
            break
          case 'marathon-runner':
            // Check for 5 hours (300 minutes) in a single day
            progress = getMaxDailyStudyTime(sessions, focusSessions)
            break
        }
        break
        
      case 'streaks':
        progress = stats.streak
        break
        
      case 'focus':
        switch (achievement.id) {
          case 'focus-champion':
            progress = focusSessions.filter(fs => fs.completed).length
            break
        }
        break
        
      case 'goals':
        switch (achievement.id) {
          case 'goal-setter':
            progress = goals.length
            break
          case 'goal-achiever':
            progress = goals.filter(goal => goal.isCompleted).length
            break
        }
        break
      case 'tasks':
        switch (achievement.id) {
          case 'task-starter':
            progress = stats.tasksCompleted || 0
            break
          case 'task-grinder':
            progress = stats.tasksCompleted || 0
            break
          case 'challenge-participant':
            progress = stats.challengeTasksCompleted || 0
            break
          case 'challenge-champion':
            progress = stats.challengeTasksCompleted || 0
            break
        }
        break
        
      default:
        // Fallback for old achievements without categories
        switch (achievement.id) {
          case 'first-session':
            progress = stats.sessionsCompleted
            break
          case 'hour-milestone':
            progress = stats.totalStudyTime
            break
          case 'week-warrior':
            progress = stats.streak
            break
          case 'focus-master':
            progress = stats.sessionsCompleted
            break
          case 'century-club':
            progress = stats.totalStudyTime
            break
        }
        break
    }
    
    const unlocked = achievement.unlocked || progress >= achievement.requirement
    
    return {
      ...achievement,
      progress: Math.min(progress, achievement.requirement),
      unlocked,
      unlockedAt: unlocked && !achievement.unlocked ? new Date() : achievement.unlockedAt
    }
  })
}

function getMaxDailyStudyTime(sessions: StudySession[], focusSessions: FocusSession[]): number {
  const dailyTotals = new Map<string, number>()
  
  // Process regular study sessions
  sessions.filter(s => s.completed).forEach(session => {
    const dateKey = new Date(session.startTime).toDateString()
    const current = dailyTotals.get(dateKey) || 0
    dailyTotals.set(dateKey, current + session.duration)
  })
  
  // Process focus sessions
  focusSessions.filter(fs => fs.completed).forEach(session => {
    const dateKey = new Date(session.startTime).toDateString()
    const current = dailyTotals.get(dateKey) || 0
    dailyTotals.set(dateKey, current + session.duration)
  })
  
  return Math.max(...Array.from(dailyTotals.values()), 0)
}

export function formatTime(minutes: number): string {
  const total = Math.max(0, Math.round(Number(minutes) || 0))
  const hours = Math.floor(total / 60)
  const mins = total % 60
  
  if (hours === 0) {
    return `${mins}m`
  }
  
  if (mins === 0) {
    return `${hours}h`
  }
  
  return `${hours}h ${mins}m`
}

export function formatDuration(seconds: number): string {
  const total = Math.max(0, Math.round(Number(seconds) || 0))
  const minutes = Math.floor(total / 60)
  const remainingSeconds = total % 60
  
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}

export function getSubjectById(subjects: Subject[], id: string): Subject | undefined {
  return subjects.find(subject => subject.id === id)
}

export function getStartOfDay(date: Date = new Date()): Date {
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)
  return start
}

export function getStartOfWeek(date: Date = new Date()): Date {
  const start = new Date(date)
  const day = start.getDay()
  const diff = start.getDate() - day
  start.setDate(diff)
  start.setHours(0, 0, 0, 0)
  return start
}

export function calculateSubjectProgress(
  subject: Subject,
  sessions: StudySession[]
): SubjectProgress {
  const now = new Date()
  const startOfDay = getStartOfDay(now)
  const startOfWeek = getStartOfWeek(now)
  
  const todaySessions = sessions.filter(session => 
    session.subjectId === subject.id && 
    session.completed &&
    new Date(session.startTime) >= startOfDay
  )
  
  const weekSessions = sessions.filter(session =>
    session.subjectId === subject.id &&
    session.completed &&
    new Date(session.startTime) >= startOfWeek
  )
  
  const todayTime = todaySessions.reduce((total, session) => total + session.duration, 0)
  const weekTime = weekSessions.reduce((total, session) => total + session.duration, 0)
  
  const dailyProgress = subject.dailyTarget ? Math.min((todayTime / subject.dailyTarget) * 100, 100) : 0
  const weeklyProgress = subject.weeklyTarget ? Math.min((weekTime / subject.weeklyTarget) * 100, 100) : 0
  
  // Check if behind targets (with some grace period)
  const currentHour = now.getHours()
  const currentDayOfWeek = now.getDay()
  
  // For daily: if past 6 PM and less than 70% complete
  const isBehindDaily = subject.dailyTarget ? 
    (currentHour >= 18 && dailyProgress < 70) || (currentHour >= 22 && dailyProgress < 90) : false
  
  // For weekly: if it's Wednesday+ and less than 40% complete, or Friday+ and less than 70%
  const isBehindWeekly = subject.weeklyTarget ?
    (currentDayOfWeek >= 3 && weeklyProgress < 40) || (currentDayOfWeek >= 5 && weeklyProgress < 70) : false
  
  return {
    subjectId: subject.id,
    todayTime,
    weekTime,
    dailyTarget: subject.dailyTarget,
    weeklyTarget: subject.weeklyTarget,
    dailyProgress,
    weeklyProgress,
    isBehindDaily,
    isBehindWeekly
  }
}

export function generateTargetNotifications(
  subjects: Subject[],
  sessions: StudySession[]
): TargetNotification[] {
  const notifications: TargetNotification[] = []
  const now = new Date()
  
  subjects.forEach(subject => {
    if (!subject.dailyTarget && !subject.weeklyTarget) return
    
    const progress = calculateSubjectProgress(subject, sessions)
    
    if (progress.isBehindDaily && subject.dailyTarget) {
      const remaining = subject.dailyTarget - progress.todayTime
      notifications.push({
        id: `daily-${subject.id}-${now.getTime()}`,
        subjectId: subject.id,
        subjectName: subject.name,
        type: 'daily',
        message: `You need ${remaining} more minutes of ${subject.name} to reach your daily goal!`,
        severity: progress.dailyProgress < 50 ? 'danger' : 'warning',
        timestamp: now
      })
    }
    
    if (progress.isBehindWeekly && subject.weeklyTarget) {
      const remaining = subject.weeklyTarget - progress.weekTime
      notifications.push({
        id: `weekly-${subject.id}-${now.getTime()}`,
        subjectId: subject.id,
        subjectName: subject.name,
        type: 'weekly',
        message: `You're behind on your weekly ${subject.name} goal. ${formatTime(remaining)} remaining!`,
        severity: progress.weeklyProgress < 30 ? 'danger' : 'warning',
        timestamp: now
      })
    }
  })
  
  return notifications
}