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
}

export function usePWA(): PWAHookReturn {
  const [isInstallable, setIsInstallable] = useState(false)
  const [installPrompt, setInstallPrompt] = useState<PWAInstallPrompt | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [hasAutoPrompted, setHasAutoPrompted] = useState<boolean>(() => {
    try { return localStorage.getItem('pwaAutoPrompted') === '1' } catch { return false }
  })
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
      // Prevent the default mini-infobar from appearing
      e.preventDefault()
      // Store the event so we can trigger it later
      setInstallPrompt(e as any)
      setIsInstallable(true)
      console.log('PWA: Install prompt available')
      // Respect dismissal cooldown
      const lastDismiss = localStorage.getItem(DISMISS_KEY)
      if (lastDismiss) {
        const ts = parseInt(lastDismiss, 10)
        if (!isNaN(ts) && Date.now() - ts < DISMISS_COOLDOWN_MS) {
          console.log('PWA: Within dismissal cooldown, skipping auto prompt')
          return
        }
      }
      // Auto prompt only once per session (ref based) & not after explicit dismissal
      if (!autoPromptedRef.current) {
        autoPromptedRef.current = true
        setTimeout(async () => {
          try {
            if ((e as any).prompt) {
              ;(e as any).prompt()
              // Capture user choice
              if ((e as any).userChoice) {
                try {
                  const choice = await (e as any).userChoice
                  if (choice?.outcome === 'dismissed') {
                    try { localStorage.setItem(DISMISS_KEY, Date.now().toString()) } catch {}
                    setIsInstallable(false)
                  }
                  if (choice?.outcome === 'accepted') {
                    setIsInstalled(true)
                    setIsInstallable(false)
                  }
                } catch {}
              }
              setHasAutoPrompted(true)
              try { localStorage.setItem('pwaAutoPrompted', '1') } catch {}
            }
          } catch {}
        }, 1500)
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

  const installApp = async (): Promise<boolean> => {
    if (!installPrompt) {
      console.log('PWA: No install prompt available')
      return false
    }

    try {
      console.log('PWA: Showing install prompt...')
      await installPrompt.prompt()
      const choiceResult = await installPrompt.userChoice
      
      console.log('PWA: User choice:', choiceResult.outcome)
      
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true)
        setIsInstallable(false)
        setInstallPrompt(null)
        console.log('PWA: Installation accepted')
        return true
      } else {
        console.log('PWA: Installation dismissed')
  // Record dismissal & suppress further prompts for cooldown duration
  try { localStorage.setItem(DISMISS_KEY, Date.now().toString()) } catch {}
  setIsInstallable(false)
  // Keep prompt reference so user can manually trigger later (after cooldown)
      }
      
      return false
    } catch (error) {
      console.error('PWA: Installation error:', error)
      return false
    }
  }

  return {
    isInstallable,
    isInstalled,
    isStandalone,
    installApp,
  isSupported,
  hasAutoPrompted
  }
}