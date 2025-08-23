// Firestore data management for user data
import { db, isFirebaseAvailable } from '@/lib/firebase'
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  orderBy,
  serverTimestamp
} from 'firebase/firestore'
import { Subject, StudySession, Achievement, Task, Challenge, FocusSession, Goal } from '@/lib/types'

export class FirestoreService {
  private isNetworkBlocked(error: any): boolean {
    return error.message?.includes('ERR_BLOCKED_BY_CLIENT') || 
           error.code === 'failed-precondition' ||
           error.message?.includes('blocked') ||
           error.message?.includes('network')
  }

  private handleFirestoreError(error: any): string {
    const isBlocked = this.isNetworkBlocked(error)
    
    if (isBlocked) {
      // Dispatch a custom event to notify the NetworkBlockIndicator
      window.dispatchEvent(new CustomEvent('firebase-error', {
        detail: { error, isBlocked: true }
      }))
      return 'Network requests blocked (possibly by ad blocker) - data saved locally'
    }
    
    // Handle permission errors specifically for shared challenges
    if (error.code === 'permission-denied' && error.message?.includes('Missing or insufficient permissions')) {
      console.warn('Firestore permission denied - likely need to update security rules')
      return 'Permission denied - Firestore security rules need to be updated for shared challenges'
    }
    
    return error.message || 'Unknown error occurred'
  }

  private getUserDocRef(userId: string) {
    if (!isFirebaseAvailable || !db) {
      throw new Error('Firestore database not available')
    }
    return doc(db, 'users', userId)
  }

  private getUserDataRef(userId: string, dataType: string) {
    if (!isFirebaseAvailable || !db) {
      throw new Error('Firestore database not available')
    }
    return doc(db, 'userData', `${userId}_${dataType}`)
  }

