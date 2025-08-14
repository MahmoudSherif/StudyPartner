import React, { createContext, useContext, useReducer, useEffect, useRef, useCallback } from 'react';
import { AppState, Task, Achievement, ImportantDate, Question, MoodEntry, DailyProgress, UserStats } from '../types';
import { generateId } from '../utils/storage';
import { 
  saveUserState, 
  loadUserState
} from '../utils/firebaseStorage';
import { 
  saveUserStateLocal, 
  loadUserStateLocal
} from '../utils/localStorage';
import { useAuth } from './AuthContext';
import { 
  calculateLevel, 
  XP_REWARDS, 
  COIN_REWARDS, 
  createAchievementTemplate,
  generateDailyChallenges,
  checkAchievements
} from '../utils/gamificationEngine';

type Action =
  | { type: 'ADD_TASK'; payload: Omit<Task, 'id' | 'createdAt'> }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'TOGGLE_TASK'; payload: string }
  | { type: 'ADD_ACHIEVEMENT'; payload: Omit<Achievement, 'id'> }
  | { type: 'UNLOCK_ACHIEVEMENT'; payload: Achievement }
  | { type: 'ADD_XP'; payload: number }
  | { type: 'ADD_COINS'; payload: number }
  | { type: 'UPDATE_USER_STATS'; payload: Partial<UserStats> }
  | { type: 'COMPLETE_DAILY_CHALLENGE'; payload: string }
  | { type: 'GENERATE_NEW_CHALLENGES' }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppState['settings']> }
  | { type: 'ADD_IMPORTANT_DATE'; payload: Omit<ImportantDate, 'id'> }
  | { type: 'UPDATE_IMPORTANT_DATE'; payload: ImportantDate }
  | { type: 'DELETE_IMPORTANT_DATE'; payload: string }
  | { type: 'ADD_QUESTION'; payload: Omit<Question, 'id' | 'createdAt'> }
  | { type: 'UPDATE_QUESTION'; payload: Question }
  | { type: 'DELETE_QUESTION'; payload: string }
  | { type: 'ADD_MOOD_ENTRY'; payload: Omit<MoodEntry, 'id'> }
  | { type: 'UPDATE_STREAK'; payload: { current: number; longest: number; lastCompletedDate: string; freezeCount?: number } }
  | { type: 'ADD_DAILY_PROGRESS'; payload: DailyProgress }
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'SET_ACHIEVEMENTS'; payload: Achievement[] }
  | { type: 'SET_STREAK'; payload: { current: number; longest: number; lastCompletedDate: string; freezeCount?: number } }
  | { type: 'SET_IMPORTANTDATES'; payload: ImportantDate[] }
  | { type: 'SET_QUESTIONS'; payload: Question[] }
  | { type: 'SET_MOODENTRIES'; payload: MoodEntry[] }
  | { type: 'SET_DAILYPROGRESS'; payload: DailyProgress[] }
  | { type: 'SET_ALL_DATA'; payload: AppState }
  | { type: 'RESET_STATE' }
  | { type: 'FIX_ACHIEVEMENTS' }
  | { type: 'FORCE_INIT_ACHIEVEMENTS' };

const initialState: AppState = {
  tasks: [],
  achievements: [],
  availableAchievements: createAchievementTemplate(),
  streak: { current: 0, longest: 0, lastCompletedDate: '', freezeCount: 3 },
  importantDates: [],
  questions: [],
  moodEntries: [],
  dailyProgress: [],
  userStats: {
    totalTasksCompleted: 0,
    longestStreak: 0,
    totalXP: 0,
    totalCoins: 100, // Start with some coins
    joinedDate: new Date().toISOString(),
    favoriteActivity: 'tasks',
    level: calculateLevel(0)
  },
  dailyChallenges: generateDailyChallenges(),
  leaderboard: [],
  coins: 100, // Start with some coins
  settings: {
    theme: 'galaxy',
    notifications: true,
    soundEffects: true,
    username: 'Profile',
    avatar: '🎯'
  }
};

// Debug log to check if achievement template is working
console.log('🔍 DEBUG: createAchievementTemplate() result:', createAchievementTemplate());
console.log('🔍 DEBUG: initialState.availableAchievements:', initialState.availableAchievements);

