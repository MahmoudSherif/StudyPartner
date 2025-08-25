import { useEffect, useState, useRef } from 'react'

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
  hasAutoPrompted: boolean
  showInstallPrompt: () => Promise<boolean>
  dismissedRecently: boolean
}

export function usePWA(): PWAHookReturn {
  const [isInstallable, setIsInstallable] = useState(false)
  const [installPrompt, setInstallPrompt] = useState<PWAInstallPrompt | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [hasAutoPrompted, setHasAutoPrompted] = useState<boolean>(() => {
    try { return localStorage.getItem('pwaAutoPrompted') === '1' } catch { return false }
  })
  const [dismissedRecently, setDismissedRecently] = useState(false)
  const autoPromptedRef = useRef(hasAutoPrompted)

  const DISMISS_KEY = 'pwaInstallDismissedAt'
  const DISMISS_COOLDOWN_MS = 1000 * 60 * 60 * 24 // 24h

  // Check if running in standalone mode (installed PWA)
  const isStandalone = typeof window !== 'undefined' && (() => {
    try {
      return window.matchMedia('(display-mode: standalone)').matches ||
             (window.navigator as any).standalone === true ||
             window.location.search.includes('pwa=true')
    } catch (e) {
      return (window.navigator as any).standalone === true
    }
  })()

  // Check if PWA is supported
  const isSupported = typeof window !== 'undefined' && 'serviceWorker' in navigator

  useEffect(() => {
    if (!isSupported) return

    // Don't show install prompt if already in standalone mode
    if (isStandalone) {
      setIsInstalled(true)
      setIsInstallable(false)
      return
    }

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
      e.preventDefault()
      setInstallPrompt(e as any)
      setIsInstallable(true)
      console.log('PWA: Install prompt captured for manual trigger')
      const lastDismiss = localStorage.getItem(DISMISS_KEY)
      if (lastDismiss) {
        const ts = parseInt(lastDismiss, 10)
        if (!isNaN(ts) && Date.now() - ts < DISMISS_COOLDOWN_MS) {
          setDismissedRecently(true)
        }
      }
    }

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setIsInstallable(false)
      setInstallPrompt(null)
      console.log('PWA: App successfully installed')
      
      // Give user feedback about successful installation
      setTimeout(() => {
        if (confirm('MotivaMate has been installed! Would you like to open the app now?')) {
          // Close the browser tab and let the user open the installed app
          window.close()
        }
      }, 1000)
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

  const performPrompt = async (): Promise<boolean> => {
    if (!installPrompt) return false
    try {
      await installPrompt.prompt()
      const choice = await installPrompt.userChoice
      if (choice?.outcome === 'accepted') {
        setIsInstalled(true)
        setIsInstallable(false)
        setInstallPrompt(null)
        return true
      } else if (choice?.outcome === 'dismissed') {
        try { localStorage.setItem(DISMISS_KEY, Date.now().toString()) } catch {}
        setDismissedRecently(true)
        setIsInstallable(false)
      }
      return false
    } catch (e) {
      console.error('PWA: prompt failed', e)
      return false
    }
  }

  const installApp = async () => performPrompt()
  const showInstallPrompt = async () => performPrompt()

  return { isInstallable, isInstalled, isStandalone, installApp, isSupported, hasAutoPrompted, showInstallPrompt, dismissedRecently }
}