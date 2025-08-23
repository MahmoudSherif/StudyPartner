import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Trophy, Target, Clock, Flame, Calendar, ArrowUp, SignOut, User as UserIcon, Globe } from '@phosphor-icons/react'
import { UserStats, Achievement, StudySession, FocusSession } from '@/lib/types'
import { formatTime } from '@/lib/utils'
import { getWeeklyData, getBestStudyTime } from '@/lib/chartUtils'
import { ActivityGrid } from '@/components/ActivityGrid'
import { ActivityCharts } from '@/components/ActivityCharts'
import { NotificationSettings } from '@/components/NotificationSettings'
import { StudyPartnerIntegration } from '@/components/StudyPartnerIntegration'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

interface ProfileTabProps {
  stats: UserStats
  achievements: Achievement[]
  sessions?: StudySession[]
}

export function ProfileTab({ stats, achievements, sessions = [] }: ProfileTabProps) {
  const { user, signOut } = useAuth()
  
  // Get user-specific focus sessions
  const currentUserId = user?.uid || 'anonymous'
  const userDataKey = (key: string) => `${currentUserId}-${key}`
  // Temporarily disabled GitHub Spark KV to prevent rate limit errors
  const [focusSessions] = useState<FocusSession[]>([])
  // const [focusSessions] = useKV<FocusSession[]>(userDataKey('focus-sessions'), [])
  
  const handleSignOut = async () => {
    const { error } = await signOut()
    if (error) {
      toast.error('Failed to sign out')
    } else {
      toast.success('Signed out successfully')
    }
  }
  
  const unlockedAchievements = achievements.filter(a => a.unlocked)
  const nextAchievement = achievements.find(a => !a.unlocked && a.progress > 0)
  
  // Combine regular study sessions and focus sessions for activity tracking
  const allActivitySessions = [
    ...sessions,
    ...focusSessions.map(fs => ({
      id: fs.id,
      subjectId: 'focus', // Use a placeholder since focus sessions don't have subjects
      startTime: fs.startTime,
      endTime: fs.endTime || fs.startTime,
      duration: fs.duration,
      completed: fs.completed
    } as StudySession))
  ]
  
  // Calculate weekly progress using all activity sessions
  const weeklyData = getWeeklyData(allActivitySessions)
  const thisWeekMinutes = weeklyData[weeklyData.length - 1]?.minutes || 0
  const lastWeekMinutes = weeklyData[weeklyData.length - 2]?.minutes || 0
  const weeklyProgress = lastWeekMinutes > 0 ? ((thisWeekMinutes - lastWeekMinutes) / lastWeekMinutes) * 100 : 0
  
  // Get best study time using all activity sessions
  const bestTime = getBestStudyTime(allActivitySessions)
  const bestTimeString = bestTime.sessions > 0 ? 
    `${bestTime.hour === 0 ? 12 : bestTime.hour > 12 ? bestTime.hour - 12 : bestTime.hour}${bestTime.hour >= 12 ? 'PM' : 'AM'}` 
    : 'N/A'

  return (
    <div className="space-y-4">
      {/* User Profile Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-white flex items-center gap-2">
            <UserIcon size={20} />
            Profile
            {user?.isFromStudyPartner && (
              <Badge variant="outline" className="ml-auto text-xs bg-green-100 text-green-800 border-green-200">
                StudyPartner
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                {user?.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt="Profile" 
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <UserIcon size={24} className="text-primary" />
                )}
              </div>
              <div>
                <h3 className="font-medium text-white">
                  {user?.displayName || user?.email?.split('@')[0] || 'User'}
                </h3>
                <p className="text-sm text-white/70">{user?.email}</p>
                {user?.isFromStudyPartner && (
                  <p className="text-xs text-green-400">Connected to StudyPartner</p>
                )}
              </div>
            </div>
            <Button
              onClick={handleSignOut}
              variant="outline"
              size="sm"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
            >
              <SignOut size={16} className="mr-2" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Profile Tabs */}
      <Tabs defaultValue="stats" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 bg-white/10 backdrop-blur-sm">
          <TabsTrigger value="stats" className="text-white data-[state=active]:bg-white/20 data-[state=active]:text-white">
            Statistics
          </TabsTrigger>
          <TabsTrigger value="settings" className="text-white data-[state=active]:bg-white/20 data-[state=active]:text-white">
            Settings
          </TabsTrigger>
          <TabsTrigger value="sync" className="text-white data-[state=active]:bg-white/20 data-[state=active]:text-white">
            Sync
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stats" className="space-y-4 m-0">
          {/* Activity Grid - GitHub-style contribution calendar */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-white">Activity</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ActivityGrid sessions={allActivitySessions} />
            </CardContent>
          </Card>

          {/* Activity Charts - Weekly and Monthly Bar Charts */}
          <ActivityCharts sessions={allActivitySessions} />

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Clock size={24} className="mx-auto text-primary mb-2" />
                <div className="text-2xl font-bold text-white">{formatTime(stats.totalStudyTime)}</div>
                <div className="text-sm text-white/70">Total Study Time</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <Flame size={24} className="mx-auto text-accent mb-2" />
                <div className="text-2xl font-bold text-white">{stats.streak}</div>
                <div className="text-sm text-white/70">Day Streak</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <Target size={24} className="mx-auto text-primary mb-2" />
                <div className="text-2xl font-bold text-white">{stats.sessionsCompleted}</div>
                <div className="text-sm text-white/70">Sessions</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <Trophy size={24} className="mx-auto text-accent mb-2" />
                <div className="text-2xl font-bold text-white">{unlockedAchievements.length}</div>
                <div className="text-sm text-white/70">Achievements</div>
              </CardContent>
            </Card>
          </div>

          {/* Weekly Progress and Best Time */}
          <div className="grid grid-cols-2 lg:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Calendar size={24} className="mx-auto text-primary mb-2" />
                <div className="text-2xl font-bold text-white">{formatTime(thisWeekMinutes)}</div>
                <div className="text-sm text-white/70">This Week</div>
                {weeklyProgress !== 0 && (
                  <div className={`text-xs mt-1 ${weeklyProgress > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {weeklyProgress > 0 ? '+' : ''}{Math.round(weeklyProgress)}% vs last week
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <ArrowUp size={24} className="mx-auto text-accent mb-2" />
                <div className="text-2xl font-bold text-white">{bestTimeString}</div>
                <div className="text-sm text-white/70">Best Study Time</div>
                {bestTime.sessions > 0 && (
                  <div className="text-xs text-white/50 mt-1">
                    {bestTime.sessions} sessions at this hour
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {nextAchievement && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-white">Next Achievement</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center space-x-3 mb-3">
                  <span className="text-2xl">{nextAchievement.icon}</span>
                  <div>
                    <h3 className="font-medium text-white">{nextAchievement.title}</h3>
                    <p className="text-sm text-white/70">{nextAchievement.description}</p>
                  </div>
                </div>
                <Progress 
                  value={(nextAchievement.progress / nextAchievement.requirement) * 100} 
                  className="h-2"
                />
                <div className="text-xs text-white/50 mt-1 text-right">
                  {nextAchievement.progress} / {nextAchievement.requirement}
                </div>
              </CardContent>
            </Card>
          )}

          {unlockedAchievements.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-white">Recent Achievements</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {unlockedAchievements.slice(-3).map((achievement) => (
                    <div key={achievement.id} className="flex items-center space-x-3">
                      <span className="text-xl">{achievement.icon}</span>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm text-white">{achievement.title}</h4>
                        <p className="text-xs text-white/70">{achievement.description}</p>
                      </div>
                      <Badge variant="secondary" className="text-xs bg-white/20 text-white border-white/30">
                        Unlocked
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-4 m-0">
          {/* Notification Settings */}
          <NotificationSettings />
        </TabsContent>

        <TabsContent value="sync" className="space-y-4 m-0">
          {/* StudyPartner Integration */}
          <StudyPartnerIntegration />
        </TabsContent>
      </Tabs>
    </div>
  )
}