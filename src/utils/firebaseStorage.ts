import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  onSnapshot
} from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { AppState, Task, Achievement, ImportantDate, Question, MoodEntry } from '../types';

// Get current user ID
const getCurrentUserId = () => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }
  return user.uid;
};

// Save user's complete state to Firestore
export const saveUserState = async (state: AppState) => {
  try {
    const userId = getCurrentUserId();
    const userDoc = doc(db, 'users', userId);
    
    console.log('Saving state to Firebase for user:', userId, state);
    
    await setDoc(userDoc, {
      tasks: state.tasks || [],
      achievements: state.achievements || [],
      streak: state.streak || { current: 0, longest: 0, lastCompletedDate: '' },
      importantDates: state.importantDates || [],
      questions: state.questions || [],
      moodEntries: state.moodEntries || [],
      dailyProgress: state.dailyProgress || [],
      lastUpdated: new Date().toISOString()
    });
    
    console.log('Successfully saved state to Firebase');
  } catch (error) {
    console.error('Error saving user state:', error);
    throw error;
  }
};

// Load user's complete state from Firestore
export const loadUserState = async (): Promise<AppState> => {
  try {
    const userId = getCurrentUserId();
    const userDoc = doc(db, 'users', userId);
    const docSnap = await getDoc(userDoc);
    
    console.log('Loading data for user:', userId);
    console.log('Document exists:', docSnap.exists());
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log('Raw Firebase data:', data);
      
      const appState = {
        tasks: data.tasks || [],
        achievements: data.achievements || [],
        streak: data.streak || { current: 0, longest: 0, lastCompletedDate: '' },
        importantDates: data.importantDates || [],
        questions: data.questions || [],
        moodEntries: data.moodEntries || [],
        dailyProgress: data.dailyProgress || []
      };
      
      console.log('Processed app state:', appState);
      return appState;
    } else {
      console.log('No existing data found, returning default state');
      // Return default state for new users
      return {
        tasks: [],
        achievements: [],
        streak: { current: 0, longest: 0, lastCompletedDate: '' },
        importantDates: [],
        questions: [],
        moodEntries: [],
        dailyProgress: []
      };
    }
  } catch (error) {
    console.error('Error loading user state:', error);
    throw error;
  }
};

// Add a task for the current user
export const addUserTask = async (task: Task) => {
  try {
    const userId = getCurrentUserId();
    const userDoc = doc(db, 'users', userId);
    const docSnap = await getDoc(userDoc);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      const updatedTasks = [...(data.tasks || []), task];
      await updateDoc(userDoc, { tasks: updatedTasks });
    } else {
      await setDoc(userDoc, { tasks: [task] });
    }
  } catch (error) {
    console.error('Error adding task:', error);
    throw error;
  }
};

// Update a task for the current user
export const updateUserTask = async (taskId: string, updates: Partial<Task>) => {
  try {
    const userId = getCurrentUserId();
    const userDoc = doc(db, 'users', userId);
    const docSnap = await getDoc(userDoc);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      const updatedTasks = (data.tasks || []).map((task: Task) =>
        task.id === taskId ? { ...task, ...updates } : task
      );
      await updateDoc(userDoc, { tasks: updatedTasks });
    }
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
};

// Delete a task for the current user
export const deleteUserTask = async (taskId: string) => {
  try {
    const userId = getCurrentUserId();
    const userDoc = doc(db, 'users', userId);
    const docSnap = await getDoc(userDoc);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      const updatedTasks = (data.tasks || []).filter((task: Task) => task.id !== taskId);
      await updateDoc(userDoc, { tasks: updatedTasks });
    }
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
};

// Add an achievement for the current user
export const addUserAchievement = async (achievement: Achievement) => {
  try {
    const userId = getCurrentUserId();
    const userDoc = doc(db, 'users', userId);
    const docSnap = await getDoc(userDoc);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      const updatedAchievements = [...(data.achievements || []), achievement];
      await updateDoc(userDoc, { achievements: updatedAchievements });
    } else {
      await setDoc(userDoc, { achievements: [achievement] });
    }
  } catch (error) {
    console.error('Error adding achievement:', error);
    throw error;
  }
};

// Add an important date for the current user
export const addUserImportantDate = async (importantDate: ImportantDate) => {
  try {
    const userId = getCurrentUserId();
    const userDoc = doc(db, 'users', userId);
    const docSnap = await getDoc(userDoc);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      const updatedImportantDates = [...(data.importantDates || []), importantDate];
      await updateDoc(userDoc, { importantDates: updatedImportantDates });
    } else {
      await setDoc(userDoc, { importantDates: [importantDate] });
    }
  } catch (error) {
    console.error('Error adding important date:', error);
    throw error;
  }
};

// Add a question for the current user
export const addUserQuestion = async (question: Question) => {
  try {
    const userId = getCurrentUserId();
    const userDoc = doc(db, 'users', userId);
    const docSnap = await getDoc(userDoc);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      const updatedQuestions = [...(data.questions || []), question];
      await updateDoc(userDoc, { questions: updatedQuestions });
    } else {
      await setDoc(userDoc, { questions: [question] });
    }
  } catch (error) {
    console.error('Error adding question:', error);
    throw error;
  }
};

// Add a mood entry for the current user
export const addUserMoodEntry = async (moodEntry: MoodEntry) => {
  try {
    const userId = getCurrentUserId();
    const userDoc = doc(db, 'users', userId);
    const docSnap = await getDoc(userDoc);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      const updatedMoodEntries = [...(data.moodEntries || []), moodEntry];
      await updateDoc(userDoc, { moodEntries: updatedMoodEntries });
    } else {
      await setDoc(userDoc, { moodEntries: [moodEntry] });
    }
  } catch (error) {
    console.error('Error adding mood entry:', error);
    throw error;
  }
};

// Real-time listener for user data changes
export const subscribeToUserData = (userId: string, callback: (data: AppState) => void) => {
  const userDoc = doc(db, 'users', userId);
  
  return onSnapshot(userDoc, (doc) => {
    if (doc.exists()) {
      const data = doc.data();
      const appState: AppState = {
        tasks: data.tasks || [],
        achievements: data.achievements || [],
        streak: data.streak || { current: 0, longest: 0, lastCompletedDate: '' },
        importantDates: data.importantDates || [],
        questions: data.questions || [],
        moodEntries: data.moodEntries || [],
        dailyProgress: data.dailyProgress || []
      };
      callback(appState);
    } else {
      // Return default state for new users
      const defaultState: AppState = {
        tasks: [],
        achievements: [],
        streak: { current: 0, longest: 0, lastCompletedDate: '' },
        importantDates: [],
        questions: [],
        moodEntries: [],
        dailyProgress: []
      };
      callback(defaultState);
    }
  });
}; 