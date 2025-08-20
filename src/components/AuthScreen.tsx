import React from 'react'
import { Button } from '@/components/ui/button'

export const SpaceBackground: React.FC = () => {
  return (
    <div className="space-background fixed inset-0 z-0">
      {/* Animated stars are handled by CSS */}
    </div>
  )
}

export const AuthScreen: React.FC<{ 
  onSignIn: (email: string, password: string) => Promise<void>
  onSignUp: (email: string, password: string, name: string) => Promise<void>
  loading: boolean 
}> = ({ onSignIn, onSignUp, loading }) => {
  const [isSignUp, setIsSignUp] = React.useState(false)
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [name, setName] = React.useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSignUp) {
      await onSignUp(email, password, name)
    } else {
      await onSignIn(email, password)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <SpaceBackground />
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-black/20 backdrop-blur-md rounded-lg border border-white/10 p-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">StudyPartner</h1>
            <p className="text-white/80">Your mobile study companion</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-white/90 mb-1">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary selectable-text"
                  placeholder="Your name"
                  required
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-white/90 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary selectable-text"
                placeholder="your@email.com"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white/90 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary selectable-text"
                placeholder="••••••••"
                required
              />
            </div>
            
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-white/80 hover:text-white text-sm"
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}