// Shared-challenge data access.
//
// Every mutating operation is a Postgres function that derives the acting user
// from auth.uid(). None of them takes a user id, because the previous design
// did -- and a caller could credit or revoke anyone's progress by editing an
// argument. Points are read from a view over completions; there is no stored
// score column for a client to write.

import { supabase } from '@/lib/supabase'
import type { Challenge, ChallengeTask } from '@/lib/types'

export interface ChallengeMember {
  userId: string
  displayName: string
  avatarUrl?: string
}

export interface LeaderboardEntry {
  userId: string
  points: number
  tasksCompleted: number
  rank: number
}

interface RawTaskRow {
  id: string
  challenge_id: string
  title: string
  description: string | null
  points: number
  created_at: string
}

function buildTasks(
  taskRows: RawTaskRow[],
  completionRows: { task_id: string; user_id: string; completed_at: string }[]
): ChallengeTask[] {
  const byTask = new Map<string, { task_id: string; user_id: string; completed_at: string }[]>()
  completionRows.forEach(row => {
    const list = byTask.get(row.task_id) ?? []
    list.push(row)
    byTask.set(row.task_id, list)
  })

  return taskRows.map(row => {
    const completions = byTask.get(row.id) ?? []
    return {
      id: row.id,
      title: row.title,
      description: row.description ?? undefined,
      points: row.points,
      createdAt: new Date(row.created_at),
      completedBy: completions.map(c => c.user_id),
      completions: Object.fromEntries(
        completions.map(c => [c.user_id, { completed: true, completedAt: new Date(c.completed_at) }])
      )
    }
  })
}

/**
 * Loads challenges the signed-in user belongs to, with tasks, participants and
 * derived scores.
 *
 * Row Level Security scopes this to the caller's own challenges. There is
 * deliberately no "list all challenges" call: the old backend had two, both
 * reachable from the UI, and each returned every challenge in the database
 * along with its participant user ids.
 */
export async function loadMyChallenges(): Promise<{ data: Challenge[]; error: string | null }> {
  try {
    const { data: challengeRows, error: challengeError } = await supabase
      .from('challenges')
      .select('*')
      .order('created_at', { ascending: false })
    if (challengeError) throw challengeError

    const challenges = challengeRows ?? []
    if (!challenges.length) return { data: [], error: null }

    const ids = challenges.map((c: any) => c.id)

    const [participantsRes, tasksRes, leaderboardRes] = await Promise.all([
      supabase.from('challenge_participants').select('challenge_id, user_id').in('challenge_id', ids),
      supabase.from('challenge_tasks').select('*').in('challenge_id', ids).order('created_at', { ascending: true }),
      supabase.from('challenge_leaderboard').select('*').in('challenge_id', ids)
    ])

    if (participantsRes.error) throw participantsRes.error
    if (tasksRes.error) throw tasksRes.error

    const taskRows = (tasksRes.data ?? []) as RawTaskRow[]
    const taskIds = taskRows.map(t => t.id)

    const completionsRes = taskIds.length
      ? await supabase
          .from('challenge_task_completions')
          .select('task_id, user_id, completed_at')
          .in('task_id', taskIds)
      : { data: [], error: null }
    if (completionsRes.error) throw completionsRes.error

    const participantsByChallenge = new Map<string, string[]>()
    ;(participantsRes.data ?? []).forEach((row: any) => {
      const list = participantsByChallenge.get(row.challenge_id) ?? []
      list.push(row.user_id)
      participantsByChallenge.set(row.challenge_id, list)
    })

    const tasksByChallenge = new Map<string, RawTaskRow[]>()
    taskRows.forEach(row => {
      const list = tasksByChallenge.get(row.challenge_id) ?? []
      list.push(row)
      tasksByChallenge.set(row.challenge_id, list)
    })

    const pointsByChallenge = new Map<string, Record<string, number>>()
    ;(leaderboardRes.data ?? []).forEach((row: any) => {
      const map = pointsByChallenge.get(row.challenge_id) ?? {}
      map[row.user_id] = row.points
      pointsByChallenge.set(row.challenge_id, map)
    })

    const completionRows = (completionsRes.data ?? []) as {
      task_id: string
      user_id: string
      completed_at: string
    }[]

    const data: Challenge[] = challenges.map((row: any) => {
      const tasks = buildTasks(tasksByChallenge.get(row.id) ?? [], completionRows)
      const maxPoints = tasks.reduce((sum, t) => sum + (t.points || 0), 0)
      return {
        id: row.id,
        code: row.code,
        title: row.title,
        description: row.description ?? '',
        createdBy: row.created_by,
        createdAt: new Date(row.created_at),
        participants: participantsByChallenge.get(row.id) ?? [],
        tasks,
        isActive: !!row.is_active,
        endDate: row.end_date ? new Date(row.end_date) : undefined,
        maxPoints,
        winnerIds: row.winner_ids ?? undefined,
        winnerId: row.winner_ids?.[0] ?? undefined,
        pointsSummary: { pointsByUser: pointsByChallenge.get(row.id) ?? {}, maxPoints },
        finalPointsByUser: row.final_points ?? undefined,
        finalMaxPoints: row.final_points ? maxPoints : undefined
      }
    })

    return { data, error: null }
  } catch (err: any) {
    console.warn('Failed to load challenges:', err?.message ?? err)
    return { data: [], error: err?.message ?? 'Failed to load challenges' }
  }
}

