import { useEffect, useState } from 'react'
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, User } from 'firebase/auth'
import { auth } from './config/firebase'
import { AuthScreen } from './components/AuthScreen'
import { MobileApp } from './components/MobileApp'
import { toast, Toaster } from 'sonner'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [authLoading, setAuthLoading] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const handleSignIn = async (email: string, password: string) => {
    setAuthLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
      toast.success('Welcome back!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleSignUp = async (email: string, password: string, _name: string) => {
    setAuthLoading(true)
    try {
      await createUserWithEmailAndPassword(auth, email, password)
      // You can update the user profile with the name here if needed
      toast.success('Account created successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to create account')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut(auth)
      toast.success('Signed out successfully')
    } catch (error: any) {
      toast.error('Failed to sign out')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-background fixed inset-0 z-0" />
        <div className="relative z-10 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-white/80">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <>
        <AuthScreen 
          onSignIn={handleSignIn} 
          onSignUp={handleSignUp} 
          loading={authLoading} 
        />
        <Toaster 
          position="top-center" 
          richColors 
          closeButton
          toastOptions={{
            style: {
              fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
            }
          }}
        />
      </>
    )
  }

  return (
    <>
      <MobileApp user={user} onSignOut={handleSignOut} />
      <Toaster 
        position="top-center" 
        richColors 
        closeButton
        toastOptions={{
          style: {
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
          }
        }}
      />
    </>
  )
}

export default App