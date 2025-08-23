import { useEffect, useState } from 'react'
import { User } from 'firebase/auth'
import { authFunctions } from '@/lib/firebase'

export const useFirebaseAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = authFunctions.onAuthStateChanged((user) => {
      setUser(user)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  return {
    user,
    loading,
    isAuthenticated: !!user
  }
}