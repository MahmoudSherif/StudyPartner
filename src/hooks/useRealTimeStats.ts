// Hook for real-time stats management
import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { statsManager, RealTimeStats } from '@/lib/statsManager'
import { 
  useFirebaseSessions, 
  useFirebaseFocusSessions, 
  useFirebaseTasks, 
  useFirebaseChallenges, 
  useFirebaseGoals, 
  useFirebaseAchievements 
} from '@/hooks/useFirebaseData'

export function useRealTimeStats() {
  const { user } = useAuth()
  const [stats, setStats] = useState<RealTimeStats | null>(null)
  
  // Get all data from Firebase hooks
  const [sessions] = useFirebaseSessions()
  const [focusSessions] = useFirebaseFocusSessions()
  const [tasks] = useFirebaseTasks()
  const [challenges] = useFirebaseChallenges()
  const [goals] = useFirebaseGoals()
  const [achievements] = useFirebaseAchievements()
  
  const currentUserId = user?.uid || 'anonymous'
  
  // Subscribe to stats updates
  useEffect(() => {
    if (!user?.uid) {
      setStats(null)
      return
    }
    
    const unsubscribe = statsManager.subscribe((newStats) => {
      setStats(newStats)
    })
    
    return unsubscribe
  }, [user?.uid])
  
  // Update stats whenever any data changes
  useEffect(() => {
    if (!user?.uid) return
    
    const newStats = statsManager.updateStats(
      sessions || [],
      focusSessions || [],
      tasks || [],
      challenges || [],
      goals || [],
      achievements || [],
      currentUserId
    )
    
    setStats(newStats)
  }, [
    user?.uid,
    sessions,
    focusSessions,
    tasks,
    challenges,
    goals,
    achievements,
    currentUserId
  ])
  
  return {
    stats,
    userStats: stats?.userStats,
    achievements: stats?.achievements || [],
    taskProgress: stats?.taskProgress,
    weeklyProgress: stats?.weeklyProgress,
    monthlyProgress: stats?.monthlyProgress,
    isLoading: !stats && !!user?.uid
  }
} 