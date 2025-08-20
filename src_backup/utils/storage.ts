import { AppState } from '../types';

const STORAGE_KEY = 'student-productivity-hub';

export const loadState = (): AppState => {
  try {
    const serializedState = localStorage.getItem(STORAGE_KEY);
    if (serializedState === null) {
      return getDefaultState();
    }
    return JSON.parse(serializedState);
  } catch (err) {
    console.error('Failed to load state from localStorage:', err);
    return getDefaultState();
  }
};

export const saveState = (state: AppState): void => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, serializedState);
  } catch (err) {
    console.error('Failed to save state to localStorage:', err);
  }
};

const getDefaultState = (): AppState => {

  
  return {
    tasks: [],
    achievements: [],
    availableAchievements: [],
    streak: {
      current: 0,
      longest: 0,
      lastCompletedDate: '',
      freezeCount: 3
    },
    importantDates: [],
    questions: [],
    moodEntries: [],
    dailyProgress: [],
    userStats: { 
      totalTasksCompleted: 0,
      longestStreak: 0,
      totalXP: 0,
      totalCoins: 0,
      joinedDate: new Date().toISOString(),
      favoriteActivity: '',
      level: { level: 1, currentXP: 0, xpToNext: 100, title: 'Beginner', totalXP: 0 }
    },
    dailyChallenges: [],
    leaderboard: [],
    coins: 0,
    settings: {
      theme: 'space' as const,
      notifications: true,
      soundEffects: true,
      username: '',
      avatar: '🎯'
    }
  };
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}; 