// Helper function to fix corrupted achievements
const fixAchievementsData = (achievements: Achievement[]): Achievement[] => {
  console.log('🔧 Starting achievements fix process...');
  console.log('Current achievements count:', achievements.length);
  
  const template = createAchievementTemplate();
  console.log('Fresh template count:', template.length);
  
  // Check if we have corrupted achievements
  const corrupted = achievements.filter(a => 
    a.title === "???" || 
    a.description === "???" || 
    !a.title || 
    !a.description ||
    a.title.trim() === "" ||
    a.description.trim() === "" ||
    a.title === "undefined" ||
    a.description === "undefined"
  );
  
  console.log('🚨 Found corrupted achievements:', corrupted.length);
  console.log('Corrupted achievements details:', corrupted);
  
  if (corrupted.length > 0) {
    // If we have corruptions, completely reset to fresh template
    // but preserve unlocked status and dates where possible
    console.log('🔄 Resetting to fresh template...');
    return template.map(templateAchievement => {
      const existing = achievements.find(a => a.id === templateAchievement.id);
      const result = {
        ...templateAchievement,
        unlocked: existing?.unlocked || false,
        date: existing?.date || ''
      };
      console.log(`Fixed achievement: ${result.id} -> ${result.title}`);
      return result;
    });
  }
  
  console.log('✅ No corruptions found, keeping existing achievements');
  return achievements;
};

// Helper function to completely reset corrupted data
const resetCorruptedData = (): AppState => {
  console.log('🚨 EMERGENCY RESET: Completely clearing corrupted data');
  
  // Clear all localStorage
  localStorage.clear();
  sessionStorage.clear();
  
  const freshState = {
    ...initialState,
    achievements: [], // Start fresh with no unlocked achievements
    availableAchievements: createAchievementTemplate()
  };
  
  console.log('✅ Fresh state created:', freshState);
  return freshState;
};

