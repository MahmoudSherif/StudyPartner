import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Warning, WifiHigh, WifiX } from '@phosphor-icons/react'

export function NetworkStatus() {
  const [hasNetworkIssues, setHasNetworkIssues] = useState(false)
  const [isBlocked, setIsBlocked] = useState(false)
  
  useEffect(() => {
    const handleFirebaseError = (event: CustomEvent) => {
      if (event.detail.isBlocked) {
        setIsBlocked(true)
        setHasNetworkIssues(true)
      }
    }
    
    window.addEventListener('firebase-error', handleFirebaseError as EventListener)
    
    return () => {
      window.removeEventListener('firebase-error', handleFirebaseError as EventListener)
    }
  }, [])
  
  if (!hasNetworkIssues) return null
  
  return (
    <Card className="border-yellow-500/30 bg-yellow-500/10 mb-4">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Warning size={24} className="text-yellow-400" />
          <div className="flex-1">
            <h4 className="text-sm font-medium text-yellow-400 mb-1">
              Network Connection Issue Detected
            </h4>
            <p className="text-xs text-yellow-400/70 mb-2">
              {isBlocked 
                ? 'Firebase requests are being blocked (likely by ad blocker). Challenge sharing may not work properly.'
                : 'Network connectivity issues detected. Some features may not work.'}
            </p>
            {isBlocked && (
              <div className="flex gap-2">
                <Button
                  onClick={() => setHasNetworkIssues(false)}
                  variant="outline"
                  size="sm"
                  className="bg-yellow-500/20 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/30"
                >
                  Dismiss
                </Button>
              </div>
            )}
          </div>
          {isBlocked ? <WifiX size={20} className="text-yellow-400" /> : <WifiHigh size={20} className="text-yellow-400" />}
        </div>
      </CardContent>
    </Card>
  )
}
