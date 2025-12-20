// One-time data migration for renamed userData collection keys
import { db, isFirebaseAvailable } from '@/lib/firebase'
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore'

interface KeyMapping {
  oldKey: string
  newKey: string
}

const KEY_MIGRATIONS: KeyMapping[] = [
  { oldKey: 'subjects', newKey: 'study-subjects' },
  { oldKey: 'sessions', newKey: 'study-sessions' },
  { oldKey: 'tasks', newKey: 'daily-tasks' },
  { oldKey: 'challenges', newKey: 'user-challenges' },
  { oldKey: 'focusSessions', newKey: 'focus-sessions' },
]

export async function migrateUserDataKeys(userId: string): Promise<{
  migrated: number
  errors: string[]
}> {
  if (!isFirebaseAvailable || !db) {
    return { migrated: 0, errors: ['Firestore not available'] }
  }

  console.log('🔄 Starting data migration for user:', userId)

  let migrated = 0
  const errors: string[] = []

  for (const { oldKey, newKey } of KEY_MIGRATIONS) {
    try {
      const oldDocRef = doc(db, 'userData', `${userId}_${oldKey}`)
      const newDocRef = doc(db, 'userData', `${userId}_${newKey}`)

      // Check if old document exists
      const oldDocSnap = await getDoc(oldDocRef)

      if (!oldDocSnap.exists()) {
        console.log(`⏭️  No old data for ${oldKey}, skipping`)
        continue
      }

      // Check if new document already exists
      const newDocSnap = await getDoc(newDocRef)

      if (newDocSnap.exists()) {
        console.log(`✅ ${newKey} already migrated, skipping`)
        continue
      }

      // Copy old document to new location
      const oldData = oldDocSnap.data()
      await setDoc(newDocRef, {
        ...oldData,
        dataType: newKey, // Update the dataType field
        migratedFrom: oldKey,
        migratedAt: new Date()
      })

      console.log(`✅ Migrated ${oldKey} → ${newKey}`)
      migrated++

      // Optionally delete old document (commented out for safety)
      // await deleteDoc(oldDocRef)

    } catch (error: any) {
      const errorMsg = `Failed to migrate ${oldKey}: ${error.message}`
      console.error(errorMsg)
      errors.push(errorMsg)
    }
  }

  console.log(`✅ Migration complete: ${migrated} documents migrated`)
  return { migrated, errors }
}

// Check if migration is needed
export async function needsMigration(userId: string): Promise<boolean> {
  if (!isFirebaseAvailable || !db) return false

  try {
    // Check if any old keys exist
    for (const { oldKey } of KEY_MIGRATIONS) {
      const oldDocRef = doc(db, 'userData', `${userId}_${oldKey}`)
      const oldDocSnap = await getDoc(oldDocRef)

      if (oldDocSnap.exists()) {
        return true // Found old data that needs migration
      }
    }
    return false
  } catch (error) {
    console.error('Error checking migration status:', error)
    return false
  }
}
