// Debug component to show real-time stats updates
import { useRealTimeStats } from '@/hooks/useRealTimeStats'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function StatsDebugger() {
  const { 
    stats, 
    userStats, 
    achievements, 
    taskProgress, 
    weeklyProgress, 
    monthlyProgress,
    isLoading 
  } = useRealTimeStats()

  if (isLoading) {
    return (
      <Card className="bg-black/20 backdrop-blur-md border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Stats Debugger</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-white/70">Loading stats...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-black/20 backdrop-blur-md border-white/10">
      <CardHeader>
        <CardTitle className="text-white">Real-Time Stats Debugger</CardTitle>
        <Badge variant="outline" className="text-green-400 border-green-400">
          Live Updates Active
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="text-white font-semibold mb-2">User Stats</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-white/70">Total Study Time:</div>
            <div className="text-white">{userStats?.totalStudyTime || 0} min</div>
            <div className="text-white/70">Streak:</div>
            <div className="text-white">{userStats?.streak || 0} days</div>
            <div className="text-white/70">Sessions:</div>
            <div className="text-white">{userStats?.sessionsCompleted || 0}</div>
            <div className="text-white/70">Tasks:</div>
            <div className="text-white">{userStats?.tasksCompleted || 0}</div>
          </div>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-2">Daily Progress</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-white/70">Tasks:</div>
            <div className="text-white">
              {taskProgress?.dailyTasks.completed || 0}/{taskProgress?.dailyTasks.total || 0}
            </div>
            <div className="text-white/70">Progress:</div>
            <div className="text-white">{taskProgress?.dailyTasks.percentage?.toFixed(1) || 0}%</div>
          </div>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-2">Weekly Progress</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-white/70">Study Time:</div>
            <div className="text-white">{weeklyProgress?.totalTime || 0} min</div>
            <div className="text-white/70">Sessions:</div>
            <div className="text-white">{weeklyProgress?.sessions || 0}</div>
            <div className="text-white/70">Tasks:</div>
            <div className="text-white">{weeklyProgress?.tasks || 0}</div>
          </div>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-2">Monthly Progress</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-white/70">Study Time:</div>
            <div className="text-white">{monthlyProgress?.totalTime || 0} min</div>
            <div className="text-white/70">Sessions:</div>
            <div className="text-white">{monthlyProgress?.sessions || 0}</div>
            <div className="text-white/70">Avg Session:</div>
            <div className="text-white">{monthlyProgress?.averageSessionLength || 0} min</div>
          </div>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-2">Achievements</h4>
          <div className="text-sm">
            <div className="text-white/70">
              Unlocked: {achievements.filter(a => a.unlocked).length}/{achievements.length}
            </div>
          </div>
        </div>

        <div className="text-xs text-white/50 mt-4">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  )
} 