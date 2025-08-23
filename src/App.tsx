import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { ProfileTab } from '@/components/ProfileTab'
import { Achievements } from '@/components/Achievements'
import { SpaceBackground } from '@/components/SpaceBackground'
import { QuotesBar } from '@/components/QuotesBar'
import { Calendar } from '@/components/Calendar'
import { TasksManagement } from '@/components/TasksManagement'
import { TaskCelebration } from '@/components/TaskCelebration'
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt'
import { OfflineIndicator } from '@/components/OfflineIndicator'
import { NetworkBlockIndicator } from '@/components/NetworkBlockIndicator'
import { FirebaseStatusIndicator } from '@/components/FirebaseStatusIndicator'
import { AchieveTab } from '@/components/AchieveTab'
import { NotesTab } from '@/components/NotesTab'
import { AuthScreen } from '@/components/AuthScreen'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { firestoreService } from '@/lib/firestore'
import { 
  useFirebaseSubjects,
  useFirebaseSessions,
  useFirebaseAchievements,
  useFirebaseTasks,
  useFirebaseFocusSessions,
  useFirebaseGoals
} from '@/hooks/useFirebaseData'

import { InspirationCarousel } from '@/components/InspirationCarousel'
import { Subject, StudySession, Achievement, Task, Challenge, TaskProgress, FocusSession, Goal } from '@/lib/types'
import { INITIAL_ACHIEVEMENTS } from '@/lib/constants'
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
  const [subjects, setSubjects] = useFirebaseSubjects()
  const [sessions, setSessions] = useFirebaseSessions()
  const [achievements, setAchievements] = useFirebaseAchievements()
  const [tasks, setTasks] = useFirebaseTasks()
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [focusSessions, setFocusSessions] = useFirebaseFocusSessions()
  const [goals, setGoals] = useFirebaseGoals()
  const [currentTab, setCurrentTab] = useState('achieve')
  
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
  const [lastSessionDuration, setLastSessionDuration] = useState(0)
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

  // Mobile and PWA hooks
  const { isStandalone } = usePWA()
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

  // Initialize notifications on app start
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

  // Load user's challenges when they log in
  useEffect(() => {
    const loadUserChallenges = async () => {
      if (!user?.uid) {
        setChallenges([])
        return
      }

      try {
        const result = await firestoreService.getUserChallenges(user.uid)
        if (result.data) {
          setChallenges(result.data)
        } else if (result.error) {
          console.warn('Failed to load user challenges:', result.error)
        }
      } catch (error) {
        console.error('Error loading user challenges:', error)
      }
    }

    loadUserChallenges()
  }, [user?.uid])

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

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleRejection)
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

  // Handle URL tab parameter for PWA shortcuts
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const tabParam = urlParams.get('tab')
    if (tabParam && ['achieve', 'tasks', 'calendar', 'notes', 'profile', 'achievements', 'inspiration'].includes(tabParam)) {
      setCurrentTab(tabParam)
    }
  }, [])

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

  // Achievement tracking (only when user is logged in)
  useEffect(() => {
    if (!user) return
    
    try {
      const stats = calculateUserStats(sessions || [], focusSessions || [])
      const updatedAchievements = updateAchievements(achievements || [], stats, sessions || [], focusSessions || [], goals || [])
      
      // Check for newly unlocked achievements
      const newlyUnlocked = updatedAchievements.filter((achievement, index) => 
        achievement.unlocked && !(achievements || [])[index]?.unlocked
      )
      
      if (newlyUnlocked.length > 0) {
        setAchievements(updatedAchievements)
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
      } else {
        setAchievements(updatedAchievements)
      }
    } catch (error) {
      // Silent error handling for achievements update
    }
  }, [user, sessions, focusSessions, goals]) // Removed 'achievements' from dependencies

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

  // Combine regular study sessions and focus sessions for stats calculation
  const stats = calculateUserStats(sessions || [], focusSessions || [])
  
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

  // Calculate task progress
  const calculateTaskProgress = (): TaskProgress => {
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

    // Find active challenge the user is participating in
    const activeChallenge = (challenges || []).find(challenge => 
      challenge.isActive && challenge.participants.includes(currentUserId)
    )

    let challengeProgress: TaskProgress['challengeProgress'] = undefined
    if (activeChallenge && showChallengeProgress) {
      // Calculate user points and task completion
      const userCompletedTasks = activeChallenge.tasks.filter(task => 
        task.completedBy.includes(currentUserId)
      )
      const userPoints = userCompletedTasks.reduce((total, task) => total + task.points, 0)
      const maxPoints = activeChallenge.tasks.reduce((total, task) => total + task.points, 0)
      
      // Calculate leaderboard with points
      const leaderboard = activeChallenge.participants.map(participantId => {
        const completedTasks = activeChallenge.tasks.filter(task => 
          task.completedBy.includes(participantId)
        )
        const points = completedTasks.reduce((total, task) => total + task.points, 0)
        return {
          userId: participantId,
          points,
          tasksCompleted: completedTasks.length,
          rank: 0 // Will be calculated after sorting
        }
      }).sort((a, b) => b.points - a.points) // Sort by points descending
      
      // Assign ranks (handle ties)
      leaderboard.forEach((participant, index) => {
        if (index === 0) {
          participant.rank = 1
        } else if (participant.points === leaderboard[index - 1].points) {
          participant.rank = leaderboard[index - 1].rank // Same rank for tied scores
        } else {
          participant.rank = index + 1
        }
      })
      
      const userRank = leaderboard.find(p => p.userId === currentUserId)?.rank || 1
      
      // Check if challenge is completed (ended)
      const isCompleted = activeChallenge.endDate ? new Date() > new Date(activeChallenge.endDate) : false
      const winnerId = isCompleted && leaderboard.length > 0 ? leaderboard[0].userId : undefined

      challengeProgress = {
        challengeId: activeChallenge.id,
        challengeTitle: activeChallenge.title,
        totalTasks: activeChallenge.tasks.length,
        completedTasks: userCompletedTasks.length,
        percentage: activeChallenge.tasks.length > 0 ? (userCompletedTasks.length / activeChallenge.tasks.length) * 100 : 0,
        userRank,
        totalParticipants: activeChallenge.participants.length,
        userPoints,
        maxPoints,
        pointsPercentage: maxPoints > 0 ? (userPoints / maxPoints) * 100 : 0,
        leaderboard,
        isCompleted,
        winnerId
      }
    }

    return {
      dailyTasks: dailyProgress,
      challengeProgress
    }
  }

  const taskProgress = calculateTaskProgress()

  const handleAddSubject = (subjectData: Omit<Subject, 'id'>) => {
    const newSubject: Subject = {
      ...subjectData,
      id: Date.now().toString()
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
        id: Date.now().toString(),
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
      id: Date.now().toString(),
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
      }
    } catch (error) {
      toast.error('Failed to update task. Please try again.')
    }
  }

  const handleDeleteTask = (taskId: string) => {
    setTasks(current => (current || []).filter(t => t.id !== taskId))
    toast.success('Task deleted')
  }

  // Challenge management functions
  const handleCreateChallenge = async (challengeData: Omit<Challenge, 'id' | 'createdAt'>) => {
    try {
      const newChallenge: Challenge = {
        ...challengeData,
        id: Date.now().toString() + '_' + Math.random().toString(36).substring(2, 9),
        createdAt: new Date()
      }

      // Save to shared challenges collection in Firestore
      const result = await firestoreService.saveSharedChallenge(newChallenge)
      if (result.error) {
        toast.error('Failed to create challenge: ' + result.error)
        return
      }

      // Add to local state
      setChallenges(current => [...current, newChallenge])
      toast.success('Challenge created successfully!')
    } catch (error) {
      console.error('Error creating challenge:', error)
      toast.error('Failed to create challenge. Please try again.')
    }
  }

  const handleJoinChallenge = async (code: string) => {
    try {
      // Find challenge in shared collection by code
      const result = await firestoreService.findSharedChallengeByCode(code)
      if (!result.data) {
        toast.error('Challenge not found or inactive')
        return
      }

      const challenge = result.data
      if (challenge.participants.includes(currentUserId)) {
        toast.info('You are already participating in this challenge')
        return
      }

      // Update challenge with new participant
      const updatedParticipants = [...challenge.participants, currentUserId]
      const updateResult = await firestoreService.updateSharedChallenge(challenge.id, {
        participants: updatedParticipants
      })

      if (updateResult.error) {
        toast.error('Failed to join challenge: ' + updateResult.error)
        return
      }

      // Update local state
      const updatedChallenge = { ...challenge, participants: updatedParticipants }
      setChallenges(current => {
        const existing = current.find(c => c.id === challenge.id)
        if (existing) {
          return current.map(c => c.id === challenge.id ? updatedChallenge : c)
        } else {
          return [...current, updatedChallenge]
        }
      })

      toast.success(`Joined challenge: ${challenge.title}`)
    } catch (error) {
      console.error('Error joining challenge:', error)
      toast.error('Failed to join challenge. Please try again.')
    }
  }

  const handleAddChallengeTask = async (challengeId: string, taskData: Omit<import('@/lib/types').ChallengeTask, 'id' | 'createdAt' | 'completedBy'>) => {
    try {
      const newTask: import('@/lib/types').ChallengeTask = {
        ...taskData,
        id: Date.now().toString(),
        createdAt: new Date(),
        completedBy: []
      }

      // Find the challenge in local state
      const challenge = challenges.find(c => c.id === challengeId)
      if (!challenge) {
        toast.error('Challenge not found')
        return
      }

      const updatedTasks = [...challenge.tasks, newTask]
      
      // Update shared challenge in Firestore
      const result = await firestoreService.updateSharedChallenge(challengeId, {
        tasks: updatedTasks
      })

      if (result.error) {
        toast.error('Failed to add task: ' + result.error)
        return
      }

      // Update local state
      setChallenges(current => 
        current.map(c => 
          c.id === challengeId 
            ? { ...c, tasks: updatedTasks }
            : c
        )
      )
      
      toast.success('Task added to challenge!')
    } catch (error) {
      console.error('Error adding challenge task:', error)
      toast.error('Failed to add task. Please try again.')
    }
  }

  const handleToggleChallengeTask = async (challengeId: string, taskId: string) => {
    try {
      const challenge = challenges.find(c => c.id === challengeId)
      const task = challenge?.tasks.find(t => t.id === taskId)
      if (!challenge || !task) return

      const isCompleted = task.completedBy.includes(currentUserId)
      const updatedCompletedBy = isCompleted
        ? task.completedBy.filter(id => id !== currentUserId)
        : [...task.completedBy, currentUserId]

      const updatedTasks = challenge.tasks.map(t => 
        t.id === taskId 
          ? { ...t, completedBy: updatedCompletedBy }
          : t
      )

      // Update shared challenge in Firestore
      const result = await firestoreService.updateSharedChallenge(challengeId, {
        tasks: updatedTasks
      })

      if (result.error) {
        toast.error('Failed to update task: ' + result.error)
        return
      }

      // Update local state
      setChallenges(current => 
        current.map(c => 
          c.id === challengeId 
            ? { ...c, tasks: updatedTasks }
            : c
        )
      )

      if (!isCompleted) {
        // Trigger special haptic feedback for challenge task completion
        mobileFeedback.challengeTaskComplete()
        
        // Show celebration for completed challenge task
        setCelebrationData({
          isOpen: true,
          taskTitle: task.title,
          isChallenge: true,
          challengeTitle: challenge.title,
          points: task.points
        })
      }
    } catch (error) {
      console.error('Error toggling challenge task:', error)
      toast.error('Failed to update challenge task. Please try again.')
    }
  }

  const handleSwitchProgressView = () => {
    setShowChallengeProgress(!showChallengeProgress)
  }

  const handleEndChallenge = async (challengeId: string, winnerId: string) => {
    try {
      // Update shared challenge in Firestore
      const result = await firestoreService.updateSharedChallenge(challengeId, {
        isActive: false,
        winnerId,
        endDate: new Date()
      })

      if (result.error) {
        toast.error('Failed to end challenge: ' + result.error)
        return
      }

      // Update local state
      setChallenges(current => 
        current.map(challenge => 
          challenge.id === challengeId 
            ? { ...challenge, isActive: false, winnerId, endDate: new Date() }
            : challenge
        )
      )
      
      // Trigger achievement haptic feedback
      mobileFeedback.achievement()
      
      const challenge = challenges.find(c => c.id === challengeId)
      const isCurrentUserWinner = winnerId === currentUserId
      
      // Calculate winner's points
      const winnerPoints = challenge?.tasks
        .filter(task => task.completedBy.includes(winnerId))
        .reduce((total, task) => total + task.points, 0) || 0
      
      // Show in-app toast
      toast.success(
        isCurrentUserWinner 
          ? `🏆 Congratulations! You won "${challenge?.title}"!`
          : `Challenge "${challenge?.title}" has ended!`,
        {
          description: isCurrentUserWinner 
            ? 'You are the challenge champion!'
            : `Winner: User ${winnerId.slice(-4)}`,
          duration: 5000
        }
      )
      
      // Send push notifications
      try {
        if (isCurrentUserWinner) {
          // Notify winner
          await notificationManager.notifyChallengeWin(
            challenge?.title || 'Challenge',
            winnerPoints
          )
        } else {
          // Notify other participants
          await notificationManager.notifyChallengeComplete(
            challenge?.title || 'Challenge',
            `User ${winnerId.slice(-4)}`
          )
        }
      } catch (error) {
        // Silent notification failure
      }
    } catch (error) {
      toast.error('Failed to end challenge. Please try again.')
    }
  }

  return (
    <div className="min-h-screen relative mobile-scroll-container" ref={containerRef as React.RefObject<HTMLDivElement>}>
      <SpaceBackground />
      <OfflineIndicator />
      <NetworkBlockIndicator />
      <FirebaseStatusIndicator />
      {!isStandalone && <PWAInstallPrompt />}
      
      <div className="relative z-10 container max-w-md lg:max-w-4xl xl:max-w-6xl mx-auto p-4 pb-28 no-select">
        <header className="text-center py-6">
          <div className="flex items-center justify-between">
            <div className="flex-1"></div>
            <div className="flex-1">
              <h1 className="text-2xl lg:text-4xl font-bold text-white drop-shadow-lg">MotivaMate</h1>
              <p className="text-white/80 text-sm lg:text-base drop-shadow">Your mobile study companion</p>
              {user && (
                <div className="mt-2 text-xs lg:text-sm text-white/60">
                  Connected as {user.displayName || user.email?.split('@')[0]}
                </div>
              )}
            </div>
            <div className="flex-1 flex justify-end">
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
          <div className="sticky top-0 bg-black/20 backdrop-blur-md z-20 py-2 rounded-lg border border-white/10" style={{ position: '-webkit-sticky' }}>
            <TabsList className="grid w-full grid-cols-8 bg-white/10 backdrop-blur-sm">
              <TabsTrigger value="achieve" className="flex-col lg:flex-row gap-1 lg:gap-2 h-14 lg:h-12 text-white data-[state=active]:bg-white/20 data-[state=active]:text-white transition-all duration-200">
                <Target size={16} className="lg:size-5" />
                <span className="text-xs lg:text-sm">Achieve</span>
              </TabsTrigger>
              <TabsTrigger value="tasks" className="flex-col lg:flex-row gap-1 lg:gap-2 h-14 lg:h-12 text-white data-[state=active]:bg-white/20 data-[state=active]:text-white transition-all duration-200">
                <CheckSquare size={16} className="lg:size-5" />
                <span className="text-xs lg:text-sm">Tasks</span>
              </TabsTrigger>
              <TabsTrigger value="calendar" className="flex-col lg:flex-row gap-1 lg:gap-2 h-14 lg:h-12 text-white data-[state=active]:bg-white/20 data-[state=active]:text-white transition-all duration-200">
                <CalendarIcon size={16} className="lg:size-5" />
                <span className="text-xs lg:text-sm">Calendar</span>
              </TabsTrigger>
              <TabsTrigger value="notes" className="flex-col lg:flex-row gap-1 lg:gap-2 h-14 lg:h-12 text-white data-[state=active]:bg-white/20 data-[state=active]:text-white transition-all duration-200">
                <Note size={16} className="lg:size-5" />
                <span className="text-xs lg:text-sm">Notes</span>
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex-col lg:flex-row gap-1 lg:gap-2 h-14 lg:h-12 text-white data-[state=active]:bg-white/20 data-[state=active]:text-white transition-all duration-200">
                <User size={16} className="lg:size-5" />
                <span className="text-xs lg:text-sm">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="achievements" className="flex-col lg:flex-row gap-1 lg:gap-2 h-14 lg:h-12 text-white data-[state=active]:bg-white/20 data-[state=active]:text-white transition-all duration-200">
                <Trophy size={16} className="lg:size-5" />
                <span className="text-xs lg:text-sm">Awards</span>
              </TabsTrigger>
              <TabsTrigger value="inspiration" className="flex-col lg:flex-row gap-1 lg:gap-2 h-14 lg:h-12 text-white data-[state=active]:bg-white/20 data-[state=active]:text-white transition-all duration-200">
                <Lightbulb size={16} className="lg:size-5" />
                <span className="text-xs lg:text-sm">Inspire</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="achieve" className="space-y-4 m-0">
            <div className="bg-black/20 backdrop-blur-md rounded-lg border border-white/10 p-4 lg:p-6">
              <AchieveTab 
                achievements={achievements}
                onUpdateAchievements={handleUpdateAchievements}
              />
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-4 m-0">
            <div className="bg-black/20 backdrop-blur-md rounded-lg border border-white/10 p-4 lg:p-6">
              <TasksManagement
                tasks={tasks}
                challenges={challenges}
                subjects={subjects}
                taskProgress={taskProgress}
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
              <ProfileTab stats={stats} achievements={achievements} sessions={allSessions} />
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-4 m-0">
            <div className="bg-black/20 backdrop-blur-md rounded-lg border border-white/10 p-4 lg:p-6">
              <Achievements achievements={achievements} />
            </div>
          </TabsContent>

          <TabsContent value="inspiration" className="space-y-4 m-0">
            <div className="bg-black/20 backdrop-blur-md rounded-lg border border-white/10 p-4 lg:p-6">
              <InspirationCarousel />
            </div>
          </TabsContent>
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
    </div>
  )
}

export default App