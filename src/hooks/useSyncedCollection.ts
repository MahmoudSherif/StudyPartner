import { useCallback, useRef, useSyncExternalStore } from 'react'
import { supabase } from '@/lib/supabase'
import type { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js'
import { readCache, writeCache } from '@/lib/localCache'
import { isUuid, newId } from '@/lib/ids'
import { useAuth } from '@/contexts/AuthContext'

/**
 * Backs an array of domain objects with a Supabase table.
 *
 * Components keep the `[items, setItems]` shape they already use, including
 * functional updates like `setTasks(prev => [...prev, task])`. Underneath, each
 * call is diffed against the last known state and turned into row-level
 * inserts, updates and deletes.
 *
 * That diffing is the point. The previous backend stored an entire collection
 * as one JSON document per user, so every edit rewrote the whole array and two
 * devices editing at the same time silently clobbered each other. Touching one
 * task now writes one row.
 *
 * State lives in a module-level store keyed by (table, user), NOT in component
 * state. Several components legitimately want the same collection --
 * `useRealTimeStats` reads the same sessions and tasks that `App` renders, and
 * `AchieveTab` wants the running focus session -- and with per-component state
 * each of those was a separate fetch, a separate copy that drifted from the
 * others, and a separate realtime channel. Supabase channel topics are unique
 * per socket, so those duplicate subscriptions collided and live updates
 * stopped working. One store per collection fixes all three at once.
 */

export interface CollectionConfig<TModel extends { id: string }, TRow> {
  /** Postgres table name. */
  table: string
  /** Cache bucket name; also used in log messages. */
  cacheKey: string
  /** Row -> domain object. */
  toModel: (row: TRow) => TModel
  /** Domain object -> row columns (excluding user_id, which is added here). */
  toRow: (model: TModel) => Record<string, unknown>
  order?: { column: string; ascending?: boolean }
  /** Subscribe to Postgres changes for this user's rows. */
  realtime?: boolean
}

type Updater<T> = T[] | ((prev: T[]) => T[])

export interface CollectionState<TModel> {
  items: TModel[]
  loading: boolean
  error: string | null
}

// The table name is a runtime value here, so the generated per-table types
// cannot narrow `from()` and every column reference resolves to `never`. The
// per-entity hooks in useAppData.ts are where the typed mapping actually lives;
// this generic layer works against an untyped view of the same client.
const db = supabase as unknown as SupabaseClient<any, 'public', any>

/**
 * Replaces any id that a `uuid` column would reject.
 *
 * Every id that came from the server is already a UUID, so anything failing the
 * check is necessarily a locally-created item -- which makes rewriting it safe:
 * it cannot correspond to a stored row, and the diff below would classify it as
 * an insert either way. This is a backstop for call sites that build an object
 * by hand; without it a single bad id fails the whole insert batch.
 */
function withValidIds<TModel extends { id: string }>(items: TModel[]): TModel[] {
  let changed = false
  const next = items.map(item => {
    if (isUuid(item.id)) return item
    changed = true
    return { ...item, id: newId() }
  })
  return changed ? next : items
}

function sameShallow(a: unknown, b: unknown): boolean {
  if (a === b) return true
  try {
    return JSON.stringify(a) === JSON.stringify(b)
  } catch {
    return false
  }
}

// --- store -----------------------------------------------------------------

/** Coalescing window for realtime-triggered refetches. */
const REFETCH_DEBOUNCE_MS = 300
/**
 * After a local write, Postgres echoes our own change straight back over the
 * realtime channel. Our optimistic state already matches, so refetching
 * immediately is a wasted round trip -- but simply ignoring the echo would also
 * drop a genuine change from another device that lands in the same window. The
 * refetch is therefore delayed to the end of this window rather than skipped,
 * which collapses a burst of edits into a single confirming read.
 */
const ECHO_QUIET_MS = 1500

/** Grace period before tearing down a store nobody is using any more. */
const TEARDOWN_GRACE_MS = 5000

/** Backstop retry for writes that failed with no connection. */
const WRITE_RETRY_MS = 30000

interface Store<TModel extends { id: string }> {
  key: string
  table: string
  cacheKey: string
  userId: string
  config: CollectionConfig<TModel, any>
  state: CollectionState<TModel>
  /** Last state we believe the server holds; diffs are computed against this. */
  baseline: TModel[]
  listeners: Set<() => void>
  subscribers: number
  channel: RealtimeChannel | null
  refetchTimer: ReturnType<typeof setTimeout> | null
  teardownTimer: ReturnType<typeof setTimeout> | null
  retryTimer: ReturnType<typeof setTimeout> | null
  /** True while a failed write is waiting to be re-sent. */
  retryPending: boolean
  /** Removes the armed retry's `online` listener and timer. */
  cancelRetry: (() => void) | null
  lastLocalWriteAt: number
  /** Increments per fetch so a slow response cannot overwrite a newer one. */
  fetchSeq: number
  started: boolean
}

const stores = new Map<string, Store<any>>()

// --- global sync status ----------------------------------------------------
//
// Save failures used to be logged to the console and nothing else, so a write
// that Postgres rejected looked identical to one that succeeded: the optimistic
// UI kept the change on screen and the user had no way to know their work was
// not stored. These let a component surface that.

export interface SyncFailure {
  table: string
  message: string
}

const syncListeners = new Set<() => void>()
let syncFailures: SyncFailure[] = []

function recomputeSyncFailures(): void {
  const next: SyncFailure[] = []
  stores.forEach(store => {
    if (store.state.error) next.push({ table: store.table, message: store.state.error })
  })
  const changed =
    next.length !== syncFailures.length ||
    next.some((f, i) => f.table !== syncFailures[i].table || f.message !== syncFailures[i].message)
  if (!changed) return
  syncFailures = next
  syncListeners.forEach(listener => listener())
}

export function subscribeToSyncFailures(listener: () => void): () => void {
  syncListeners.add(listener)
  return () => syncListeners.delete(listener)
}

export function getSyncFailures(): SyncFailure[] {
  return syncFailures
}

/**
 * Backs the "Retry" action on the sync-failure banner.
 *
 * A collection with unsent writes is RE-SENT, not re-read. Reading would
 * overwrite the user's unsaved edits with the server's older copy -- the exact
 * opposite of what pressing "Retry" after "changes have not been saved" is
 * asking for. Collections that merely failed to load are re-read as normal.
 */
export async function retryAllCollections(): Promise<void> {
  await Promise.all(
    Array.from(stores.values()).map(store => {
      if (!store.retryPending) return fetchAll(store)
      // Disarm first: persist() re-arms on failure, and scheduleWriteRetry is a
      // no-op while a retry is already pending, so leaving the flag set would
      // strand the collection with no further attempts.
      cancelWriteRetry(store)
      return persist(store, store.state.items)
    })
  )
}

function getStore<TModel extends { id: string }>(
  userId: string,
  config: CollectionConfig<TModel, any>
): Store<TModel> {
  const key = `${config.table}:${userId}`
  const existing = stores.get(key) as Store<TModel> | undefined
  if (existing) {
    // Keep the newest mapping functions; they are stable in practice, but a
    // hot reload can replace them.
    existing.config = config
    return existing
  }

  const store: Store<TModel> = {
    key,
    table: config.table,
    cacheKey: config.cacheKey,
    userId,
    config,
    state: { items: [], loading: true, error: null },
    baseline: [],
    listeners: new Set(),
    subscribers: 0,
    channel: null,
    refetchTimer: null,
    teardownTimer: null,
    retryTimer: null,
    retryPending: false,
    cancelRetry: null,
    lastLocalWriteAt: 0,
    fetchSeq: 0,
    started: false
  }
  stores.set(key, store)
  return store
}

function emit<TModel extends { id: string }>(store: Store<TModel>): void {
  store.listeners.forEach(listener => listener())
}

function setState<TModel extends { id: string }>(
  store: Store<TModel>,
  patch: Partial<CollectionState<TModel>>
): void {
  const next = { ...store.state, ...patch }
  if (
    next.items === store.state.items &&
    next.loading === store.state.loading &&
    next.error === store.state.error
  ) {
    return
  }
  const errorChanged = next.error !== store.state.error
  store.state = next
  emit(store)
  if (errorChanged) recomputeSyncFailures()
}

async function fetchAll<TModel extends { id: string }>(store: Store<TModel>): Promise<void> {
  if (!store.userId) {
    store.baseline = []
    setState(store, { items: [], loading: false })
    return
  }

  const seq = ++store.fetchSeq
  const cfg = store.config

  try {
    let query = db.from(cfg.table).select('*').eq('user_id', store.userId)
    if (cfg.order) {
      query = query.order(cfg.order.column, { ascending: cfg.order.ascending ?? true })
    }
    const { data, error: queryError } = await query
    if (queryError) throw queryError
    if (seq !== store.fetchSeq) return // a newer fetch already won

    const models = (data ?? []).map(row => cfg.toModel(row))
    store.baseline = models
    writeCache(store.userId, cfg.cacheKey, models)
    setState(store, { items: models, error: null, loading: false })
  } catch (err: any) {
    if (seq !== store.fetchSeq) return
    // Keep whatever the cache gave us; the user can still read their data.
    console.warn(`Failed to load ${cfg.cacheKey}:`, err?.message ?? err)
    setState(store, { error: err?.message ?? 'Failed to load data', loading: false })
  }
}

/** Schedules a refetch, coalescing bursts and our own realtime echo. */
function scheduleRefetch<TModel extends { id: string }>(store: Store<TModel>): void {
  // Never refetch over unsent local work: `fetchAll` replaces both `items` and
  // `baseline` with the server's copy, which would silently drop edits that are
  // still queued for retry.
  if (store.retryPending) return
  if (store.refetchTimer) clearTimeout(store.refetchTimer)
  const sinceLocalWrite = Date.now() - store.lastLocalWriteAt
  const delay = Math.max(REFETCH_DEBOUNCE_MS, ECHO_QUIET_MS - sinceLocalWrite)
  store.refetchTimer = setTimeout(() => {
    store.refetchTimer = null
    void fetchAll(store)
  }, delay)
}

function start<TModel extends { id: string }>(store: Store<TModel>): void {
  if (store.started || !store.userId) return
  store.started = true

  const cached = readCache<TModel[]>(store.userId, store.cacheKey)
  if (cached && Array.isArray(cached)) {
    store.baseline = cached
    setState(store, { items: cached })
  }

  void fetchAll(store)

  if (store.config.realtime) {
    store.channel = supabase
      .channel(`sync:${store.table}:${store.userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: store.table,
          filter: `user_id=eq.${store.userId}`
        },
        () => {
          // Refetch rather than patching from the payload: it is simpler to
          // reason about, and these collections are small.
          scheduleRefetch(store)
        }
      )
      .subscribe()
  }
}

function stop<TModel extends { id: string }>(store: Store<TModel>): void {
  store.started = false
  cancelWriteRetry(store)
  if (store.refetchTimer) {
    clearTimeout(store.refetchTimer)
    store.refetchTimer = null
  }
  if (store.channel) {
    void supabase.removeChannel(store.channel)
    store.channel = null
  }
  stores.delete(store.key)
}

/**
 * Distinguishes "the request never arrived" from "the server said no".
 *
 * The two need opposite handling. A rejected write (a constraint violation, an
 * RLS refusal) means the optimistic state is wrong and must be reverted to what
 * is actually stored. A network failure means the state is probably fine and
 * just has not been sent yet -- reverting there throws away work the user did
 * on a train, which is exactly when a study app gets used.
 */
function isNetworkFailure(error: any): boolean {
  if (typeof navigator !== 'undefined' && !navigator.onLine) return true
  const message = String(error?.message ?? error ?? '')
  return (
    error instanceof TypeError ||
    /failed to fetch|network|networkerror|load failed|timeout|aborted/i.test(message)
  )
}

async function persist<TModel extends { id: string }>(
  store: Store<TModel>,
  next: TModel[]
): Promise<void> {
  if (!store.userId) return
  const cfg = store.config
  const previous = store.baseline

  const prevById = new Map(previous.map(item => [item.id, item]))
  const nextById = new Map(next.map(item => [item.id, item]))

  const inserted = next.filter(item => !prevById.has(item.id))
  const deleted = previous.filter(item => !nextById.has(item.id))
  const updated = next.filter(item => {
    const before = prevById.get(item.id)
    return before && !sameShallow(before, item)
  })

  if (!inserted.length && !deleted.length && !updated.length) return

  // Move the baseline forward optimistically so overlapping edits diff against
  // the intended state rather than replaying the same operations.
  store.baseline = next
  store.lastLocalWriteAt = Date.now()

  const operations: Promise<unknown>[] = []

  if (inserted.length) {
    operations.push(
      Promise.resolve(
        db
          .from(cfg.table)
          .insert(inserted.map(item => ({ ...cfg.toRow(item), id: item.id, user_id: store.userId })))
      ).then(({ error }: any) => {
        if (error) throw error
      })
    )
  }

  for (const item of updated) {
    operations.push(
      Promise.resolve(
        db.from(cfg.table).update(cfg.toRow(item)).eq('id', item.id).eq('user_id', store.userId)
      ).then(({ error }: any) => {
        if (error) throw error
      })
    )
  }

  if (deleted.length) {
    operations.push(
      Promise.resolve(
        db
          .from(cfg.table)
          .delete()
          .in(
            'id',
            deleted.map(item => item.id)
          )
          .eq('user_id', store.userId)
      ).then(({ error }: any) => {
        if (error) throw error
      })
    )
  }

  const results = await Promise.allSettled(operations)
  store.lastLocalWriteAt = Date.now()

  const failure = results.find(r => r.status === 'rejected') as PromiseRejectedResult | undefined
  if (!failure) {
    if (store.state.error) setState(store, { error: null })
    return
  }

  const reason = failure.reason
  const message = reason?.message ?? 'Failed to save changes'
  console.warn(`Failed to save ${cfg.cacheKey}:`, message)

  // Rewind the baseline either way, so the next attempt recomputes the full
  // diff against what the server actually holds rather than believing these
  // rows are already stored.
  store.baseline = previous

  if (isNetworkFailure(reason)) {
    // Keep the optimistic state and try again when the connection returns.
    setState(store, { error: message })
    scheduleWriteRetry(store)
  } else {
    setState(store, { error: message })
    // The server refused it. Re-read so the UI reflects what was actually
    // stored instead of silently diverging from it.
    void fetchAll(store)
  }
}

/**
 * Re-sends a collection's unsaved changes once the network is back.
 *
 * Only one retry is armed per store; `persist` recomputes the diff from the
 * current state each time, so a single attempt covers every edit made while
 * offline rather than replaying them one by one.
 */
function scheduleWriteRetry<TModel extends { id: string }>(store: Store<TModel>): void {
  if (store.retryPending) return
  store.retryPending = true

  const attempt = () => {
    if (!store.retryPending) return
    cancelWriteRetry(store)
    if (!stores.has(store.key)) return
    void persist(store, store.state.items)
  }

  store.cancelRetry = () => {
    store.retryPending = false
    window.removeEventListener('online', attempt)
    if (store.retryTimer) {
      clearTimeout(store.retryTimer)
      store.retryTimer = null
    }
    store.cancelRetry = null
  }

  window.addEventListener('online', attempt)
  // A backstop for the case where `online` never fires -- a captive portal, or
  // a connection that is nominally up but was failing for another reason.
  store.retryTimer = setTimeout(attempt, WRITE_RETRY_MS)
}

/** Disarms a pending write retry, removing its listener and timer. */
function cancelWriteRetry<TModel extends { id: string }>(store: Store<TModel>): void {
  store.cancelRetry?.()
  store.retryPending = false
  if (store.retryTimer) {
    clearTimeout(store.retryTimer)
    store.retryTimer = null
  }
}

function applyUpdate<TModel extends { id: string }>(
  store: Store<TModel>,
  value: Updater<TModel>
): void {
  const current = store.state.items
  const resolved =
    typeof value === 'function' ? (value as (prev: TModel[]) => TModel[])(current) : value
  const next = withValidIds(resolved)
  if (next === current) return

  if (store.userId) writeCache(store.userId, store.cacheKey, next)
  setState(store, { items: next })
  void persist(store, next)
}

/** Drops every store. Called on sign-out so nothing leaks to the next account. */
export function resetSyncedCollections(): void {
  Array.from(stores.values()).forEach(store => {
    if (store.teardownTimer) clearTimeout(store.teardownTimer)
    stop(store)
  })
  stores.clear()
  recomputeSyncFailures()
}

// --- hook ------------------------------------------------------------------

const EMPTY_STATE: CollectionState<any> = { items: [], loading: false, error: null }

export function useSyncedCollection<TModel extends { id: string }, TRow = any>(
  config: CollectionConfig<TModel, TRow>
): [
  TModel[],
  (value: Updater<TModel>) => void,
  { loading: boolean; error: string | null; refresh: () => Promise<void> }
] {
  const { user } = useAuth()
  const userId = user?.id ?? ''

  // `config` is rebuilt on every render by the per-entity hooks, so it cannot
  // be a dependency; the store keeps the latest copy itself.
  const configRef = useRef(config)
  configRef.current = config

  const subscribe = useCallback(
    (onChange: () => void) => {
      if (!userId) return () => {}
      const store = getStore(userId, configRef.current)

      if (store.teardownTimer) {
        clearTimeout(store.teardownTimer)
        store.teardownTimer = null
      }
      store.listeners.add(onChange)
      store.subscribers += 1
      start(store)

      return () => {
        store.listeners.delete(onChange)
        store.subscribers -= 1
        if (store.subscribers > 0) return
        // Deliberately delayed: React StrictMode mounts, unmounts and remounts
        // effects, and a tab switch can unmount the only reader for a moment.
        // Tearing down immediately would drop the channel and refetch
        // everything each time.
        store.teardownTimer = setTimeout(() => {
          store.teardownTimer = null
          if (store.subscribers === 0) stop(store)
        }, TEARDOWN_GRACE_MS)
      }
    },
    [userId]
  )

  const getSnapshot = useCallback((): CollectionState<TModel> => {
    if (!userId) return EMPTY_STATE
    return getStore<TModel>(userId, configRef.current).state
  }, [userId])

  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

  const update = useCallback(
    (value: Updater<TModel>) => {
      if (!userId) return
      applyUpdate(getStore<TModel>(userId, configRef.current), value)
    },
    [userId]
  )

  const refresh = useCallback(async () => {
    if (!userId) return
    await fetchAll(getStore<TModel>(userId, configRef.current))
  }, [userId])

  return [state.items, update, { loading: state.loading, error: state.error, refresh }]
}
