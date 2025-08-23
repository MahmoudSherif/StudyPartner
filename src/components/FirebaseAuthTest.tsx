import React, { useState } from 'react'
import { authFunctions } from '@/lib/firebase'
import { toast } from 'sonner'

export const FirebaseAuthTest = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Please enter email and password')
      return
    }

    setLoading(true)
    try {
      let result
      if (mode === 'signup') {
        result = await authFunctions.signUp(email, password, displayName)
      } else {
        result = await authFunctions.signIn(email, password)
      }

      if (result.user) {
        toast.success(`Successfully ${mode === 'signup' ? 'signed up' : 'signed in'}!`)
        setEmail('')
        setPassword('')
        setDisplayName('')
      } else {
        toast.error(result.error || `Failed to ${mode}`)
      }
    } catch (error: any) {
      toast.error(error.message || `An error occurred during ${mode}`)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    setLoading(true)
    try {
      const result = await authFunctions.signOut()
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Signed out successfully!')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign out')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-6">
      <h3 className="text-xl font-bold text-white mb-4">Firebase Auth Test</h3>
      
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setMode('signin')}
          className={`px-4 py-2 rounded ${mode === 'signin' ? 'bg-blue-600' : 'bg-gray-600'} text-white`}
        >
          Sign In
        </button>
        <button
          onClick={() => setMode('signup')}
          className={`px-4 py-2 rounded ${mode === 'signup' ? 'bg-blue-600' : 'bg-gray-600'} text-white`}
        >
          Sign Up
        </button>
      </div>

      <form onSubmit={handleAuth} className="space-y-4">
        {mode === 'signup' && (
          <input
            type="text"
            placeholder="Display Name (optional)"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50"
          />
        )}
        
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50"
          required
        />
        
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50"
          required
        />
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded disabled:opacity-50"
        >
          {loading ? 'Loading...' : mode === 'signup' ? 'Sign Up' : 'Sign In'}
        </button>
      </form>

      <button
        onClick={handleSignOut}
        disabled={loading}
        className="w-full mt-2 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded disabled:opacity-50"
      >
        Sign Out
      </button>
    </div>
  )
}
