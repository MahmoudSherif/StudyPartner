import { db, isFirebaseAvailable } from '@/lib/firebase'
import { collection, getDocs, writeBatch, doc } from 'firebase/firestore'

// One-off migration: copy tasks array from each shared-challenges doc into tasks subcollection.
export async function migrateChallengeTasksToSubcollections() {
  if (!isFirebaseAvailable || !db) throw new Error('Firestore unavailable')
  const challengesSnap = await getDocs(collection(db, 'shared-challenges'))
  let migrated = 0
  for (const ch of challengesSnap.docs) {
    const data: any = ch.data()
    const tasks = Array.isArray(data.tasks) ? data.tasks : []
    if (!tasks.length) continue
    const batch = writeBatch(db)
    tasks.forEach((t: any) => {
      if (!t?.id) return
      const ref = doc(db, 'shared-challenges', ch.id, 'tasks', t.id)
      batch.set(ref, {
        id: t.id,
        title: t.title,
        description: t.description || '',
        points: t.points || 0,
        completions: t.completions || {},
        completedBy: t.completedBy || [],
        createdAt: t.createdAt || new Date()
      }, { merge: true })
    })
    await batch.commit()
    migrated++
  }
  return { migrated }
}

// Usage (temporary): in a secure admin-only UI action or console: migrateChallengeTasksToSubcollections()