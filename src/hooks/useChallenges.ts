import { useCallback, useMemo, useSyncExternalStore } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { readCache, writeCache } from '@/lib/localCache'
import {
  addChallengeTask,
  createChallenge,
  deleteChallenge,
  deleteChallengeTask,
  endChallenge,
  joinChallenge,
  leaveChallenge,
  loadMemberProfiles,
  loadMyChallenges,
  subscribeToChallenges,
  toggleChallengeTask,
  type ChallengeMember
} from '@/lib/challenges'
import type { Challenge } from '@/lib/types'

/**
 * Shared challenges, plus the operations that mutate them.
 *
 * Challenges are not exposed as a writable array the way personal collections
 * are. Every mutation is a server call that decides what the caller is allowed
 * to do, and the result is refetched. That is the whole point of the redesign:
 * scores are derived from completion rows, so there is no client-side value to
 * set and nothing to keep in sync by hand.
 *
 * Like the collection stores, state is module-level rather than per-component.
 * `App` and `useRealTimeStats` both call this hook, and a second copy meant a
 * second full load of every challenge plus a second realtime channel on the
 * same topic -- which Supabase treats as a duplicate subscription, so live
 * updates stopped arriving for both.
 */

interface ChallengeState {
  challenges: Challenge[]
  members: Record<string, ChallengeMember>
  loading: boolean
  error: string | null
}

interface ChallengeStore {
  userId: string
  state: ChallengeState
  listeners: Set<() => void>
  unsubscribe: (() => void) | null
  /** Increments per refresh so a slow response cannot overwrite a newer one. */
  seq: number
  /** In-flight refresh, so concurrent callers share one round trip. */
  inFlight: Promise<void> | null
  /**
   * A refresh queued to start once `inFlight` settles. At most one is ever
   * queued: any number of callers arriving mid-flight are satisfied by a single
   * follow-up round trip, since they all want the same thing -- state no older
   * than the moment they asked.
   */
  queued: Promise<void> | null
  started: boolean
}

const EMPTY: ChallengeState = { challenges: [], members: {}, loading: false, error: null }

let store: ChallengeStore | null = null

function getStore(userId: string): ChallengeStore {
  if (store && store.userId === userId) return store
  if (store) teardown(store)
  store = {
    userId,
    state: { challenges: [], members: {}, loading: true, error: null },
    listeners: new Set(),
    unsubscribe: null,
    seq: 0,
    inFlight: null,
    queued: null,
    started: false
  }
  return store
}

function teardown(target: ChallengeStore): void {
  target.unsubscribe?.()
  target.unsubscribe = null
  target.started = false
  if (store === target) store = null
}

/** Drops the shared challenge state. Called on sign-out. */
export function resetChallengeStore(): void {
  if (store) teardown(store)
}

function setState(target: ChallengeStore, patch: Partial<ChallengeState>): void {
  target.state = { ...target.state, ...patch }
  target.listeners.forEach(listener => listener())
}

/**
 * Refreshes, guaranteeing the caller sees state no older than this call.
 *
 * Sharing an in-flight request is only sound when that request started *after*
 * whatever the caller is waiting to observe. It did not: creating a challenge
 * also fires the realtime subscription, which starts its own refresh, so the
 * `await refresh()` after `createChallenge` was handed a round trip that had
 * already read the table before the new row was visible. It resolved against
 * stale data and the new challenge did not appear until a manual reload.
 *
 * So a caller arriving mid-flight now waits for a fresh round trip that begins
 * after the current one settles, rather than piggybacking on it.
 */
async function refreshStore(target: ChallengeStore): Promise<void> {
  if (target.inFlight) {
    if (!target.queued) {
      target.queued = target.inFlight
        .catch(() => {})
        .then(() => {
          target.queued = null
          return runRefresh(target)
        })
    }
    return target.queued
  }
  return runRefresh(target)
}

function runRefresh(target: ChallengeStore): Promise<void> {
  const run = (async () => {
    const seq = ++target.seq
    const { data, error } = await loadMyChallenges()
    if (seq !== target.seq || store !== target) return

    if (error) {
      setState(target, { error, loading: false })
      return
    }

    writeCache(target.userId, 'challenges', data)
    setState(target, { challenges: data, error: null, loading: false })

    const ids = Array.from(new Set(data.flatMap(c => [...c.participants, c.createdBy])))
    if (!ids.length) return

    const profiles = await loadMemberProfiles(ids)
    if (seq !== target.seq || store !== target) return
    setState(target, { members: profiles })
  })()

  target.inFlight = run.finally(() => {
    if (target.inFlight === run) target.inFlight = null
  })
  return target.inFlight
}

