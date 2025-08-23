import { StudySession, Subject } from './types'

export interface WeeklyData {
  week: string
  minutes: number
  sessions: number
}

export interface MonthlyData {
  month: string
  minutes: number
  sessions: number
}

export interface DailyData {
  day: string
  minutes: number
  sessions: number
}

/**
 * Get weekly study data for the last 4 weeks
 */
export function getWeeklyData(sessions: StudySession[]): WeeklyData[] {
  const now = new Date()
  const weeks: WeeklyData[] = []
  
  for (let i = 3; i >= 0; i--) {
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - (i * 7) - now.getDay())
    weekStart.setHours(0, 0, 0, 0)
    
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)
    weekEnd.setHours(23, 59, 59, 999)
    
    const weekSessions = sessions.filter(session => {
      const sessionDate = new Date(session.startTime)
      return sessionDate >= weekStart && sessionDate <= weekEnd && session.completed
    })
    
    const totalMinutes = weekSessions.reduce((sum, session) => sum + session.duration, 0)
    
    // Format week label
    const weekLabel = i === 0 ? 'This Week' : 
                     i === 1 ? 'Last Week' : 
                     `${i} weeks ago`
    
    weeks.push({
      week: weekLabel,
      minutes: totalMinutes,
      sessions: weekSessions.length
    })
  }
  
  return weeks
}

/**
 * Get monthly study data for the last 6 months
 */
export function getMonthlyData(sessions: StudySession[]): MonthlyData[] {
  const now = new Date()
  const months: MonthlyData[] = []
  
  for (let i = 5; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999)
    
    const monthSessions = sessions.filter(session => {
      const sessionDate = new Date(session.startTime)
      return sessionDate >= monthStart && sessionDate <= monthEnd && session.completed
    })
    
    const totalMinutes = monthSessions.reduce((sum, session) => sum + session.duration, 0)
    
    // Format month label
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const monthLabel = monthNames[monthStart.getMonth()]
    
    months.push({
      month: monthLabel,
      minutes: totalMinutes,
      sessions: monthSessions.length
    })
  }
  
  return months
}

/**
 * Get daily study data for the last 7 days
 */
export function getDailyData(sessions: StudySession[], subjects: Subject[]): DailyData[] {
  const now = new Date()
  const days: DailyData[] = []
  
  for (let i = 6; i >= 0; i--) {
    const dayStart = new Date(now)
    dayStart.setDate(now.getDate() - i)
    dayStart.setHours(0, 0, 0, 0)
    
    const dayEnd = new Date(dayStart)
    dayEnd.setHours(23, 59, 59, 999)
    
    const daySessions = sessions.filter(session => {
      const sessionDate = new Date(session.startTime)
      return sessionDate >= dayStart && sessionDate <= dayEnd && session.completed
    })
    
    const totalMinutes = daySessions.reduce((sum, session) => sum + session.duration, 0)
    
    // Format day label
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const dayLabel = i === 0 ? 'Today' : 
                    i === 1 ? 'Yesterday' : 
                    dayNames[dayStart.getDay()]
    
    days.push({
      day: dayLabel,
      minutes: totalMinutes,
      sessions: daySessions.length
    })
  }
  
  return days
}

/**
 * Get study data by subject for the last 30 days
 */
export function getSubjectBreakdown(sessions: StudySession[], subjects: Subject[]) {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  
  const recentSessions = sessions.filter(session => {
    const sessionDate = new Date(session.startTime)
    return sessionDate >= thirtyDaysAgo && session.completed
  })
  
  const subjectData = subjects.map(subject => {
    const subjectSessions = recentSessions.filter(session => session.subjectId === subject.id)
    const totalMinutes = subjectSessions.reduce((sum, session) => sum + session.duration, 0)
    
    return {
      name: subject.name,
      minutes: totalMinutes,
      sessions: subjectSessions.length,
      color: subject.color
    }
  }).filter(data => data.minutes > 0)
  
  return subjectData
}

/**
 * Calculate study streak
 */
export function calculateStudyStreak(sessions: StudySession[]): number {
  const completedSessions = sessions.filter(s => s.completed)
  
  if (completedSessions.length === 0) return 0
  
  const today = new Date()
  const sortedSessions = [...completedSessions].sort((a, b) => 
    new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
  )
  
  let streak = 0
  const currentDate = new Date(today)
  currentDate.setHours(0, 0, 0, 0)
  
  // Check if user studied today or yesterday to maintain streak
  const lastSessionDate = new Date(sortedSessions[0].startTime)
  lastSessionDate.setHours(0, 0, 0, 0)
  
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  yesterday.setHours(0, 0, 0, 0)
  
  // If last session wasn't today or yesterday, streak is broken
  if (lastSessionDate.getTime() < yesterday.getTime()) {
    return 0
  }
  
  // Count consecutive days with sessions
  for (const session of sortedSessions) {
    const sessionDate = new Date(session.startTime)
    sessionDate.setHours(0, 0, 0, 0)
    
    if (sessionDate.getTime() === currentDate.getTime()) {
      streak++
      currentDate.setDate(currentDate.getDate() - 1)
    } else if (sessionDate.getTime() < currentDate.getTime()) {
      break
    }
  }
  
  return streak
}

/**
 * Get best study time (hour of day when most productive)
 */
