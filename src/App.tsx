import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
// Simple challenge sharing removed
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { ProfileTab } from '@/components/ProfileTab'
import { NetworkStatus } from '@/components/NetworkStatus'
import { Achievements } from '@/components/Achievements'
import { SpaceBackground } from '@/components/SpaceBackground'
import { QuotesBar } from '@/components/QuotesBar'
import { Calendar } from '@/components/Calendar'
import { TasksManagement } from '@/components/TasksManagement'
import { TaskCelebration } from '@/components/TaskCelebration'
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt'
import { PWAIndicator } from '@/components/PWAIndicator'
import { OfflineIndicator } from '@/components/OfflineIndicator'
import { AchieveTab } from '@/components/AchieveTab'
import { NotesTab } from '@/components/NotesTab'
import { AuthScreen } from '@/components/AuthScreen'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import {
  useSubjects,
  useSessions,
  useAchievements,
  useTasks,
  useFocusSessions,
  useGoals
} from '@/hooks/useAppData'
import { useChallenges } from '@/hooks/useChallenges'
import { useRealTimeStats } from '@/hooks/useRealTimeStats'

import { InspirationCarousel } from '@/components/InspirationCarousel'
import { DevDiagnostics } from '@/components/DevDiagnostics'
import { StatsDebugger } from '@/components/StatsDebugger'
import { Subject, StudySession, Achievement, Task, Challenge, TaskProgress, FocusSession, Goal, UserStats } from '@/lib/types'
import { INITIAL_ACHIEVEMENTS } from '@/lib/constants'
import { newId } from '@/lib/ids'
import { calculateUserStats, updateAchievements } from '@/lib/utils'
import { useTouchGestures } from '@/hooks/useTouchGestures'
import { usePWA } from '@/hooks/usePWA'
import { useMobileBehavior } from '@/hooks/useDeviceDetection'
import { mobileFeedback } from '@/lib/mobileFeedback'
import { notificationManager, initializeNotifications } from '@/lib/notifications'
import { 
  Clock, 
  ChartBar, 
  Trophy, 
  BookOpen, 
  Calendar as CalendarIcon,
  CheckSquare,
  Lightbulb,
  Target,
  Note,
  User
} from '@phosphor-icons/react'
import { toast, Toaster } from 'sonner'

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

