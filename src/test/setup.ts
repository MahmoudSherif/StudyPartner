import '@testing-library/jest-dom'
import { afterEach, vi } from 'vitest'

// Mock the Supabase client and its auth surface.
//
// `from()` returns a chainable thenable so that any query the app builds
// resolves to an empty result set instead of attempting a network call.
const makeQueryBuilder = () => {
  const builder: any = {
    then: (resolve: (v: unknown) => unknown) => Promise.resolve({ data: [], error: null }).then(resolve),
  }
  for (const method of [
    'select', 'insert', 'update', 'upsert', 'delete', 'eq', 'neq', 'in', 'is',
    'gt', 'gte', 'lt', 'lte', 'like', 'ilike', 'order', 'limit', 'range', 'filter',
  ]) {
    builder[method] = vi.fn(() => builder)
  }
  builder.single = vi.fn(() => Promise.resolve({ data: null, error: null }))
  builder.maybeSingle = vi.fn(() => Promise.resolve({ data: null, error: null }))
  return builder
}

const makeChannel = () => {
  const channel: any = {}
  channel.on = vi.fn(() => channel)
  channel.subscribe = vi.fn(() => channel)
  channel.unsubscribe = vi.fn(() => Promise.resolve('ok'))
  return channel
}

vi.mock('@/lib/supabase', () => ({
  isSupabaseConfigured: true,
  describeAuthError: vi.fn((e: unknown) => String(e)),
  supabase: {
    from: vi.fn(() => makeQueryBuilder()),
    rpc: vi.fn(() => Promise.resolve({ data: null, error: null })),
    channel: vi.fn(() => makeChannel()),
    removeChannel: vi.fn(() => Promise.resolve('ok')),
    auth: {
      getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null })),
      getUser: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
      signUp: vi.fn(() => Promise.resolve({ data: { user: null, session: null }, error: null })),
      signInWithPassword: vi.fn(() => Promise.resolve({ data: { user: null, session: null }, error: null })),
      signInWithOAuth: vi.fn(() => Promise.resolve({ data: null, error: null })),
      signOut: vi.fn(() => Promise.resolve({ error: null })),
      resetPasswordForEmail: vi.fn(() => Promise.resolve({ error: null })),
      updateUser: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
      // Returns the shape supabase-js does, so callers can unsubscribe.
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
  },
  authFunctions: {
    signUp: vi.fn(() => Promise.resolve({ user: null, error: null })),
    signIn: vi.fn(() => Promise.resolve({ user: null, error: null })),
    signInWithGoogle: vi.fn(() => Promise.resolve({ error: null })),
    signOut: vi.fn(() => Promise.resolve({ error: null })),
    resetPassword: vi.fn(() => Promise.resolve({ error: null })),
    updateDisplayName: vi.fn(() => Promise.resolve({ error: null })),
    getSession: vi.fn(() => Promise.resolve(null)),
    onAuthStateChange: vi.fn(() => vi.fn()), // returns an unsubscribe function
  },
}))

// Mock the Supabase-backed data hooks. Every hook keeps the
// `[items, setItems]` tuple contract the components rely on.
vi.mock('@/hooks/useAppData', () => ({
  useSubjects: vi.fn(() => [[], vi.fn()]),
  useSessions: vi.fn(() => [[], vi.fn()]),
  useFocusSessions: vi.fn(() => [[], vi.fn()]),
  useActiveFocusSession: vi.fn(() => [null, vi.fn()]),
  useTasks: vi.fn(() => [[], vi.fn()]),
  useGoals: vi.fn(() => [[], vi.fn()]),
  useNotes: vi.fn(() => [[], vi.fn()]),
  useCalendarEvents: vi.fn(() => [[], vi.fn()]),
  useAchievements: vi.fn(() => [[], vi.fn()]),
  useTheme: vi.fn(() => ['dark', vi.fn()]),
  useStudyPartnerSettings: vi.fn(() => [{ apiUrl: '', autoSync: false }, vi.fn()]),
  useUserSetting: vi.fn(() => [null, vi.fn()]),
}))

// Mock LocalStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Mock IntersectionObserver. Cast because the stub deliberately omits the
// readonly members (root, rootMargin, thresholds, takeRecords) that nothing
// under test reads.
global.IntersectionObserver = class IntersectionObserver {
  root = null
  rootMargin = ''
  thresholds: number[] = []
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] { return [] }
} as unknown as typeof global.IntersectionObserver

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
}

// Safety net: a test that installs fake timers and then fails before restoring
// them used to leave the clock frozen for every subsequent file in the run,
// which exhausted the heap and killed the whole suite. Restoring here means one
// broken test can only ever fail itself.
afterEach(() => {
  vi.useRealTimers()
})
