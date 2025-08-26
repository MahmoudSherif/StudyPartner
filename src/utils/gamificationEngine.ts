/**
 * Gamification Engine for MotivaMate
 * Handles points, levels, and achievement mechanics
 */

export interface GamificationStats {
  points: number
  level: number
  nextLevelPoints: number
  streak: number
  multiplier: number
}

export interface ActivityPoints {
  session: number
  task: number
  challenge: number
  focus: number
  achievement: number
}

export const ACTIVITY_POINTS: ActivityPoints = {
  session: 10, // Base points per study session
  task: 5, // Base points per completed task
  challenge: 15, // Base points per challenge task
  focus: 8, // Base points per focus session
  achievement: 25 // Bonus points for unlocking achievements
}

export const LEVEL_THRESHOLDS = [
  0, 100, 250, 500, 1000, 1750, 2750, 4000, 5500, 7500, 10000,
  13000, 16500, 20500, 25000, 30000, 35500, 41500, 48000, 55000, 62500
]

export const STREAK_MULTIPLIERS = {
  3: 1.1, // 10% bonus after 3 days
  7: 1.25, // 25% bonus after 1 week
  14: 1.5, // 50% bonus after 2 weeks
  30: 2.0, // 100% bonus after 1 month
  90: 2.5, // 150% bonus after 3 months
  365: 3.0 // 200% bonus after 1 year
}

/**
 * Calculate points for a specific activity
 */
export function calculatePoints(
  activity: keyof ActivityPoints,
  data: { duration?: number; priority?: string; difficulty?: string; streak?: number }
): number {
  let basePoints = ACTIVITY_POINTS[activity]

  // Apply duration bonus for sessions
  if (activity === 'session' && data.duration) {
    const minutes = data.duration / 60
    basePoints += Math.floor(minutes / 30) * 5 // 5 extra points per 30 minutes
  }

  // Apply priority bonus for tasks
  if (activity === 'task' && data.priority) {
    const priorityMultiplier = {
      low: 1.0,
      medium: 1.2,
      high: 1.5
    }
    basePoints *= priorityMultiplier[data.priority as keyof typeof priorityMultiplier] || 1.0
  }

  // Apply difficulty bonus for challenges
  if (activity === 'challenge' && data.difficulty) {
    const difficultyMultiplier = {
      easy: 1.0,
      medium: 1.3,
      hard: 1.6
    }
    basePoints *= difficultyMultiplier[data.difficulty as keyof typeof difficultyMultiplier] || 1.0
  }

  // Apply streak bonus
  if (data.streak) {
    const streakMultiplier = processStreakBonus(data.streak, basePoints)
    basePoints = streakMultiplier
  }

  return Math.round(basePoints)
}

/**
 * Determine user level from total points
 */
export function determineLevel(points: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (points >= LEVEL_THRESHOLDS[i]) {
      return i + 1
    }
  }
  return 1
}

/**
 * Get next milestone information
 */
export function getNextMilestone(currentPoints: number): {
  level: number
  pointsRequired: number
  pointsToNext: number
  progress: number
} {
  const currentLevel = determineLevel(currentPoints)
  const nextLevel = Math.min(currentLevel + 1, LEVEL_THRESHOLDS.length)
  const pointsRequired = LEVEL_THRESHOLDS[nextLevel - 1] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]
  const pointsToNext = Math.max(0, pointsRequired - currentPoints)
  const previousLevelPoints = LEVEL_THRESHOLDS[currentLevel - 1] || 0
  const progress = Math.min(100, ((currentPoints - previousLevelPoints) / (pointsRequired - previousLevelPoints)) * 100)

  return {
    level: nextLevel,
    pointsRequired,
    pointsToNext,
    progress
  }
}

/**
 * Process streak bonus calculation
 */
export function processStreakBonus(streak: number, basePoints: number): number {
  let multiplier = 1.0

  // Find the highest applicable streak multiplier
  for (const [threshold, bonus] of Object.entries(STREAK_MULTIPLIERS).reverse()) {
    if (streak >= parseInt(threshold)) {
      multiplier = bonus
      break
    }
  }

  // Cap the bonus to prevent excessive point inflation
  const maxBonus = basePoints * 3
  return Math.min(basePoints * multiplier, maxBonus)
}

/**
 * Calculate comprehensive gamification statistics
 */
export function calculateGamificationStats(
  totalPoints: number,
  currentStreak: number
): GamificationStats {
  const level = determineLevel(totalPoints)
  const nextMilestone = getNextMilestone(totalPoints)
  const multiplier = Object.entries(STREAK_MULTIPLIERS)
    .reverse()
    .find(([threshold]) => currentStreak >= parseInt(threshold))?.[1] || 1.0

  return {
    points: totalPoints,
    level,
    nextLevelPoints: nextMilestone.pointsToNext,
    streak: currentStreak,
    multiplier
  }
}

/**
 * Generate level-up rewards
 */
export function generateLevelUpRewards(newLevel: number): {
  title: string
  description: string
  rewards: string[]
} {
  const rewards = {
    title: `Level ${newLevel} Achieved!`,
    description: `Congratulations on reaching level ${newLevel}!`,
    rewards: [
      'Increased point multipliers',
      'New achievement opportunities',
      'Enhanced study tracking features'
    ]
  }

  // Special rewards for milestone levels
  if (newLevel % 5 === 0) {
    rewards.rewards.push('Exclusive milestone badge')
  }

  if (newLevel >= 10) {
    rewards.rewards.push('Advanced statistics dashboard')
  }

  if (newLevel >= 20) {
    rewards.rewards.push('Premium theme unlocked')
  }

  return rewards
}

export const gamificationEngine = {
  calculatePoints,
  determineLevel,
  getNextMilestone,
  processStreakBonus,
  calculateGamificationStats,
  generateLevelUpRewards
}
