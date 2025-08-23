import { useState, useEffect } from 'react'
import { X, Globe, Circle } from '@phosphor-icons/react'
import { isFirebaseAvailable } from '@/lib/firebase'
import { toast } from 'sonner'

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [showIndicator, setShowIndicator] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setShowIndicator(true)
      toast.success('Back online! 🌐', {
        duration: 3000
      })
      
      // Hide indicator after showing "back online" message
      setTimeout(() => setShowIndicator(false), 3000)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowIndicator(true)
      toast.error('You are offline 📱', {
        description: 'Some features may be limited',
        duration: 5000
      })
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Show indicator initially if offline or Firebase unavailable
    if (!navigator.onLine || !isFirebaseAvailable) {
      setShowIndicator(true)
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Show indicator if offline or Firebase unavailable
  const shouldShowIndicator = showIndicator && (!isOnline || !isFirebaseAvailable)
  
  if (!shouldShowIndicator) return null

  const getIndicatorContent = () => {
    if (!isOnline && !isFirebaseAvailable) {
      return {
        icon: <X size={16} />,
        text: 'Offline Mode',
        bgColor: 'bg-red-500/90',
        borderColor: 'border-red-400/50'
      }
    }
    
    if (!isOnline) {
      return {
        icon: <X size={16} />,
        text: 'No Internet',
        bgColor: 'bg-red-500/90',
        borderColor: 'border-red-400/50'
      }
    }
    
    if (!isFirebaseAvailable) {
      return {
        icon: <X size={16} />,
        text: 'Local Mode',
        bgColor: 'bg-yellow-500/90',
        borderColor: 'border-yellow-400/50'
      }
    }

    return {
      icon: <Globe size={16} />,
      text: 'Online',
      bgColor: 'bg-green-500/90',
      borderColor: 'border-green-400/50'
    }
  }

  const { icon, text, bgColor, borderColor } = getIndicatorContent()

  return (
    <div className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 ${bgColor} backdrop-blur-sm rounded-full px-4 py-2 border ${borderColor} ${!isFirebaseAvailable ? 'animate-pulse' : ''}`}>
      <div className="flex items-center gap-2 text-white text-sm font-medium">
        {icon}
        <span>{text}</span>
      </div>
    </div>
  )
}