const appReducer = (state: AppState, action: Action): AppState => {
  let newState: AppState;

  switch (action.type) {
    case 'ADD_TASK':
      newState = {
        ...state,
        tasks: [
          ...state.tasks,
          {
            ...action.payload,
            id: generateId(),
            createdAt: new Date().toISOString()
          }
        ]
      };
      break;

    case 'UPDATE_TASK':
      newState = {
        ...state,
        tasks: state.tasks.map(task => 
          task.id === action.payload.id ? action.payload : task
        )
      };
      break;

    case 'DELETE_TASK':
      newState = {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload)
      };
      break;

    case 'TOGGLE_TASK':
      const task = state.tasks.find(t => t.id === action.payload);
      const isCompleting = task && !task.completed;
      
      newState = {
        ...state,
        tasks: state.tasks.map(task => {
          if (task.id === action.payload) {
            const completed = !task.completed;
            return {
              ...task,
              completed,
              completedAt: completed ? new Date().toISOString() : undefined
            };
          }
          return task;
        })
      };

      // If task is being completed, award XP and coins
      if (isCompleting && task) {
        const xpReward = task.priority === 'high' ? XP_REWARDS.HIGH_PRIORITY_TASK : XP_REWARDS.TASK_COMPLETE;
        const coinReward = task.priority === 'high' ? COIN_REWARDS.HIGH_PRIORITY_TASK : COIN_REWARDS.TASK_COMPLETE;
        
        newState = {
          ...newState,
          userStats: {
            ...newState.userStats,
            totalTasksCompleted: newState.userStats.totalTasksCompleted + 1,
            totalXP: newState.userStats.totalXP + xpReward,
            totalCoins: newState.userStats.totalCoins + coinReward,
            level: calculateLevel(newState.userStats.totalXP + xpReward)
          },
          coins: newState.coins + coinReward
        };

        // Update daily challenges progress
        newState = {
          ...newState,
          dailyChallenges: newState.dailyChallenges.map(challenge => {
            if (challenge.type === 'task-completion' && !challenge.completed) {
              const newProgress = challenge.progress + 1;
              return {
                ...challenge,
                progress: newProgress,
                completed: newProgress >= challenge.target
              };
            }
            return challenge;
          })
        };
      }
      break;

    case 'ADD_XP':
      newState = {
        ...state,
        userStats: {
          ...state.userStats,
          totalXP: state.userStats.totalXP + action.payload,
          level: calculateLevel(state.userStats.totalXP + action.payload)
        }
      };
      break;

    case 'ADD_COINS':
      newState = {
        ...state,
        coins: state.coins + action.payload,
        userStats: {
          ...state.userStats,
          totalCoins: state.userStats.totalCoins + action.payload
        }
      };
      break;

    case 'ADD_ACHIEVEMENT':
      newState = {
        ...state,
        achievements: [
          ...state.achievements,
          {
            ...action.payload,
            id: generateId(),
            unlocked: true,
            date: new Date().toISOString()
          }
        ]
      };
      break;

    case 'UNLOCK_ACHIEVEMENT':
      newState = {
        ...state,
        achievements: [
          ...state.achievements,
          {
            ...action.payload,
            unlocked: true,
            date: new Date().toISOString()
          }
        ],
        userStats: {
          ...state.userStats,
          totalXP: state.userStats.totalXP + action.payload.points,
          level: calculateLevel(state.userStats.totalXP + action.payload.points)
        },
        coins: state.coins + COIN_REWARDS.ACHIEVEMENT_UNLOCK
      };
      break;

    case 'COMPLETE_DAILY_CHALLENGE':
      const challenge = state.dailyChallenges.find(c => c.id === action.payload);
      if (challenge && !challenge.completed) {
        newState = {
          ...state,
          dailyChallenges: state.dailyChallenges.map(c => 
            c.id === action.payload ? { ...c, completed: true } : c
          ),
          userStats: {
            ...state.userStats,
            totalXP: state.userStats.totalXP + challenge.reward.xp,
            totalCoins: state.userStats.totalCoins + challenge.reward.coins,
            level: calculateLevel(state.userStats.totalXP + challenge.reward.xp)
          },
          coins: state.coins + challenge.reward.coins
        };
      } else {
        newState = state;
      }
      break;

    case 'GENERATE_NEW_CHALLENGES':
      newState = {
        ...state,
        dailyChallenges: generateDailyChallenges()
      };
      break;

    case 'UPDATE_SETTINGS':
      newState = {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload
        }
      };
      break;

    case 'ADD_IMPORTANT_DATE':
      newState = {
        ...state,
        importantDates: [
          ...state.importantDates,
          {
            ...action.payload,
            id: generateId()
          }
        ]
      };
      break;

    case 'UPDATE_IMPORTANT_DATE':
      newState = {
        ...state,
        importantDates: state.importantDates.map(date => 
          date.id === action.payload.id ? action.payload : date
        )
      };
      break;

    case 'DELETE_IMPORTANT_DATE':
      newState = {
        ...state,
        importantDates: state.importantDates.filter(date => date.id !== action.payload)
      };
      break;

    case 'ADD_QUESTION':
      newState = {
        ...state,
        questions: [
          ...state.questions,
          {
            ...action.payload,
            id: generateId(),
            createdAt: new Date().toISOString()
          }
        ],
        userStats: {
          ...state.userStats,
          totalXP: state.userStats.totalXP + XP_REWARDS.KNOWLEDGE_QUESTION,
          level: calculateLevel(state.userStats.totalXP + XP_REWARDS.KNOWLEDGE_QUESTION)
        }
      };

      // Update daily challenges progress
      newState = {
        ...newState,
        dailyChallenges: newState.dailyChallenges.map(challenge => {
          if (challenge.type === 'knowledge-add' && !challenge.completed) {
            const newProgress = challenge.progress + 1;
            return {
              ...challenge,
              progress: newProgress,
              completed: newProgress >= challenge.target
            };
          }
          return challenge;
        })
      };
      break;

    case 'UPDATE_QUESTION':
      newState = {
        ...state,
        questions: state.questions.map(question => 
          question.id === action.payload.id ? action.payload : question
        )
      };
      break;

    case 'DELETE_QUESTION':
      newState = {
        ...state,
        questions: state.questions.filter(question => question.id !== action.payload)
      };
      break;

    case 'ADD_MOOD_ENTRY':
      newState = {
        ...state,
        moodEntries: [
          ...state.moodEntries,
          {
            ...action.payload,
            id: generateId()
          }
        ],
        userStats: {
          ...state.userStats,
          totalXP: state.userStats.totalXP + XP_REWARDS.MOOD_ENTRY,
          level: calculateLevel(state.userStats.totalXP + XP_REWARDS.MOOD_ENTRY)
        }
      };

      // Update daily challenges progress
      newState = {
        ...newState,
        dailyChallenges: newState.dailyChallenges.map(challenge => {
          if (challenge.type === 'mood-track' && !challenge.completed) {
            const newProgress = challenge.progress + 1;
            return {
              ...challenge,
              progress: newProgress,
              completed: newProgress >= challenge.target
            };
          }
          return challenge;
        })
      };
      break;

    case 'UPDATE_STREAK':
      newState = {
        ...state,
        streak: {
          current: action.payload.current,
          longest: action.payload.longest,
          lastCompletedDate: action.payload.lastCompletedDate,
          freezeCount: action.payload.freezeCount ?? state.streak.freezeCount
        },
        userStats: {
          ...state.userStats,
          longestStreak: Math.max(state.userStats.longestStreak, action.payload.longest)
        }
      };
      break;

    case 'ADD_DAILY_PROGRESS':
      newState = {
        ...state,
        dailyProgress: [
          ...state.dailyProgress.filter(progress => progress.date !== action.payload.date),
          action.payload
        ]
      };
      break;

    case 'SET_TASKS':
      newState = {
        ...state,
        tasks: action.payload
      };
      break;

    case 'SET_ACHIEVEMENTS':
      newState = {
        ...state,
        achievements: fixAchievementsData(action.payload)
      };
      break;

    case 'SET_STREAK':
      newState = {
        ...state,
        streak: {
          current: action.payload.current,
          longest: action.payload.longest,
          lastCompletedDate: action.payload.lastCompletedDate,
          freezeCount: action.payload.freezeCount ?? 3
        }
      };
      break;

    case 'SET_IMPORTANTDATES':
      newState = {
        ...state,
        importantDates: action.payload
      };
      break;

    case 'SET_QUESTIONS':
      newState = {
        ...state,
        questions: action.payload
      };
      break;

    case 'SET_MOODENTRIES':
      newState = {
        ...state,
        moodEntries: action.payload
      };
      break;

    case 'SET_DAILYPROGRESS':
      newState = {
        ...state,
        dailyProgress: action.payload
      };
      break;

    case 'SET_ALL_DATA':
      // Ensure we have default values for new properties
      const incomingAchievements = action.payload.availableAchievements;
      const shouldUseTemplate = !incomingAchievements || 
                               !Array.isArray(incomingAchievements) || 
                               incomingAchievements.length === 0;
      
      console.log('🔍 SET_ALL_DATA debug:');
      console.log('Incoming availableAchievements:', incomingAchievements);
      console.log('Should use template?', shouldUseTemplate);
      
      newState = {
        ...initialState,
        ...action.payload,
        achievements: fixAchievementsData(action.payload.achievements || []),
        availableAchievements: shouldUseTemplate ? createAchievementTemplate() : incomingAchievements,
        userStats: {
          ...initialState.userStats,
          ...action.payload.userStats,
          level: calculateLevel(action.payload.userStats?.totalXP || 0)
        },
        dailyChallenges: action.payload.dailyChallenges || generateDailyChallenges(),
        settings: {
          ...initialState.settings,
          ...action.payload.settings
        },
        coins: action.payload.coins || 100,
        streak: {
          ...initialState.streak,
          ...action.payload.streak,
          freezeCount: action.payload.streak?.freezeCount ?? 3
        }
      };
      
      console.log('✅ Final availableAchievements count:', newState.availableAchievements.length);
      break;

    case 'RESET_STATE':
      newState = initialState;
      break;

    case 'FIX_ACHIEVEMENTS':
      // Check if we have severe corruption that requires full reset
      const hasCorruption = state.achievements.some(a => 
        a.title === "???" || 
        a.description === "???" || 
        !a.title || 
        !a.description ||
        a.title.trim() === "" ||
        a.description.trim() === "" ||
        a.title === "undefined" ||
        a.description === "undefined"
      );
      
      if (hasCorruption) {
        console.log('🚨 Severe corruption detected - performing full reset');
        newState = resetCorruptedData();
      } else {
        newState = {
          ...state,
          achievements: fixAchievementsData(state.achievements),
          availableAchievements: createAchievementTemplate()
        };
      }
      break;

    case 'FORCE_INIT_ACHIEVEMENTS':
      console.log('🔧 FORCE_INIT_ACHIEVEMENTS - populating availableAchievements');
      newState = {
        ...state,
        availableAchievements: createAchievementTemplate()
      };
      break;

    default:
      return state;
  }

  // Check for new achievements after state update
  if (action.type !== 'SET_ALL_DATA' && action.type !== 'RESET_STATE') {
    const newUnlockedAchievements = checkAchievements(
      newState.userStats,
      newState.availableAchievements,
      newState.achievements
    );

    if (newUnlockedAchievements.length > 0) {
      newState = {
        ...newState,
        achievements: [...newState.achievements, ...newUnlockedAchievements],
        userStats: {
          ...newState.userStats,
          totalXP: newState.userStats.totalXP + newUnlockedAchievements.reduce((sum, a) => sum + a.points, 0),
          level: calculateLevel(newState.userStats.totalXP + newUnlockedAchievements.reduce((sum, a) => sum + a.points, 0))
        },
        coins: newState.coins + (newUnlockedAchievements.length * COIN_REWARDS.ACHIEVEMENT_UNLOCK)
      };
    }
  }

  return newState;
};

