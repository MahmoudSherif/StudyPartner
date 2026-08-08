// Offline read-through cache.
//
// Purpose is snappy first paint and read-only usability when the network is
// down: a cached collection is rendered immediately, then reconciled with the
// server. The server is always authoritative -- the cache is never a source of
// truth and is never written back to the database. That distinction matters,
// because the previous implementation synced unvalidated localStorage content
// straight into the backend at login.

const CACHE_PREFIX = 'motivamate:cache:'
// Bump when the cached shape changes so stale entries are dropped, not misread.
const CACHE_VERSION = 2
const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000

interface CacheEnvelope<T> {
  v: number
  userId: string
  storedAt: number
  data: T
}

function keyFor(userId: string, name: string): string {
  return `${CACHE_PREFIX}${userId}:${name}`
}

export function readCache<T>(userId: string, name: string, ttlMs = DEFAULT_TTL_MS): T | null {
  if (!userId) return null
  try {
    const raw = localStorage.getItem(keyFor(userId, name))
    if (!raw) return null

    const parsed = JSON.parse(raw) as CacheEnvelope<T>
    // Reject anything that is not the shape we wrote. localStorage is
    // user-writable, so this is parsing untrusted input.
    if (!parsed || typeof parsed !== 'object') return null
    if (parsed.v !== CACHE_VERSION) return null
    // Guards against a cache entry from a previous account on a shared device.
    if (parsed.userId !== userId) return null
    if (typeof parsed.storedAt !== 'number') return null
    if (Date.now() - parsed.storedAt > ttlMs) return null

    return parsed.data
  } catch {
    return null
  }
}

export function writeCache<T>(userId: string, name: string, data: T): void {
  if (!userId) return
  try {
    const envelope: CacheEnvelope<T> = {
      v: CACHE_VERSION,
      userId,
      storedAt: Date.now(),
      data
    }
    localStorage.setItem(keyFor(userId, name), JSON.stringify(envelope))
  } catch (err) {
    // Quota exceeded is the common case. Drop our own entries and move on --
    // the cache is an optimisation, never required for correctness.
    if (err instanceof DOMException) {
      clearAllCaches()
    }
  }
}

export function clearCache(userId: string, name: string): void {
  try {
    localStorage.removeItem(keyFor(userId, name))
  } catch {
    /* ignore */
  }
}

/** Wipes every cached collection. Call on sign-out so nothing survives for the next user. */
export function clearAllCaches(): void {
  try {
    const doomed: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(CACHE_PREFIX)) doomed.push(key)
    }
    doomed.forEach(key => localStorage.removeItem(key))
  } catch {
    /* ignore */
  }
}

/**
 * Removes cache entries belonging to any user other than the one given.
 * Sign-out should clear everything, but this covers the case where a session
 * is replaced without a clean sign-out.
 */
export function clearOtherUserCaches(currentUserId: string): void {
  try {
    const doomed: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key?.startsWith(CACHE_PREFIX)) continue
      const owner = key.slice(CACHE_PREFIX.length).split(':')[0]
      if (owner !== currentUserId) doomed.push(key)
    }
    doomed.forEach(key => localStorage.removeItem(key))
  } catch {
    /* ignore */
  }
}
