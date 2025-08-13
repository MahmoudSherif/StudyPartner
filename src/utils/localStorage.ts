import { AppState } from '../types';

const getStorageKey = (userId: string) => `user_data_${userId}`;

export const saveUserStateLocal = (userId: string, state: AppState) => {
  try {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(state));
    console.log('Saved to local storage for user:', userId);
  } catch (error) {
    console.error('Error saving to local storage:', error);
  }
};

export const loadUserStateLocal = (userId: string): AppState => {
  try {
    const data = localStorage.getItem(getStorageKey(userId));
    if (data) {
      const parsed = JSON.parse(data);
      console.log('Loaded from local storage for user:', userId, parsed);
      return parsed;
    }
  } catch (error) {
    console.error('Error loading from local storage:', error);
  }
  
  // Return default state
  return {
    tasks: [],
    achievements: [],
    streak: { current: 0, longest: 0, lastCompletedDate: '', freezeCount: 0 },
    importantDates: [],
    questions: [],
    moodEntries: [],
    dailyProgress: []
  };
}; 