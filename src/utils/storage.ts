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
    streak: {
      current: 0,
      longest: 0,
      lastCompletedDate: '',
      freezeCount: 0
    },
    importantDates: [],
    questions: [],
    moodEntries: [],
    dailyProgress: []
  };
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}; 