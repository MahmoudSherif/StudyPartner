// Firestore data management for user data
import { db, isFirebaseAvailable } from '@/lib/firebase'
import { LocalChallengeStorage } from '@/lib/localChallengeStorage'
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
      // Only log non-permission errors to reduce console noise
      if (!errorMessage.includes('permission') && !errorMessage.includes('Permission')) {
        console.warn(`Firestore getUserData failed for ${dataType}:`, errorMessage)
      }
      // Always return null data with no error to prevent UI disruption
      return { data: null, error: null }
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

  // ALTERNATIVE APPROACH: Save challenges in user's personal collection with sharing enabled
  async saveSharedChallengeAlternative(challenge: Challenge, userId: string) {
    try {
      if (!isFirebaseAvailable || !db) {
        return { error: 'Firestore database not available - offline mode' }
      }
      
      console.log('💡 Alternative: Saving challenge in user collection with sharing enabled')
      
      // Ensure code consistency - always store in uppercase
      const normalizedCode = challenge.code.trim().toUpperCase()
      
      // Save in user's personal challenges collection but mark as shareable
      const challengeRef = doc(db, 'users', userId, 'shared-challenges', challenge.id)
      const challengeData = {
        ...challenge,
        code: normalizedCode, // Ensure uppercase storage
        sharingEnabled: true,
        originalOwner: userId,
        createdAt: challenge.createdAt,
        updatedAt: serverTimestamp(),
        // Make it publicly searchable by code (also uppercase for consistency)
        searchableCode: normalizedCode
      }
      
      console.log('Alternative challenge data with normalized code:', normalizedCode, challengeData)
      await setDoc(challengeRef, challengeData)
      
      // Also save in a public index for faster searching (use uppercase as key)
      const indexRef = doc(db, 'public-challenge-index', normalizedCode)
      await setDoc(indexRef, {
        challengeId: challenge.id,
        ownerId: userId,
        code: normalizedCode, // Store normalized uppercase
        originalCode: challenge.code, // Keep original input for display if needed
        title: challenge.title,
        isActive: challenge.isActive,
        createdAt: challenge.createdAt,
        updatedAt: serverTimestamp()
      })
      
      console.log('✅ Alternative save successful with normalized code:', normalizedCode)
      return { error: null }
    } catch (error: any) {
      console.error('❌ Alternative save failed:', error)
      return { error: this.handleFirestoreError(error) }
    }
  }

  async findSharedChallengeByCodeAlternative(code: string) {
    try {
      if (!isFirebaseAvailable || !db) {
        return { data: null, error: 'Firestore database not available - offline mode' }
      }
      
      // NORMALIZE CODE - always search in lowercase but preserve original case in data
      const normalizedCode = code.toLowerCase()
      console.log('💡 Alternative: Searching for challenge with code:', code, '(normalized:', normalizedCode + ')')
      
      // First, check the public index
      const indexRef = doc(db, 'public-challenge-index', normalizedCode)
      const indexSnap = await getDoc(indexRef)
      
      if (!indexSnap.exists()) {
        console.log('❌ Challenge code not found in index for normalized code:', normalizedCode)
        return { data: null, error: 'Challenge not found' }
      }
      
      const indexData = indexSnap.data()
      console.log('✅ Found challenge in index:', indexData)
      
      // Get the actual challenge from the owner's collection
      const challengeRef = doc(db, 'users', indexData.ownerId, 'shared-challenges', indexData.challengeId)
      const challengeSnap = await getDoc(challengeRef)
      
      if (!challengeSnap.exists()) {
        console.log('❌ Challenge data not found in owner collection')
        return { data: null, error: 'Challenge data not found' }
      }
      
      const challengeData = challengeSnap.data()
      console.log('✅ Found full challenge data:', challengeData)
      
      return { 
        data: {
          ...challengeData,
          id: challengeSnap.id,
          createdAt: challengeData.createdAt?.toDate?.() || new Date(challengeData.createdAt),
          updatedAt: challengeData.updatedAt?.toDate?.() || new Date()
        } as unknown as Challenge, 
        error: null 
      }
    } catch (error: any) {
      console.error('❌ Alternative search failed:', error)
      return { data: null, error: this.handleFirestoreError(error) }
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
    // Try alternative approach first, then fallback to old method
    const normalizedCode = code.trim().toUpperCase() // Normalize input
    console.log('🔄 Trying alternative approach first for code:', code, '(normalized:', normalizedCode + ')')
    
    const altResult = await this.findSharedChallengeByCodeAlternative(normalizedCode)
    if (altResult.data) {
      console.log('✅ Found via alternative approach')
      return altResult
    }
    
    console.log('⚠️ Alternative failed, trying original method')
    
    try {
      if (!isFirebaseAvailable || !db) {
        return { data: null, error: 'Firestore database not available - offline mode' }
      }
      
      console.log('Searching for challenge with normalized code:', normalizedCode, skipActiveCheck ? '(ignoring isActive)' : '(only active)')
      
      const challengesRef = collection(db, 'shared-challenges')
      // Search with normalized (uppercase) code
      const q = skipActiveCheck 
        ? query(challengesRef, where('code', '==', normalizedCode))
        : query(challengesRef, where('code', '==', normalizedCode), where('isActive', '==', true))
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
        console.log('No challenge found with normalized code:', normalizedCode)
        return { data: null, error: null }
      }
    } catch (error: any) {
      console.error('Error finding shared challenge:', error)
      const errorMessage = this.handleFirestoreError(error)
      console.warn('Firestore findSharedChallengeByCode failed:', errorMessage)
      return { data: null, error: errorMessage }
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
  async getAllSharedChallenges(includeInactive: boolean = false) {
    try {
      if (!isFirebaseAvailable || !db) {
        return { data: [], error: 'Firestore database not available - offline mode' }
      }
      
      console.log('🔍 Fetching ALL shared challenges for debugging...', includeInactive ? '(including inactive)' : '(active only)')
      const challengesRef = collection(db, 'shared-challenges')
      
      let q
      if (includeInactive) {
        // Get all challenges regardless of isActive status
        q = challengesRef
      } else {
        // Only get active challenges
        q = query(challengesRef, where('isActive', '==', true))
      }
      
      const querySnapshot = await getDocs(q)
      
      console.log('📊 Total challenges found in database:', querySnapshot.size)
      
      const challenges: Challenge[] = querySnapshot.docs.map(doc => {
        const data = doc.data() as any
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
          createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt || Date.now()),
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

  // Original methods for backward compatibility
  async saveSharedChallenge(challenge: Challenge) {
    // Try alternative approach first, then fallback to local storage
    console.log('💾 Trying to save challenge with alternative approach')
    
    const altResult = await this.saveSharedChallengeAlternative(challenge, challenge.createdBy)
    if (!altResult.error) {
      console.log('✅ Saved via alternative approach')
      return altResult
    }
    
    console.log('⚠️ Alternative failed, saving locally:', altResult.error)
    
    // Fallback to local storage
    const localResult = LocalChallengeStorage.saveChallenge(challenge)
    if (localResult.error) {
      console.error('❌ Local save also failed:', localResult.error)
      return { error: 'Failed to save challenge: ' + altResult.error }
    }
    
    console.log('✅ Saved locally as fallback')
    return { error: null }
  }

  async updateSharedChallenge(challengeId: string, updates: Partial<Challenge>) {
    try {
      if (!isFirebaseAvailable || !db) {
        // Try local update
        const localResult = LocalChallengeStorage.updateChallenge(challengeId, updates)
        return localResult
      }
      
      console.log('Updating shared challenge:', challengeId, updates)
      
      // Try to update in shared-challenges collection
      const challengeRef = doc(db, 'shared-challenges', challengeId)
      await updateDoc(challengeRef, { ...updates, updatedAt: serverTimestamp() })
      return { error: null }
    } catch (error: any) {
      console.error('Error updating shared challenge:', error)
      // Fallback to local update
      const localResult = LocalChallengeStorage.updateChallenge(challengeId, updates)
      if (localResult.error) {
        return { error: this.handleFirestoreError(error) }
      }
      return { error: null }
    }
  }
}

export const firestoreService = new FirestoreService()