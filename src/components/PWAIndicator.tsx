import { usePWA } from '@/hooks/usePWA'
import { DeviceMobile } from '@phosphor-icons/react'

export function PWAIndicator() {
  const { isStandalone } = usePWA()
  
  if (!isStandalone) return null
  
  return (
    <div className="fixed bottom-4 left-4 z-50 bg-green-600/90 backdrop-blur-sm text-white px-3 py-2 rounded-lg shadow-lg text-sm flex items-center gap-2">
      <DeviceMobile size={16} />
      <span>Running as App</span>
    </div>
  )
}
