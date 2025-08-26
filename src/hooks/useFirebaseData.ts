// Custom hook that syncs directly with Firestore without local storage
import { useEffect, useState, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { firestoreService } from '@/lib/firestore'
import { Subject, StudySession, Achievement, Task, Challenge, FocusSession, Goal, StickyNote } from '@/lib/types'
import { INITIAL_ACHIEVEMENTS } from '@/lib/constants'
import { onSnapshot, doc } from 'firebase/firestore'
import { db, isFirebaseAvailable } from '@/lib/firebase'

// Enhanced error handling for Firebase operations
function handleFirebaseError(error: any, operation: string): string {
  if (error?.code) {
    switch (error.code) {
      case 'permission-denied':
        return `Permission denied during ${operation}`
      case 'unavailable':
        return `Firebase service unavailable during ${operation}`
      case 'failed-precondition':
        return `Network error during ${operation}`
      default:
        return `Firebase error during ${operation}: ${error.message || 'Unknown error'}`
    }
  }
  return `Error during ${operation}: ${error?.message || 'Unknown error'}`
}

// Generic hook for Firebase data with improved reliability and real-time updates
function useFirebaseData<T>(
  key: string,
  defaultValue: T,
  syncToFirestore: (userId: string, data: T) => Promise<{ error: string | null }>,
  loadFromFirestore: (userId: string) => Promise<{ data: T | null; error: string | null }>
): [T, (value: T | ((prev: T) => T)) => void] {
  const { user } = useAuth()
  const [data, setData] = useState<T>(defaultValue)
  
  // Refs to track state without causing re-renders
  const hasLoadedRef = useRef(false)
  const isSyncingRef = useRef(false)
  const isLoadingRef = useRef(false)
  const lastSyncedDataRef = useRef<T | null>(null)
  const unsubscribeRef = useRef<(() => void) | null>(null)

  // Load data when user changes
  useEffect(() => {
    if (user?.uid && !hasLoadedRef.current && !isLoadingRef.current) {
      loadDataFromFirestore()
    }
  }, [user?.uid])

  // Set up real-time listener for data changes
  useEffect(() => {
    if (!user?.uid || !isFirebaseAvailable || !db) return

    // Clean up previous listener
    if (unsubscribeRef.current) {
      unsubscribeRef.current()
      unsubscribeRef.current = null
    }

    // Set up real-time listener
    const docRef = doc(db, 'userData', `${user.uid}_${key}`)
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const docData = docSnap.data()
        const newData = docData.data as T
        console.log(`🔄 Real-time update for ${key}:`, newData)
        setData(newData)
        lastSyncedDataRef.current = newData
        hasLoadedRef.current = true
      } else {
        console.log(`📭 No real-time data found for ${key}, using defaults`)
        hasLoadedRef.current = true
        lastSyncedDataRef.current = defaultValue
      }
    }, (error) => {
      console.warn(`Real-time listener error for ${key}:`, error)
      // Fall back to manual loading if real-time fails
      if (!hasLoadedRef.current) {
        loadDataFromFirestore()
      }
    })

    unsubscribeRef.current = unsubscribe

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
        unsubscribeRef.current = null
      }
    }
  }, [user?.uid, key])

  const loadDataFromFirestore = async () => {
    if (!user?.uid || isLoadingRef.current) return
    
    isLoadingRef.current = true
    try {
      console.log(`🔄 Loading ${key} from Firestore for user ${user.uid}`)
      const result = await loadFromFirestore(user.uid)
      if (result.data !== null) {
        console.log(`✅ Loaded ${key}:`, result.data)
        setData(result.data)
        lastSyncedDataRef.current = result.data
        hasLoadedRef.current = true
      } else {
        console.log(`📭 No ${key} data found, using defaults`)
        hasLoadedRef.current = true
        lastSyncedDataRef.current = defaultValue
      }
    } catch (error) {
      const errorMessage = handleFirebaseError(error, 'data loading')
      console.warn(`Firestore ${key} loading failed:`, errorMessage)
      hasLoadedRef.current = true // Still mark as loaded to prevent infinite retries
      lastSyncedDataRef.current = defaultValue
    } finally {
      isLoadingRef.current = false
    }
  }

  // Sync to Firestore when data changes (immediate sync for important changes)
  useEffect(() => {
    if (user?.uid && !isSyncingRef.current && !isLoadingRef.current && hasLoadedRef.current) {
      // Check if data has actually changed from last synced data
      const hasChanged = JSON.stringify(data) !== JSON.stringify(lastSyncedDataRef.current)
      if (hasChanged) {
        console.log(`🔄 Data changed for ${key}, syncing to Firestore`)
        // Immediate sync for goals and other critical data
        syncDataToFirestore()
      }
    }
  }, [data, user?.uid])

  // Reset hasLoaded when user changes but preserve during tab switches
  useEffect(() => {
    if (!user?.uid) {
      hasLoadedRef.current = false
      lastSyncedDataRef.current = null
      // Clean up listener
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
        unsubscribeRef.current = null
      }
    }
  }, [user?.uid])

  // Ensure data is saved when component unmounts or page unloads
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (user?.uid && hasLoadedRef.current && !isSyncingRef.current) {
        const hasChanged = JSON.stringify(data) !== JSON.stringify(lastSyncedDataRef.current)
        if (hasChanged) {
          // Force immediate sync on page unload (synchronous)
          console.log(`🚨 Emergency sync for ${key} on page unload`)
          // This is a last resort - the immediate sync in useEffect should handle most cases
        }
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      // Sync on component unmount if needed
      if (user?.uid && hasLoadedRef.current && !isSyncingRef.current) {
        const hasChanged = JSON.stringify(data) !== JSON.stringify(lastSyncedDataRef.current)
        if (hasChanged) {
          console.log(`🔄 Syncing ${key} on component unmount`)
          syncDataToFirestore()
        }
      }
      // Clean up listener
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
        unsubscribeRef.current = null
      }
    }
  }, [data, user?.uid])

  const syncDataToFirestore = async () => {
    if (!user?.uid || isSyncingRef.current) return
    
    isSyncingRef.current = true
    try {
      console.log(`💾 Syncing ${key} to Firestore:`, data)
      const result = await syncToFirestore(user.uid, data)
      if (result.error) {
        console.error(`❌ Failed to sync ${key}:`, result.error)
      } else {
        console.log(`✅ Successfully synced ${key}`)
        lastSyncedDataRef.current = data // Update synced reference
      }
    } catch (error) {
      const errorMessage = handleFirebaseError(error, 'data syncing')
      console.warn(`Firestore ${key} syncing failed:`, errorMessage)
    } finally {
      isSyncingRef.current = false
    }
  }

  const updateData = (value: T | ((prev: T) => T)) => {
    setData(prevData => {
      const newData = typeof value === 'function' ? (value as (prev: T) => T)(prevData) : value
      return newData
    })
  }

  return [data, updateData]
}

