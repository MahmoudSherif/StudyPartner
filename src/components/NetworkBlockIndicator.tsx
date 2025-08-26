import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { WifiSlash, ShieldWarning } from '@phosphor-icons/react'

interface NetworkBlockIndicatorProps {
  onBlockDetected?: () => void
}

export function NetworkBlockIndicator({ onBlockDetected }: NetworkBlockIndicatorProps) {
  const [hasShownWarning, setHasShownWarning] = useState(false)

  useEffect(() => {
    // Listen for Firebase connection errors
    const handleFirebaseError = (event: any) => {
      if (event.detail?.error?.message?.includes('ERR_BLOCKED_BY_CLIENT') || 
          event.detail?.error?.message?.includes('blocked') ||
          event.detail?.isBlocked) {
        const operation = event.detail?.operation || 'Firebase operation'
        showBlockedRequestWarning(operation)
      }
    }

    // Listen for network errors that might indicate blocking
    const handleNetworkError = (event: ErrorEvent) => {
      if (event.message?.includes('ERR_BLOCKED_BY_CLIENT') ||
          event.message?.includes('blocked')) {
        showBlockedRequestWarning('network request')
      }
    }

    const showBlockedRequestWarning = (operation: string = 'Firebase operation') => {
      if (!hasShownWarning) {
        setHasShownWarning(true)
        
        toast.warning('⚠️ Ad Blocker Detected', {
          description: 'Your ad blocker is preventing real-time sync. Data will be saved locally.',
          duration: 10000,
          action: {
            label: 'How to fix',
            onClick: () => {
              toast.info('🔧 To enable real-time sync:', {
                description: `1. Disable your ad blocker for this site
2. Or add these to your allowlist:
   • firestore.googleapis.com
   • firebase.googleapis.com
3. Then refresh the page`,
                duration: 15000
              })
            }
          }
        })

        onBlockDetected?.()
        
        // Reset warning flag after 5 minutes to show again if needed
        setTimeout(() => {
          setHasShownWarning(false)
        }, 300000)
      }
    }

    // Add event listeners
    window.addEventListener('firebase-error', handleFirebaseError)
    window.addEventListener('error', handleNetworkError)

    return () => {
      window.removeEventListener('firebase-error', handleFirebaseError)
      window.removeEventListener('error', handleNetworkError)
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
