import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

admin.initializeApp()
const db = admin.firestore()

interface TaskDoc {
  id: string
  points?: number
  completions?: Record<string, { completed: boolean }>
}

// Recompute points summary for a challenge based on subcollection tasks
async function recomputeChallenge(challengeId: string) {
  const challengeRef = db.collection('shared-challenges').doc(challengeId)
  const tasksSnap = await challengeRef.collection('tasks').get()
  let maxPoints = 0
  const pointsByUser: Record<string, number> = {}
  tasksSnap.forEach(doc => {
    const t = doc.data() as TaskDoc
    const pts = typeof t.points === 'number' ? t.points : 0
    maxPoints += pts
    Object.entries(t.completions || {}).forEach(([uid, meta]) => {
      if (meta?.completed) {
        pointsByUser[uid] = (pointsByUser[uid] || 0) + pts
      }
    })
  })
  const update: any = { pointsSummary: { pointsByUser, maxPoints }, updatedAt: admin.firestore.FieldValue.serverTimestamp() }
  const challengeSnap = await challengeRef.get()
  if (challengeSnap.exists) {
    const data = challengeSnap.data() || {}
    const ended = data.isActive === false || !!data.endDate
    if (ended) {
      update.finalPointsByUser = data.finalPointsByUser || { ...pointsByUser }
      update.finalMaxPoints = data.finalMaxPoints ?? maxPoints
    }
  }
  await challengeRef.set(update, { merge: true })
}

export const onTaskWrite = functions.firestore
  .document('shared-challenges/{challengeId}/tasks/{taskId}')
  .onWrite(async (change, ctx) => {
    const { challengeId } = ctx.params as any
    try {
      await recomputeChallenge(challengeId)
    } catch (e) {
      console.error('recompute error', challengeId, e)
    }
  })

export const recomputeChallengePoints = functions.https.onCall(async (data, context) => {
  const challengeId = data?.challengeId
  if (!challengeId) throw new functions.https.HttpsError('invalid-argument', 'challengeId required')
  await recomputeChallenge(challengeId)
  return { ok: true }
})
