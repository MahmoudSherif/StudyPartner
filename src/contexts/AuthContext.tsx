import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { authFunctions, supabase, type User as SupabaseUser } from '@/lib/supabase'
import { clearAllCaches, clearOtherUserCaches } from '@/lib/localCache'
import { resetSyncedCollections } from '@/hooks/useSyncedCollection'
import { resetAchievementStore } from '@/hooks/useAppData'
import { resetChallengeStore } from '@/hooks/useChallenges'
import { toast } from 'sonner'

export interface AuthUser {
  /** Supabase user id (a uuid). */
  id: string
  /**
   * Alias of `id`. Retained because ~50 call sites across the app read
   * `user.uid`, the name Firebase used. Keeping both avoids a rename that
   * touches nine files for no behavioural gain.
   */
  uid: string
  email: string | null
  displayName: string | null
  photoURL?: string | null
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  signUp: (email: string, password: string, displayName?: string) => Promise<{ user: AuthUser | null; error: string | null }>
  signIn: (email: string, password: string) => Promise<{ user: AuthUser | null; error: string | null }>
  signInWithGoogle: () => Promise<{ user: AuthUser | null; error: string | null }>
  signOut: () => Promise<{ error: string | null }>
  resetPassword: (email: string) => Promise<{ error: string | null }>
  updateDisplayName: (displayName: string) => Promise<{ error: string | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

function mapUser(user: SupabaseUser | null): AuthUser | null {
  if (!user) return null
  const displayName =
    (user.user_metadata?.display_name as string | undefined) ??
    (user.user_metadata?.full_name as string | undefined) ??
    user.email?.split('@')[0] ??
    null

  return {
    id: user.id,
    uid: user.id,
    email: user.email ?? null,
    displayName,
    photoURL: (user.user_metadata?.avatar_url as string | undefined) ?? null
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    // Resolve the persisted session before first paint so the app does not
    // flash the sign-in screen for an already-authenticated user.
    void (async () => {
      const session = await authFunctions.getSession()
      if (!active) return
      const mapped = mapUser(session?.user ?? null)
      setUser(mapped)
      if (mapped) clearOtherUserCaches(mapped.id)
      setLoading(false)
    })()

    const unsubscribe = authFunctions.onAuthStateChange(nextUser => {
      const mapped = mapUser(nextUser)
      setUser(mapped)
      if (mapped) {
        // A different account on this device must not read the previous one's
        // cached collections.
        clearOtherUserCaches(mapped.id)
      }
      setLoading(false)
    })

    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  /**
   * Mirrors the display name into the public profile row.
   *
   * A database trigger seeds this on sign-up; this keeps it current when the
   * name changes later. `profiles` holds only a name and avatar -- deliberately
   * not the email address, so showing a participant's name in a challenge does
   * not disclose their contact details.
   */
  const syncProfile = useCallback(async (displayName: string | null, avatarUrl?: string | null) => {
    const { data } = await supabase.auth.getUser()
    const current = data.user
    if (!current) return
    const { error } = await supabase
      .from('profiles')
      .upsert(
        { id: current.id, display_name: displayName, avatar_url: avatarUrl ?? null },
        { onConflict: 'id' }
      )
    if (error) console.warn('Failed to sync profile:', error.message)
  }, [])

  const signUp = useCallback(
    async (email: string, password: string, displayName?: string) => {
      setLoading(true)
      try {
        const result = await authFunctions.signUp(email, password, displayName)
        if (!result.user) return { user: null, error: result.error ?? 'Failed to create account' }

        const mapped = mapUser(result.user)
        // With email confirmation enabled there is no session yet; the profile
        // trigger has already run server-side, so nothing more is needed here.
        if (mapped) toast.success('Account created successfully!')
        return { user: mapped, error: null }
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true)
    try {
      const result = await authFunctions.signIn(email, password)
      if (!result.user) return { user: null, error: result.error ?? 'Failed to sign in' }
      const mapped = mapUser(result.user)
      toast.success('Signed in successfully!')
      return { user: mapped, error: null }
    } finally {
      setLoading(false)
    }
  }, [])

  const signInWithGoogle = useCallback(async () => {
    // Redirects away from the page; the session is picked up on return by
    // detectSessionInUrl.
    const { error } = await authFunctions.signInWithGoogle()
    return { user: null, error }
  }, [])

  const signOut = useCallback(async () => {
    setLoading(true)
    try {
      const result = await authFunctions.signOut()
      if (result.error) return { error: result.error }
      setUser(null)
      // Nothing cached should survive for whoever signs in next -- neither the
      // localStorage entries nor the in-memory stores, which outlive React
      // state because they are module-level.
      resetSyncedCollections()
      resetAchievementStore()
      resetChallengeStore()
      clearAllCaches()
      toast.success('Signed out successfully!')
      return { error: null }
    } finally {
      setLoading(false)
    }
  }, [])

  const resetPassword = useCallback(async (email: string) => {
    return authFunctions.resetPassword(email)
  }, [])

  const updateDisplayName = useCallback(
    async (displayName: string) => {
      const trimmed = displayName.trim()
      const { error } = await supabase.auth.updateUser({ data: { display_name: trimmed } })
      if (error) return { error: error.message }
      await syncProfile(trimmed)
      setUser(current => (current ? { ...current, displayName: trimmed } : current))
      return { error: null }
    },
    [syncProfile]
  )

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      loading,
      signUp,
      signIn,
      signInWithGoogle,
      signOut,
      resetPassword,
      updateDisplayName
    }),
    [user, loading, signUp, signIn, signInWithGoogle, signOut, resetPassword, updateDisplayName]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
