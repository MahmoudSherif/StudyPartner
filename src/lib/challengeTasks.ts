import { ChallengeTask } from '@/lib/types'

// Determine if a challenge task is completed for a specific user using the new per-user completions map.
// Falls back to legacy completedBy only if no completions map exists.
export function isChallengeTaskCompletedForUser(task: ChallengeTask, userId: string): boolean {
  if (!task) return false
  if (task.completions && typeof task.completions === 'object') {
    return !!task.completions[userId]?.completed
  }
  return task.completedBy?.includes(userId)
}

// Count how many users have completed a task using completions map first.
export function countTaskCompletions(task: ChallengeTask): number {
  if (task.completions) {
    return Object.values(task.completions).filter((m: any) => m?.completed).length
  }
  return task.completedBy?.length || 0
}