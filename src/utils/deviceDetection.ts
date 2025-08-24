export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false
  
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera
  
  // Check for mobile devices
  const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i
  return mobileRegex.test(userAgent.toLowerCase())
}

export const isIOS = (): boolean => {
  if (typeof window === 'undefined') return false
  
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
}

export const isAndroid = (): boolean => {
  if (typeof window === 'undefined') return false
  
  return /Android/.test(navigator.userAgent)
}

export const canInstallPWA = (): boolean => {
  if (typeof window === 'undefined') return false
  
  // Check if browser supports PWA installation
  return 'serviceWorker' in navigator && 'BeforeInstallPromptEvent' in window
}