function AppContent() {
  // ALL HOOKS MUST BE DECLARED FIRST - BEFORE ANY CONDITIONAL RETURNS
  const { user, loading, signOut } = useAuth()
  
  // Firebase-synced data - these will automatically sync with Firestore
  const [subjects, setSubjects] = useSubjects()
  const [sessions, setSessions] = useSessions()
  const [achievements, setAchievements] = useAchievements()
  const [tasks, setTasks] = useTasks()
  // Challenges are server-owned: scores are derived from completion rows, so
  // there is no writable local array. Mutations go through these operations.
  const {
    challenges,
    nameFor: resolveMemberName,
    create: createChallengeOp,
    join: joinChallengeOp,
    addTask: addChallengeTaskOp,
    toggleTask: toggleChallengeTaskOp,
    end: endChallengeOp,
    remove: deleteChallengeOp
  } = useChallenges()
  // Active challenge code for real-time subscription
  const [activeChallengeCode, setActiveChallengeCode] = useState<string | null>(null)
  const [focusSessions, setFocusSessions] = useFocusSessions()
  const [goals, setGoals] = useGoals()
  const [currentTab, setCurrentTab] = useState('achieve')
  const lastTabSwitchRef = useRef(Date.now())

  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
  const [lastSessionDuration, setLastSessionDuration] = useState(0)

  // Use ref to track pending challenge task toggles and prevent race conditions
  const pendingTogglesRef = useRef<Set<string>>(new Set())

  // Use ref to track previous achievements without causing re-renders
  const previousAchievementsRef = useRef<Achievement[]>([])

  const [celebrationData, setCelebrationData] = useState<{
    isOpen: boolean
    taskTitle: string
    isChallenge: boolean
    challengeTitle?: string
    points?: number
  }>({
    isOpen: false,
    taskTitle: '',
    isChallenge: false
  })
  const [showChallengeProgress, setShowChallengeProgress] = useState(false)
  const [activeTaskProgress, setActiveTaskProgress] = useState(0)
  const [remainingTime, setRemainingTime] = useState<number | null>(null)
  const [previousDailyProgress, setPreviousDailyProgress] = useState(0)
  const [previousChallengeProgress, setPreviousChallengeProgress] = useState(0)

  
  // Use real-time stats management - MUST be called before any conditional returns
  const { 
    userStats: stats, 
    achievements: realTimeAchievements, 
    taskProgress, 
    weeklyProgress, 
    monthlyProgress,
    isLoading: statsLoading 
  } = useRealTimeStats()

  // Display names come from the public profile projection, resolved in bulk by
  // useChallenges. The old implementation fetched each participant's full
  // profile document, which also carried their email address.
  const resolveUserName = resolveMemberName

  // Name lookup handed to child components. Sourced from the public profile
  // projection (display name + avatar only), never from the private profile.
  const userNames = useMemo(() => {
    const ids = new Set<string>()
    challenges.forEach(c => {
      c.participants.forEach(p => ids.add(p))
      if (c.createdBy) ids.add(c.createdBy)
    })
    return Object.fromEntries(Array.from(ids).map(id => [id, resolveMemberName(id)]))
  }, [challenges, resolveMemberName])

  // Mobile and PWA hooks
  const { isStandalone, isInstallable, installApp } = usePWA()
  const deviceInfo = useMobileBehavior()

  // Touch gestures for tab navigation
  const containerRef = useTouchGestures({
    onSwipeLeft: () => {
      const tabs = ['achieve', 'tasks', 'calendar', 'notes', 'profile', 'achievements', 'inspiration']
      const currentIndex = tabs.indexOf(currentTab)
      if (currentIndex < tabs.length - 1) {
        setCurrentTab(tabs[currentIndex + 1])
      }
    },
    onSwipeRight: () => {
      const tabs = ['achieve', 'tasks', 'calendar', 'notes', 'profile', 'achievements', 'inspiration']
      const currentIndex = tabs.indexOf(currentTab)
      if (currentIndex > 0) {
        setCurrentTab(tabs[currentIndex - 1])
      }
    },
    threshold: 100
  })

  // Initialize notifications and network error interceptor on app start
  useEffect(() => {
    const setupNotifications = async () => {
      try {
        const initialized = await initializeNotifications();
        // Notifications initialized silently for production
      } catch (error) {
        // Silent failure for notifications in production
      }
    };

    setupNotifications();
  }, []);

  // Challenges load, refresh and stay live inside useChallenges: it fetches the
  // caller's own challenges through RLS and subscribes to task, completion and
  // challenge changes. The previous implementation hand-rolled all three here.

  // Track the active challenge code for the header/summary.
  useEffect(() => {
    if (activeChallengeCode) return
    const firstActive = challenges.find(c => c.isActive)
    if (firstActive) setActiveChallengeCode(firstActive.code)
  }, [challenges, activeChallengeCode])

  // Enhanced error handling for unhandled errors and promise rejections
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Unhandled error:', event.error)
    }

    const handleRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason)
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleRejection)

    // Debounce for repetitive Firestore terminate errors caused by blockers
    const seenErrors: Record<string, number> = {}
    const originalConsoleError = console.error
    console.error = function (...args) {
      try {
        const msg = args.join(' ') || ''
        // Completely suppress common Firestore blocking errors (expected with ad blockers)
        if (/ERR_BLOCKED_BY_CLIENT|net::ERR_BLOCKED_BY_CLIENT/i.test(msg)) {
          return // Silently ignore blocked by client errors
        }
        if (/Firestore.*(terminate|connection.*closed)/i.test(msg)) {
          const key = msg.replace(/gsessionid=[^&]+/,'gsessionid=*')
          const now = Date.now()
            if (seenErrors[key] && now - seenErrors[key] < 10000) {
              // Suppress duplicate within 10s
              return
            }
          seenErrors[key] = now
        }
      } catch {
        /* never let the log filter itself throw and swallow a real error */
      }
      originalConsoleError.apply(console, args as any)
    }

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleRejection)
      console.error = originalConsoleError
    }
  }, [])

  // Prevent zooming on double tap
  useEffect(() => {
    const preventDefault = (e: TouchEvent) => {
      if (e.touches && e.touches.length > 1) {
        e.preventDefault()
      }
    }

    const preventZoom = (e: TouchEvent) => {
      const t2 = e.timeStamp
      const target = e.currentTarget as HTMLElement
      if (!target || !target.dataset) return
      
      const t1 = parseFloat(target.dataset.lastTouch || t2.toString())
      const dt = t2 - t1
      const fingers = e.touches ? e.touches.length : 0
      target.dataset.lastTouch = t2.toString()

      if (!dt || dt > 500 || fingers > 1) return // not double-tap

      e.preventDefault()
      if (e.target && typeof (e.target as HTMLElement).click === 'function') {
        (e.target as HTMLElement).click()
      }
    }

    document.addEventListener('touchstart', preventDefault, { passive: false })
    document.addEventListener('touchstart', preventZoom, { passive: false })

    return () => {
      document.removeEventListener('touchstart', preventDefault)
      document.removeEventListener('touchstart', preventZoom)
    }
  }, [])

  // Handle URL tab parameter for PWA shortcuts
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const tabParam = urlParams.get('tab')
    if (tabParam && ['achieve', 'tasks', 'calendar', 'notes', 'profile', 'achievements', 'inspiration'].includes(tabParam)) {
      setCurrentTab(tabParam)
    }
  }, [])

  // Tab-aware visibility optimization - log tab switches for analytics
  useEffect(() => {
    const now = Date.now()
    const timeSinceLastSwitch = now - lastTabSwitchRef.current
    lastTabSwitchRef.current = now

    // Log tab switch for analytics (only if more than 1 second since last switch)
    if (timeSinceLastSwitch > 1000) {
      console.log(`📑 Switched to ${currentTab} tab`)
    }

    // Optional: Trigger data refresh if tab was idle for more than 5 minutes
    // This ensures data is fresh when users return to a tab
    if (timeSinceLastSwitch > 300000) { // 5 minutes
      console.log(`🔄 Tab was idle for >5 min, data should be fresh via listeners`)
    }
  }, [currentTab])

  // Progress tracking and milestone notifications (only when user is logged in)
  useEffect(() => {
    if (!user) return
    
    try {
      const today = new Date()
      const todayTasks = (tasks || []).filter(task => {
        const taskDate = new Date(task.createdAt)
        return taskDate.toDateString() === today.toDateString()
      })
      
      const completedTodayTasks = todayTasks.filter(task => task.completed)
      
      const dailyProgress = {
        total: todayTasks.length,
        completed: completedTodayTasks.length,
        percentage: todayTasks.length > 0 ? (completedTodayTasks.length / todayTasks.length) * 100 : 0
      }

      const currentUserId = user?.uid || 'anonymous'
      const activeChallenge = (challenges || []).find(challenge => 
        challenge.isActive && challenge.participants.includes(currentUserId)
      )

      let challengeProgress: any = undefined
      if (activeChallenge && showChallengeProgress) {
        const userCompletedTasks = activeChallenge.tasks.filter(task => 
          task.completedBy.includes(currentUserId)
        )
        const userPoints = userCompletedTasks.reduce((total, task) => total + task.points, 0)
        const maxPoints = activeChallenge.tasks.reduce((total, task) => total + task.points, 0)
        
        challengeProgress = {
          challengeTitle: activeChallenge.title,
          userPoints,
          maxPoints,
          pointsPercentage: maxPoints > 0 ? (userPoints / maxPoints) * 100 : 0,
          completedTasks: userCompletedTasks.length,
          totalTasks: activeChallenge.tasks.length
        }
      }

      const taskProgress = {
        dailyTasks: dailyProgress,
        challengeProgress
      }

      const dailyPercentage = taskProgress.dailyTasks.percentage
      const challengePointsPercentage = taskProgress.challengeProgress?.pointsPercentage || 0

      // Check daily task milestones (25%, 50%, 75%, 100%)
      const dailyMilestones = [25, 50, 75, 100]
      const reachedDailyMilestone = dailyMilestones.find(milestone => 
        dailyPercentage >= milestone && previousDailyProgress < milestone
      )

      if (reachedDailyMilestone && dailyPercentage > 0) {
        mobileFeedback.progressMilestone()
        toast.success(`Daily Progress: ${reachedDailyMilestone}% complete! 🎯`, {
          description: `${taskProgress.dailyTasks.completed}/${taskProgress.dailyTasks.total} tasks done today`,
        })
      }

      // Check challenge milestones (based on points percentage)
      const challengeMilestones = [25, 50, 75, 100]
      const reachedChallengeMilestone = challengeMilestones.find(milestone => 
        challengePointsPercentage >= milestone && previousChallengeProgress < milestone
      )

      if (reachedChallengeMilestone && challengePointsPercentage > 0 && taskProgress.challengeProgress) {
        mobileFeedback.progressMilestone()
        toast.success(`Challenge Progress: ${reachedChallengeMilestone}% complete! 🏆`, {
          description: `${taskProgress.challengeProgress.userPoints}/${taskProgress.challengeProgress.maxPoints} points in ${taskProgress.challengeProgress.challengeTitle}`,
        })
      }

      setPreviousDailyProgress(dailyPercentage)
      setPreviousChallengeProgress(challengePointsPercentage)
    } catch (error) {
      // Silent error handling for milestone tracking
    }
  }, [user, tasks, challenges, showChallengeProgress, previousDailyProgress, previousChallengeProgress])

  // Memoize expensive stats calculation
  const userStats = useMemo(() => {
    if (!user?.uid) return null
    return calculateUserStats(
      sessions || [],
      focusSessions || [],
      tasks || [],
      challenges || [],
      user.uid
    )
  }, [user?.uid, sessions, focusSessions, tasks, challenges])

  // Achievement tracking (only when user is logged in)
  useEffect(() => {
    if (!user || !userStats || !achievements) return

    try {
      const updatedAchievements = updateAchievements(
        achievements,
        userStats,
        sessions || [],
        focusSessions || [],
        goals || []
      )

      // Check for newly unlocked achievements by comparing with previous state
      const newlyUnlocked = updatedAchievements.filter((achievement, index) => {
        const prevAchievement = previousAchievementsRef.current[index]
        return achievement.unlocked && (!prevAchievement || !prevAchievement.unlocked)
      })

      // Update the ref before setting state
      previousAchievementsRef.current = updatedAchievements

      // Only update if achievements actually changed
      const achievementsChanged = JSON.stringify(achievements) !== JSON.stringify(updatedAchievements)
      if (!achievementsChanged) return

      setAchievements(updatedAchievements)

      if (newlyUnlocked.length > 0) {
        newlyUnlocked.forEach(async (achievement) => {
          // Trigger achievement haptic feedback
          mobileFeedback.achievement()

          // Show in-app toast
          toast.success(`Achievement Unlocked: ${achievement.title}`, {
            description: achievement.description,
            duration: 5000
          })

          // Send push notification
          try {
            await notificationManager.notifyAchievementUnlock(
              achievement.title,
              achievement.description
            )
          } catch (error) {
            // Silent notification failure
          }
        })
      }
    } catch (error) {
      // Silent error handling for achievements update
    }
  }, [user, userStats, sessions, focusSessions, goals])

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <SpaceBackground />
        <div className="relative z-10 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-white/80">Loading...</p>
        </div>
      </div>
    )
  }
  
  // Show auth screen if user is not logged in
  if (!user) {
    return <AuthScreen />
  }
  
  // Get current user ID from Firebase Auth
  const currentUserId = user?.uid || 'anonymous'
  
  // Provide default values to prevent type errors
  const defaultStats: UserStats = {
    totalStudyTime: 0,
    streak: 0,
    longestStreak: 0,
    sessionsCompleted: 0,
    averageSessionLength: 0,
    tasksCompleted: 0,
    challengeTasksCompleted: 0
  }
  
  const defaultTaskProgress: TaskProgress = {
    dailyTasks: { total: 0, completed: 0, percentage: 0 },
    challengeProgress: undefined
  }
  
  // Combine regular study sessions and focus sessions for activity tracking
  const allSessions = [
    ...(sessions || []),
    ...(focusSessions || []).map(fs => ({
      id: fs.id,
      subjectId: 'focus',
      startTime: fs.startTime,
      endTime: fs.endTime || fs.startTime,
      duration: fs.duration,
      completed: fs.completed
    } as StudySession))
  ]

  const handleAddSubject = (subjectData: Omit<Subject, 'id'>) => {
    const newSubject: Subject = {
      ...subjectData,
      id: newId()
    }
    setSubjects(current => [...(current || []), newSubject])
    toast.success(`Added subject: ${newSubject.name}`)
  }

  const handleDeleteSubject = (id: string) => {
    const subject = (subjects || []).find(s => s.id === id)
    setSubjects(current => (current || []).filter(s => s.id !== id))
    setSessions(current => (current || []).filter(s => s.subjectId !== id))
    
    if (selectedSubject?.id === id) {
      setSelectedSubject(null)
    }
    
    toast.success(`Deleted subject: ${subject?.name}`)
    }

  const handleUpdateSubject = (id: string, updates: Partial<Subject>) => {
    setSubjects(current => 
      current.map(subject => 
        subject.id === id ? { ...subject, ...updates } : subject
      )
    )
    
    // Update selected subject if it's the one being updated
    if (selectedSubject?.id === id) {
      setSelectedSubject(current => current ? { ...current, ...updates } : current)
    }
    
    toast.success('Subject updated successfully')
  }

  const handleSessionComplete = (duration: number) => {
    try {
      if (!selectedSubject) return

      const session: StudySession = {
        id: newId(),
        subjectId: selectedSubject.id,
        startTime: new Date(),
        endTime: new Date(),
        duration: Math.round(duration),
        completed: true
      }

      setSessions(current => [...(current || []), session])
      
      // Update subject total time
      setSubjects(current => 
        (current || []).map(subject => 
          subject.id === selectedSubject.id 
            ? { ...subject, totalTime: subject.totalTime + Math.round(duration) }
            : subject
        )
      )

      // Trigger haptic feedback for study session completion
      mobileFeedback.studySessionComplete()

      setLastSessionDuration(Math.round(duration))
      
      toast.success(`Great job! You studied ${selectedSubject.name} for ${Math.round(duration)} minutes.`)
    } catch (error) {
      toast.error('Failed to save session. Please try again.')
    }
  }

  const handleSessionCancel = () => {
    toast.info('Study session cancelled')
  }

  // Update achievements function
  const handleUpdateAchievements = (newAchievements: Achievement[]) => {
    setAchievements(newAchievements)
  }

  // Task management functions
  const handleAddTask = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: newId(),
      createdAt: new Date()
    }
    setTasks(current => [...(current || []), newTask])
  }

  const handleToggleTask = (taskId: string) => {
    try {
      const task = tasks.find(t => t.id === taskId)
      if (!task) return

      const updatedTask = {
        ...task,
        completed: !task.completed,
        completedAt: !task.completed ? new Date() : undefined
      }

      setTasks(current => 
        (current || []).map(t => t.id === taskId ? updatedTask : t)
      )

      if (!task.completed) {
        // Trigger haptic feedback for task completion
        mobileFeedback.taskComplete()
        
        // Show celebration for completed task
        setCelebrationData({
          isOpen: true,
          taskTitle: task.title,
          isChallenge: false
        })

        // Milestone notifications for personal tasks
        try {
          const completedCount = (tasks.filter(t => t.completed).length) + 1 // include this one
          const milestones = [5, 10, 25, 50, 100]
          const reached = milestones.find(m => completedCount === m)
          if (reached) {
            toast.success(`Task Milestone: ${reached} personal tasks completed!`, { description: 'Keep the streak going 💪' })
          }
        } catch {
          /* milestone toasts are cosmetic; never fail the toggle over one */
        }
      }
    } catch (error) {
      toast.error('Failed to update task. Please try again.')
    }
  }

  const handleDeleteTask = (taskId: string) => {
    setTasks(current => (current || []).filter(t => t.id !== taskId))
    toast.success('Task deleted')
  }

  // ---- Challenge management -------------------------------------------------
  //
  // Each of these is now a single server call. The previous versions merged
  // task arrays client-side, retried reads, wrote to several mirrored copies of
  // the same challenge, and recomputed scores locally. Scores are derived from
  // completion rows in Postgres now, so none of that is needed -- and none of
  // it can be forged.

  const handleCreateChallenge = async (challengeData: Omit<Challenge, 'id' | 'createdAt'>) => {
    try {
      const { data, error } = await createChallengeOp(
        challengeData.title,
        challengeData.description,
        challengeData.endDate ?? null
      )
      if (error || !data) {
        toast.error(error || 'Failed to create challenge')
        return
      }
      setActiveChallengeCode(data.code)
      toast.success(`Challenge created! Share code: ${data.code}`)
    } catch (error) {
      console.error('Error creating challenge:', error)
      toast.error('Failed to create challenge. Please try again.')
    }
  }

  const handleJoinChallenge = async (code: string) => {
    try {
      const trimmed = (code || '').trim().toUpperCase()
      if (!trimmed) {
        toast.error('Please enter a challenge code')
        return
      }
      if (challenges.some(c => c.code === trimmed)) {
        toast.info('You have already joined this challenge')
        setActiveChallengeCode(trimmed)
        return
      }

      const { error } = await joinChallengeOp(trimmed)
      if (error) {
        toast.error(error)
        return
      }
      setActiveChallengeCode(trimmed)
      toast.success('Joined challenge!')
    } catch (error) {
      console.error('Error joining challenge:', error)
      toast.error('Failed to join challenge. Please try again.')
    }
  }

  const handleAddChallengeTask = async (
    challengeId: string,
    taskData: Omit<import('@/lib/types').ChallengeTask, 'id' | 'createdAt' | 'completedBy'>
  ) => {
    // Row Level Security also enforces creator-only inserts; this check exists
    // only so the UI can explain the refusal instead of showing a raw error.
    const challenge = challenges.find(c => c.id === challengeId)
    if (!challenge) {
      toast.error('Challenge not found')
      return
    }
    if (challenge.createdBy !== currentUserId) {
      toast.error('Only the challenge creator can add tasks')
      return
    }

    const { error } = await addChallengeTaskOp(challengeId, {
      title: taskData.title,
      description: taskData.description,
      points: taskData.points
    })
    if (error) {
      toast.error(error)
      return
    }
    toast.success('Task added to challenge!')
  }

  const handleToggleChallengeTask = async (challengeId: string, taskId: string) => {
    const key = `${challengeId}:${taskId}`
    if (pendingTogglesRef.current.has(key)) return

    const challenge = challenges.find(c => c.id === challengeId)
    const task = challenge?.tasks.find(t => t.id === taskId)
    if (!challenge || !task) return

    const wasCompleted = !!task.completions?.[currentUserId]?.completed

    try {
      pendingTogglesRef.current.add(key)
      const { error } = await toggleChallengeTaskOp(challengeId, taskId)
      if (error) {
        toast.error(error)
        return
      }

      if (!wasCompleted) {
        mobileFeedback.taskComplete()
        setCelebrationData({
          isOpen: true,
          taskTitle: task.title,
          isChallenge: true,
          challengeTitle: challenge.title,
          points: task.points
        })
      }
    } finally {
      pendingTogglesRef.current.delete(key)
    }
  }

  const handleDeleteChallenge = async (challengeId: string) => {
    const { error } = await deleteChallengeOp(challengeId)
    if (error) {
      toast.error(error)
      return
    }
    toast.success('Challenge deleted')
  }


  const handleSwitchProgressView = () => {
    setShowChallengeProgress(!showChallengeProgress)
  }

  const handleEndChallenge = async (challengeId: string) => {
    const challenge = challenges.find(c => c.id === challengeId)

    // The winner is decided by the database from the completion rows, not sent
    // from here. Whoever ends the challenge could otherwise nominate anyone --
    // including themselves -- and the frozen snapshot was never revisited.
    const { data: updated, error } = await endChallengeOp(challengeId)
    if (error) {
      toast.error('Failed to end challenge: ' + error)
      return
    }

    mobileFeedback.achievement()

    const winnerIds = updated?.winnerIds ?? []
    const isCurrentUserWinner = winnerIds.includes(currentUserId)
    const winnerNames = winnerIds.map(id => resolveUserName(id)).join(', ')

    toast.success(
      isCurrentUserWinner
        ? `🏆 Congratulations! You won "${challenge?.title}"!`
        : `Challenge "${challenge?.title}" has ended!`,
      {
        description: isCurrentUserWinner
          ? 'You are the challenge champion!'
          : winnerNames
            ? `Winner: ${winnerNames}`
            : 'No tasks were completed.',
        duration: 5000
      }
    )

    try {
      const points = updated?.finalPointsByUser?.[currentUserId] ?? 0
      if (isCurrentUserWinner) {
        await notificationManager.notifyChallengeWin(challenge?.title || 'Challenge', points)
      } else {
        await notificationManager.notifyChallengeComplete(
          challenge?.title || 'Challenge',
          winnerNames || 'nobody'
        )
      }
    } catch {
      // Notifications are best-effort.
    }
  }


  return (
    <div className="min-h-screen relative mobile-scroll-container" ref={containerRef as React.RefObject<HTMLDivElement>}>
      <SpaceBackground />
      <OfflineIndicator />
      {!isStandalone && <PWAInstallPrompt />}
      <PWAIndicator />

      <div className="relative z-10 container max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-6xl mx-auto p-4 pb-32 md:pb-28 no-select">
        {/* Inside the container, not floating behind the starfield: this only
            renders when a collection genuinely failed to sync, and it needs to
            be legible when it does. */}
        <NetworkStatus />
        <header className="text-center py-6">
          <div className="flex items-center justify-between">
            <div className="flex-1"></div>
            <div className="flex-1">
              <h1 className="text-2xl lg:text-4xl font-bold text-white drop-shadow-lg" data-testid="main-title">MotivaMate</h1>
              <p className="text-white/80 text-sm lg:text-base drop-shadow">Your mobile study companion</p>
              {user && (
                <div className="mt-2 text-xs lg:text-sm text-white/60">
                  Connected as {user.displayName || user.email?.split('@')[0]}
                </div>
              )}
            </div>
            <div className="flex-1 flex justify-end gap-2">
              {!isStandalone && isInstallable && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => installApp()}
                  className="text-xs lg:text-sm bg-white/10 text-white hover:bg-white/20 border-white/20"
                >Install</Button>
              )}
              {user && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    const { error } = await signOut()
                    if (error) {
                      toast.error('Failed to sign out')
                    }
                  }}
                  className="text-white/70 hover:text-white hover:bg-white/10 text-xs lg:text-sm"
                >
                  Sign Out
                </Button>
              )}
            </div>
          </div>
        </header>

        <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
          <div className="sticky top-0 bg-black/20 backdrop-blur-md z-20 py-2 rounded-lg border border-white/10">
            <TabsList className="w-full flex md:grid gap-0.5 md:gap-1 bg-white/10 backdrop-blur-sm md:grid-cols-7 px-1 overflow-x-auto snap-x snap-mandatory scrollbar-none touch-pan-x"
                      style={{ WebkitOverflowScrolling: 'touch' }}>
              <TabsTrigger value="achieve" className="flex flex-col justify-center items-center gap-0.5 md:gap-1 h-16 md:h-12 text-white data-[state=active]:bg-white/20 data-[state=active]:text-white transition-all duration-200 px-1.5 md:px-2 py-1 min-w-[52px] md:min-w-0 flex-shrink-0 snap-start">
                <Target size={16} className="md:size-5" />
                <span className="text-[9px] md:text-xs font-medium whitespace-nowrap">Achieve</span>
              </TabsTrigger>
              <TabsTrigger value="tasks" data-testid="tasks-tab" className="flex flex-col justify-center items-center gap-0.5 md:gap-1 h-16 md:h-12 text-white data-[state=active]:bg-white/20 data-[state=active]:text-white transition-all duration-200 px-1.5 md:px-2 py-1 min-w-[52px] md:min-w-0 flex-shrink-0 snap-start">
                <CheckSquare size={16} className="md:size-5" />
                <span className="text-[9px] md:text-xs font-medium whitespace-nowrap">Tasks</span>
              </TabsTrigger>
              <TabsTrigger value="calendar" className="flex flex-col justify-center items-center gap-0.5 md:gap-1 h-16 md:h-12 text-white data-[state=active]:bg-white/20 data-[state=active]:text-white transition-all duration-200 px-1.5 md:px-2 py-1 min-w-[52px] md:min-w-0 flex-shrink-0 snap-start">
                <CalendarIcon size={16} className="md:size-5" />
                <span className="text-[9px] md:text-xs font-medium whitespace-nowrap">Calendar</span>
              </TabsTrigger>
              <TabsTrigger value="notes" data-testid="notes-tab" className="flex flex-col justify-center items-center gap-0.5 md:gap-1 h-16 md:h-12 text-white data-[state=active]:bg-white/20 data-[state=active]:text-white transition-all duration-200 px-1.5 md:px-2 py-1 min-w-[52px] md:min-w-0 flex-shrink-0 snap-start">
                <Note size={16} className="md:size-5" />
                <span className="text-[9px] md:text-xs font-medium whitespace-nowrap">Notes</span>
              </TabsTrigger>
              <TabsTrigger value="profile" data-testid="profile-tab" className="flex flex-col justify-center items-center gap-0.5 md:gap-1 h-16 md:h-12 text-white data-[state=active]:bg-white/20 data-[state=active]:text-white transition-all duration-200 px-1.5 md:px-2 py-1 min-w-[52px] md:min-w-0 flex-shrink-0 snap-start">
                <User size={16} className="md:size-5" />
                <span className="text-[9px] md:text-xs font-medium whitespace-nowrap">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="achievements" className="flex flex-col justify-center items-center gap-0.5 md:gap-1 h-16 md:h-12 text-white data-[state=active]:bg-white/20 data-[state=active]:text-white transition-all duration-200 px-1.5 md:px-2 py-1 min-w-[52px] md:min-w-0 flex-shrink-0 snap-start">
                <Trophy size={16} className="md:size-5" />
                <span className="text-[9px] md:text-xs font-medium whitespace-nowrap">Awards</span>
              </TabsTrigger>
              <TabsTrigger value="inspiration" className="flex flex-col justify-center items-center gap-0.5 md:gap-1 h-16 md:h-12 text-white data-[state=active]:bg-white/20 data-[state=active]:text-white transition-all duration-200 px-1.5 md:px-2 py-1 min-w-[52px] md:min-w-0 flex-shrink-0 snap-start">
                <Lightbulb size={16} className="md:size-5" />
                <span className="text-[9px] md:text-xs font-medium whitespace-nowrap">Inspire</span>
              </TabsTrigger>
              {/* Temporarily disabled debug tab to fix React hooks error
              <TabsTrigger value="debug" className="min-w-[72px] flex-col lg:flex-row gap-1 lg:gap-2 h-12 lg:h-12 text-white data-[state=active]:bg-white/20 data-[state=active]:text-white transition-all duration-200 text-[11px] lg:text-sm px-2 py-1">
                <ChartBar size={16} className="lg:size-5" />
                <span className="text-xs lg:text-sm">Debug</span>
              </TabsTrigger>
              */}
            </TabsList>
          </div>

          <TabsContent value="achieve" className="space-y-4 m-0">
            <div className="bg-black/20 backdrop-blur-md rounded-lg border border-white/10 p-4 lg:p-6">
              <AchieveTab 
                achievements={realTimeAchievements}
                onUpdateAchievements={handleUpdateAchievements}
                goals={goals}
                setGoals={setGoals}
                focusSessions={focusSessions}
                setFocusSessions={setFocusSessions}
              />
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-4 m-0">
            <div className="bg-black/20 backdrop-blur-md rounded-lg border border-white/10 p-4 lg:p-6">
              <TasksManagement
                tasks={tasks}
                challenges={challenges}
                subjects={subjects}
                taskProgress={taskProgress || defaultTaskProgress}
                currentUserId={currentUserId}
                onAddTask={handleAddTask}
                onToggleTask={handleToggleTask}
                onDeleteTask={handleDeleteTask}
                onCreateChallenge={handleCreateChallenge}
                onJoinChallenge={handleJoinChallenge}
                onAddChallengeTask={handleAddChallengeTask}
                onToggleChallengeTask={handleToggleChallengeTask}
                onSwitchProgressView={handleSwitchProgressView}
                onEndChallenge={handleEndChallenge}
                userNames={userNames}
              />
            </div>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-4 m-0">
            <div className="bg-black/20 backdrop-blur-md rounded-lg border border-white/10 p-4 lg:p-6">
              <Calendar subjects={subjects} />
            </div>
          </TabsContent>

          <TabsContent value="notes" className="space-y-4 m-0">
            <div className="bg-black/20 backdrop-blur-md rounded-lg border border-white/10 p-4 lg:p-6">
              <NotesTab />
            </div>
          </TabsContent>

          <TabsContent value="profile" className="space-y-4 m-0">
            <div className="bg-black/20 backdrop-blur-md rounded-lg border border-white/10 p-4 lg:p-6">
              <ProfileTab stats={stats || defaultStats} achievements={achievements} sessions={sessions} focusSessions={focusSessions} tasks={tasks} challenges={challenges} />
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-4 m-0">
            <div className="bg-black/20 backdrop-blur-md rounded-lg border border-white/10 p-4 lg:p-6">
              <Achievements achievements={realTimeAchievements} />
            </div>
          </TabsContent>

          <TabsContent value="inspiration" className="space-y-4 m-0">
            <div className="bg-black/20 backdrop-blur-md rounded-lg border border-white/10 p-4 lg:p-6">
              <InspirationCarousel />
            </div>
          </TabsContent>

          {/* Temporarily disabled debug tab to fix React hooks error
          <TabsContent value="debug" className="space-y-4 m-0">
            <div className="bg-black/20 backdrop-blur-md rounded-lg border border-white/10 p-4 lg:p-6">
              <StatsDebugger />
            </div>
          </TabsContent>
          */}
        </Tabs>
      </div>

      <QuotesBar />

      <TaskCelebration
        isOpen={celebrationData.isOpen}
        onClose={() => setCelebrationData({ ...celebrationData, isOpen: false })}
        taskTitle={celebrationData.taskTitle}
        isChallenge={celebrationData.isChallenge}
        challengeTitle={celebrationData.challengeTitle}
        points={celebrationData.points}
      />

      <Toaster 
        position="top-center" 
        richColors 
        closeButton
        toastOptions={{
          style: {
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
          }
        }}
      />
  <DevDiagnostics challenges={challenges} activeCode={activeChallengeCode} />
    </div>
  )
}

export default App