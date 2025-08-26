/**
 * Streak Calculator Utilities
 * Handles calculation and management of study streaks
 */

import { StudySession, FocusSession } from '@/lib/types'

export interface StreakData {
  current: number
  longest: number
  total: number
  percentage: number
  lastStudyDate: Date | null
  streakHistory: Array<{
    startDate: Date
    endDate: Date
    length: number
  }>
}

/**
 * Calculate current active streak
 */
export function calculateCurrentStreak(sessions: StudySession[]): number {
  if (!sessions || sessions.length === 0) return 0

  const completedSessions = sessions
    .filter(session => session.completed)
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())

  if (completedSessions.length === 0) return 0

  let streak = 0
  let currentDate = new Date()
  currentDate.setHours(0, 0, 0, 0)

  // Check if there's a session today or yesterday
  const mostRecentSession = new Date(completedSessions[0].startTime)
  mostRecentSession.setHours(0, 0, 0, 0)

  const daysDifference = Math.floor((currentDate.getTime() - mostRecentSession.getTime()) / (1000 * 60 * 60 * 24))

  // If the most recent session is more than 1 day old, streak is broken
  if (daysDifference > 1) return 0

  // Count consecutive days with sessions
  const sessionDates = new Set<string>()
  completedSessions.forEach(session => {
    const sessionDate = new Date(session.startTime)
    sessionDate.setHours(0, 0, 0, 0)
    sessionDates.add(sessionDate.toISOString().split('T')[0])
  })

  const sortedDates = Array.from(sessionDates).sort().reverse()
  
  let checkDate = new Date()
  checkDate.setHours(0, 0, 0, 0)

  for (const dateStr of sortedDates) {
    const sessionDate = new Date(dateStr)
    const dayDiff = Math.floor((checkDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24))

    if (dayDiff === streak) {
      streak++
      checkDate.setDate(checkDate.getDate() - 1)
    } else if (dayDiff > streak) {
      break
    }
  }

  return streak
}

/**
 * Find the longest streak in session history
 */
export function getLongestStreak(sessions: StudySession[]): number {
  if (!sessions || sessions.length === 0) return 0

  const completedSessions = sessions
    .filter(session => session.completed)
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())

  if (completedSessions.length === 0) return 0

  // Get unique session dates
  const sessionDates = new Set<string>()
  completedSessions.forEach(session => {
    const sessionDate = new Date(session.startTime)
    sessionDate.setHours(0, 0, 0, 0)
    sessionDates.add(sessionDate.toISOString().split('T')[0])
  })

  const sortedDates = Array.from(sessionDates).sort()
  
  let maxStreak = 1
  let currentStreak = 1

  for (let i = 1; i < sortedDates.length; i++) {
    const currentDate = new Date(sortedDates[i])
    const previousDate = new Date(sortedDates[i - 1])
    
    const dayDifference = Math.floor((currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24))

    if (dayDifference === 1) {
      currentStreak++
      maxStreak = Math.max(maxStreak, currentStreak)
    } else {
      currentStreak = 1
    }
  }

  return maxStreak
}

/**
 * Check if streak is broken between two dates
 */
export function isStreakBroken(lastStudyDate: Date, currentDate: Date): boolean {
  const timeDifference = currentDate.getTime() - lastStudyDate.getTime()
  const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24))
  
  return daysDifference > 1
}

/**
 * Get comprehensive streak data
 */
export function getStreakData(sessions: StudySession[]): StreakData {
  if (!sessions || sessions.length === 0) {
    return {
      current: 0,
      longest: 0,
      total: 0,
      percentage: 0,
      lastStudyDate: null,
      streakHistory: []
    }
  }

  const completedSessions = sessions.filter(session => session.completed)
  const current = calculateCurrentStreak(sessions)
  const longest = getLongestStreak(sessions)
  
  // Get unique study days
  const studyDates = new Set<string>()
  completedSessions.forEach(session => {
    const sessionDate = new Date(session.startTime)
    sessionDate.setHours(0, 0, 0, 0)
    studyDates.add(sessionDate.toISOString().split('T')[0])
  })

  const total = studyDates.size
  const lastStudyDate = completedSessions.length > 0 
    ? new Date(Math.max(...completedSessions.map(s => new Date(s.startTime).getTime())))
    : null

  // Calculate streak percentage (days studied vs total days since first session)
  let percentage = 0
  if (completedSessions.length > 0) {
    const firstSession = new Date(Math.min(...completedSessions.map(s => new Date(s.startTime).getTime())))
    const daysSinceFirst = Math.floor((Date.now() - firstSession.getTime()) / (1000 * 60 * 60 * 24)) + 1
    percentage = Math.round((total / daysSinceFirst) * 100)
  }

  // Generate streak history
  const streakHistory = generateStreakHistory(sessions)

  return {
    current,
    longest,
    total,
    percentage: Math.min(100, percentage),
    lastStudyDate,
    streakHistory
  }
}

