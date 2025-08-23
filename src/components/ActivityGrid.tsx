import { StudySession } from '@/lib/types'
import { useMemo } from 'react'

interface ActivityGridProps {
  sessions: StudySession[]
}

interface DayActivity {
  date: Date
  minutes: number
  level: number
}

export function ActivityGrid({ sessions }: ActivityGridProps) {
  // Generate activity data for the last 10 weeks (70 days)
  const activityData = useMemo(() => {
    const today = new Date()
    const days: DayActivity[] = []
    
    // Go back 70 days (10 weeks)
    for (let i = 69; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      
      // Count study minutes for this date
      const dateString = date.toDateString()
      const dayMinutes = sessions
        .filter(session => {
          const sessionDate = new Date(session.startTime)
          return sessionDate.toDateString() === dateString
        })
        .reduce((total, session) => total + session.duration, 0)
      
      days.push({
        date: date,
        minutes: dayMinutes,
        level: getIntensityLevel(dayMinutes)
      })
    }
    
    return days
  }, [sessions])

  // Get intensity level based on study minutes
  function getIntensityLevel(minutes: number): number {
    if (minutes === 0) return 0
    if (minutes < 30) return 1
    if (minutes < 60) return 2
    if (minutes < 120) return 3
    return 4
  }

  // Get color class based on intensity level
  function getColorClass(level: number): string {
    const colors = {
      0: 'bg-white/10', // No activity
      1: 'bg-green-900/50', // Light activity
      2: 'bg-green-700/70', // Medium activity  
      3: 'bg-green-500/80', // High activity
      4: 'bg-green-300/90'  // Very high activity
    }
    return colors[level as keyof typeof colors] || colors[0]
  }

  // Group days into weeks
  const weeks: DayActivity[][] = []
  for (let i = 0; i < activityData.length; i += 7) {
    weeks.push(activityData.slice(i, i + 7))
  }

  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  // Calculate total study time for stats
  const totalMinutes = activityData.reduce((sum, day) => sum + day.minutes, 0)
  const activeDays = activityData.filter(day => day.minutes > 0).length
  const currentStreak = calculateCurrentStreak(activityData)

  function calculateCurrentStreak(days: typeof activityData): number {
    let streak = 0
    for (let i = days.length - 1; i >= 0; i--) {
      if (days[i].minutes > 0) {
        streak++
      } else {
        break
      }
    }
    return streak
  }

  return (
    <div className="space-y-4">
      {/* Stats Summary */}
      <div className="flex justify-between text-sm text-white/70">
        <span>{totalMinutes} minutes in last 10 weeks</span>
        <span>{activeDays} active days</span>
      </div>

      {/* Activity Grid */}
      <div className="space-y-2">
        {/* Month labels */}
        <div className="flex text-xs text-white/50 mb-1">
          {weeks.map((week, weekIndex) => {
            const firstDay = week[0]?.date
            if (!firstDay || firstDay.getDate() > 7) return <div key={weekIndex} className="w-3" />
            
            return (
              <div key={weekIndex} className="w-3 text-center">
                {monthLabels[firstDay.getMonth()].slice(0, 1)}
              </div>
            )
          })}
        </div>

        {/* Grid */}
        <div className="flex space-x-1">
          {/* Day labels */}
          <div className="flex flex-col space-y-1 mr-2">
            {dayLabels.map((label, index) => (
              <div key={index} className="w-3 h-3 flex items-center justify-center text-xs text-white/50">
                {index % 2 === 1 ? label : ''}
              </div>
            ))}
          </div>

          {/* Activity squares */}
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col space-y-1">
              {week.map((day, dayIndex) => (
                <div
                  key={dayIndex}
                  className={`w-3 h-3 rounded-sm border border-white/10 ${getColorClass(day.level)}`}
                  title={`${day.date.toLocaleDateString()}: ${day.minutes} minutes`}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between text-xs text-white/50 mt-2">
          <span>Less</span>
          <div className="flex space-x-1">
            {[0, 1, 2, 3, 4].map(level => (
              <div
                key={level}
                className={`w-3 h-3 rounded-sm border border-white/10 ${getColorClass(level)}`}
              />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>

      {/* Current streak indicator */}
      {currentStreak > 0 && (
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 bg-green-500/20 rounded-full px-3 py-1 border border-green-500/30">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-sm text-green-400 font-medium">
              {currentStreak} day streak
            </span>
          </div>
        </div>
      )}
    </div>
  )
}