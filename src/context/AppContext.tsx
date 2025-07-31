import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AppState, Task, Achievement, ImportantDate, Question, MoodEntry, DailyProgress } from '../types';
import { generateId } from '../utils/storage';
import { 
  saveUserState, 
  loadUserState
} from '../utils/firebaseStorage';
import { useAuth } from './AuthContext';

type Action =
  | { type: 'ADD_TASK'; payload: Omit<Task, 'id' | 'createdAt'> }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'TOGGLE_TASK'; payload: string }
  | { type: 'ADD_ACHIEVEMENT'; payload: Omit<Achievement, 'id'> }
  | { type: 'ADD_IMPORTANT_DATE'; payload: Omit<ImportantDate, 'id'> }
  | { type: 'UPDATE_IMPORTANT_DATE'; payload: ImportantDate }
  | { type: 'DELETE_IMPORTANT_DATE'; payload: string }
  | { type: 'ADD_QUESTION'; payload: Omit<Question, 'id' | 'createdAt'> }
  | { type: 'UPDATE_QUESTION'; payload: Question }
  | { type: 'DELETE_QUESTION'; payload: string }
  | { type: 'ADD_MOOD_ENTRY'; payload: Omit<MoodEntry, 'id'> }
  | { type: 'UPDATE_STREAK'; payload: { current: number; longest: number; lastCompletedDate: string } }
  | { type: 'ADD_DAILY_PROGRESS'; payload: DailyProgress }
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'SET_ACHIEVEMENTS'; payload: Achievement[] }
  | { type: 'SET_STREAK'; payload: { current: number; longest: number; lastCompletedDate: string } }
  | { type: 'SET_IMPORTANTDATES'; payload: ImportantDate[] }
  | { type: 'SET_QUESTIONS'; payload: Question[] }
  | { type: 'SET_MOODENTRIES'; payload: MoodEntry[] }
  | { type: 'SET_DAILYPROGRESS'; payload: DailyProgress[] }
  | { type: 'SET_ALL_DATA'; payload: AppState }
  | { type: 'RESET_STATE' };

const initialState: AppState = {
  tasks: [],
  achievements: [],
  streak: { current: 0, longest: 0, lastCompletedDate: '' },
  importantDates: [],
  questions: [],
  moodEntries: [],
  dailyProgress: []
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
      break;

    case 'ADD_ACHIEVEMENT':
      newState = {
        ...state,
        achievements: [
          ...state.achievements,
          {
            ...action.payload,
            id: generateId()
          }
        ]
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
        ]
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
        ]
      };
      break;

    case 'UPDATE_STREAK':
      newState = {
        ...state,
        streak: action.payload
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
        achievements: action.payload
      };
      break;

    case 'SET_STREAK':
      newState = {
        ...state,
        streak: action.payload
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
      newState = {
        ...state,
        ...action.payload
      };
      break;

    case 'RESET_STATE':
      newState = {
        tasks: [],
        achievements: [],
        streak: { current: 0, longest: 0, lastCompletedDate: '' },
        importantDates: [],
        questions: [],
        moodEntries: [],
        dailyProgress: []
      };
      break;

    default:
      return state;
  }

  // Save to Firebase will be handled by useEffect
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
  addImportantDate: (date: Omit<ImportantDate, 'id'>) => void;
  deleteImportantDate: (id: string) => void;
  addQuestion: (question: Omit<Question, 'id' | 'createdAt'>) => void;
  deleteQuestion: (id: string) => void;
  addMoodEntry: (mood: Omit<MoodEntry, 'id'>) => void;
  updateStreak: (streak: { current: number; longest: number; lastCompletedDate: string }) => void;
  addDailyProgress: (progress: DailyProgress) => void;
  saveToFirebase: () => Promise<void>;
  reloadFromFirebase: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [isLoading, setIsLoading] = React.useState(false);
  const { currentUser } = useAuth();

  // Load user data from Firebase when user logs in
  useEffect(() => {
    if (currentUser && currentUser.uid) {
      const loadData = async () => {
        try {
          setIsLoading(true);
          console.log('Loading data for user:', currentUser.uid);
          const userData = await loadUserState();
          console.log('Loaded user data:', userData);
          
          // Update state with user data - use a single dispatch to avoid race conditions
          dispatch({ 
            type: 'SET_ALL_DATA', 
            payload: userData 
          });
        } catch (error) {
          console.error('Error loading user data:', error);
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
    }
  }, [currentUser]);

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

  // Save state to Firebase whenever it changes (but not on initial load)
  useEffect(() => {
    if (currentUser && currentUser.uid) {
      const saveData = async () => {
        try {
          console.log('Saving data for user:', currentUser.uid, state);
          await saveUserState(state);
          console.log('Successfully saved data to Firebase');
        } catch (error) {
          console.error('Error saving user data:', error);
        }
      };
      
      // Save immediately for important changes
      saveData();
    }
  }, [state, currentUser]);

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

  const updateStreak = (streak: { current: number; longest: number; lastCompletedDate: string }) => {
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

  const value: AppContextType = {
    state,
    isLoading,
    dispatch,
    addTask,
    toggleTask,
    deleteTask,
    addAchievement,
    addImportantDate,
    deleteImportantDate,
    addQuestion,
    deleteQuestion,
    addMoodEntry,
    updateStreak,
    addDailyProgress,
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