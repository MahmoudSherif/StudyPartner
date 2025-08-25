export interface Subject {
  id: string
  name: string
  color: string
  totalTime: number
  goal?: number
  dailyTarget?: number // minutes per day
  weeklyTarget?: number // minutes per week
}

export interface StudySession {
  id: string
  subjectId: string
  startTime: Date
  endTime?: Date
  duration: number
  completed: boolean
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlocked: boolean
  unlockedAt?: Date
  requirement: number
  progress: number
  category?: 'time' | 'sessions' | 'streaks' | 'focus' | 'goals' | 'tasks'
  isGoalBased?: boolean
  goalTarget?: number
  goalDeadline?: Date
}

export interface UserStats {
  totalStudyTime: number
  streak: number
  longestStreak: number
  sessionsCompleted: number
  averageSessionLength: number
  tasksCompleted?: number // individual (non-challenge) tasks
  challengeTasksCompleted?: number // challenge task completions by user
}

export interface SubjectProgress {
  subjectId: string
  todayTime: number
  weekTime: number
  dailyTarget?: number
  weeklyTarget?: number
  dailyProgress: number // percentage 0-100
  weeklyProgress: number // percentage 0-100
  isBehindDaily: boolean
  isBehindWeekly: boolean
}

export interface TargetNotification {
  id: string
  subjectId: string
  subjectName: string
  type: 'daily' | 'weekly'
  message: string
  severity: 'warning' | 'danger'
  timestamp: Date
}

export interface CalendarEvent {
  id: string
  title: string
  description?: string
  date: Date
  startTime?: string
  endTime?: string
  subjectId?: string
  type: 'study' | 'exam' | 'deadline' | 'reminder' | 'break'
  isAllDay: boolean
  color?: string
}

export interface Task {
  id: string
  title: string
  description?: string
  completed: boolean
  createdAt: Date
  completedAt?: Date
  subjectId?: string
  priority: 'low' | 'medium' | 'high'
  dueDate?: Date
  estimatedTime?: number // minutes
}

export interface Challenge {
  id: string
  code: string
  title: string
  description: string
  createdBy: string
  createdAt: Date
  participants: string[]
  tasks: ChallengeTask[]
  isActive: boolean
  endDate?: Date
  maxPoints?: number // Total points available in the challenge
  // Backward compatibility: single winnerId retained; prefer winnerIds for ties
  winnerId?: string // (legacy) single winner
  winnerIds?: string[] // All winners in case of tie
  // Optional cached points summary (stored in Firestore owner + global docs)
  pointsSummary?: {
    pointsByUser: Record<string, number>
    maxPoints: number
  }
  // Persist final immutable snapshot when challenge ends to prevent later recomputations from "erasing" results
  finalPointsByUser?: Record<string, number>
  finalMaxPoints?: number
}

export interface ChallengeTask {
  id: string
  title: string
  description?: string
  // Legacy field: array of user IDs who completed the task (kept for backward compatibility & quick counts)
  completedBy: string[]
  // New structured per-user completion metadata
  completions?: Record<string, {
    completed: boolean
    completedAt?: Date
  }>
  points: number
  createdAt: Date
}

export interface TaskProgress {
  dailyTasks: {
    total: number
    completed: number
    percentage: number
  }
  challengeProgress?: {
    challengeId: string
    challengeTitle: string
    totalTasks: number
    completedTasks: number
    percentage: number
    userRank: number
    totalParticipants: number
    userPoints: number // Points earned by current user
    maxPoints: number // Maximum points available
    pointsPercentage: number // Percentage based on points
    leaderboard: Array<{
      userId: string
      points: number
      tasksCompleted: number
      rank: number
    }>
    isCompleted: boolean // Whether challenge has ended
    winnerId?: string // Winner of the challenge
  }
}

export interface FocusSession {
  id: string
  title: string
  duration: number // minutes
  startTime: Date
  endTime?: Date
  completed: boolean
  category?: string
  notes?: string
}

export interface Goal {
  id: string
  title: string
  description?: string
  target: number // in minutes
  current: number // progress in minutes
  deadline?: Date
  category: 'daily' | 'weekly' | 'monthly' | 'custom'
  isCompleted: boolean
  createdAt: Date
}

export interface StickyNote {
  id: string
  title: string
  content: string
  color: string
  position: { x: number; y: number }
  size: { width: number; height: number }
  createdAt: Date
  updatedAt: Date
  isPinned: boolean
  tags?: string[]
}