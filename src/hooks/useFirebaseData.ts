// Custom hook that syncs directly with Firestore without local storage
import { useEffect, useState, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { firestoreService } from '@/lib/firestore'
import { Subject, StudySession, Achievement, Task, Challenge, FocusSession, Goal } from '@/lib/types'

// Enhanced error handling function
function handleFirebaseError(error: any, operation: string): string {
  const isNetworkBlocked = error.message?.includes('ERR_BLOCKED_BY_CLIENT') || 
                          error.code === 'failed-precondition' ||
                          error.message?.includes('blocked') ||
                          error.message?.includes('network')
  
  if (isNetworkBlocked) {
    // Dispatch event for NetworkBlockIndicator
    window.dispatchEvent(new CustomEvent('firebase-error', {
      detail: { error, isBlocked: true, operation }
    }))
    return `Network requests blocked - ${operation} saved locally`
  }
  
  return error.message || 'Unknown error occurred'
}

export function useFirebaseData<T>(
  key: string,
  defaultValue: T,
  syncToFirestore: (userId: string, data: T) => Promise<{ error: string | null }>,
  loadFromFirestore: (userId: string) => Promise<{ data: T | null; error: string | null }>
): [T, (value: T | ((prev: T) => T)) => void] {
  const { user } = useAuth()
  const [data, setData] = useState<T>(defaultValue)
  const isLoadingRef = useRef(false)
  const isSyncingRef = useRef(false)
  const hasLoadedRef = useRef(false)

  // Load data from Firestore when user signs in
  useEffect(() => {
    if (user?.uid && !isLoadingRef.current && !hasLoadedRef.current) {
      loadDataFromFirestore()
    }
  }, [user?.uid])

  const loadDataFromFirestore = async () => {
    if (!user?.uid || isLoadingRef.current || hasLoadedRef.current) return
    
    isLoadingRef.current = true
    try {
      const result = await loadFromFirestore(user.uid)
      if (result.data !== null) {
        setData(result.data)
        hasLoadedRef.current = true
      }
    } catch (error) {
      const errorMessage = handleFirebaseError(error, 'data loading')
      console.warn(`Firestore ${key} loading failed:`, errorMessage)
      // Don't throw the error, just log it and continue with default data
    } finally {
      isLoadingRef.current = false
    }
  }

  // Sync to Firestore when data changes (debounced) - but only after initial load
  useEffect(() => {
    if (user?.uid && !isSyncingRef.current && !isLoadingRef.current && hasLoadedRef.current) {
      const timeoutId = setTimeout(() => {
        syncDataToFirestore()
      }, 500) // 500ms debounce

      return () => clearTimeout(timeoutId)
    }
  }, [data, user?.uid])

  // Reset hasLoaded when user changes
  useEffect(() => {
    hasLoadedRef.current = false
  }, [user?.uid])

  const syncDataToFirestore = async () => {
    if (!user?.uid || isSyncingRef.current) return
    
    isSyncingRef.current = true
    try {
      await syncToFirestore(user.uid, data)
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
  return useFirebaseData<Achievement[]>(
    'achievements',
    [] as Achievement[],
    (userId, data) => firestoreService.saveAchievements(userId, data),
    (userId) => firestoreService.getAchievements(userId)
  )
}

export function useFirebaseTasks(): [Task[], (value: Task[] | ((prev: Task[]) => Task[])) => void] {
  return useFirebaseData<Task[]>(
    'tasks',
    [] as Task[],
    (userId, data) => firestoreService.saveTasks(userId, data),
    (userId) => firestoreService.getTasks(userId)
  )
}

export function useFirebaseChallenges(): [Challenge[], (value: Challenge[] | ((prev: Challenge[]) => Challenge[])) => void] {
  return useFirebaseData<Challenge[]>(
    'challenges',
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
    'focus-goals',
    [] as Goal[],
    (userId, data) => firestoreService.saveGoals(userId, data),
    (userId) => firestoreService.getGoals(userId)
  )
}
