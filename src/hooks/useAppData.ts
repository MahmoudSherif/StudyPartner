// Per-entity data hooks, backed by Supabase.
//
// Replaces the Firebase hooks. Each returns the same `[items, setItems]` shape
// components already use, so call sites did not have to change; the difference
// is underneath, where a single edit now writes a single row instead of
// rewriting the user's entire collection as one JSON document.

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import { useSyncedCollection } from '@/hooks/useSyncedCollection'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { readCache, writeCache } from '@/lib/localCache'
import { INITIAL_ACHIEVEMENTS } from '@/lib/constants'
import type {
  Subject,
  StudySession,
  Task,
  Goal,
  FocusSession,
  StickyNote,
  CalendarEvent,
  Achievement
} from '@/lib/types'

// --- date helpers ----------------------------------------------------------
// Postgres returns ISO strings; the domain model uses Date objects.

const toDate = (value: string | null | undefined): Date | undefined =>
  value ? new Date(value) : undefined

const toIso = (value: Date | string | null | undefined): string | null => {
  if (!value) return null
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

/** `YYYY-MM-DD` for Postgres `date` columns, using local time, not UTC. */
const toDateOnly = (value: Date | string | null | undefined): string | null => {
  if (!value) return null
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return null
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

// --- subjects --------------------------------------------------------------

export function useSubjects() {
  const [items, setItems] = useSyncedCollection<Subject>({
    table: 'subjects',
    cacheKey: 'subjects',
    order: { column: 'created_at', ascending: true },
    realtime: true,
    toModel: (row: any) => ({
      id: row.id,
      name: row.name,
      color: row.color,
      totalTime: row.total_time ?? 0,
      goal: row.goal ?? undefined,
      dailyTarget: row.daily_target ?? undefined,
      weeklyTarget: row.weekly_target ?? undefined
    }),
    toRow: subject => ({
      name: subject.name,
      color: subject.color,
      total_time: Math.max(0, Math.round(subject.totalTime ?? 0)),
      goal: subject.goal ?? null,
      daily_target: subject.dailyTarget ?? null,
      weekly_target: subject.weeklyTarget ?? null
    })
  })
  return [items, setItems] as const
}

// --- study sessions --------------------------------------------------------

export function useSessions() {
  const [items, setItems] = useSyncedCollection<StudySession>({
    table: 'study_sessions',
    cacheKey: 'study-sessions',
    order: { column: 'start_time', ascending: false },
    realtime: true,
    toModel: (row: any) => ({
      id: row.id,
      subjectId: row.subject_id ?? '',
      startTime: new Date(row.start_time),
      endTime: toDate(row.end_time),
      duration: row.duration ?? 0,
      completed: !!row.completed
    }),
    toRow: session => ({
      // '' is the sentinel the focus-session flow uses for "no subject"; the
      // column is a foreign key, so it has to become NULL.
      subject_id: session.subjectId && session.subjectId !== 'focus' ? session.subjectId : null,
      start_time: toIso(session.startTime),
      end_time: toIso(session.endTime),
      duration: Math.min(86400, Math.max(0, Math.round(session.duration ?? 0))),
      completed: !!session.completed
    })
  })
  return [items, setItems] as const
}

// --- focus sessions --------------------------------------------------------

export function useFocusSessions() {
  const [items, setItems] = useSyncedCollection<FocusSession>({
    table: 'focus_sessions',
    cacheKey: 'focus-sessions',
    order: { column: 'start_time', ascending: false },
    realtime: true,
    toModel: (row: any) => ({
      id: row.id,
      title: row.title,
      duration: row.duration ?? 0,
      startTime: new Date(row.start_time),
      endTime: toDate(row.end_time),
      completed: !!row.completed,
      category: row.category ?? undefined,
      notes: row.notes ?? undefined,
      isRunning: !!row.is_running,
      goalId: row.goal_id ?? undefined
    }),
    toRow: session => ({
      title: session.title || 'Focus session',
      duration: Math.min(86400, Math.max(0, Math.round(session.duration ?? 0))),
      start_time: toIso(session.startTime),
      end_time: toIso(session.endTime),
      completed: !!session.completed,
      category: session.category ?? null,
      notes: session.notes ?? null,
      is_running: !!session.isRunning,
      // Null, not undefined: the column has to be cleared when a session is
      // detached from its goal, and undefined would omit the key entirely.
      goal_id: session.goalId ?? null
    })
  })
  return [items, setItems] as const
}

/**
 * The single in-progress focus session, if any.
 *
 * A partial unique index enforces at most one running session per user, so
 * starting a new one clears any previous `isRunning` flag first. The old
 * implementation stored this on the profile document and could accumulate
 * several.
 */
export function useActiveFocusSession(): [
  FocusSession | null,
  (value: FocusSession | null | ((prev: FocusSession | null) => FocusSession | null)) => void
] {
  const [sessions, setSessions] = useFocusSessions()

  // A paused session is still the active one.
  //
  // This was `sessions.find(s => s.isRunning)`, but pausing writes
  // `isRunning: false` to the row, so the act of pausing made the session stop
  // being "active": the timer card unmounted, the empty start form came back,
  // and the row was stranded at `is_running = false, completed = false` with
  // whatever time it had accrued. Pressing Pause lost the session.
  //
  // A session is active until it is stopped, which is what sets `completed`.
  // The running one wins if there is one; otherwise the most recently started
  // unfinished session, which is the one just paused. Rows stranded by the old
  // behaviour are superseded by any newer session rather than resurfacing.
  const active = useMemo(() => {
    const running = sessions.find(s => s.isRunning)
    if (running) return running
    const unfinished = sessions.filter(s => !s.completed)
    if (unfinished.length === 0) return null
    return unfinished.reduce((newest, s) =>
      new Date(s.startTime).getTime() > new Date(newest.startTime).getTime() ? s : newest
    )
  }, [sessions])

  const setActive = useCallback(
    (value: FocusSession | null | ((prev: FocusSession | null) => FocusSession | null)) => {
      setSessions(current => {
        const currentActive = current.find(s => s.isRunning) ?? null
        const next = typeof value === 'function' ? value(currentActive) : value

        // Clearing: mark the running session as no longer running.
        if (!next) {
          return current.map(s => (s.isRunning ? { ...s, isRunning: false } : s))
        }

        const withoutOtherRunning = current.map(s =>
          s.isRunning && s.id !== next.id ? { ...s, isRunning: false } : s
        )
        const exists = withoutOtherRunning.some(s => s.id === next.id)
        return exists
          ? withoutOtherRunning.map(s => (s.id === next.id ? { ...next } : s))
          : [...withoutOtherRunning, next]
      })
    },
    [setSessions]
  )

  return [active, setActive]
}

// --- tasks -----------------------------------------------------------------

export function useTasks() {
  const [items, setItems] = useSyncedCollection<Task>({
    table: 'tasks',
    cacheKey: 'tasks',
    order: { column: 'created_at', ascending: false },
    realtime: true,
    toModel: (row: any) => ({
      id: row.id,
      title: row.title,
      description: row.description ?? undefined,
      completed: !!row.completed,
      createdAt: new Date(row.created_at),
      completedAt: toDate(row.completed_at),
      subjectId: row.subject_id ?? undefined,
      priority: row.priority ?? 'medium',
      dueDate: toDate(row.due_date),
      estimatedTime: row.estimated_time ?? undefined
    }),
    toRow: task => ({
      title: task.title,
      description: task.description ?? null,
      completed: !!task.completed,
      completed_at: toIso(task.completedAt),
      subject_id: task.subjectId || null,
      priority: task.priority ?? 'medium',
      due_date: toIso(task.dueDate),
      estimated_time: task.estimatedTime ?? null,
      created_at: toIso(task.createdAt) ?? new Date().toISOString()
    })
  })
  return [items, setItems] as const
}

// --- goals -----------------------------------------------------------------

export function useGoals() {
  const [items, setItems] = useSyncedCollection<Goal>({
    table: 'goals',
    cacheKey: 'goals',
    order: { column: 'created_at', ascending: false },
    realtime: true,
    toModel: (row: any) => ({
      id: row.id,
      title: row.title,
      description: row.description ?? undefined,
      target: row.target ?? 0,
      current: row.current ?? 0,
      deadline: toDate(row.deadline),
      category: row.category ?? 'custom',
      isCompleted: !!row.is_completed,
      createdAt: new Date(row.created_at)
    }),
    toRow: goal => ({
      title: goal.title,
      description: goal.description ?? null,
      target: Math.max(0, Math.round(goal.target ?? 0)),
      current: Math.max(0, Math.round(goal.current ?? 0)),
      deadline: toIso(goal.deadline),
      category: goal.category ?? 'custom',
      is_completed: !!goal.isCompleted,
      created_at: toIso(goal.createdAt) ?? new Date().toISOString()
    })
  })
  return [items, setItems] as const
}

// --- sticky notes ----------------------------------------------------------

// Returns the sync meta as a third element, unlike its siblings. Anything that
// seeds default content needs to tell "no notes" apart from "not loaded yet" --
// see the welcome note in NotesTab.
export function useNotes() {
  const [items, setItems, meta] = useSyncedCollection<StickyNote>({
    table: 'sticky_notes',
    cacheKey: 'sticky-notes',
    order: { column: 'created_at', ascending: false },
    realtime: true,
    toModel: (row: any) => ({
      id: row.id,
      title: row.title ?? '',
      content: row.content ?? '',
      color: row.color,
      position: { x: row.position_x ?? 0, y: row.position_y ?? 0 },
      size: { width: row.width ?? 250, height: row.height ?? 200 },
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      isPinned: !!row.is_pinned,
      tags: row.tags ?? []
    }),
    toRow: note => ({
      title: note.title ?? '',
      content: note.content ?? '',
      color: note.color,
      position_x: note.position?.x ?? 0,
      position_y: note.position?.y ?? 0,
      width: note.size?.width ?? 250,
      height: note.size?.height ?? 200,
      is_pinned: !!note.isPinned,
      tags: note.tags ?? []
    })
  })
  return [items, setItems, meta] as const
}

// --- calendar --------------------------------------------------------------

export function useCalendarEvents() {
  const [items, setItems] = useSyncedCollection<CalendarEvent>({
    table: 'calendar_events',
    cacheKey: 'calendar-events',
    order: { column: 'event_date', ascending: true },
    realtime: true,
    toModel: (row: any) => ({
      id: row.id,
      title: row.title,
      description: row.description ?? undefined,
      // `date` columns have no timezone; parse as local midnight so an event
      // does not display on the previous day west of UTC.
      date: new Date(`${row.event_date}T00:00:00`),
      startTime: row.start_time ?? undefined,
      endTime: row.end_time ?? undefined,
      subjectId: row.subject_id ?? undefined,
      type: row.type ?? 'study',
      isAllDay: !!row.is_all_day,
      color: row.color ?? undefined
    }),
    toRow: event => ({
      title: event.title,
      description: event.description ?? null,
      event_date: toDateOnly(event.date),
      start_time: event.startTime || null,
      end_time: event.endTime || null,
      subject_id: event.subjectId || null,
      type: event.type ?? 'study',
      is_all_day: !!event.isAllDay,
      color: event.color ?? null
    })
  })
  return [items, setItems] as const
}

// --- achievements ----------------------------------------------------------

/**
 * Achievements are the one collection that is not a plain table mirror.
 *
 * The definitions (title, description, icon, requirement) are application
 * constants; only unlock state and progress are per-user. Storing the whole
 * definition per user, as the old backend did, meant every user carried a copy
 * of static text and definitions could drift between users. Only the mutable
 * part is persisted here, then merged with INITIAL_ACHIEVEMENTS on read.
 */
interface AchievementStore {
  userId: string
  items: Achievement[]
  /** Last known server state, keyed by achievement id, for change detection. */
  baseline: Record<string, { unlocked: boolean; progress: number }>
  listeners: Set<() => void>
  loaded: boolean
}

// Shared for the same reason the collection stores are: `App` and
// `useRealTimeStats` both read achievements, and with per-component state one
// copy would unlock an award while the other went on showing it locked.
let achievementStore: AchievementStore | null = null

function mergeAchievements(rows: any[]): Achievement[] {
  const byKey = new Map(rows.map(r => [r.key, r]))
  return INITIAL_ACHIEVEMENTS.map(def => {
    const row = byKey.get(def.id)
    return row
      ? {
          ...def,
          unlocked: !!row.unlocked,
          unlockedAt: toDate(row.unlocked_at),
          progress: row.progress ?? 0
        }
      : { ...def }
  })
}

function getAchievementStore(userId: string): AchievementStore {
  if (achievementStore && achievementStore.userId === userId) return achievementStore
  achievementStore = {
    userId,
    items: INITIAL_ACHIEVEMENTS,
    baseline: {},
    listeners: new Set(),
    loaded: false
  }
  return achievementStore
}

/** Drops the shared achievement state. Called on sign-out. */
export function resetAchievementStore(): void {
  achievementStore = null
}

function loadAchievements(store: AchievementStore): void {
  if (store.loaded) return
  store.loaded = true

  const cached = readCache<Achievement[]>(store.userId, 'achievements')
  if (cached) {
    store.items = cached
    store.listeners.forEach(listener => listener())
  }

  void supabase
    .from('achievements')
    .select('*')
    .eq('user_id', store.userId)
    .then(({ data, error }) => {
      // A sign-out between request and response replaces the store; the
      // response then belongs to nobody and must not be applied.
      if (achievementStore !== store) return
      if (error) {
        console.warn('Failed to load achievements:', error.message)
        return
      }
      const rows = data ?? []
      store.baseline = Object.fromEntries(
        rows.map((r: any) => [r.key, { unlocked: !!r.unlocked, progress: r.progress ?? 0 }])
      )
      store.items = mergeAchievements(rows)
      writeCache(store.userId, 'achievements', store.items)
      store.listeners.forEach(listener => listener())
    })
}

export function useAchievements(): [
  Achievement[],
  (value: Achievement[] | ((prev: Achievement[]) => Achievement[])) => void
] {
  const { user } = useAuth()
  const userId = user?.id ?? ''

  const subscribe = useCallback(
    (onChange: () => void) => {
      if (!userId) return () => {}
      const store = getAchievementStore(userId)
      store.listeners.add(onChange)
      loadAchievements(store)
      return () => {
        store.listeners.delete(onChange)
      }
    },
    [userId]
  )

  const getSnapshot = useCallback(
    () => (userId ? getAchievementStore(userId).items : INITIAL_ACHIEVEMENTS),
    [userId]
  )

  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

  const update = useCallback(
    (value: Achievement[] | ((prev: Achievement[]) => Achievement[])) => {
      if (!userId) return
      const store = getAchievementStore(userId)
      const next = typeof value === 'function' ? value(store.items) : value
      if (next === store.items) return

      store.items = next
      store.listeners.forEach(listener => listener())
      writeCache(userId, 'achievements', next)

      // Only send rows whose unlock state or progress actually moved.
      const changed = next.filter(a => {
        const before = store.baseline[a.id]
        return !before || before.unlocked !== a.unlocked || before.progress !== (a.progress ?? 0)
      })
      if (!changed.length) return

      changed.forEach(a => {
        store.baseline[a.id] = { unlocked: a.unlocked, progress: a.progress ?? 0 }
      })

      void supabase
        .from('achievements')
        .upsert(
          changed.map(a => ({
            user_id: userId,
            key: a.id,
            unlocked: a.unlocked,
            unlocked_at: a.unlocked ? toIso(a.unlockedAt ?? new Date()) : null,
            progress: Math.max(0, Math.round(a.progress ?? 0))
          })),
          { onConflict: 'user_id,key' }
        )
        .then(({ error }) => {
          if (error) console.warn('Failed to save achievements:', error.message)
        })
    },
    [userId]
  )

  return [state, update]
}

// --- user settings ---------------------------------------------------------

/** Small key/value settings stored as one row per user. */
export function useUserSetting<T>(
  key: string,
  defaultValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const { user } = useAuth()
  const userId = user?.id ?? ''
  const [value, setValue] = useState<T>(defaultValue)

  useEffect(() => {
    if (!userId) {
      setValue(defaultValue)
      return
    }
    let cancelled = false
    void (async () => {
      const { data, error } = await supabase
        .from('user_settings')
        .select('theme, settings')
        .eq('user_id', userId)
        .maybeSingle()
      if (cancelled || error || !data) return
      const stored = key === 'theme' ? (data as any).theme : ((data as any).settings ?? {})[key]
      if (stored !== undefined && stored !== null) setValue(stored as T)
    })()
    return () => {
      cancelled = true
    }
    // defaultValue is intentionally not a dependency: callers pass object
    // literals, which would change identity every render and loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, key])

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue(current => {
        const resolved = typeof next === 'function' ? (next as (prev: T) => T)(current) : next
        if (!userId) return resolved

        const payload: { user_id: string; theme?: string; settings?: any } = {
          user_id: userId
        }
        if (key === 'theme') payload.theme = String(resolved)
        else payload.settings = { [key]: resolved }

        void supabase
          .from('user_settings')
          .upsert(payload, { onConflict: 'user_id' })
          .then(({ error }) => {
            if (error) console.warn(`Failed to save setting ${key}:`, error.message)
          })

        return resolved
      })
    },
    [userId, key]
  )

  return [value, update]
}

export function useTheme() {
  return useUserSetting<string>('theme', 'dark')
}

