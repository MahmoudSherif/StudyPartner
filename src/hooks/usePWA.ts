import { useEffect, useState } from 'react'

interface PWAInstallPrompt {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
  preventDefault?: () => void
}

interface PWAHookReturn {
  isInstallable: boolean
  isInstalled: boolean
  isStandalone: boolean
  installApp: () => Promise<boolean>
  isSupported: boolean
}

export function usePWA(): PWAHookReturn {
  const [isInstallable, setIsInstallable] = useState(false)
  const [installPrompt, setInstallPrompt] = useState<PWAInstallPrompt | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)

  // Check if running in standalone mode (installed PWA)
  const isStandalone = typeof window !== 'undefined' && (() => {
    try {
      return window.matchMedia('(display-mode: standalone)').matches ||
             (window.navigator as any).standalone === true
    } catch (e) {
      return (window.navigator as any).standalone === true
    }
  })()

  // Check if PWA is supported
  const isSupported = typeof window !== 'undefined' && 'serviceWorker' in navigator

  useEffect(() => {
    if (!isSupported) return

    // Register service worker
    const registerSW = async () => {
      try {
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.register('/sw.js')
          // Production logging removed
        }
      } catch (error) {
        // Production logging removed
      }
    }

    registerSW()

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      // Store the event but don't prevent it yet - let it show the banner
      // Only prevent if we want to show it manually later
      setInstallPrompt(e as any)
      setIsInstallable(true)
    }

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setIsInstallable(false)
      setInstallPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    // Check if already installed
    if (isStandalone) {
      setIsInstalled(true)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [isSupported, isStandalone])

  const installApp = async (): Promise<boolean> => {
    if (!installPrompt) return false

    try {
      // Prevent the default behavior and show our custom prompt
      installPrompt.preventDefault?.()
      await installPrompt.prompt()
      const choiceResult = await installPrompt.userChoice
      
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true)
        setIsInstallable(false)
        setInstallPrompt(null)
        return true
      }
      
      return false
    } catch (error) {
      // Production logging removed
      return false
    }
  }

  return {
    isInstallable,
    isInstalled,
    isStandalone,
    installApp,
    isSupported
  }
}