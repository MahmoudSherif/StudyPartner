import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Achievement } from '@/lib/types'
import { 
  Trophy, 
  Clock, 
  Target, 
  Fire, 
  BookOpen, 
  CheckSquare 
} from '@phosphor-icons/react'

interface AchievementsProps {
  achievements: Achievement[]
}

export function Achievements({ achievements }: AchievementsProps) {
  const unlockedCount = achievements.filter(a => a.unlocked).length
  const totalCount = achievements.length

  // Group achievements by category
  const achievementsByCategory = {
    time: achievements.filter(a => a.category === 'time'),
    sessions: achievements.filter(a => a.category === 'sessions'),
    streaks: achievements.filter(a => a.category === 'streaks'),
    focus: achievements.filter(a => a.category === 'focus'),
    goals: achievements.filter(a => a.category === 'goals'),
    tasks: achievements.filter(a => a.category === 'tasks'),
    other: achievements.filter(a => !a.category)
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'time': return <Clock size={16} />
      case 'sessions': return <BookOpen size={16} />
      case 'streaks': return <Fire size={16} />
      case 'focus': return <Target size={16} />
      case 'goals': return <Trophy size={16} />
      case 'tasks': return <CheckSquare size={16} />
      default: return <Trophy size={16} />
    }
  }

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'time': return 'Time Mastery'
      case 'sessions': return 'Study Sessions'
      case 'streaks': return 'Consistency'
      case 'focus': return 'Focus Power'
      case 'goals': return 'Goal Achievement'
      case 'tasks': return 'Task Completion'
      default: return 'General'
    }
  }

  const renderAchievementCard = (achievement: Achievement) => (
    <Card 
      key={achievement.id}
      className={achievement.unlocked ? 'bg-accent/10 border-accent/20' : 'opacity-60'}
    >
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          <div className="text-3xl">
            {achievement.icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-medium text-white">{achievement.title}</h3>
              {achievement.unlocked && (
                <Badge className="bg-accent text-accent-foreground">
                  Unlocked!
                </Badge>
              )}
            </div>
            <p className="text-sm text-white/60 mb-2">
              {achievement.description}
            </p>
            {!achievement.unlocked && (
              <>
                <Progress 
                  value={(achievement.progress / achievement.requirement) * 100} 
                  className="h-2 mb-1 bg-white/10"
                />
                <div className="text-xs text-white/60">
                  {achievement.progress} / {achievement.requirement}
                  {achievement.category === 'time' && ' minutes'}
                  {achievement.category === 'sessions' && ' sessions'}
                  {achievement.category === 'focus' && ' focus sessions'}
                  {achievement.category === 'goals' && ' goals'}
                  {achievement.category === 'streaks' && ' days'}
                </div>
              </>
            )}
            {achievement.unlocked && achievement.unlockedAt && (
              <div className="text-xs text-white/60">
                Unlocked on {new Date(achievement.unlockedAt).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Achievements</h2>
        <Badge variant="secondary" className="bg-white/20 text-white">
          {unlockedCount} / {totalCount}
        </Badge>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 bg-white/10 backdrop-blur-sm">
          <TabsTrigger value="all" className="text-white data-[state=active]:bg-white/20 data-[state=active]:text-white">
            All
          </TabsTrigger>
          <TabsTrigger value="unlocked" className="text-white data-[state=active]:bg-white/20 data-[state=active]:text-white">
            Unlocked
          </TabsTrigger>
          <TabsTrigger value="progress" className="text-white data-[state=active]:bg-white/20 data-[state=active]:text-white">
            Progress
          </TabsTrigger>
          <TabsTrigger value="categories" className="text-white data-[state=active]:bg-white/20 data-[state=active]:text-white">
            Categories
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-3">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
            {achievements
              .sort((a, b) => {
                if (a.unlocked && !b.unlocked) return -1
                if (!a.unlocked && b.unlocked) return 1
                return 0
              })
              .map(renderAchievementCard)}
          </div>
        </TabsContent>

        <TabsContent value="unlocked" className="space-y-3">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
            {achievements
              .filter(a => a.unlocked)
              .sort((a, b) => new Date(b.unlockedAt || 0).getTime() - new Date(a.unlockedAt || 0).getTime())
              .map(renderAchievementCard)}
          </div>
          {unlockedCount === 0 && (
            <div className="text-center py-8 text-white/60 lg:col-span-2">
              <Trophy size={48} className="mx-auto mb-4 opacity-50" />
              <p>No achievements unlocked yet</p>
              <p className="text-sm">Start studying to unlock your first achievement!</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="progress" className="space-y-3">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
            {achievements
              .filter(a => !a.unlocked)
              .sort((a, b) => (b.progress / b.requirement) - (a.progress / a.requirement))
              .map(renderAchievementCard)}
          </div>
          {achievements.filter(a => !a.unlocked).length === 0 && (
            <div className="text-center py-8 text-white/60 lg:col-span-2">
              <Trophy size={48} className="mx-auto mb-4 text-accent" />
              <p>All achievements unlocked!</p>
              <p className="text-sm">You're a true study champion! 🎉</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          {Object.entries(achievementsByCategory)
            .filter(([_, categoryAchievements]) => categoryAchievements.length > 0)
            .map(([category, categoryAchievements]) => (
              <Card key={category} className="bg-black/40 backdrop-blur-md border-white/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white flex items-center gap-2">
                    {getCategoryIcon(category)}
                    {getCategoryTitle(category)}
                    <Badge variant="secondary" className="bg-white/20 text-white ml-auto">
                      {categoryAchievements.filter(a => a.unlocked).length} / {categoryAchievements.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {categoryAchievements
                    .sort((a, b) => {
                      if (a.unlocked && !b.unlocked) return -1
                      if (!a.unlocked && b.unlocked) return 1
                      return 0
                    })
                    .map(renderAchievementCard)}
                </CardContent>
              </Card>
            ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}