function start(target: ChallengeStore): void {
  if (target.started) return
  target.started = true

  const cached = readCache<Challenge[]>(target.userId, 'challenges')
  if (cached) {
    // Dates survive JSON as strings; rehydrate the ones the UI formats.
    setState(target, {
      challenges: cached.map(c => ({
        ...c,
        createdAt: new Date(c.createdAt),
        endDate: c.endDate ? new Date(c.endDate) : undefined
      }))
    })
  }

  void refreshStore(target)

  // Someone else completing a task should update the board live.
  target.unsubscribe = subscribeToChallenges(() => {
    void refreshStore(target)
  })
}

export function useChallenges() {
  const { user } = useAuth()
  const userId = user?.id ?? ''

  const subscribe = useCallback(
    (onChange: () => void) => {
      if (!userId) return () => {}
      const target = getStore(userId)
      target.listeners.add(onChange)
      start(target)
      return () => {
        target.listeners.delete(onChange)
      }
    },
    [userId]
  )

  const getSnapshot = useCallback(
    () => (userId ? getStore(userId).state : EMPTY),
    [userId]
  )

  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

  const refresh = useCallback(async () => {
    if (!userId) return
    await refreshStore(getStore(userId))
  }, [userId])

  const create = useCallback(
    async (title: string, description?: string, endDate?: Date | null) => {
      const { data, error } = await createChallenge(title, description, endDate)
      if (error) return { data: null, error }
      await refresh()
      return { data, error: null }
    },
    [refresh]
  )

  const join = useCallback(
    async (code: string) => {
      const { challengeId, error } = await joinChallenge(code)
      if (error) return { challengeId: null, error }
      await refresh()
      return { challengeId, error: null }
    },
    [refresh]
  )

  const addTask = useCallback(
    async (challengeId: string, task: { title: string; description?: string; points: number }) => {
      const result = await addChallengeTask(challengeId, task)
      if (!result.error) await refresh()
      return result
    },
    [refresh]
  )

  const removeTask = useCallback(
    async (taskId: string) => {
      const result = await deleteChallengeTask(taskId)
      if (!result.error) await refresh()
      return result
    },
    [refresh]
  )

  /**
   * Toggles the signed-in user's completion of a task.
   *
   * Applies the change locally first so the checkbox responds immediately, then
   * reconciles. On failure the optimistic edit is dropped by the refresh.
   */
  const toggleTask = useCallback(
    async (challengeId: string, taskId: string) => {
      if (!userId) return { error: 'Not signed in' }
      const target = getStore(userId)

      setState(target, {
        challenges: target.state.challenges.map(challenge => {
          if (challenge.id !== challengeId) return challenge
          return {
            ...challenge,
            tasks: challenge.tasks.map(task => {
              if (task.id !== taskId) return task
              const wasCompleted = !!task.completions?.[userId]?.completed
              const completions = { ...(task.completions ?? {}) }
              if (wasCompleted) delete completions[userId]
              else completions[userId] = { completed: true, completedAt: new Date() }
              return { ...task, completions, completedBy: Object.keys(completions) }
            })
          }
        })
      })

      const { error } = await toggleChallengeTask(taskId)
      await refresh()
      return { error }
    },
    [userId, refresh]
  )

  /**
   * Ends a challenge and returns its frozen result.
   *
   * The refreshed challenge is returned rather than left for the caller to look
   * up: `challenges` is captured by the calling render's closure, so reading it
   * straight after an await yields the pre-refresh value and the winner banner
   * reported stale scores.
   */
  const end = useCallback(
    async (challengeId: string) => {
      const result = await endChallenge(challengeId)
      if (result.error) return { data: null, error: result.error }
      await refresh()
      const updated = userId
        ? getStore(userId).state.challenges.find(c => c.id === challengeId) ?? null
        : null
      return { data: updated, error: null }
    },
    [refresh, userId]
  )

  const leave = useCallback(
    async (challengeId: string) => {
      if (!userId) return { error: 'Not signed in' }
      const result = await leaveChallenge(challengeId, userId)
      if (!result.error) await refresh()
      return result
    },
    [userId, refresh]
  )

  const remove = useCallback(
    async (challengeId: string) => {
      const result = await deleteChallenge(challengeId)
      if (!result.error) await refresh()
      return result
    },
    [refresh]
  )

  /** Display name for a participant id, falling back to a short label. */
  const nameFor = useCallback(
    (id: string) => state.members[id]?.displayName ?? `User ${String(id).slice(-4)}`,
    [state.members]
  )

  const activeChallenge = useMemo(
    () => state.challenges.find(c => c.isActive) ?? null,
    [state.challenges]
  )

  return {
    challenges: state.challenges,
    activeChallenge,
    members: state.members,
    nameFor,
    loading: state.loading,
    error: state.error,
    refresh,
    create,
    join,
    addTask,
    removeTask,
    toggleTask,
    end,
    leave,
    remove
  }
}
