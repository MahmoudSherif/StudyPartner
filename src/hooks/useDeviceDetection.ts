import { useEffect, useState } from 'react'

interface DeviceInfo {
  isMobile: boolean
  isIOS: boolean
  isAndroid: boolean
  isTablet: boolean
  hasTouch: boolean
  orientation: 'portrait' | 'landscape'
  standalone: boolean
}

export function useDeviceDetection(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobile: false,
    isIOS: false,
    isAndroid: false,
    isTablet: false,
    hasTouch: false,
    orientation: 'portrait',
    standalone: false
  })

  useEffect(() => {
    const updateDeviceInfo = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera
      
      // Detect mobile devices
      const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
      
      // Detect specific platforms
      const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream
      const isAndroid = /android/i.test(userAgent)
      
      // Detect tablet (basic detection)
      const isTablet = /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/i.test(userAgent)
      
      // Detect touch capability
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      
      // Detect orientation
      const orientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
      
      // Detect standalone mode (PWA)
      let standalone = false
      try {
        standalone = window.matchMedia('(display-mode: standalone)').matches || 
                     (navigator as any).standalone === true ||
                     window.location.search.includes('pwa=true')
      } catch (e) {
        // Fallback if matchMedia is not available
        standalone = (navigator as any).standalone === true ||
                     window.location.search.includes('pwa=true')
      }

      setDeviceInfo({
        isMobile,
        isIOS,
        isAndroid,
        isTablet,
        hasTouch,
        orientation,
        standalone
      })
    }

    updateDeviceInfo()

    // Listen for orientation changes
    const handleOrientationChange = () => {
      setTimeout(updateDeviceInfo, 100) // Delay to ensure dimensions are updated
    }

    window.addEventListener('resize', handleOrientationChange)
    window.addEventListener('orientationchange', handleOrientationChange)

    return () => {
      window.removeEventListener('resize', handleOrientationChange)
      window.removeEventListener('orientationchange', handleOrientationChange)
    }
  }, [])

  return deviceInfo
}

// Hook for handling mobile-specific behaviors
export function useMobileBehavior() {
  const deviceInfo = useDeviceDetection()

  useEffect(() => {
    // Prevent zoom on input focus (iOS Safari)
    if (deviceInfo.isIOS) {
      const meta = document.querySelector('meta[name="viewport"]')
      if (meta) {
        const originalContent = meta.getAttribute('content')
        
        const handleFocusIn = () => {
          meta.setAttribute('content', originalContent + ', user-scalable=no')
        }
        
        const handleFocusOut = () => {
          meta.setAttribute('content', originalContent || 'width=device-width, initial-scale=1.0')
        }

        document.addEventListener('focusin', handleFocusIn)
        document.addEventListener('focusout', handleFocusOut)

        return () => {
          document.removeEventListener('focusin', handleFocusIn)
          document.removeEventListener('focusout', handleFocusOut)
        }
      }
    }

    // Prevent pull-to-refresh on mobile
    if (deviceInfo.isMobile) {
      let startY = 0
      
      const handleTouchStart = (e: TouchEvent) => {
        startY = e.touches[0].clientY
      }
      
      const handleTouchMove = (e: TouchEvent) => {
        const currentY = e.touches[0].clientY
        const isScrollingUp = currentY > startY
        const isAtTop = document.documentElement.scrollTop === 0
        
        if (isAtTop && isScrollingUp) {
          e.preventDefault()
        }
      }

      document.addEventListener('touchstart', handleTouchStart, { passive: true })
      document.addEventListener('touchmove', handleTouchMove, { passive: false })

      return () => {
        document.removeEventListener('touchstart', handleTouchStart)
        document.removeEventListener('touchmove', handleTouchMove)
      }
    }

    // Handle Android back button in PWA
    if (deviceInfo.isAndroid && deviceInfo.standalone) {
      const handlePopState = (e: PopStateEvent) => {
        // Handle navigation in PWA
        e.preventDefault()
        // You can implement custom back button behavior here
      }

      window.addEventListener('popstate', handlePopState)
      return () => window.removeEventListener('popstate', handlePopState)
    }
  }, [deviceInfo])

  return deviceInfo
}