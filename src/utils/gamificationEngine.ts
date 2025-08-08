// Comprehensive gamification engine for MotiveMate
import { UserLevel, Achievement, DailyChallenge, UserStats } from '../types';

// XP and Level System
export const XP_PER_LEVEL = 100;
export const LEVEL_MULTIPLIER = 1.2;

export const calculateLevel = (totalXP: number): UserLevel => {
  let level = 1;
  let xpNeeded = XP_PER_LEVEL;
  let currentLevelXP = totalXP;

  while (currentLevelXP >= xpNeeded) {
    currentLevelXP -= xpNeeded;
    level++;
    xpNeeded = Math.floor(XP_PER_LEVEL * Math.pow(LEVEL_MULTIPLIER, level - 1));
  }

  const xpToNext = xpNeeded - currentLevelXP;
  
  return {
    level,
    currentXP: currentLevelXP,
    xpToNext,
    totalXP,
    title: getLevelTitle(level)
  };
};

export const getLevelTitle = (level: number): string => {
  if (level < 5) return "Rookie Motivator";
  if (level < 10) return "Rising Star";
  if (level < 15) return "Goal Getter";
  if (level < 20) return "Productivity Pro";
  if (level < 30) return "Achievement Hunter";
  if (level < 40) return "Motivation Master";
  if (level < 50) return "Legendary Producer";
  if (level < 75) return "Elite Achiever";
  if (level < 100) return "Grandmaster";
  return "Motivation Deity";
};

// XP Rewards System
export const XP_REWARDS = {
  TASK_COMPLETE: 15,
  HIGH_PRIORITY_TASK: 25,
  STREAK_DAY: 10,
  DAILY_CHALLENGE: 50,
  MOOD_ENTRY: 8,
  KNOWLEDGE_QUESTION: 12,
  PERFECT_DAY: 100, // All tasks + mood + knowledge
  FIRST_TIME_BONUS: 20,
  COMEBACK_BONUS: 30, // After being away for a while
};

export const COIN_REWARDS = {
  TASK_COMPLETE: 2,
  HIGH_PRIORITY_TASK: 5,
  STREAK_MILESTONE: 10,
  DAILY_CHALLENGE: 15,
  ACHIEVEMENT_UNLOCK: 25,
  PERFECT_DAY: 50,
  WEEKLY_BONUS: 30,
};

// Achievement System
export const createAchievementTemplate = (): Achievement[] => [
  // Task Achievements
  {
    id: 'first-task',
    title: 'Getting Started! 🌟',
    description: 'Complete your very first task',
    type: 'task',
    points: 10,
    rarity: 'common',
    icon: '🎯',
    unlocked: false,
    date: ''
  },
  {
    id: 'task-warrior-10',
    title: 'Task Warrior',
    description: 'Complete 10 tasks',
    type: 'task',
    points: 50,
    rarity: 'common',
    icon: '⚔️',
    unlocked: false,
    date: ''
  },
  {
    id: 'task-champion-50',
    title: 'Task Champion',
    description: 'Complete 50 tasks',
    type: 'task',
    points: 150,
    rarity: 'rare',
    icon: '🏆',
    unlocked: false,
    date: ''
  },
  {
    id: 'task-legend-100',
    title: 'Task Legend',
    description: 'Complete 100 tasks - You\'re unstoppable!',
    type: 'task',
    points: 300,
    rarity: 'epic',
    icon: '👑',
    unlocked: false,
    date: ''
  },
  {
    id: 'perfectionist',
    title: 'Perfectionist',
    description: 'Complete all tasks for 7 days straight',
    type: 'task',
    points: 200,
    rarity: 'rare',
    icon: '💎',
    unlocked: false,
    date: ''
  },

  // Streak Achievements
  {
    id: 'streak-3',
    title: 'On Fire! 🔥',
    description: 'Maintain a 3-day streak',
    type: 'streak',
    points: 30,
    rarity: 'common',
    icon: '🔥',
    unlocked: false,
    date: ''
  },
  {
    id: 'streak-7',
    title: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    type: 'streak',
    points: 70,
    rarity: 'rare',
    icon: '⭐',
    unlocked: false,
    date: ''
  },
  {
    id: 'streak-30',
    title: 'Monthly Master',
    description: 'Maintain a 30-day streak - Incredible dedication!',
    type: 'streak',
    points: 300,
    rarity: 'epic',
    icon: '🌟',
    unlocked: false,
    date: ''
  },
  {
    id: 'streak-100',
    title: 'Centurion',
    description: 'Maintain a 100-day streak - Legendary status!',
    type: 'streak',
    points: 1000,
    rarity: 'legendary',
    icon: '👑',
    unlocked: false,
    date: ''
  },

  // Milestone Achievements
  {
    id: 'level-10',
    title: 'Rising Star',
    description: 'Reach level 10',
    type: 'milestone',
    points: 100,
    rarity: 'rare',
    icon: '⭐',
    unlocked: false,
    date: ''
  },
  {
    id: 'level-25',
    title: 'Productivity Pro',
    description: 'Reach level 25',
    type: 'milestone',
    points: 250,
    rarity: 'epic',
    icon: '🚀',
    unlocked: false,
    date: ''
  },
  {
    id: 'level-50',
    title: 'Legendary Producer',
    description: 'Reach level 50 - You\'re in the top 1%!',
    type: 'milestone',
    points: 500,
    rarity: 'legendary',
    icon: '👑',
    unlocked: false,
    date: ''
  },

  // Daily Challenge Achievements
  {
    id: 'challenge-master',
    title: 'Challenge Master',
    description: 'Complete 10 daily challenges',
    type: 'daily-challenge',
    points: 150,
    rarity: 'rare',
    icon: '🎯',
    unlocked: false,
    date: ''
  },

  // Special Achievements
  {
    id: 'early-bird',
    title: 'Early Bird',
    description: 'Complete a task before 6 AM',
    type: 'special',
    points: 50,
    rarity: 'rare',
    icon: '🐦',
    unlocked: false,
    date: ''
  },
  {
    id: 'night-owl',
    title: 'Night Owl',
    description: 'Complete a task after 10 PM',
    type: 'special',
    points: 30,
    rarity: 'common',
    icon: '🦉',
    unlocked: false,
    date: ''
  },
  {
    id: 'speed-demon',
    title: 'Speed Demon',
    description: 'Complete 5 tasks in one hour',
    type: 'special',
    points: 75,
    rarity: 'rare',
    icon: '⚡',
    unlocked: false,
    date: ''
  },
  {
    id: 'mood-tracker',
    title: 'Mood Master',
    description: 'Track your mood for 7 days straight',
    type: 'special',
    points: 80,
    rarity: 'rare',
    icon: '😊',
    unlocked: false,
    date: ''
  },
  {
    id: 'knowledge-seeker',
    title: 'Knowledge Seeker',
    description: 'Add 25 study questions',
    type: 'special',
    points: 120,
    rarity: 'rare',
    icon: '📚',
    unlocked: false,
    date: ''
  }
];

