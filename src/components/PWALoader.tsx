import { useState, useEffect } from 'react'
import { usePWA } from '@/hooks/usePWA'

interface PWALoaderProps {
  children: React.ReactNode
}

export function PWALoader({ children }: PWALoaderProps) {
  const { isStandalone } = usePWA()
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    // Add a small delay to ensure everything loads properly
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    // Handle any errors during loading
    const handleError = (event: ErrorEvent) => {
      console.error('PWA Loading Error:', event.error)
      setHasError(true)
      setIsLoading(false)
    }

    window.addEventListener('error', handleError)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('error', handleError)
    }
  }, [])

  // Show loading screen for PWA
  if (isStandalone && isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-4xl mb-4">📱</div>
          <h1 className="text-2xl font-bold mb-2">MotivaMate</h1>
          <p className="text-white/70 mb-4">Loading your study companion...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
        </div>
      </div>
    )
  }

  // Show error screen if something went wrong
  if (hasError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white p-6">
          <div className="text-4xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold mb-2">Oops! Something went wrong</h1>
          <p className="text-white/70 mb-4">Please try refreshing the app</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-white text-purple-900 px-6 py-2 rounded-lg font-semibold hover:bg-white/90 transition-colors"
          >
            Refresh App
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
