// Comprehensive streak calculation utility
// Handles sequential day tracking with proper reset logic

export interface StreakData {
  current: number;
  longest: number;
  lastCompletedDate: string;
}

export interface StreakResult {
  newStreak: StreakData;
  isNewRecord: boolean;
  isMilestone: boolean;
  milestoneMessage?: string;
}

/**
 * Calculate new streak based on current streak and today's completion
 * @param currentStreak - Current streak data
 * @param completionDate - Date when task was completed (optional, defaults to today)
 * @returns New streak data with proper sequential day logic
 */
export const calculateNewStreak = (
  currentStreak: StreakData, 
  completionDate?: string
): StreakResult => {
  const today = completionDate || new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  
  // If already completed today, return current streak
  if (currentStreak.lastCompletedDate === today) {
    return {
      newStreak: currentStreak,
      isNewRecord: false,
      isMilestone: false
    };
  }
  
  let newCurrent: number;
  
  // Determine new current streak based on sequential day logic
  if (!currentStreak.lastCompletedDate) {
    // First ever completion
    newCurrent = 1;
  } else if (currentStreak.lastCompletedDate === yesterday) {
    // Consecutive day - continue streak
    newCurrent = currentStreak.current + 1;
  } else {
    // Gap in days - reset to 1 (not 0, since we're completing today)
    newCurrent = 1;
  }
  
  // Calculate new longest streak
  const newLongest = Math.max(currentStreak.longest, newCurrent);
  const isNewRecord = newCurrent > currentStreak.longest;
  
  // Check if this is a milestone
  const milestones = [3, 7, 14, 21, 30, 50, 75, 100, 150, 200, 365];
  const isMilestone = milestones.includes(newCurrent);
  
  const newStreak: StreakData = {
    current: newCurrent,
    longest: newLongest,
    lastCompletedDate: today
  };
  
  return {
    newStreak,
    isNewRecord,
    isMilestone,
    milestoneMessage: isMilestone ? getMilestoneMessage(newCurrent) : undefined
  };
};

/**
 * Get motivational message for streak milestones
 */
export const getMilestoneMessage = (streakDays: number): string => {
  switch (streakDays) {
    case 3:
      return "🔥 3-Day Streak! You're building momentum!";
    case 7:
      return "⭐ 1 Week Streak! Incredible consistency!";
    case 14:
      return "💎 2 Week Streak! You're developing a powerful habit!";
    case 21:
      return "🏆 3 Week Streak! Habit formation in progress!";
    case 30:
      return "🌟 1 Month Streak! You're truly committed!";
    case 50:
      return "🚀 50-Day Streak! You're unstoppable!";
    case 75:
      return "⚡ 75-Day Streak! Extraordinary dedication!";
    case 100:
      return "🎯 100-Day Streak! You've reached legendary status!";
    case 150:
      return "👑 150-Day Streak! You are the master of consistency!";
    case 200:
      return "🌌 200-Day Streak! Your discipline is out of this world!";
    case 365:
      return "🏅 1 YEAR STREAK! You've achieved the ultimate goal!";
    default:
      return `🔥 ${streakDays}-Day Streak! Amazing consistency!`;
  }
};

/**
 * Get general streak message for display
 */
export const getStreakMessage = (streak: StreakData): string => {
  if (streak.current === 0) {
    return "Start your streak today! 💪";
  } else if (streak.current === 1) {
    return "🔥 Day 1 - Great start!";
  } else {
    return `🔥 ${streak.current} days in a row!`;
  }
};

/**
 * Check if user has completed a task today
 */
export const hasCompletedToday = (streak: StreakData): boolean => {
  const today = new Date().toISOString().split('T')[0];
  return streak.lastCompletedDate === today;
};

/**
 * Calculate days since last completion
 */
export const daysSinceLastCompletion = (streak: StreakData): number => {
  if (!streak.lastCompletedDate) return Infinity;
  
  const today = new Date().toISOString().split('T')[0];
  const lastDate = new Date(streak.lastCompletedDate);
  const todayDate = new Date(today);
  
  const diffTime = todayDate.getTime() - lastDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

/**
 * Check if streak should be reset due to missed days
 * This function can be called daily to check and reset streaks
 */
export const shouldResetStreak = (streak: StreakData): boolean => {
  const daysSince = daysSinceLastCompletion(streak);
  // If more than 1 day has passed since last completion, streak should reset
  return daysSince > 1;
};

/**
 * Reset streak to zero (for missed days)
 */
export const resetStreak = (streak: StreakData): StreakData => {
  return {
    current: 0,
    longest: streak.longest, // Keep longest record
    lastCompletedDate: '' // Clear last completion date
  };
};

/**
 * Get streak statistics for display
 */
export const getStreakStats = (streak: StreakData): {
  currentStreak: number;
  longestStreak: number;
  daysSinceLastActivity: number;
  isActive: boolean;
  motivationalMessage: string;
} => {
  const daysSince = daysSinceLastCompletion(streak);
  const isActive = daysSince <= 1;
  
  return {
    currentStreak: streak.current,
    longestStreak: streak.longest,
    daysSinceLastActivity: daysSince === Infinity ? 0 : daysSince,
    isActive,
    motivationalMessage: getStreakMessage(streak)
  };
}; 