// Daily Challenges System
export const generateDailyChallenges = (): DailyChallenge[] => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(23, 59, 59, 999);

  const challenges = [
    {
      id: 'daily-tasks-3',
      title: 'Triple Threat',
      description: 'Complete 3 tasks today',
      type: 'task-completion' as const,
      target: 3,
      progress: 0,
      reward: { xp: 50, coins: 15 },
      expiresAt: tomorrow.toISOString(),
      completed: false
    },
    {
      id: 'daily-high-priority',
      title: 'Priority Focus',
      description: 'Complete 1 high-priority task',
      type: 'task-completion' as const,
      target: 1,
      progress: 0,
      reward: { xp: 40, coins: 12 },
      expiresAt: tomorrow.toISOString(),
      completed: false
    },
    {
      id: 'daily-mood-track',
      title: 'Mood Check',
      description: 'Track your mood today',
      type: 'mood-track' as const,
      target: 1,
      progress: 0,
      reward: { xp: 25, coins: 8 },
      expiresAt: tomorrow.toISOString(),
      completed: false
    },
    {
      id: 'daily-knowledge',
      title: 'Learn Something New',
      description: 'Add 2 study questions',
      type: 'knowledge-add' as const,
      target: 2,
      progress: 0,
      reward: { xp: 35, coins: 10 },
      expiresAt: tomorrow.toISOString(),
      completed: false
    }
  ];

  // Randomly select 2-3 challenges for the day
  const shuffled = challenges.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.floor(Math.random() * 2) + 2);
};

// Achievement Checking
export const checkAchievements = (
  stats: UserStats,
  availableAchievements: Achievement[],
  unlockedAchievements: Achievement[]
): Achievement[] => {
  const newUnlocked: Achievement[] = [];
  const unlockedIds = new Set(unlockedAchievements.map(a => a.id));

  availableAchievements.forEach(achievement => {
    if (unlockedIds.has(achievement.id)) return;

    let shouldUnlock = false;

    switch (achievement.id) {
      case 'first-task':
        shouldUnlock = stats.totalTasksCompleted >= 1;
        break;
      case 'task-warrior-10':
        shouldUnlock = stats.totalTasksCompleted >= 10;
        break;
      case 'task-champion-50':
        shouldUnlock = stats.totalTasksCompleted >= 50;
        break;
      case 'task-legend-100':
        shouldUnlock = stats.totalTasksCompleted >= 100;
        break;
      case 'streak-3':
        shouldUnlock = stats.longestStreak >= 3;
        break;
      case 'streak-7':
        shouldUnlock = stats.longestStreak >= 7;
        break;
      case 'streak-30':
        shouldUnlock = stats.longestStreak >= 30;
        break;
      case 'streak-100':
        shouldUnlock = stats.longestStreak >= 100;
        break;
      case 'level-10':
        shouldUnlock = stats.level.level >= 10;
        break;
      case 'level-25':
        shouldUnlock = stats.level.level >= 25;
        break;
      case 'level-50':
        shouldUnlock = stats.level.level >= 50;
        break;
    }

    if (shouldUnlock) {
      newUnlocked.push({
        ...achievement,
        unlocked: true,
        date: new Date().toISOString()
      });
    }
  });

  return newUnlocked;
};

export const getRarityColor = (rarity: string): string => {
  switch (rarity) {
    case 'common': return 'text-slate-300 bg-slate-800/60';
    case 'rare': return 'text-blue-300 bg-blue-900/30';
    case 'epic': return 'text-purple-300 bg-purple-900/30';
    case 'legendary': return 'text-yellow-300 bg-yellow-900/20';
    default: return 'text-slate-300 bg-slate-800/60';
  }
};

export const getRarityBorder = (rarity: string): string => {
  switch (rarity) {
    case 'common': return 'border-slate-500/30';
    case 'rare': return 'border-blue-500/30';
    case 'epic': return 'border-purple-500/30';
    case 'legendary': return 'border-yellow-500/30';
    default: return 'border-slate-500/30';
  }
};