// Hook for real-time stats management
import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { statsManager, RealTimeStats } from '@/lib/statsManager'
import {
  useSessions,
  useFocusSessions,
  useTasks,
  useGoals,
  useAchievements
} from '@/hooks/useAppData'
import { useChallenges } from '@/hooks/useChallenges'

export function useRealTimeStats() {
  const { user } = useAuth()
  const [stats, setStats] = useState<RealTimeStats | null>(null)
  
  // Get all data from Supabase-backed hooks
  const [sessions] = useSessions()
  const [focusSessions] = useFocusSessions()
  const [tasks] = useTasks()
  const { challenges } = useChallenges()
  const [goals] = useGoals()
  const [achievements] = useAchievements()
  
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
    
    const currentUserId = user.uid || 'anonymous'
    
    // Only update stats if we have data
    if (sessions || focusSessions || tasks || challenges || goals || achievements) {
      statsManager.updateStats(
        sessions || [],
        focusSessions || [],
        tasks || [],
        challenges || [],
        goals || [],
        achievements || [],
        currentUserId
      )
    }
  }, [
    user?.uid,
    sessions,
    focusSessions,
    tasks,
    challenges,
    goals,
    achievements
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