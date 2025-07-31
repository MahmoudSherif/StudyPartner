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
  | { type: 'SET_DAILYPROGRESS'; payload: DailyProgress[] };

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

    default:
      return state;
  }

  // Save to Firebase will be handled by useEffect
  return newState;
};

interface AppContextType {
  state: AppState;
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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { currentUser } = useAuth();

  // Load user data from Firebase when user logs in
  useEffect(() => {
    if (currentUser) {
      const loadData = async () => {
        try {
          console.log('Loading data for user:', currentUser.uid);
          const userData = await loadUserState();
          console.log('Loaded user data:', userData);
          
          // Update state with user data
          Object.entries(userData).forEach(([key, value]) => {
            const actionType = `SET_${key.toUpperCase()}` as any;
            console.log('Dispatching action:', actionType, value);
            dispatch({ 
              type: actionType, 
              payload: value 
            });
          });
        } catch (error) {
          console.error('Error loading user data:', error);
        }
      };
      
      loadData();
    } else {
      // Reset state when user logs out
      dispatch({ type: 'SET_TASKS', payload: [] });
      dispatch({ type: 'SET_ACHIEVEMENTS', payload: [] });
      dispatch({ type: 'SET_STREAK', payload: { current: 0, longest: 0, lastCompletedDate: '' } });
      dispatch({ type: 'SET_IMPORTANTDATES', payload: [] });
      dispatch({ type: 'SET_QUESTIONS', payload: [] });
      dispatch({ type: 'SET_MOODENTRIES', payload: [] });
      dispatch({ type: 'SET_DAILYPROGRESS', payload: [] });
    }
  }, [currentUser]);

  // Save state to Firebase whenever it changes (but not on initial load)
  useEffect(() => {
    if (currentUser) {
      const saveData = async () => {
        try {
          console.log('Saving data for user:', currentUser.uid, state);
          await saveUserState(state);
        } catch (error) {
          console.error('Error saving user data:', error);
        }
      };
      
      // Debounce the save to avoid too many Firebase calls
      const timeoutId = setTimeout(saveData, 1000);
      return () => clearTimeout(timeoutId);
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

  const value: AppContextType = {
    state,
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
    addDailyProgress
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