// Supabase client and authentication.
//
// Replaces the Firebase client. Two things worth knowing:
//
//  - VITE_SUPABASE_ANON_KEY is publishable by design. It identifies the
//    project, it does not grant access: every table has Row Level Security and
//    the key carries no authority of its own. Do not try to hide it.
//
//  - There is no offline fallback authenticator. The previous implementation
//    dropped to a local mock that accepted any password whenever the network
//    failed, which an attacker could trigger at will.

import { createClient, type Session, type User } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

if (!isSupabaseConfigured) {
  console.error(
    'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY. ' +
    'See .env.example.'
  )
}

export const supabase = createClient<Database>(
  supabaseUrl ?? 'http://localhost:54321',
  supabaseAnonKey ?? 'missing-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'motivamate-auth'
    },
    realtime: {
      // Enough for a challenge board without hammering the socket.
      params: { eventsPerSecond: 5 }
    }
  }
)

export type { Session, User }

const AUTH_UNAVAILABLE =
  'Cannot reach the authentication service. Check your connection and try again.'

/**
 * Maps a Supabase auth error to a user-facing message.
 *
 * Bad password and unknown account intentionally produce the SAME message.
 * Distinguishing them turns the sign-in form into an oracle for which email
 * addresses have accounts.
 */
export function describeAuthError(error: unknown): string {
  const err = error as { message?: string; status?: number } | null
  const message = err?.message ?? ''

  if (/invalid login credentials/i.test(message)) return 'Incorrect email or password.'
  if (/email not confirmed/i.test(message)) return 'Please confirm your email address first.'
  if (/user already registered/i.test(message)) return 'That email address is already registered.'
  if (/password should be at least/i.test(message)) return 'Please choose a stronger password.'
  if (/rate limit|too many requests/i.test(message)) {
    return 'Too many attempts. Please wait a moment and try again.'
  }
  if (/fetch|network|failed to fetch/i.test(message)) return AUTH_UNAVAILABLE
  return message || 'Something went wrong. Please try again.'
}

export interface AuthResult {
  user: User | null
  error: string | null
}

export const authFunctions = {
  signUp: async (email: string, password: string, displayName?: string): Promise<AuthResult> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        // Read by the handle_new_user() trigger to seed the profile row.
        options: { data: displayName ? { display_name: displayName } : undefined }
      })
      if (error) return { user: null, error: describeAuthError(error) }
      return { user: data.user, error: null }
    } catch (error) {
      return { user: null, error: describeAuthError(error) }
    }
  },

  signIn: async (email: string, password: string): Promise<AuthResult> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      })
      if (error) return { user: null, error: describeAuthError(error) }
      return { user: data.user, error: null }
    } catch (error) {
      return { user: null, error: describeAuthError(error) }
    }
  },

  signInWithGoogle: async (): Promise<{ error: string | null }> => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/` }
      })
      // On success the browser navigates away; nothing else to do here.
      return { error: error ? describeAuthError(error) : null }
    } catch (error) {
      return { error: describeAuthError(error) }
    }
  },

  signOut: async (): Promise<{ error: string | null }> => {
    try {
      const { error } = await supabase.auth.signOut()
      return { error: error ? describeAuthError(error) : null }
    } catch (error) {
      return { error: describeAuthError(error) }
    }
  },

  resetPassword: async (email: string): Promise<{ error: string | null }> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/`
      })
      // Always reported as success to the caller's UI layer: revealing whether
      // an address is registered is the same leak as above.
      return { error: error ? describeAuthError(error) : null }
    } catch (error) {
      return { error: describeAuthError(error) }
    }
  },

  getSession: async (): Promise<Session | null> => {
    const { data } = await supabase.auth.getSession()
    return data.session
  },

  onAuthStateChange: (callback: (user: User | null) => void) => {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user ?? null)
    })
    return () => data.subscription.unsubscribe()
  }
}