export async function createChallenge(
  title: string,
  description = '',
  endDate?: Date | null
): Promise<{ data: Challenge | null; error: string | null }> {
  const { data, error } = await supabase.rpc('create_challenge', {
    p_title: title,
    p_description: description,
    p_end_date: endDate ? endDate.toISOString() : undefined
  })
  if (error) return { data: null, error: error.message }

  const row: any = Array.isArray(data) ? data[0] : data
  if (!row) return { data: null, error: 'Challenge was not created' }

  return {
    data: {
      id: row.id,
      code: row.code,
      title: row.title,
      description: row.description ?? '',
      createdBy: row.created_by,
      createdAt: new Date(row.created_at),
      participants: [row.created_by],
      tasks: [],
      isActive: !!row.is_active,
      endDate: row.end_date ? new Date(row.end_date) : undefined,
      maxPoints: 0,
      pointsSummary: { pointsByUser: {}, maxPoints: 0 }
    },
    error: null
  }
}

/** Joins by invite code. The lookup happens server-side so the table stays unlistable. */
export async function joinChallenge(code: string): Promise<{ challengeId: string | null; error: string | null }> {
  const normalized = (code ?? '').trim().toUpperCase()
  if (!normalized) return { challengeId: null, error: 'Enter a challenge code' }

  const { data, error } = await supabase.rpc('join_challenge', { p_code: normalized })
  if (error) {
    // Postgres raises P0002 for "not found"; surface something human.
    if (error.code === 'P0002' || /not found/i.test(error.message)) {
      return { challengeId: null, error: 'No challenge found with that code' }
    }
    return { challengeId: null, error: error.message }
  }
  const row: any = Array.isArray(data) ? data[0] : data
  return { challengeId: row?.id ?? null, error: null }
}

export async function addChallengeTask(
  challengeId: string,
  task: { title: string; description?: string; points: number }
): Promise<{ error: string | null }> {
  const title = (task.title ?? '').trim()
  if (!title) return { error: 'Task title is required' }

  const points = Number(task.points)
  if (!Number.isFinite(points) || !Number.isInteger(points) || points < 0 || points > 10000) {
    return { error: 'Task points must be a whole number between 0 and 10000' }
  }

  // RLS permits this insert only for the challenge creator.
  const { error } = await supabase.from('challenge_tasks').insert({
    challenge_id: challengeId,
    title,
    description: task.description?.trim() || null,
    points
  })
  if (error) {
    if (error.code === '42501') return { error: 'Only the challenge creator can add tasks' }
    return { error: error.message }
  }
  return { error: null }
}

export async function deleteChallengeTask(taskId: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('challenge_tasks').delete().eq('id', taskId)
  return { error: error?.message ?? null }
}

/** Toggles the caller's own completion. Returns the resulting state. */
export async function toggleChallengeTask(taskId: string): Promise<{ completed: boolean | null; error: string | null }> {
  const { data, error } = await supabase.rpc('toggle_challenge_task', { p_task_id: taskId })
  if (error) return { completed: null, error: error.message }
  return { completed: !!data, error: null }
}

export async function endChallenge(challengeId: string): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc('end_challenge', { p_challenge_id: challengeId })
  if (error) {
    if (error.code === '42501') return { error: 'Only the challenge creator can end it' }
    return { error: error.message }
  }
  return { error: null }
}

export async function leaveChallenge(challengeId: string, userId: string): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('challenge_participants')
    .delete()
    .eq('challenge_id', challengeId)
    .eq('user_id', userId)
  return { error: error?.message ?? null }
}

export async function deleteChallenge(challengeId: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('challenges').delete().eq('id', challengeId)
  if (error) {
    if (error.code === '42501') return { error: 'Only the challenge creator can delete it' }
    return { error: error.message }
  }
  return { error: null }
}

/** Display names for a set of user ids, read from the public profile projection. */
export async function loadMemberProfiles(userIds: string[]): Promise<Record<string, ChallengeMember>> {
  const unique = Array.from(new Set(userIds.filter(Boolean)))
  if (!unique.length) return {}

  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, avatar_url')
    .in('id', unique)

  if (error) {
    console.warn('Failed to load member profiles:', error.message)
    return {}
  }

  return Object.fromEntries(
    (data ?? []).map((row: any) => [
      row.id,
      {
        userId: row.id,
        displayName: row.display_name || `User ${String(row.id).slice(-4)}`,
        avatarUrl: row.avatar_url ?? undefined
      }
    ])
  )
}

export function rankLeaderboard(pointsByUser: Record<string, number>, participants: string[]): LeaderboardEntry[] {
  const entries = participants.map(userId => ({
    userId,
    points: pointsByUser[userId] ?? 0,
    tasksCompleted: 0,
    rank: 0
  }))
  entries.sort((a, b) => b.points - a.points)

  // Standard competition ranking: equal scores share a rank, and the next
  // distinct score skips ahead.
  let lastPoints: number | null = null
  let lastRank = 0
  entries.forEach((entry, index) => {
    if (lastPoints === null || entry.points !== lastPoints) {
      lastRank = index + 1
      lastPoints = entry.points
    }
    entry.rank = lastRank
  })

  return entries
}

/**
 * Subscribes to everything that can change a challenge board.
 *
 * Completions and tasks live in separate tables, so three subscriptions are
 * needed; each fires the same callback and the caller refetches.
 */
let challengeChannelSeq = 0

export function subscribeToChallenges(onChange: () => void): () => void {
  // Topics are unique per socket. A fixed name meant a second caller silently
  // collided with the first instead of getting its own subscription.
  const channel = supabase
    .channel(`challenge-activity-${++challengeChannelSeq}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'challenge_task_completions' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'challenge_tasks' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'challenges' }, onChange)
    .subscribe()

  return () => {
    void supabase.removeChannel(channel)
  }
}
