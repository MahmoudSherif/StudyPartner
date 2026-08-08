import { useState, useEffect, useMemo, useRef } from 'react'
import { useActiveFocusSession } from '@/hooks/useAppData'
import { useAuth } from '@/contexts/AuthContext'
// Fixed async/await usage for notifications
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { 
  Play, 
  Pause, 
  Square, 
  Plus, 
  Target, 
  Clock, 
  Trophy,
  Pencil,
  Trash,
  CheckCircle
} from '@phosphor-icons/react'
import { FocusSession, Goal, Achievement } from '@/lib/types'
import { newId } from '@/lib/ids'
import { toast } from 'sonner'
import { mobileFeedback } from '@/lib/mobileFeedback'
import { notificationManager } from '@/lib/notifications'

/** Select value meaning "this session counts toward no goal". */
const NO_GOAL = 'none'

interface AchieveTabProps {
  achievements: Achievement[]
  onUpdateAchievements: (achievements: Achievement[]) => void
  goals: Goal[]
  setGoals: (goals: Goal[] | ((prev: Goal[]) => Goal[])) => void
  focusSessions: FocusSession[]
  setFocusSessions: (sessions: FocusSession[] | ((prev: FocusSession[]) => FocusSession[])) => void
}

export function AchieveTab({ achievements, onUpdateAchievements, goals, setGoals, focusSessions, setFocusSessions }: AchieveTabProps) {
  const { user } = useAuth()
  
  // Get user-specific data
  const currentUserId = user?.uid || 'anonymous'
  const userDataKey = (key: string) => `${currentUserId}-${key}`
  
  // Use shared firebase-backed hook for active session only
  const [activeFocusSession, setActiveFocusSession] = useActiveFocusSession()
  
  // Timer state.
  //
  // Elapsed time is derived from the wall clock rather than accumulated by the
  // interval. Browsers throttle setInterval to once a minute in a background
  // tab and suspend it entirely when the device sleeps, so a counter that added
  // one second per tick lost most of a long session. The interval now only
  // triggers a re-render; the value comes from the timestamps.
  const [isRunning, setIsRunning] = useState(false)
  const [sessionTitle, setSessionTitle] = useState('')
  const [sessionCategory, setSessionCategory] = useState('')
  const [sessionNotes, setSessionNotes] = useState('')
  // Which goal the next session will count toward. `NO_GOAL` is a real sentinel
  // rather than '' because Radix Select treats an empty string as "no value" and
  // would render the placeholder instead of the "No goal" choice, leaving the
  // default looking unset when it is in fact a deliberate selection.
  const [sessionGoalId, setSessionGoalId] = useState<string>(NO_GOAL)

  /** Seconds banked from previous run segments (i.e. before the current resume). */
  const [elapsedBase, setElapsedBase] = useState(0)
  /** Epoch ms at which the current run segment started; null while paused. */
  const [runStartedAt, setRunStartedAt] = useState<number | null>(null)
  // Re-render tick. The value is meaningless on its own; it is a dependency of
  // the memo below purely so the derived time is recomputed once a second.
  const [tick, setTick] = useState(0)

  const currentTime = useMemo(() => {
    if (runStartedAt === null) return elapsedBase
    return elapsedBase + Math.floor((Date.now() - runStartedAt) / 1000)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elapsedBase, runStartedAt, tick])

  const timerStateKey = `${currentUserId}-active-timer-state`

  /** The goal the running session counts toward, if it still exists. */
  const linkedGoal = useMemo(
    () => (activeFocusSession?.goalId ? goals.find(g => g.id === activeFocusSession.goalId) ?? null : null),
    [activeFocusSession?.goalId, goals]
  )

  // Which session the adopt effect below has already taken over. Declared here,
  // above the mirror effect, because that effect must not run before adoption.
  const adoptedSessionRef = useRef<string | null>(null)

  // Mirror the timer to localStorage so a refresh resumes where it left off.
  // This is deliberately NOT a database write: the previous implementation
  // pushed the elapsed time to Postgres once per second, which is one UPDATE,
  // one realtime echo and one refetch every second the timer ran.
  useEffect(() => {
    if (!currentUserId || !activeFocusSession || activeFocusSession.completed) return
    // Nothing is written until this session has been adopted.
    //
    // Both this effect and the adopt effect depend on `activeFocusSession`, and
    // React runs them in declaration order. When a running session arrived from
    // the server this one fired first and wrote the *initial* render state --
    // elapsedBase 0, runStartedAt null, isRunning false -- into the very key the
    // adopt effect reads. Adoption then found a valid entry, treated it as
    // restored, and discarded the elapsed time derived from the session's
    // startTime. Reopening the app mid-session showed 0:00 and stopping recorded
    // a duration of 0, so the study time was lost.
    if (adoptedSessionRef.current !== activeFocusSession.id) return
    try {
      localStorage.setItem(
        timerStateKey,
        JSON.stringify({ elapsedBase, runStartedAt, isRunning })
      )
    } catch {
      /* storage full or unavailable; the session row is still the source of truth */
    }
  }, [elapsedBase, runStartedAt, isRunning, currentUserId, activeFocusSession, timerStateKey])

  // UI state
  const [showAddGoal, setShowAddGoal] = useState(false)
  const [showEditGoal, setShowEditGoal] = useState<Goal | null>(null)
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    target: 60,
    category: 'daily' as Goal['category'],
    deadline: ''
  })

  // Adopt whatever session is already running when this tab mounts, whether it
  // was left by a refresh or started on another device. (`adoptedSessionRef` is
  // declared above, next to the effect that depends on it.)
  useEffect(() => {
    if (!activeFocusSession || activeFocusSession.completed) return
    if (adoptedSessionRef.current === activeFocusSession.id) return
    adoptedSessionRef.current = activeFocusSession.id

    // Time since the session row was created is the floor: it is authoritative
    // and survives clearing site data, but it counts paused time too.
    const sinceStart = Math.max(
      0,
      Math.floor((Date.now() - new Date(activeFocusSession.startTime).getTime()) / 1000)
    )

    let restored = false
    try {
      const saved = localStorage.getItem(timerStateKey)
      if (saved) {
        const parsed = JSON.parse(saved) as {
          elapsedBase?: number
          runStartedAt?: number | null
          isRunning?: boolean
        }
        if (typeof parsed.elapsedBase === 'number') {
          setElapsedBase(parsed.elapsedBase)
          setRunStartedAt(parsed.runStartedAt ?? null)
          setIsRunning(!!parsed.isRunning && parsed.runStartedAt != null)
          restored = true
        }
      }
    } catch {
      /* fall through to the server-derived value */
    }

    if (!restored) {
      const running = !!activeFocusSession.isRunning
      setElapsedBase(running ? 0 : sinceStart)
      setRunStartedAt(running ? Date.now() - sinceStart * 1000 : null)
      setIsRunning(running)
    }

    setSessionTitle(activeFocusSession.title)
    setSessionCategory(activeFocusSession.category || '')
    setSessionNotes(activeFocusSession.notes || '')
    setSessionGoalId(activeFocusSession.goalId || NO_GOAL)
  }, [activeFocusSession, timerStateKey])

  // Re-render once a second while running so the derived elapsed time updates.
  // No state is accumulated here and nothing is written to the database.
  useEffect(() => {
    if (!isRunning || !activeFocusSession) return
    const interval = setInterval(() => setTick(t => t + 1), 1000)
    return () => clearInterval(interval)
  }, [isRunning, activeFocusSession?.id])

  // Format time display
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  // Start focus session
  const startSession = () => {
    // Input validation and sanitization
    const sanitizedTitle = sessionTitle.trim()
    const sanitizedCategory = sessionCategory?.trim()
    const sanitizedNotes = sessionNotes?.trim()
    
    if (!sanitizedTitle) {
      toast.error('Please enter a focus title')
      return
    }
    
    if (sanitizedTitle.length > 100) {
      toast.error('Focus title is too long (max 100 characters)')
      return
    }
    
    if (sanitizedCategory && sanitizedCategory.length > 50) {
      toast.error('Category is too long (max 50 characters)')
      return
    }
    
    if (sanitizedNotes && sanitizedNotes.length > 500) {
      toast.error('Notes are too long (max 500 characters)')
      return
    }

    const newSession: FocusSession = {
      id: newId(),
      title: sanitizedTitle,
      duration: 0,
      startTime: new Date(),
      completed: false,
      isRunning: true,
      // Only include optional fields if they have actual values
      ...(sanitizedCategory && { category: sanitizedCategory }),
      ...(sanitizedNotes && { notes: sanitizedNotes }),
      // Stored on the row, not in component state, so the link survives a
      // refresh or the session being picked up on another device. Guarded
      // against a goal deleted between opening the picker and pressing start.
      ...(sessionGoalId !== NO_GOAL &&
        goals.some(g => g.id === sessionGoalId) && { goalId: sessionGoalId })
    }

    adoptedSessionRef.current = newSession.id
    setActiveFocusSession(newSession)
    setElapsedBase(0)
    setRunStartedAt(Date.now())
    setIsRunning(true)
    mobileFeedback.buttonPress()
    toast.success(`Focus session started: ${sanitizedTitle}`)
  }

  // Pause/resume session. One write per transition, not one per second.
  const togglePause = () => {
    if (!activeFocusSession) return
    const resuming = !isRunning

    if (resuming) {
      setRunStartedAt(Date.now())
    } else {
      // Bank the segment that just ended so the total survives the pause.
      setElapsedBase(currentTime)
      setRunStartedAt(null)
    }
    setIsRunning(resuming)

    setActiveFocusSession({
      ...activeFocusSession,
      duration: Math.floor(currentTime / 60),
      isRunning: resuming
    })

    mobileFeedback.buttonPress()
  }

  // Stop and save session
  const stopSession = () => {
    if (!activeFocusSession) return

    const sessionMinutes = Math.floor(currentTime / 60)
    const finishedId = activeFocusSession.id

    // Update the existing row in place. The session was inserted when it
    // started, so appending it here produced a second entry with the same
    // primary key -- two conflicting UPDATEs whose order decided the outcome.
    // `isRunning` must be cleared in the same write: a partial unique index
    // allows only one running session per user, so leaving it set blocks the
    // next one from ever starting.
    setFocusSessions(current =>
      current.map(session =>
        session.id === finishedId
          ? {
              ...session,
              duration: sessionMinutes,
              endTime: new Date(),
              completed: true,
              isRunning: false
            }
          : session
      )
    )

    // Credit only the goal this session was started against, if any. The goal
    // is read off the session row rather than component state so it survives a
    // refresh, a pause, or the session being adopted on another device.
    if (activeFocusSession.goalId) {
      creditGoal(activeFocusSession.goalId, sessionMinutes).catch(() => {
        // Silent: the session itself is already saved, and goal progress is
        // recoverable. Failing loudly here would imply the session was lost.
      })
    }

    adoptedSessionRef.current = null
    setElapsedBase(0)
    setRunStartedAt(null)
    setIsRunning(false)
    setSessionTitle('')
    setSessionCategory('')
    setSessionNotes('')
    setSessionGoalId(NO_GOAL)

    // Clear saved timer state
    try {
      localStorage.removeItem(timerStateKey)
    } catch {
      /* ignore */
    }

    mobileFeedback.studySessionComplete()
    toast.success(`Focus session completed! ${sessionMinutes} minutes of focused work.`)
  }

  /**
   * Adds a completed session's minutes to one goal, and one goal only.
   *
   * This replaced `updateGoalsProgress(minutes)`, which walked every goal and
   * credited each one whose category window happened to be open -- a daily goal
   * with no deadline always qualified, a weekly one all week, a monthly one all
   * month, and custom goals unconditionally. A single 30 minute session
   * therefore advanced four unrelated goals by 30 minutes each, so a goal's
   * progress reflected how long the user had studied in total rather than how
   * long they had spent on that goal. Sessions now name their goal up front and
   * nothing else is touched.
   *
   * Category windows are deliberately not consulted any more. The user picked
   * this goal when starting the session, which is a clearer statement of intent
   * than a date range, and honouring the window would silently drop the credit
   * for a goal whose deadline had just passed.
   */
  const creditGoal = async (goalId: string, minutes: number) => {
    try {
      if (minutes <= 0) return

      const goal = goals.find(g => g.id === goalId)
      // Gone or already finished: nothing to add. A goal deleted mid-session
      // leaves `goal_id` null on the row (the FK clears it), so this is the
      // deleted-while-running case rather than an error.
      if (!goal || goal.isCompleted) return

      const newCurrent = Math.min(goal.current + minutes, goal.target)
      const isNowCompleted = newCurrent >= goal.target

      setGoals(current =>
        current.map(g =>
          g.id === goalId ? { ...g, current: newCurrent, isCompleted: isNowCompleted } : g
        )
      )

      if (!isNowCompleted) return

      const notificationPromises: Promise<void>[] = []
      mobileFeedback.achievement()
      toast.success(`\u{1F3AF} Goal completed: ${goal.title}!`)
      notificationPromises.push(
        notificationManager
          .notifyGoalAchievement(goal.title, goal.description)
          .catch(() => {
            /* silent notification failure */
          })
      )

      // +1 for the goal just completed, which is not yet reflected in `goals`.
      const completedGoalsCount = goals.filter(g => g.isCompleted).length + 1
      const goalAchieverAchievement = achievements.find(a => a.id === 'goal-achiever')

      if (
        goalAchieverAchievement &&
        !goalAchieverAchievement.unlocked &&
        completedGoalsCount >= goalAchieverAchievement.requirement
      ) {
        onUpdateAchievements(
          achievements.map(achievement =>
            achievement.id === 'goal-achiever'
              ? { ...achievement, progress: completedGoalsCount, unlocked: true, unlockedAt: new Date() }
              : achievement
          )
        )
        mobileFeedback.achievement()
        toast.success(`Achievement Unlocked: ${goalAchieverAchievement.title}!`, {
          description: goalAchieverAchievement.description,
          duration: 5000
        })
        notificationPromises.push(
          notificationManager
            .notifyAchievementUnlock(goalAchieverAchievement.title, goalAchieverAchievement.description)
            .catch(() => {
              /* silent notification failure */
            })
        )
      }

      await Promise.allSettled(notificationPromises)
    } catch (error) {
      // Silent: the session is already saved; goal progress is secondary.
    }
  }

  // Add new goal
  const addGoal = async () => {
    // Input validation and sanitization
    const sanitizedTitle = newGoal.title.trim()
    const sanitizedDescription = newGoal.description?.trim()
    
    if (!sanitizedTitle) {
      toast.error('Please enter a goal title')
      return
    }
    
    if (sanitizedTitle.length > 100) {
      toast.error('Goal title is too long (max 100 characters)')
      return
    }
    
    if (sanitizedDescription && sanitizedDescription.length > 500) {
      toast.error('Goal description is too long (max 500 characters)')
      return
    }
    
    // Validate target
    if (newGoal.target < 1 || newGoal.target > 10000) {
      toast.error('Goal target must be between 1 and 10000')
      return
    }
    
    // Validate deadline
    let deadlineValid: Date | undefined
    if (newGoal.deadline) {
      deadlineValid = new Date(newGoal.deadline)
      if (isNaN(deadlineValid.getTime())) {
        toast.error('Please enter a valid deadline')
        return
      }
      
      // Check if deadline is not in the past
      const now = new Date()
      now.setHours(0, 0, 0, 0) // Start of today
      if (deadlineValid < now) {
        toast.error('Deadline cannot be in the past')
        return
      }
      
      // Check if deadline is not too far in the future (e.g., more than 2 years)
      const twoYearsFromNow = new Date()
      twoYearsFromNow.setFullYear(twoYearsFromNow.getFullYear() + 2)
      if (deadlineValid > twoYearsFromNow) {
        toast.error('Deadline cannot be more than 2 years in the future')
        return
      }
    }

    const goal: Goal = {
      id: newId(),
      title: sanitizedTitle,
      ...(sanitizedDescription && { description: sanitizedDescription }),
      target: newGoal.target,
      current: 0,
      ...(deadlineValid && { deadline: deadlineValid }),
      category: newGoal.category,
      isCompleted: false,
      createdAt: new Date()
    }

    // Add goal and ensure immediate sync
    const updatedGoals = [...goals, goal]
    setGoals(updatedGoals)
    
    // Trigger achievement check for goal creation
    let unlockedAchievement: Achievement | null = null
    const updatedAchievements = achievements.map(achievement => {
      if (achievement.id === 'goal-setter' && !achievement.unlocked) {
        const newProgress = goals.length + 1 // +1 for the goal we just added
        const unlocked = newProgress >= achievement.requirement
        
        if (unlocked) {
          mobileFeedback.achievement()
          toast.success(`Achievement Unlocked: ${achievement.title}!`, {
            description: achievement.description,
            duration: 5000
          })
          
          // Store achievement for async notification
          unlockedAchievement = achievement
        }
        
        return {
          ...achievement,
          progress: Math.min(newProgress, achievement.requirement),
          unlocked,
          unlockedAt: unlocked ? new Date() : achievement.unlockedAt
        }
      }
      return achievement
    })
    
    // Send push notification for achievement unlock (async operation outside map)
    if (unlockedAchievement !== null) {
      const achievement: Achievement = unlockedAchievement
      try {
        await notificationManager.notifyAchievementUnlock(
          achievement.title,
          achievement.description
        )
      } catch (error) {
        // Silent notification failure
      }
    }
    
    onUpdateAchievements(updatedAchievements)
    
    setNewGoal({
      title: '',
      description: '',
      target: 60,
      category: 'daily',
      deadline: ''
    })
    setShowAddGoal(false)
    toast.success('Goal added successfully!')
  }

  // Delete goal
  const deleteGoal = (goalId: string) => {
    setGoals(current => current.filter(g => g.id !== goalId))
    toast.success('Goal deleted')
  }

  // Get active goals
  const activeGoals = goals.filter(goal => !goal.isCompleted).slice(0, 3)
  const completedGoals = goals.filter(goal => goal.isCompleted)

  return (
    <div className="space-y-6">
      {/* Goals Progress Bar */}
      <Card className="bg-black/40 backdrop-blur-md border-white/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2">
            <Target size={20} />
            Current Goals
            {goals.length > 0 && (
              <Badge variant="secondary" className="bg-white/20 text-white ml-auto">
                {goals.filter(g => g.isCompleted).length}/{goals.length} completed
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeGoals.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-white/60 mb-3">No active goals yet</p>
              <p className="text-xs text-white/50 mb-3">
                Setting goals helps unlock achievements and track your progress!
              </p>
              <Button 
                onClick={() => setShowAddGoal(true)}
                className="bg-accent/20 hover:bg-accent/30 text-accent border-accent/30"
              >
                <Plus size={16} className="mr-2" />
                Add Your First Goal
              </Button>
            </div>
          ) : (
            <>
              {activeGoals.map(goal => (
                <div key={goal.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-white font-medium">{goal.title}</h4>
                      <p className="text-white/60 text-sm">
                        {goal.current}/{goal.target} minutes • {goal.category}
                        {goal.deadline && (
                          <span className="ml-2">
                            Due: {new Date(goal.deadline).toLocaleDateString()}
                          </span>
                        )}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteGoal(goal.id)}
                      className="text-white/60 hover:text-red-400"
                    >
                      <Trash size={16} />
                    </Button>
                  </div>
                  <Progress 
                    value={(goal.current / goal.target) * 100} 
                    className="h-2 bg-white/10"
                  />
                </div>
              ))}
              
              <Button 
                onClick={() => setShowAddGoal(true)}
                variant="outline"
                className="w-full bg-white/5 hover:bg-white/10 text-white border-white/20"
              >
                <Plus size={16} className="mr-2" />
                Add Goal
              </Button>
            </>
          )}
          
          {/* Quick Goal Templates */}
          {activeGoals.length === 0 && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-xs text-white/50 mb-3">Quick Templates:</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { title: 'Study 2 hours today', target: 120, category: 'daily' as const },
                  { title: 'Focus for 1 hour', target: 60, category: 'daily' as const },
                  { title: '10 hours this week', target: 600, category: 'weekly' as const },
                  { title: 'Monthly reading goal', target: 1200, category: 'monthly' as const }
                ].map((template, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setNewGoal({
                        title: template.title,
                        description: '',
                        target: template.target,
                        category: template.category,
                        deadline: ''
                      })
                      setShowAddGoal(true)
                    }}
                    className="text-xs bg-white/5 hover:bg-white/10 text-white/80 border-white/20"
                  >
                    {template.title}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Focus Session Timer */}
      <Card className="bg-black/40 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Clock size={20} />
            Focus Session
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!activeFocusSession ? (
            <div className="space-y-4">
              <Input
                placeholder="What are you focusing on?"
                value={sessionTitle}
                onChange={(e) => setSessionTitle(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
              
              <Input
                placeholder="Category (optional)"
                value={sessionCategory}
                onChange={(e) => setSessionCategory(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
              
              <Textarea
                placeholder="Session notes (optional)"
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 resize-none h-20"
              />
              
              {/*
                Which goal this session counts toward. Defaults to "No goal":
                opting in is the safe default, since a session silently credited
                to the wrong goal is harder to notice and undo than one credited
                to nothing. Only unfinished goals are offered -- adding minutes
                to an already completed goal cannot change anything.
              */}
              <Select value={sessionGoalId} onValueChange={setSessionGoalId}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="No goal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_GOAL}>No goal &mdash; just track the time</SelectItem>
                  {goals
                    .filter(goal => !goal.isCompleted)
                    .map(goal => (
                      <SelectItem key={goal.id} value={goal.id}>
                        {goal.title} ({goal.current}/{goal.target} min)
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              <Button
                onClick={startSession}
                className="w-full bg-accent hover:bg-accent/80 text-accent-foreground"
                disabled={!sessionTitle.trim()}
              >
                <Play size={16} className="mr-2" />
                Start Focus Session
              </Button>
              
            </div>
          ) : (
            <div className="text-center space-y-6">
              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-white">{activeFocusSession.title}</h3>
                {activeFocusSession.category && (
                  <Badge variant="secondary" className="bg-white/20 text-white">
                    {activeFocusSession.category}
                  </Badge>
                )}
                {/* State the destination while it still matters. Once stopped,
                    the minutes are already committed and there is no undo. */}
                <p className="text-sm text-white/70">
                  {linkedGoal
                    ? `Counting toward: ${linkedGoal.title}`
                    : 'Not counting toward any goal'}
                </p>
              </div>

              <div className="text-6xl font-mono font-bold text-accent my-6">
                {formatTime(currentTime)}
              </div>

              <div className="flex gap-4 justify-center items-center">
                <Button
                  onClick={togglePause}
                  variant="outline"
                  size="lg"
                  className="bg-white/10 hover:bg-white/20 text-white border-white/30"
                >
                  {isRunning ? <Pause size={20} /> : <Play size={20} />}
                </Button>
                
                <Button
                  onClick={stopSession}
                  variant="outline"
                  size="lg"
                  className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border-red-500/30"
                >
                  <Square size={20} />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Achievements */}
      <Card className="bg-black/40 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Trophy size={20} />
            Achievement Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3">
            {achievements
              .filter(achievement => achievement.category === 'goals' || achievement.category === 'focus' || !achievement.unlocked)
              .slice(0, 4)
              .map(achievement => (
                <div
                  key={achievement.id}
                  className={`p-3 rounded-lg border transition-all ${
                    achievement.unlocked
                      ? 'bg-accent/20 border-accent/30'
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">
                      {achievement.unlocked ? <CheckCircle className="text-accent" size={24} /> : achievement.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-medium ${achievement.unlocked ? 'text-accent' : 'text-white'}`}>
                        {achievement.title}
                      </h4>
                      <p className="text-sm text-white/60">{achievement.description}</p>
                      {!achievement.unlocked && (
                        <>
                          <Progress 
                            value={(achievement.progress / achievement.requirement) * 100}
                            className="h-1 mt-2 bg-white/10"
                          />
                          <div className="text-xs text-white/60 mt-1">
                            {achievement.progress} / {achievement.requirement}
                            {achievement.category === 'goals' && ' goals'}
                            {achievement.category === 'focus' && ' focus sessions'}
                            {achievement.category === 'time' && ' minutes'}
                          </div>
                        </>
                      )}
                      {achievement.unlocked && achievement.unlockedAt && (
                        <div className="text-xs text-white/60 mt-1">
                          Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
          
          {/* Goal Achievement Stats */}
          <div className="mt-4 pt-4 border-t border-white/10">
            {(() => {
              const totalFocusTime = focusSessions.reduce((total, session) => total + session.duration, 0)
              const avgSessionTime = focusSessions.length > 0 ? Math.round(totalFocusTime / focusSessions.length) : 0
              
              return (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 text-center">
                  <div className="space-y-1">
                    <div className="text-xl md:text-2xl font-bold text-accent">{goals.filter(g => g.isCompleted).length}</div>
                    <div className="text-[10px] md:text-xs text-white/60">Goals Completed</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xl md:text-2xl font-bold text-accent">{focusSessions.filter(fs => fs.completed).length}</div>
                    <div className="text-[10px] md:text-xs text-white/60">Focus Sessions</div>
                  </div>
                  <div className="space-y-1 md:block hidden">
                    <div className="text-xl md:text-2xl font-bold text-primary">{totalFocusTime}</div>
                    <div className="text-[10px] md:text-xs text-white/60">Total Focus (min)</div>
                  </div>
                  <div className="space-y-1 lg:block hidden">
                    <div className="text-xl md:text-2xl font-bold text-primary">{avgSessionTime}</div>
                    <div className="text-[10px] md:text-xs text-white/60">Avg Session (min)</div>
                  </div>
                </div>
              )
            })()}
          </div>
        </CardContent>
      </Card>

      {/* Add Goal Dialog */}
      <Dialog open={showAddGoal} onOpenChange={setShowAddGoal}>
        <DialogContent className="bg-black/90 backdrop-blur-md border-white/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Add New Goal</DialogTitle>
            <DialogDescription className="text-white/70">
              Create a new goal to track your progress
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Goal title"
              value={newGoal.title}
              onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
            />
            
            <Textarea
              placeholder="Description (optional)"
              value={newGoal.description}
              onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50 resize-none h-20"
            />
            
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  type="number"
                  placeholder="Target (minutes)"
                  value={newGoal.target}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, target: parseInt(e.target.value) || 60 }))}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
              </div>
              <div className="flex-1">
                <Select value={newGoal.category} onValueChange={(value: Goal['category']) => setNewGoal(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-black/90 border-white/20">
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Input
              type="date"
              placeholder="Deadline (optional)"
              value={newGoal.deadline}
              onChange={(e) => setNewGoal(prev => ({ ...prev, deadline: e.target.value }))}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
            />
            
            <div className="flex gap-2">
              <Button
                onClick={() => setShowAddGoal(false)}
                variant="outline"
                className="flex-1 bg-white/10 hover:bg-white/20 text-white border-white/30"
              >
                Cancel
              </Button>
              <Button
                onClick={addGoal}
                className="flex-1 bg-accent hover:bg-accent/80 text-accent-foreground"
              >
                Add Goal
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}