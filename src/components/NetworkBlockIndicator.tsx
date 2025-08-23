import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { WifiSlash, ShieldWarning } from '@phosphor-icons/react'

interface NetworkBlockIndicatorProps {
  onBlockDetected?: () => void
}

export function NetworkBlockIndicator({ onBlockDetected }: NetworkBlockIndicatorProps) {
  const [hasShownWarning, setHasShownWarning] = useState(false)

  useEffect(() => {
    let isCleanedUp = false
    
    // Listen for Firebase connection errors
    const handleFirebaseError = (event: any) => {
      if (isCleanedUp) return
      
      if (event.detail?.error?.message?.includes('ERR_BLOCKED_BY_CLIENT') || 
          event.detail?.error?.message?.includes('blocked') ||
          event.detail?.isBlocked) {
        const operation = event.detail?.operation || 'Firebase operation'
        showBlockedRequestWarning(operation)
      }
    }

    // Listen for network errors that might indicate blocking
    const handleNetworkError = (event: ErrorEvent) => {
      if (isCleanedUp) return
      
      if (event.message?.includes('ERR_BLOCKED_BY_CLIENT') ||
          event.message?.includes('blocked') ||
          event.message?.includes('bugsnag')) {
        showBlockedRequestWarning('network request')
      }
    }

    // Listen for resource load errors (like Bugsnag)
    const handleResourceError = (event: Event) => {
      if (isCleanedUp) return
      
      const target = event.target as HTMLElement
      if (target && (target.src?.includes('bugsnag') || target.href?.includes('bugsnag'))) {
        showBlockedRequestWarning('tracking service')
      }
    }

    const showBlockedRequestWarning = (operation: string = 'Firebase operation') => {
      if (!hasShownWarning && !isCleanedUp) {
        setHasShownWarning(true)
        
        toast.warning('⚠️ Network requests blocked', {
          description: `${operation} blocked by ad blocker. Data is saved locally and will sync when possible.`,
          duration: 8000,
          action: {
            label: 'How to fix',
            onClick: () => {
              if (!isCleanedUp) {
                toast.info('💡 Fix blocking issues:', {
                  description: '1. Disable ad blocker for this site\n2. Add Firebase domains to allowlist\n3. Refresh the page',
                  duration: 12000
                })
              }
            }
          }
        })

        onBlockDetected?.()
      }
    }

    // Add event listeners safely
    if (typeof window !== 'undefined') {
      window.addEventListener('firebase-error', handleFirebaseError)
      window.addEventListener('error', handleNetworkError)
      window.addEventListener('error', handleResourceError, true) // Use capture phase for resource errors
    }

    return () => {
      isCleanedUp = true
      
      if (typeof window !== 'undefined' && window.removeEventListener) {
        try {
          window.removeEventListener('firebase-error', handleFirebaseError)
          window.removeEventListener('error', handleNetworkError)
          window.removeEventListener('error', handleResourceError, true)
        } catch (error) {
          // Silently handle cleanup errors
        }
      }
    }
  }, [hasShownWarning, onBlockDetected])

  return null // This is a utility component with no UI
}

// Hook to detect network blocking
export function useNetworkBlockDetection() {
  const [isBlocked, setIsBlocked] = useState(false)
  const [hasDetected, setHasDetected] = useState(false)

  const detectBlock = () => {
    setIsBlocked(true)
    setHasDetected(true)
  }

  return { 
    isBlocked, 
    hasDetected, 
    detectBlock 
  }
}