  // User profile management
  async getUserProfile(userId: string) {
    try {
      if (!isFirebaseAvailable || !db) {
        return { data: null, error: 'Firestore database not available - offline mode' }
      }
      
      const docRef = this.getUserDocRef(userId)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        return { data: docSnap.data(), error: null }
      } else {
        return { data: null, error: 'User not found' }
      }
    } catch (error: any) {
      const errorMessage = this.handleFirestoreError(error)
      console.warn('Firestore getUserProfile failed:', errorMessage)
      return { data: null, error: errorMessage }
    }
  }

  async updateUserProfile(userId: string, data: any) {
    try {
      if (!isFirebaseAvailable || !db) {
        return { error: 'Firestore database not available - offline mode' }
      }
      
      const docRef = this.getUserDocRef(userId)
      await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() })
      return { error: null }
    } catch (error: any) {
      const errorMessage = this.handleFirestoreError(error)
      console.warn('Firestore updateUserProfile failed:', errorMessage)
      return { error: errorMessage }
    }
  }

  async createUserProfile(userId: string, data: any) {
    try {
      if (!isFirebaseAvailable || !db) {
        return { error: 'Firestore database not available - offline mode' }
      }
      
      const docRef = this.getUserDocRef(userId)
      await setDoc(docRef, { 
        ...data, 
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      return { error: null }
    } catch (error: any) {
      const errorMessage = this.handleFirestoreError(error)
      console.warn('Firestore createUserProfile failed:', errorMessage)
      return { error: errorMessage }
    }
  }

  // Generic data management
  async saveUserData<T>(userId: string, dataType: string, data: T) {
    try {
      if (!isFirebaseAvailable || !db) {
        return { error: 'Firestore database not available - offline mode' }
      }
      
      const docRef = this.getUserDataRef(userId, dataType)
      await setDoc(docRef, {
        data,
        userId,
        dataType,
        updatedAt: serverTimestamp()
      })
      return { error: null }
    } catch (error: any) {
      const errorMessage = this.handleFirestoreError(error)
      console.warn('Firestore saveUserData failed:', errorMessage)
      return { error: errorMessage }
    }
  }

  async getUserData<T>(userId: string, dataType: string): Promise<{ data: T | null; error: string | null }> {
    try {
      if (!isFirebaseAvailable || !db) {
        return { data: null, error: null } // Silent offline mode
      }
      
      const docRef = this.getUserDataRef(userId, dataType)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        const docData = docSnap.data()
        return { data: docData.data as T, error: null }
      } else {
        return { data: null, error: null } // No data found is not an error
      }
    } catch (error: any) {
      const errorMessage = this.handleFirestoreError(error)
      // Only log non-permission errors to reduce noise
      if (!errorMessage.includes('permissions')) {
        console.warn('Firestore getUserData failed:', errorMessage)
      }
      return { data: null, error: null } // Return no error to prevent UI disruption
    }
  }

  // Specific data type methods
  async saveSubjects(userId: string, subjects: Subject[]) {
    return this.saveUserData(userId, 'subjects', subjects)
  }

  async getSubjects(userId: string) {
    return this.getUserData<Subject[]>(userId, 'subjects')
  }

  async saveSessions(userId: string, sessions: StudySession[]) {
    return this.saveUserData(userId, 'sessions', sessions)
  }

  async getSessions(userId: string) {
    return this.getUserData<StudySession[]>(userId, 'sessions')
  }

  async saveAchievements(userId: string, achievements: Achievement[]) {
    return this.saveUserData(userId, 'achievements', achievements)
  }

  async getAchievements(userId: string) {
    return this.getUserData<Achievement[]>(userId, 'achievements')
  }

  async saveTasks(userId: string, tasks: Task[]) {
    return this.saveUserData(userId, 'tasks', tasks)
  }

  async getTasks(userId: string) {
    return this.getUserData<Task[]>(userId, 'tasks')
  }

  async saveChallenges(userId: string, challenges: Challenge[]) {
    return this.saveUserData(userId, 'challenges', challenges)
  }

  async getChallenges(userId: string) {
    return this.getUserData<Challenge[]>(userId, 'challenges')
  }

  async saveFocusSessions(userId: string, focusSessions: FocusSession[]) {
    return this.saveUserData(userId, 'focusSessions', focusSessions)
  }

  async getFocusSessions(userId: string) {
    return this.getUserData<FocusSession[]>(userId, 'focusSessions')
  }

  async saveGoals(userId: string, goals: Goal[]) {
    return this.saveUserData(userId, 'goals', goals)
  }

  async getGoals(userId: string) {
    return this.getUserData<Goal[]>(userId, 'goals')
  }

  // Shared challenge methods for global access
  async saveSharedChallenge(challenge: Challenge) {
    try {
      if (!isFirebaseAvailable || !db) {
        return { error: 'Firestore database not available - offline mode' }
      }
      
      console.log('Saving shared challenge to Firestore:', challenge)
      
      const challengeRef = doc(db, 'shared-challenges', challenge.id)
      const challengeData = {
        ...challenge,
        createdAt: challenge.createdAt,
        updatedAt: serverTimestamp()
      }
      
      console.log('Challenge data to save:', challengeData)
      
      await setDoc(challengeRef, challengeData)
      console.log('Challenge saved successfully to Firestore')
      return { error: null }
    } catch (error: any) {
      console.error('Error saving shared challenge:', error)
      const errorMessage = this.handleFirestoreError(error)
      console.warn('Firestore saveSharedChallenge failed:', errorMessage)
      return { error: errorMessage }
    }
  }

  async getSharedChallenge(challengeId: string) {
    try {
      if (!isFirebaseAvailable || !db) {
        return { data: null, error: 'Firestore database not available - offline mode' }
      }
      
      const challengeRef = doc(db, 'shared-challenges', challengeId)
      const docSnap = await getDoc(challengeRef)
      
      if (docSnap.exists()) {
        const data = docSnap.data()
        return { 
          data: {
            ...data,
            id: docSnap.id,
            createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
            updatedAt: data.updatedAt?.toDate?.() || new Date()
          } as unknown as Challenge, 
          error: null 
        }
      } else {
        return { data: null, error: null }
      }
    } catch (error: any) {
      const errorMessage = this.handleFirestoreError(error)
      console.warn('Firestore getSharedChallenge failed:', errorMessage)
      return { data: null, error: errorMessage }
    }
  }

  async findSharedChallengeByCode(code: string, skipActiveCheck: boolean = false) {
    try {
      if (!isFirebaseAvailable || !db) {
        return { data: null, error: 'Firestore database not available - offline mode' }
      }
      
      console.log('Searching for challenge with code:', code, skipActiveCheck ? '(ignoring isActive)' : '(only active)')
      
      const challengesRef = collection(db, 'shared-challenges')
      const q = skipActiveCheck 
        ? query(challengesRef, where('code', '==', code))
        : query(challengesRef, where('code', '==', code), where('isActive', '==', true))
      console.log('Executing query for challenges...')
      
      const querySnapshot = await getDocs(q)
      console.log('Query result - docs found:', querySnapshot.size)
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0]
        const data = doc.data()
        console.log('Found challenge:', data)
        
        if (!skipActiveCheck && data.isActive !== true) {
          console.log('Challenge found but isActive =', data.isActive)
        }
        
        return { 
          data: {
            ...data,
            id: doc.id,
            createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
            updatedAt: data.updatedAt?.toDate?.() || new Date()
          } as unknown as Challenge, 
          error: null 
        }
      } else {
        console.log('No challenge found with code:', code)
        return { data: null, error: null }
      }
    } catch (error: any) {
      console.error('Error finding shared challenge:', error)
      const errorMessage = this.handleFirestoreError(error)
      console.warn('Firestore findSharedChallengeByCode failed:', errorMessage)
      return { data: null, error: errorMessage }
    }
  }

  async updateSharedChallenge(challengeId: string, updates: Partial<Challenge>) {
    try {
      if (!isFirebaseAvailable || !db) {
        return { error: 'Firestore database not available - offline mode' }
      }
      
      const challengeRef = doc(db, 'shared-challenges', challengeId)
      await updateDoc(challengeRef, {
        ...updates,
        updatedAt: serverTimestamp()
      })
      return { error: null }
    } catch (error: any) {
      const errorMessage = this.handleFirestoreError(error)
      console.warn('Firestore updateSharedChallenge failed:', errorMessage)
      return { error: errorMessage }
    }
  }

  async getUserChallenges(userId: string) {
    try {
      if (!isFirebaseAvailable || !db) {
        return { data: [], error: 'Firestore database not available - offline mode' }
      }
      
      const challengesRef = collection(db, 'shared-challenges')
      const q = query(challengesRef, where('participants', 'array-contains', userId))
      const querySnapshot = await getDocs(q)
      
      const challenges: Challenge[] = querySnapshot.docs.map(doc => {
        const data = doc.data()
        return {
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
          updatedAt: data.updatedAt?.toDate?.() || new Date()
        } as unknown as Challenge
      })
      
      return { data: challenges, error: null }
    } catch (error: any) {
      const errorMessage = this.handleFirestoreError(error)
      console.warn('Firestore getUserChallenges failed:', errorMessage)
      return { data: [], error: errorMessage }
    }
  }

  // Debug function to list all challenges (for debugging purposes)
  async getAllSharedChallenges() {
    try {
      if (!isFirebaseAvailable || !db) {
        return { data: [], error: 'Firestore database not available - offline mode' }
      }
      
      console.log('🔍 Fetching ALL shared challenges for debugging...')
      const challengesRef = collection(db, 'shared-challenges')
      const querySnapshot = await getDocs(challengesRef)
      
      console.log('📊 Total challenges found in database:', querySnapshot.size)
      
      const challenges: Challenge[] = querySnapshot.docs.map(doc => {
        const data = doc.data()
        console.log('📄 Challenge document:', {
          id: doc.id,
          code: data.code,
          title: data.title,
          isActive: data.isActive,
          createdBy: data.createdBy,
          participants: data.participants
        })
        return {
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
          updatedAt: data.updatedAt?.toDate?.() || new Date()
        } as unknown as Challenge
      })
      
      return { data: challenges, error: null }
    } catch (error: any) {
      console.error('Error fetching all challenges:', error)
      const errorMessage = this.handleFirestoreError(error)
      return { data: [], error: errorMessage }
    }
  }

  // Batch sync all user data
  async syncAllUserData(userId: string, userData: {
    subjects: Subject[]
    sessions: StudySession[]
    achievements: Achievement[]
    tasks: Task[]
    challenges: Challenge[]
    focusSessions: FocusSession[]
    goals: Goal[]
  }) {
    try {
      const promises = [
        this.saveSubjects(userId, userData.subjects),
        this.saveSessions(userId, userData.sessions),
        this.saveAchievements(userId, userData.achievements),
        this.saveTasks(userId, userData.tasks),
        this.saveChallenges(userId, userData.challenges),
        this.saveFocusSessions(userId, userData.focusSessions),
        this.saveGoals(userId, userData.goals)
      ]

      const results = await Promise.all(promises)
      const errors = results.filter(result => result.error).map(result => result.error)
      
      if (errors.length > 0) {
        return { error: `Failed to sync some data: ${errors.join(', ')}` }
      }

      return { error: null }
    } catch (error: any) {
      return { error: error.message }
    }
  }

  async loadAllUserData(userId: string) {
    try {
      const [
        subjectsResult,
        sessionsResult,
        achievementsResult,
        tasksResult,
        challengesResult,
        focusSessionsResult,
        goalsResult
      ] = await Promise.all([
        this.getSubjects(userId),
        this.getSessions(userId),
        this.getAchievements(userId),
        this.getTasks(userId),
        this.getChallenges(userId),
        this.getFocusSessions(userId),
        this.getGoals(userId)
      ])

      return {
        subjects: subjectsResult.data || [],
        sessions: sessionsResult.data || [],
        achievements: achievementsResult.data || [],
        tasks: tasksResult.data || [],
        challenges: challengesResult.data || [],
        focusSessions: focusSessionsResult.data || [],
        goals: goalsResult.data || [],
        error: null
      }
    } catch (error: any) {
      return {
        subjects: [],
        sessions: [],
        achievements: [],
        tasks: [],
        challenges: [],
        focusSessions: [],
        goals: [],
        error: error.message
      }
    }
  }
}

export const firestoreService = new FirestoreService()