export function getBestStudyTime(sessions: StudySession[]): { hour: number; sessions: number } {
  const hourCounts = new Array(24).fill(0)
  
  sessions.filter(s => s.completed).forEach(session => {
    const hour = new Date(session.startTime).getHours()
    hourCounts[hour]++
  })
  
  const maxSessions = Math.max(...hourCounts)
  const bestHour = hourCounts.indexOf(maxSessions)
  
  return {
    hour: bestHour,
    sessions: maxSessions
  }
}

/**
 * Get subject-specific weekly data for individual topic performance
 */
export function getSubjectWeeklyData(sessions: StudySession[], subjects: Subject[]): { [subjectId: string]: WeeklyData[] } {
  try {
    const now = new Date()
    const subjectWeeklyData: { [subjectId: string]: WeeklyData[] } = {}
    
    subjects.forEach(subject => {
      if (!subject || !subject.id) return // Skip invalid subjects
      
      const weeks: WeeklyData[] = []
      
      for (let i = 3; i >= 0; i--) {
        const weekStart = new Date(now)
        weekStart.setDate(now.getDate() - (i * 7) - now.getDay())
        weekStart.setHours(0, 0, 0, 0)
        
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekStart.getDate() + 6)
        weekEnd.setHours(23, 59, 59, 999)
        
        const weekSessions = sessions.filter(session => {
          try {
            const sessionDate = new Date(session.startTime)
            return sessionDate >= weekStart && sessionDate <= weekEnd && 
                   session.completed && session.subjectId === subject.id
          } catch (error) {
            // Skip invalid session dates in production
            return false
          }
        })
        
        const totalMinutes = weekSessions.reduce((sum, session) => {
          return sum + (session.duration || 0)
        }, 0)
        
        const weekLabel = i === 0 ? 'This Week' : 
                         i === 1 ? 'Last Week' : 
                         `${i} weeks ago`
        
        weeks.push({
          week: weekLabel,
          minutes: totalMinutes,
          sessions: weekSessions.length
        })
      }
      
      subjectWeeklyData[subject.id] = weeks
    })
    
    return subjectWeeklyData
  } catch (error) {
    // Error handling removed for production
    return {}
  }
}

/**
 * Get subject-specific monthly data for individual topic performance
 */
export function getSubjectMonthlyData(sessions: StudySession[], subjects: Subject[]): { [subjectId: string]: MonthlyData[] } {
  try {
    const now = new Date()
    const subjectMonthlyData: { [subjectId: string]: MonthlyData[] } = {}
    
    subjects.forEach(subject => {
      if (!subject || !subject.id) return // Skip invalid subjects
      
      const months: MonthlyData[] = []
      
      for (let i = 5; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999)
        
        const monthSessions = sessions.filter(session => {
          try {
            const sessionDate = new Date(session.startTime)
            return sessionDate >= monthStart && sessionDate <= monthEnd && 
                   session.completed && session.subjectId === subject.id
          } catch (error) {
            // Error handling removed for production
            return false
          }
        })
        
        const totalMinutes = monthSessions.reduce((sum, session) => {
          return sum + (session.duration || 0)
        }, 0)
        
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                           'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        const monthLabel = monthNames[monthStart.getMonth()]
        
        months.push({
          month: monthLabel,
          minutes: totalMinutes,
          sessions: monthSessions.length
        })
      }
      
      subjectMonthlyData[subject.id] = months
    })
    
    return subjectMonthlyData
  } catch (error) {
    // Error handling removed for production
    return {}
  }
}

/**
 * Get comparative subject performance over time periods
 */
export function getSubjectComparison(sessions: StudySession[], subjects: Subject[]): Array<{ name: string; thisWeek: number; lastWeek: number; color: string }> {
  try {
    const now = new Date()
    
    // This week
    const thisWeekStart = new Date(now)
    thisWeekStart.setDate(now.getDate() - now.getDay())
    thisWeekStart.setHours(0, 0, 0, 0)
    
    // Last week
    const lastWeekStart = new Date(thisWeekStart)
    lastWeekStart.setDate(thisWeekStart.getDate() - 7)
    const lastWeekEnd = new Date(thisWeekStart)
    lastWeekEnd.setMilliseconds(-1)
    
    return subjects.filter(subject => subject && subject.id).map(subject => {
      const thisWeekSessions = sessions.filter(session => {
        try {
          const sessionDate = new Date(session.startTime)
          return sessionDate >= thisWeekStart && session.completed && session.subjectId === subject.id
        } catch (error) {
          // Error handling removed for production
          return false
        }
      })
      
      const lastWeekSessions = sessions.filter(session => {
        try {
          const sessionDate = new Date(session.startTime)
          return sessionDate >= lastWeekStart && sessionDate <= lastWeekEnd && 
                 session.completed && session.subjectId === subject.id
        } catch (error) {
          // Error handling removed for production
          return false
        }
      })
      
      const thisWeekMinutes = thisWeekSessions.reduce((sum, session) => sum + (session.duration || 0), 0)
      const lastWeekMinutes = lastWeekSessions.reduce((sum, session) => sum + (session.duration || 0), 0)
      
      return {
        name: subject.name || 'Unknown Subject',
        thisWeek: thisWeekMinutes,
        lastWeek: lastWeekMinutes,
        color: subject.color || '#8b5cf6'
      }
    }).filter(data => data.thisWeek > 0 || data.lastWeek > 0)
  } catch (error) {
    // Error handling removed for production
    return []
  }
}