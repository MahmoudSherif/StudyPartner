import { StudySession, FocusSession } from './types'

export function generateSampleSessions(): StudySession[] {
  const sessions: StudySession[] = []
  const now = new Date()
  
  // Generate sessions for the past 30 days
  for (let day = 0; day < 30; day++) {
    const date = new Date(now)
    date.setDate(date.getDate() - day)
    
    // Random chance of having sessions on this day (70% chance)
    if (Math.random() > 0.3) {
      // Generate 1-3 sessions per day
      const sessionCount = Math.floor(Math.random() * 3) + 1
      
      for (let i = 0; i < sessionCount; i++) {
        const startHour = 8 + Math.floor(Math.random() * 12) // Sessions between 8am and 8pm
        const duration = 25 + Math.floor(Math.random() * 60) // 25-85 minute sessions
        
        const sessionDate = new Date(date)
        sessionDate.setHours(startHour, Math.floor(Math.random() * 60), 0, 0)
        
        const endDate = new Date(sessionDate)
        endDate.setMinutes(endDate.getMinutes() + duration)
        
        sessions.push({
          id: `sample-${day}-${i}`,
          subjectId: ['math', 'science', 'english', 'history'][Math.floor(Math.random() * 4)],
          startTime: sessionDate,
          endTime: endDate,
          duration,
          completed: true
        })
      }
    }
  }
  
  return sessions.sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
}

export function generateSampleFocusSessions(): FocusSession[] {
  const focusSessions: FocusSession[] = []
  const now = new Date()
  
  // Generate focus sessions for the past 14 days
  for (let day = 0; day < 14; day++) {
    const date = new Date(now)
    date.setDate(date.getDate() - day)
    
    // Random chance of having focus sessions (50% chance)
    if (Math.random() > 0.5) {
      // Generate 1-2 focus sessions per day
      const sessionCount = Math.floor(Math.random() * 2) + 1
      
      for (let i = 0; i < sessionCount; i++) {
        const startHour = 9 + Math.floor(Math.random() * 10) // Sessions between 9am and 7pm
        const duration = 25 // Standard Pomodoro session
        
        const sessionDate = new Date(date)
        sessionDate.setHours(startHour, Math.floor(Math.random() * 60), 0, 0)
        
        const endDate = new Date(sessionDate)
        endDate.setMinutes(endDate.getMinutes() + duration)
        
        focusSessions.push({
          id: `focus-sample-${day}-${i}`,
          title: 'Focus Session',
          startTime: sessionDate,
          endTime: endDate,
          duration,
          completed: true,
          category: 'focus'
        })
      }
    }
  }
  
  return focusSessions.sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
}
