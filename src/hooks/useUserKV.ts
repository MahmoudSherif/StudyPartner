import { useKV } from '@github/spark/hooks'
import { useAuth } from '@/contexts/AuthContext'
import { useEffect, useRef } from 'react'

/**
 * User-specific key-value storage hook
 * Automatically prefixes keys with user ID to ensure data isolation between users
 */
export function useUserKV<T>(key: string, defaultValue: T) {
  const { user } = useAuth()
  const currentUserId = user?.uid || 'anonymous'
  const previousUserIdRef = useRef<string | null>(null)
  
  // Create user-specific key
  const userKey = `${currentUserId}:${key}`
  
  // Use the underlying useKV hook with the user-specific key
  const [value, setValue, deleteValue] = useKV<T>(userKey, defaultValue)
  
  // Reset to default value when user changes
  useEffect(() => {
    if (previousUserIdRef.current && previousUserIdRef.current !== currentUserId) {
      setValue(defaultValue)
    }
    previousUserIdRef.current = currentUserId
  }, [currentUserId, defaultValue, setValue])
  
  return [value, setValue, deleteValue] as const
}