interface AppContextType {
  state: AppState;
  isLoading: boolean;
  dispatch: React.Dispatch<Action>;
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  addAchievement: (achievement: Omit<Achievement, 'id'>) => void;
  unlockAchievement: (achievement: Achievement) => void;
  addXP: (amount: number) => void;
  addCoins: (amount: number) => void;
  completeDailyChallenge: (challengeId: string) => void;
  generateNewChallenges: () => void;
  updateSettings: (settings: Partial<AppState['settings']>) => void;
  addImportantDate: (date: Omit<ImportantDate, 'id'>) => void;
  deleteImportantDate: (id: string) => void;
  addQuestion: (question: Omit<Question, 'id' | 'createdAt'>) => void;
  deleteQuestion: (id: string) => void;
  addMoodEntry: (mood: Omit<MoodEntry, 'id'>) => void;
  updateStreak: (streak: { current: number; longest: number; lastCompletedDate: string; freezeCount?: number }) => void;
  addDailyProgress: (progress: DailyProgress) => void;
  fixAchievements: () => void;
  saveToFirebase: () => Promise<void>;
  reloadFromFirebase: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [isLoading, setIsLoading] = React.useState(false);
  const { currentUser } = useAuth();
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialLoadRef = useRef(true);
  const lastSavedStateRef = useRef<string>('');

