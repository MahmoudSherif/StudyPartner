// Custom hook that syncs with both local storage (useKV) and Firestore
import { useEffect, useRef } from 'react'
import { useKV } from '@github/spark/hooks'
import { useAuth } from '@/contexts/AuthContext'
import { firestoreService } from '@/lib/firestore'
import { INITIAL_ACHIEVEMENTS } from '@/lib/constants'
import { toast } from 'sonner'

export function useFirebaseSync<T>(
  key: string,
  defaultValue: T,
  syncToFirestore: (userId: string, data: T) => Promise<{ error: string | null }>,
  loadFromFirestore: (userId: string) => Promise<{ data: T | null; error: string | null }>
) {
  const { user } = useAuth()
  const [localData, setLocalData, deleteLocalData] = useKV<T>(key, defaultValue)
  const lastSyncRef = useRef<string>('')
  const isSyncingRef = useRef(false)

  // Load data from Firestore when user signs in
  useEffect(() => {
    if (user?.uid && !isSyncingRef.current) {
      loadDataFromFirestore()
    }
  }, [user?.uid])

  // Sync to Firestore when local data changes (debounced)
  useEffect(() => {
    if (user?.uid && !isSyncingRef.current) {
      const timeoutId = setTimeout(() => {
        syncDataToFirestore()
      }, 1000) // 1 second debounce

      return () => clearTimeout(timeoutId)
    }
  }, [localData, user?.uid])

  const loadDataFromFirestore = async () => {
    if (!user?.uid || isSyncingRef.current) return

    try {
      isSyncingRef.current = true
      const result = await loadFromFirestore(user.uid)
      
      if (result.data && result.data !== null) {
        // Only update if the data is different
        const currentDataStr = JSON.stringify(localData)
        const firestoreDataStr = JSON.stringify(result.data)
        
        if (currentDataStr !== firestoreDataStr) {
          setLocalData(result.data)
          lastSyncRef.current = firestoreDataStr
        }
      }
    } catch (error) {
      console.warn('Failed to load data from Firestore:', error)
    } finally {
      isSyncingRef.current = false
    }
  }

  const syncDataToFirestore = async () => {
    if (!user?.uid || isSyncingRef.current) return

    try {
      const currentDataStr = JSON.stringify(localData)
      
      // Skip sync if data hasn't changed since last sync
      if (currentDataStr === lastSyncRef.current) return

      isSyncingRef.current = true
      const result = await syncToFirestore(user.uid, localData)
      
      if (!result.error) {
        lastSyncRef.current = currentDataStr
      }
    } catch (error) {
      console.warn('Failed to sync data to Firestore:', error)
    } finally {
      isSyncingRef.current = false
    }
  }

  // Force sync function for manual syncing
  const forceSync = async () => {
    if (user?.uid) {
      await syncDataToFirestore()
    }
  }

  return [localData, setLocalData, deleteLocalData, forceSync] as const
}

// Specific hooks for different data types
export function useFirebaseSubjects() {
  const { user } = useAuth()
  
  return useFirebaseSync(
    user?.uid ? `${user.uid}-study-subjects` : 'study-subjects',
    [],
    firestoreService.saveSubjects.bind(firestoreService),
    firestoreService.getSubjects.bind(firestoreService)
  )
}

export function useFirebaseSessions() {
  const { user } = useAuth()
  
  return useFirebaseSync(
    user?.uid ? `${user.uid}-study-sessions` : 'study-sessions',
    [],
    firestoreService.saveSessions.bind(firestoreService),
    firestoreService.getSessions.bind(firestoreService)
  )
}

export function useFirebaseAchievements() {
  const { user } = useAuth()
  
  return useFirebaseSync(
    user?.uid ? `${user.uid}-achievements` : 'achievements',
    INITIAL_ACHIEVEMENTS,
    firestoreService.saveAchievements.bind(firestoreService),
    firestoreService.getAchievements.bind(firestoreService)
  )
}

export function useFirebaseTasks() {
  const { user } = useAuth()
  
  return useFirebaseSync(
    user?.uid ? `${user.uid}-tasks` : 'tasks',
    [],
    firestoreService.saveTasks.bind(firestoreService),
    firestoreService.getTasks.bind(firestoreService)
  )
}

export function useFirebaseChallenges() {
  const { user } = useAuth()
  
  return useFirebaseSync(
    user?.uid ? `${user.uid}-challenges` : 'challenges',
    [],
    firestoreService.saveChallenges.bind(firestoreService),
    firestoreService.getChallenges.bind(firestoreService)
  )
}

export function useFirebaseFocusSessions() {
  const { user } = useAuth()
  
  return useFirebaseSync(
    user?.uid ? `${user.uid}-focus-sessions` : 'focus-sessions',
    [],
    firestoreService.saveFocusSessions.bind(firestoreService),
    firestoreService.getFocusSessions.bind(firestoreService)
  )
}

export function useFirebaseGoals() {
  const { user } = useAuth()
  
  return useFirebaseSync(
    user?.uid ? `${user.uid}-focus-goals` : 'focus-goals',
    [],
    firestoreService.saveGoals.bind(firestoreService),
    firestoreService.getGoals.bind(firestoreService)
  )
}