/**
 * Generate history of all streaks
 */
function generateStreakHistory(sessions: StudySession[]): Array<{
  startDate: Date
  endDate: Date
  length: number
}> {
  const completedSessions = sessions
    .filter(session => session.completed)
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())

  if (completedSessions.length === 0) return []

  // Get unique session dates
  const sessionDates = new Set<string>()
  completedSessions.forEach(session => {
    const sessionDate = new Date(session.startTime)
    sessionDate.setHours(0, 0, 0, 0)
    sessionDates.add(sessionDate.toISOString().split('T')[0])
  })

  const sortedDates = Array.from(sessionDates).sort()
  const streaks: Array<{ startDate: Date; endDate: Date; length: number }> = []
  
  let streakStart = new Date(sortedDates[0])
  let streakEnd = new Date(sortedDates[0])
  let streakLength = 1

  for (let i = 1; i < sortedDates.length; i++) {
    const currentDate = new Date(sortedDates[i])
    const previousDate = new Date(sortedDates[i - 1])
    
    const dayDifference = Math.floor((currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24))

    if (dayDifference === 1) {
      // Continue current streak
      streakEnd = currentDate
      streakLength++
    } else {
      // End current streak and start new one
      if (streakLength >= 2) { // Only record streaks of 2+ days
        streaks.push({
          startDate: new Date(streakStart),
          endDate: new Date(streakEnd),
          length: streakLength
        })
      }
      
      streakStart = currentDate
      streakEnd = currentDate
      streakLength = 1
    }
  }

  // Don't forget the last streak
  if (streakLength >= 2) {
    streaks.push({
      startDate: new Date(streakStart),
      endDate: new Date(streakEnd),
      length: streakLength
    })
  }

  return streaks.sort((a, b) => b.length - a.length) // Sort by length descending
}

/**
 * Predict streak continuation probability
 */
export function predictStreakContinuation(sessions: StudySession[], currentStreak: number): {
  probability: number
  recommendation: string
} {
  if (currentStreak === 0) {
    return {
      probability: 0,
      recommendation: "Start a new study session to begin building your streak!"
    }
  }

  const streakData = getStreakData(sessions)
  const averageStreakLength = streakData.streakHistory.length > 0
    ? streakData.streakHistory.reduce((sum, streak) => sum + streak.length, 0) / streakData.streakHistory.length
    : 0

  // Simple probability based on current streak vs historical performance
  let probability = Math.min(95, (currentStreak / Math.max(streakData.longest, 1)) * 100)
  
  // Boost probability if current streak is below average
  if (currentStreak < averageStreakLength) {
    probability += 20
  }

  // Reduce probability for very long streaks (fatigue factor)
  if (currentStreak > 30) {
    probability *= 0.8
  }

  probability = Math.max(5, Math.min(95, probability))

  const recommendations = [
    "Keep up the great work! You're on a roll!",
    "Schedule your next study session to maintain momentum.",
    "Consider setting a reminder to study tomorrow.",
    "Your consistency is paying off - don't break the chain!",
    "Challenge yourself with a slightly longer session today."
  ]

  const recommendation = recommendations[Math.floor(Math.random() * recommendations.length)]

  return {
    probability: Math.round(probability),
    recommendation
  }
}

export const streakCalculator = {
  calculateCurrentStreak,
  getLongestStreak,
  isStreakBroken,
  getStreakData,
  predictStreakContinuation
}
