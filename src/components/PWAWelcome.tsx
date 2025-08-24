import { usePWA } from '@/hooks/usePWA'
import { Card, CardContent } from '@/components/ui/card'
import { DeviceMobile, CheckCircle } from '@phosphor-icons/react'

export function PWAWelcome() {
  const { isStandalone } = usePWA()
  
  if (!isStandalone) return null
  
  return (
    <Card className="mb-4 bg-green-50 border-green-200">
      <CardContent className="p-4">
        <div className="flex items-center gap-3 text-green-800">
          <div className="flex items-center gap-2">
            <CheckCircle size={20} className="text-green-600" />
            <DeviceMobile size={20} className="text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold">Welcome to MotivaMate App!</h3>
            <p className="text-sm text-green-700">
              You're now using MotivaMate as an installed app. Enjoy the enhanced experience!
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
