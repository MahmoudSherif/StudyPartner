// Firestore data management for user data
import { db, isFirebaseAvailable } from '@/lib/firebase'
import { LocalChallengeStorage } from '@/lib/localChallengeStorage'
import { SimpleChallengeSharing } from '@/lib/simpleChallengeSharing'
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
      const normalizedCode = (challenge.code || '').trim().toUpperCase()
      if (!normalizedCode) {
        console.warn('⚠️ Challenge missing code, generating temporary code')
        // Simple fallback code generation (6 chars)
        const gen = Math.random().toString(36).substring(2, 8).toUpperCase()
        challenge.code = gen
      } else {
        // Mutate original object so subsequent layers (simple sharing) get uppercase
        challenge.code = normalizedCode
      }
      
      // Save in user's personal challenges collection (authoritative owner copy) but mark as shareable
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

      // Additionally store a copy in global collection for backward compatibility/listing
      try {
        const globalRef = doc(db, 'shared-challenges', challenge.id)
        await setDoc(globalRef, challengeData)
        console.log('🌍 Stored global copy in shared-challenges collection')
      } catch (globalErr) {
        console.warn('⚠️ Failed to write global copy (non-fatal):', globalErr)
      }
      
  // Save in a public index for faster searching (use uppercase as key)
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

  // Store direct owner mapping for quick update lookups (id -> owner)
      try {
        const ownerMapRef = doc(db, 'challenge-owners', challenge.id)
        await setDoc(ownerMapRef, {
          ownerId: userId,
            code: normalizedCode,
            createdAt: challenge.createdAt,
            updatedAt: serverTimestamp()
        })
        console.log('🗺️ Stored owner mapping for challenge', challenge.id)
      } catch (mapErr) {
        console.warn('⚠️ Failed to store challenge owner mapping (non-fatal):', mapErr)
      }
      
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
      
      // NORMALIZE CODE - use uppercase (matches save logic) with lowercase legacy fallback
      const normalizedCode = code.trim().toUpperCase()
      const legacyLower = code.trim().toLowerCase()
      console.log('💡 Alternative: Searching for challenge with code:', code, '(primary:', normalizedCode, 'legacy:', legacyLower + ')')
      
      // First, check the public index (uppercase key)
      let indexRef = doc(db, 'public-challenge-index', normalizedCode)
      let indexSnap = await getDoc(indexRef)
      
      if (!indexSnap.exists()) {
        console.log('⚠️ Uppercase index miss, trying legacy lowercase key')
        const legacyRef = doc(db, 'public-challenge-index', legacyLower)
        const legacySnap = await getDoc(legacyRef)
        if (legacySnap.exists()) {
          indexRef = legacyRef
          indexSnap = legacySnap
          console.log('✅ Found legacy lowercase index entry')
        }
      }
      
      if (!indexSnap.exists()) {
        console.log('❌ Challenge code not found in index (uppercase or lowercase)')
        return { data: null, error: 'Challenge not found' }
      }
      
      const indexData = indexSnap.data()
      console.log('✅ Found challenge in index:', indexData)
      
      // Fetch owner and global copies in parallel
      const ownerRef = doc(db, 'users', indexData.ownerId, 'shared-challenges', indexData.challengeId)
      const [ownerSnap, globalSnap] = await Promise.all([
        getDoc(ownerRef),
        getDoc(doc(db, 'shared-challenges', indexData.challengeId))
      ])

      if (!ownerSnap.exists() && !globalSnap.exists()) {
        console.log('❌ Challenge data missing in both owner and global locations')
        return { data: null, error: 'Challenge data not found' }
      }

      const ownerData: any = ownerSnap.exists() ? ownerSnap.data() : {}
      const globalData: any = globalSnap.exists() ? globalSnap.data() : {}

      // Merge participants uniquely
      const mergedParticipants = Array.from(new Set([...(ownerData.participants||[]), ...(globalData.participants||[])]))
      // Merge tasks by id (prefer owner definitions)
      const tasksMap: Record<string, any> = {}
      ;(globalData.tasks||[]).forEach((t:any)=>{ if(t?.id) tasksMap[t.id]=t })
      ;(ownerData.tasks||[]).forEach((t:any)=>{ if(t?.id) tasksMap[t.id]=t })
      const mergedTasks = Object.values(tasksMap)

      const createdAt = ownerData.createdAt?.toDate?.() || globalData.createdAt?.toDate?.() || new Date(ownerData.createdAt || globalData.createdAt || Date.now())
      const updatedOwner = ownerData.updatedAt?.toDate?.() || new Date(ownerData.updatedAt || 0)
      const updatedGlobal = globalData.updatedAt?.toDate?.() || new Date(globalData.updatedAt || 0)
      const updatedAt = (updatedOwner.getTime() > updatedGlobal.getTime()) ? updatedOwner : updatedGlobal

      const merged: any = {
        ...(globalData || {}),
        ...(ownerData || {}), // owner fields override
        participants: mergedParticipants,
        tasks: mergedTasks,
        id: indexData.challengeId,
        createdAt,
        updatedAt: updatedAt.getTime() ? updatedAt : new Date()
      }

      console.log('✅ Merged challenge data (owner+global):', merged)
      return { data: merged as Challenge, error: null }
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
    // Try alternative approach first, then fallback to multiple sharing systems
    console.log('💾 Trying to save challenge with alternative approach')
    
    const altResult = await this.saveSharedChallengeAlternative(challenge, challenge.createdBy)
    if (!altResult.error) {
      console.log('✅ Saved via alternative approach')
      
      // ALSO save to Simple Challenge Sharing for cross-account discovery
      console.log('🔄 Also saving to Simple Challenge Sharing for cross-account access...')
      const simpleResult = SimpleChallengeSharing.shareChallenge(challenge)
      if (!simpleResult.error) {
        console.log('✅ Also saved to Simple Challenge Sharing with code:', simpleResult.code)
      } else {
        console.warn('⚠️ Simple sharing failed but alternative succeeded')
      }
      
      return altResult
    }
    
    console.log('⚠️ Alternative failed, trying Simple Challenge Sharing:', altResult.error)
    
    // Try Simple Challenge Sharing (works across accounts)
    const simpleResult = SimpleChallengeSharing.shareChallenge(challenge)
    if (!simpleResult.error) {
      console.log('✅ Saved via Simple Challenge Sharing with code:', simpleResult.code)
      return { error: null }
    }
    
    console.log('⚠️ Simple sharing also failed, saving locally:', simpleResult.error)
    
    // Final fallback to local storage
    const localResult = LocalChallengeStorage.saveChallenge(challenge)
    if (localResult.error) {
      console.error('❌ All save methods failed - local, alternative, and simple sharing')
      return { error: 'Failed to save challenge: All storage methods failed' }
    }
    
    console.log('✅ Saved locally as final fallback')
    return { error: null }
  }

  async updateSharedChallenge(challengeId: string, updates: Partial<Challenge>, currentUserId?: string) {
    try {
      if (!isFirebaseAvailable || !db) {
        // Try local update
        const localResult = LocalChallengeStorage.updateChallenge(challengeId, updates)
        return localResult
      }
      
      console.log('Updating shared challenge:', challengeId, updates)
      
      // Permission enforcement: only original owner may add new tasks
      // Fetch owner mapping early
      let ownerId: string | null = null
      try {
        const ownerMapRef = doc(db, 'challenge-owners', challengeId)
        const ownerMapSnap = await getDoc(ownerMapRef)
        if (ownerMapSnap.exists()) {
          ownerId = (ownerMapSnap.data() as any).ownerId || null
        }
      } catch {}

      // If tasks are being updated ensure non-owner cannot add new tasks (only toggle completion)
      if (updates.tasks && ownerId && currentUserId && currentUserId !== ownerId) {
        try {
          // Load an existing copy (owner preferred, global fallback)
          let existingTasks: any[] = []
          if (ownerId) {
            const ownerRef = doc(db, 'users', ownerId, 'shared-challenges', challengeId)
            const ownerSnap = await getDoc(ownerRef)
            if (ownerSnap.exists()) {
              existingTasks = (ownerSnap.data() as any).tasks || []
            } else {
              const globalSnap = await getDoc(doc(db, 'shared-challenges', challengeId))
              if (globalSnap.exists()) {
                existingTasks = (globalSnap.data() as any).tasks || []
              }
            }
          }
          const incomingTasks = updates.tasks || []
          const existingIds = new Set(existingTasks.map((t: any) => t.id))
          const added = incomingTasks.filter((t: any) => t && t.id && !existingIds.has(t.id))
          if (added.length > 0) {
            console.warn('🚫 Non-owner attempted to add tasks. Stripping new tasks from update.')
            // Reduce incomingTasks to only existing ones, merging completion changes
            const sanitized = incomingTasks.filter((t: any) => t && existingIds.has(t.id))
            updates.tasks = sanitized as any
          }
        } catch (permErr) {
          console.log('Task permission check issue (continuing with caution):', permErr)
        }
      }
      
      // First, check if the document exists in main shared-challenges collection
      const challengeRef = doc(db, 'shared-challenges', challengeId)
      const docSnap = await getDoc(challengeRef)
      
      if (docSnap.exists()) {
        // Document exists in main collection, proceed with update
        await updateDoc(challengeRef, { ...updates, updatedAt: serverTimestamp() })
        console.log('✅ Updated challenge in main Firestore collection')
        return { error: null }
      }
      
      console.warn('⚠️ Challenge not found in main collection, searching in alternative locations...')
      
      // If currentUserId is provided, check their personal collection first
      if (currentUserId) {
        try {
          const userChallengeRef = doc(db, 'users', currentUserId, 'shared-challenges', challengeId)
          const userDocSnap = await getDoc(userChallengeRef)
          
          if (userDocSnap.exists()) {
            console.log('✅ Found challenge in current user\'s collection')
            await updateDoc(userChallengeRef, { ...updates, updatedAt: serverTimestamp() })
            console.log('✅ Updated challenge in user\'s Firestore collection')
            return { error: null }
          }
        } catch (error) {
          console.log('Could not access current user\'s collection')
        }
      }
      
      // Try to search in public challenge index to find the owner
      try {
        // Fast path: owner mapping doc
        try {
          const ownerMapRef = doc(db, 'challenge-owners', challengeId)
          const ownerMapSnap = await getDoc(ownerMapRef)
          if (ownerMapSnap.exists()) {
            const ownerData: any = ownerMapSnap.data()
            if (ownerData?.ownerId) {
              console.log('🗺️ Found owner via mapping collection:', ownerData.ownerId)
              const ownerChallengeRef = doc(db, 'users', ownerData.ownerId, 'shared-challenges', challengeId)
              const ownerDocSnap = await getDoc(ownerChallengeRef)
              if (ownerDocSnap.exists()) {
                await updateDoc(ownerChallengeRef, { ...updates, updatedAt: serverTimestamp() })
                console.log('✅ Updated challenge via owner mapping collection')
                return { error: null }
              }
            }
          }
        } catch (mapErr) {
          console.log('Owner mapping lookup failed (continuing):', mapErr)
        }
        const indexQuery = query(collection(db, 'public-challenge-index'))
        const indexSnapshot = await getDocs(indexQuery)
        
        for (const indexDoc of indexSnapshot.docs) {
          const indexData = indexDoc.data()
          if (indexData.challengeId === challengeId) {
            console.log('✅ Found challenge owner in index:', indexData.ownerId)
            const ownerChallengeRef = doc(db, 'users', indexData.ownerId, 'shared-challenges', challengeId)
            const ownerDocSnap = await getDoc(ownerChallengeRef)
            
            if (ownerDocSnap.exists()) {
              await updateDoc(ownerChallengeRef, { ...updates, updatedAt: serverTimestamp() })
              console.log('✅ Updated challenge in owner\'s Firestore collection')
              return { error: null }
            }
          }
        }
      } catch (error) {
        console.log('Could not search public index:', error)
      }
      
      console.warn('⚠️ Challenge document does not exist in any Firestore location, trying local update instead')
      
      // Document doesn't exist anywhere in Firestore, try local storage
      const localResult = LocalChallengeStorage.updateChallenge(challengeId, updates)
      if (!localResult.error) {
        console.log('✅ Updated challenge locally instead')
        return { error: null }
      }
      
      // If local also fails, return descriptive error
      return { error: `Challenge ${challengeId} not found in Firestore or local storage` }
    } catch (error: any) {
      console.error('Error updating shared challenge:', error)
      
      // If it's a "No document to update" error, try local storage
      if (error.message?.includes('No document to update')) {
        console.log('🔄 Document missing in Firestore, trying local storage fallback')
        const localResult = LocalChallengeStorage.updateChallenge(challengeId, updates)
        if (!localResult.error) {
          console.log('✅ Updated challenge locally as fallback')
          return { error: null }
        }
      }
      
      // Fallback to local update for any error
      const localResult = LocalChallengeStorage.updateChallenge(challengeId, updates)
      if (localResult.error) {
        return { error: this.handleFirestoreError(error) }
      }
      
      console.log('✅ Updated challenge locally after Firestore error')
      return { error: null }
    }
  }
}

export const firestoreService = new FirestoreService()