// Specific hooks for each data type
export function useFirebaseSubjects(): [Subject[], (value: Subject[] | ((prev: Subject[]) => Subject[])) => void] {
  return useFirebaseData<Subject[]>(
    'study-subjects',
    [] as Subject[],
    (userId, data) => firestoreService.saveSubjects(userId, data),
    (userId) => firestoreService.getSubjects(userId)
  )
}

export function useFirebaseSessions(): [StudySession[], (value: StudySession[] | ((prev: StudySession[]) => StudySession[])) => void] {
  return useFirebaseData<StudySession[]>(
    'study-sessions',
    [] as StudySession[],
    (userId, data) => firestoreService.saveSessions(userId, data),
    (userId) => firestoreService.getSessions(userId)
  )
}

export function useFirebaseAchievements(): [Achievement[], (value: Achievement[] | ((prev: Achievement[]) => Achievement[])) => void] {
  const hook = useFirebaseData<Achievement[]>(
    'achievements',
    [] as Achievement[],
    (userId, data) => firestoreService.saveAchievements(userId, data),
    (userId) => firestoreService.getAchievements(userId)
  )
  const [achievements, setAchievements] = hook
  // After load, ensure all INITIAL_ACHIEVEMENTS IDs exist
  useEffect(() => {
    if (!achievements) return
    if (achievements.length === 0) return // initial empty still loading maybe
    const existingIds = new Set(achievements.map(a => a.id))
    const missing = INITIAL_ACHIEVEMENTS.filter(a => !existingIds.has(a.id))
    if (missing.length > 0) {
      setAchievements(prev => {
        const merged = [...prev, ...missing]
        // Migration no longer needed - all data stored in Firebase
        return merged
      })
    }
  }, [achievements])
  return [achievements, setAchievements]
}

