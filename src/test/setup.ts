import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Firebase for tests
// Mock Firebase services
vi.mock('@/lib/firebase', () => ({
  authFunctions: {
    createUserWithEmailAndPassword: vi.fn(),
    signInWithEmailAndPassword: vi.fn(),
    signOut: vi.fn(),
    onAuthStateChanged: vi.fn(() => vi.fn()), // Return an unsubscribe function
    GoogleAuthProvider: vi.fn(),
    signInWithPopup: vi.fn(),
    sendPasswordResetEmail: vi.fn(),
    updateProfile: vi.fn()
  },
  firestoreFunctions: {
    createUserProfile: vi.fn(),
    getUserProfile: vi.fn(),
    updateUserProfile: vi.fn(),
    getUserData: vi.fn(),
    setUserData: vi.fn(),
    syncUserData: vi.fn()
  }
}))

// Mock Firestore service
vi.mock('@/lib/firestore', () => ({
  firestoreService: {
    saveUserData: vi.fn(() => Promise.resolve({ error: null })),
    getUserData: vi.fn(() => Promise.resolve({ data: null, error: null })),
    saveSubjects: vi.fn(() => Promise.resolve({ error: null })),
    getSubjects: vi.fn(() => Promise.resolve({ data: [], error: null })),
    saveSessions: vi.fn(() => Promise.resolve({ error: null })),
    getSessions: vi.fn(() => Promise.resolve({ data: [], error: null })),
    saveAchievements: vi.fn(() => Promise.resolve({ error: null })),
    getAchievements: vi.fn(() => Promise.resolve({ data: [], error: null })),
    saveTasks: vi.fn(() => Promise.resolve({ error: null })),
    getTasks: vi.fn(() => Promise.resolve({ data: [], error: null })),
    saveChallenges: vi.fn(() => Promise.resolve({ error: null })),
    getChallenges: vi.fn(() => Promise.resolve({ data: [], error: null })),
    saveFocusSessions: vi.fn(() => Promise.resolve({ error: null })),
    getFocusSessions: vi.fn(() => Promise.resolve({ data: [], error: null })),
    saveGoals: vi.fn(() => Promise.resolve({ error: null })),
    getGoals: vi.fn(() => Promise.resolve({ data: [], error: null })),
    getUserProfile: vi.fn(() => Promise.resolve({ data: null, error: null })),
    updateUserProfile: vi.fn(() => Promise.resolve({ error: null })),
    createUserProfile: vi.fn(() => Promise.resolve({ error: null })),
    getDiscoverableChallenges: vi.fn(() => Promise.resolve({ data: [], error: null })),
  },
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

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
}
