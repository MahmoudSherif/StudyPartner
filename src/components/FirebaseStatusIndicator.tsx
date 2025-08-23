import { useState, useEffect } from 'react'
import { ShieldWarning, CloudSlash } from '@phosphor-icons/react'

export function FirebaseStatusIndicator() {
  const [isBlocked, setIsBlocked] = useState(false)
  const [showIndicator, setShowIndicator] = useState(false)

  useEffect(() => {
    const handleFirebaseError = (event: any) => {
      if (event.detail?.isBlocked) {
        setIsBlocked(true)
        setShowIndicator(true)
        
        // Auto-hide after 30 seconds
        setTimeout(() => {
          setShowIndicator(false)
        }, 30000)
      }
    }

    window.addEventListener('firebase-error', handleFirebaseError)
    
    return () => {
      window.removeEventListener('firebase-error', handleFirebaseError)
    }
  }, [])

  if (!showIndicator) return null

  return (
    <div className="fixed top-4 right-4 z-50 bg-amber-100 dark:bg-amber-900/50 border border-amber-300 dark:border-amber-700 rounded-lg px-3 py-2 shadow-lg backdrop-blur-sm">
      <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
        <ShieldWarning size={16} className="flex-shrink-0" />
        <div className="text-xs">
          <div className="font-medium">Offline Mode</div>
          <div className="text-amber-600 dark:text-amber-400">Data saved locally</div>
        </div>
        <button 
          onClick={() => setShowIndicator(false)}
          className="ml-2 text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200"
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
    </div>
  )
}