export function useFirebaseTasks(): [Task[], (value: Task[] | ((prev: Task[]) => Task[])) => void] {
  return useFirebaseData<Task[]>(
    'daily-tasks',
    [] as Task[],
    (userId, data) => firestoreService.saveTasks(userId, data),
    (userId) => firestoreService.getTasks(userId)
  )
}

export function useFirebaseChallenges(): [Challenge[], (value: Challenge[] | ((prev: Challenge[]) => Challenge[])) => void] {
  return useFirebaseData<Challenge[]>(
    'user-challenges',
    [] as Challenge[],
    (userId, data) => firestoreService.saveChallenges(userId, data),
    (userId) => firestoreService.getChallenges(userId)
  )
}

export function useFirebaseFocusSessions(): [FocusSession[], (value: FocusSession[] | ((prev: FocusSession[]) => FocusSession[])) => void] {
  return useFirebaseData<FocusSession[]>(
    'focus-sessions',
    [] as FocusSession[],
    (userId, data) => firestoreService.saveFocusSessions(userId, data),
    (userId) => firestoreService.getFocusSessions(userId)
  )
}

export function useFirebaseGoals(): [Goal[], (value: Goal[] | ((prev: Goal[]) => Goal[])) => void] {
  return useFirebaseData<Goal[]>(
    'goals',
    [] as Goal[],
    (userId, data) => firestoreService.saveGoals(userId, data),
    (userId) => firestoreService.getGoals(userId)
  )
}

export function useFirebaseStudyPartnerSettings(): [{ apiUrl: string; autoSync: boolean }, (value: { apiUrl: string; autoSync: boolean } | ((prev: { apiUrl: string; autoSync: boolean }) => { apiUrl: string; autoSync: boolean })) => void] {
  return useFirebaseData<{ apiUrl: string; autoSync: boolean }>(
    'studypartner-settings',
    { apiUrl: 'https://api.studypartner.app/v1', autoSync: false },
    (userId, data) => firestoreService.saveUserData(userId, 'studypartner-settings', data),
    (userId) => firestoreService.getUserData<{ apiUrl: string; autoSync: boolean }>(userId, 'studypartner-settings')
  )
}

export function useFirebaseNotes(): [StickyNote[], (value: StickyNote[] | ((prev: StickyNote[]) => StickyNote[])) => void] {
  return useFirebaseData<StickyNote[]>(
    'sticky-notes',
    [] as StickyNote[],
    (userId, data) => firestoreService.saveNotes(userId, data),
    (userId) => firestoreService.getNotes(userId)
  )
}

export function useFirebaseTheme(): [string, (value: string | ((prev: string) => string)) => void] {
  return useFirebaseData<string>(
    'theme-preference',
    'dark',
    (userId, data) => firestoreService.saveUserData(userId, 'theme', data),
    (userId) => firestoreService.getUserData<string>(userId, 'theme')
  )
}