  // Force ensure availableAchievements are always populated
  useEffect(() => {
    console.log('🔍 Checking availableAchievements:', state.availableAchievements.length);
    
    if (state.availableAchievements.length === 0) {
      console.log('🚨 availableAchievements is empty - force populating...');
      setTimeout(() => {
        dispatch({ type: 'FORCE_INIT_ACHIEVEMENTS' });
      }, 100);
    } else {
      // Also check if achievements are corrupted
      const validAchievements = state.availableAchievements.filter(a => 
        a && a.id && a.title && a.description && a.title !== '???' && a.description !== '???'
      );
      
      if (validAchievements.length === 0) {
        console.log('🚨 All availableAchievements are corrupted - force repopulating...');
        setTimeout(() => {
          dispatch({ type: 'FORCE_INIT_ACHIEVEMENTS' });
        }, 100);
      }
    }
  }, [state.availableAchievements, state.availableAchievements.length]);

  // Debounced save function
  const debouncedSave = useCallback(async (stateToSave: AppState) => {
    if (!currentUser?.uid) return;
    
    // Validate state before saving - never save empty availableAchievements
    if (!stateToSave.availableAchievements || stateToSave.availableAchievements.length === 0) {
      console.log('🚨 Preventing save with empty availableAchievements');
      stateToSave = {
        ...stateToSave,
        availableAchievements: createAchievementTemplate()
      };
    }
    
    const stateString = JSON.stringify(stateToSave);
    // Don't save if state hasn't actually changed
    if (stateString === lastSavedStateRef.current) return;
    
    try {
      console.log('Saving data for user:', currentUser.uid);
      console.log('Saving availableAchievements count:', stateToSave.availableAchievements.length);
      
      // Try Firebase first, fallback to local storage
      try {
        await saveUserState(stateToSave);
        console.log('Successfully saved data to Firebase');
        lastSavedStateRef.current = stateString;
      } catch (firebaseError) {
        console.log('Firebase failed, saving to local storage:', firebaseError);
        saveUserStateLocal(currentUser.uid, stateToSave);
        lastSavedStateRef.current = stateString;
      }
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  }, [currentUser]);

  // Load user data from Firebase when user logs in
  useEffect(() => {
    if (currentUser && currentUser.uid) {
      const loadData = async () => {
        try {
          setIsLoading(true);
          console.log('Loading data for user:', currentUser.uid);
          
          // Check if offline mode is enabled
          const isOfflineMode = localStorage.getItem('motiveMate_offlineMode') === 'true';
          
          let userData;
          try {
            if (isOfflineMode) {
              console.log('🔌 Offline mode enabled - skipping Firebase');
              throw new Error('Offline mode');
            }
            
            // Try Firebase first, fallback to local storage
            userData = await loadUserState();
            console.log('Loaded user data from Firebase:', userData);
          } catch (firebaseError) {
            console.log('Firebase blocked/failed, using local storage:', firebaseError);
            userData = loadUserStateLocal(currentUser.uid);
            
            // If no local data exists, use fresh initial state
            if (!userData || Object.keys(userData).length === 0) {
              console.log('No local data found, using fresh initial state');
              userData = {
                ...initialState,
                achievements: [], // Start fresh
                availableAchievements: createAchievementTemplate()
              };
              // Save this fresh state to local storage
              saveUserStateLocal(currentUser.uid, userData);
            }
          }
          
          // Ensure achievements are properly initialized
          if (!userData.availableAchievements || userData.availableAchievements.length === 0) {
            console.log('🔧 Initializing missing availableAchievements');
            userData.availableAchievements = createAchievementTemplate();
          }
          
          // Validate each achievement has required properties
          userData.availableAchievements = userData.availableAchievements.filter(a => 
            a && a.id && a.title && a.description
          );
          
          // If filtering removed achievements, repopulate from template
          if (userData.availableAchievements.length === 0) {
            console.log('🚨 All achievements were invalid - repopulating from template');
            userData.availableAchievements = createAchievementTemplate();
          }
          
          // Fix any corrupted achievements
          if (userData.achievements) {
            userData.achievements = fixAchievementsData(userData.achievements);
          } else {
            userData.achievements = [];
          }
          
          console.log('Final user data to load:', {
            ...userData,
            availableAchievements: `Array(${userData.availableAchievements.length})`
          });
          
          // Update state with user data
          dispatch({ 
            type: 'SET_ALL_DATA', 
            payload: userData 
          });
          
          // Store the loaded state as the last saved state
          lastSavedStateRef.current = JSON.stringify(userData);
          isInitialLoadRef.current = false;
        } catch (error) {
          console.error('Error loading user data:', error);
          
          // If everything fails, use initial state
          console.log('🚨 Complete fallback to initial state');
          dispatch({ 
            type: 'SET_ALL_DATA', 
            payload: initialState 
          });
        } finally {
          setIsLoading(false);
        }
      };
    
      // Add a small delay to ensure Firebase auth is ready
      setTimeout(loadData, 100);
    } else if (!currentUser) {
      // Reset state when user logs out
      dispatch({ type: 'RESET_STATE' });
      setIsLoading(false);
      isInitialLoadRef.current = true;
      lastSavedStateRef.current = '';
    }
  }, [currentUser]);

  // Daily challenge refresh check
  useEffect(() => {
    const checkDailyChallenges = () => {
      if (state.dailyChallenges.length > 0) {
        const now = new Date();
        const hasExpired = state.dailyChallenges.some(challenge => 
          new Date(challenge.expiresAt) < now
        );
        
        if (hasExpired) {
          dispatch({ type: 'GENERATE_NEW_CHALLENGES' });
        }
      }
    };

    // Check on component mount and then every hour
    checkDailyChallenges();
    const interval = setInterval(checkDailyChallenges, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [state.dailyChallenges]);

  // Reload data when page becomes visible (handles refresh)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (currentUser && currentUser.uid && !document.hidden) {
        console.log('Page became visible, reloading data...');
        const loadData = async () => {
          try {
            setIsLoading(true);
            const userData = await loadUserState();
            console.log('Reloaded user data on visibility change:', userData);
            dispatch({ 
              type: 'SET_ALL_DATA', 
              payload: userData 
            });
            lastSavedStateRef.current = JSON.stringify(userData);
          } catch (error) {
            console.error('Error reloading user data:', error);
          } finally {
            setIsLoading(false);
          }
        };
        loadData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [currentUser]);

  // Debounced save state to Firebase whenever it changes (after initial load)
  useEffect(() => {
    // Skip saving during initial load or if no user
    if (isInitialLoadRef.current || !currentUser?.uid) return;
    
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Set new timeout for debounced save (500ms delay)
    saveTimeoutRef.current = setTimeout(() => {
      debouncedSave(state);
    }, 500);
    
    // Cleanup timeout on unmount
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [state, currentUser, debouncedSave]);

  // Immediate save for critical actions (like logout)
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (currentUser?.uid && !isInitialLoadRef.current) {
        // Force immediate save before page unload
        const stateString = JSON.stringify(state);
        if (stateString !== lastSavedStateRef.current) {
          try {
            saveUserStateLocal(currentUser.uid, state);
          } catch (error) {
            console.error('Error saving on page unload:', error);
          }
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [currentUser, state]);

  const addTask = (task: Omit<Task, 'id' | 'createdAt'>) => {
    dispatch({ type: 'ADD_TASK', payload: task });
  };

  const toggleTask = (id: string) => {
    dispatch({ type: 'TOGGLE_TASK', payload: id });
  };

  const deleteTask = (id: string) => {
    dispatch({ type: 'DELETE_TASK', payload: id });
  };

  const addAchievement = (achievement: Omit<Achievement, 'id'>) => {
    dispatch({ type: 'ADD_ACHIEVEMENT', payload: achievement });
  };

  const unlockAchievement = (achievement: Achievement) => {
    dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: achievement });
  };

  const addXP = (amount: number) => {
    dispatch({ type: 'ADD_XP', payload: amount });
  };

  const addCoins = (amount: number) => {
    dispatch({ type: 'ADD_COINS', payload: amount });
  };

  const completeDailyChallenge = (challengeId: string) => {
    dispatch({ type: 'COMPLETE_DAILY_CHALLENGE', payload: challengeId });
  };

  const generateNewChallenges = () => {
    dispatch({ type: 'GENERATE_NEW_CHALLENGES' });
  };

  const updateSettings = (settings: Partial<AppState['settings']>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
  };

  const addImportantDate = (date: Omit<ImportantDate, 'id'>) => {
    dispatch({ type: 'ADD_IMPORTANT_DATE', payload: date });
  };

  const deleteImportantDate = (id: string) => {
    dispatch({ type: 'DELETE_IMPORTANT_DATE', payload: id });
  };

  const addQuestion = (question: Omit<Question, 'id' | 'createdAt'>) => {
    dispatch({ type: 'ADD_QUESTION', payload: question });
  };

  const deleteQuestion = (id: string) => {
    dispatch({ type: 'DELETE_QUESTION', payload: id });
  };

  const addMoodEntry = (mood: Omit<MoodEntry, 'id'>) => {
    dispatch({ type: 'ADD_MOOD_ENTRY', payload: mood });
  };

  const updateStreak = (streak: { current: number; longest: number; lastCompletedDate: string; freezeCount?: number }) => {
    dispatch({ type: 'UPDATE_STREAK', payload: streak });
  };

  const addDailyProgress = (progress: DailyProgress) => {
    dispatch({ type: 'ADD_DAILY_PROGRESS', payload: progress });
  };

  const saveToFirebase = async () => {
    if (currentUser && currentUser.uid) {
      try {
        console.log('Manual save triggered for user:', currentUser.uid);
        await saveUserState(state);
        console.log('Manual save completed successfully');
      } catch (error) {
        console.error('Error in manual save:', error);
      }
    }
  };

  const reloadFromFirebase = async () => {
    if (currentUser && currentUser.uid) {
      try {
        setIsLoading(true);
        console.log('Manual reload triggered for user:', currentUser.uid);
        const userData = await loadUserState();
        console.log('Manual reload completed:', userData);
        dispatch({ 
          type: 'SET_ALL_DATA', 
          payload: userData 
        });
      } catch (error) {
        console.error('Error in manual reload:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Auto-fix corrupted achievements on startup
  useEffect(() => {
    const checkForCorruption = () => {
      const corrupted = state.achievements.some(a => 
        a.title === "???" || 
        a.description === "???" || 
        !a.title || 
        !a.description ||
        a.title.trim() === "" ||
        a.description.trim() === "" ||
        a.title === 'undefined' ||
        a.description === 'undefined'
      );
      
      if (corrupted) {
        console.log('🚨 Corrupted achievements detected on startup - fixing automatically...');
        console.log('Corrupted achievements:', state.achievements.filter(a => 
          a.title === "???" || 
          a.description === "???" || 
          !a.title || 
          !a.description ||
          a.title.trim() === "" ||
          a.description.trim() === ""
        ));
        
        // Add global helper functions
        (window as any).clearMotiveMateData = () => {
          console.log('🗑️ Clearing all MotiveMate data...');
          localStorage.clear();
          sessionStorage.clear();
          window.location.reload();
        };
        
        (window as any).enableOfflineMode = () => {
          console.log('� Enabling offline mode...');
          localStorage.setItem('motiveMate_offlineMode', 'true');
          const freshData = {
            ...initialState,
            achievements: [],
            availableAchievements: createAchievementTemplate()
          };
          if (currentUser?.uid) {
            saveUserStateLocal(currentUser.uid, freshData);
          }
          window.location.reload();
        };
        
        console.log('🔧 Available commands:');
        console.log('- clearMotiveMateData() - Clear all data');
        console.log('- enableOfflineMode() - Force offline mode (bypasses Firebase)');
        
        // Trigger fix
        setTimeout(() => {
          dispatch({ type: 'FIX_ACHIEVEMENTS' });
        }, 500);
      }
      
      // Always expose helper functions
      if (!(window as any).clearMotiveMateData) {
        (window as any).clearMotiveMateData = () => {
          console.log('🗑️ Clearing all MotiveMate data...');
          localStorage.clear();
          sessionStorage.clear();
          window.location.reload();
        };
      }
      
      if (!(window as any).enableOfflineMode) {
        (window as any).enableOfflineMode = () => {
          console.log('🔌 Enabling offline mode...');
          localStorage.setItem('motiveMate_offlineMode', 'true');
          const freshData = {
            ...initialState,
            achievements: [],
            availableAchievements: createAchievementTemplate()
          };
          if (currentUser?.uid) {
            saveUserStateLocal(currentUser.uid, freshData);
          }
          window.location.reload();
        };
      }
    };

    // Check after a brief delay to ensure state is loaded
    if (state.achievements.length > 0) {
      setTimeout(checkForCorruption, 1000);
    } else {
      // If no achievements at all, also expose helper functions
      setTimeout(checkForCorruption, 2000);
    }
  }, [state.achievements, currentUser]);

  const fixAchievements = useCallback(() => {
    console.log('🔧 Manual achievement fix triggered');
    
    // Clear all localStorage related to achievements
    localStorage.removeItem('motiveMateAchievements');
    localStorage.removeItem('motiveMateData');
    localStorage.removeItem('motivemateAppData');
    console.log('🗑️ Cleared all localStorage caches');
    
    // Dispatch fix action with fresh template
    dispatch({ 
      type: 'FIX_ACHIEVEMENTS'
    });
    
    console.log('✅ Achievement fix completed - refreshing in 1 second');
    
    // Force page refresh after a short delay to ensure clean state
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }, []);

  const value: AppContextType = {
    state,
    isLoading,
    dispatch,
    addTask,
    toggleTask,
    deleteTask,
    addAchievement,
    unlockAchievement,
    addXP,
    addCoins,
    completeDailyChallenge,
    generateNewChallenges,
    updateSettings,
    addImportantDate,
    deleteImportantDate,
    addQuestion,
    deleteQuestion,
    addMoodEntry,
    updateStreak,
    addDailyProgress,
    fixAchievements,
    saveToFirebase,
    reloadFromFirebase
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}; 