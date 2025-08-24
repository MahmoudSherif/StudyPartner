import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { usePWA } from '@/hooks/usePWA'
import { isMobileDevice, isIOS } from '@/utils/deviceDetection'
import { Download, X } from '@phosphor-icons/react'
import { useState } from 'react'

export function PWAInstallPrompt() {
  const { isInstallable, installApp, isStandalone, isInstalled } = usePWA()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [showPrompt, setShowPrompt] = useState(true)
  const [isInstalling, setIsInstalling] = useState(false)

  const isMobile = isMobileDevice()
  const isiOS = isIOS()

  // Don't show if already installed, running as PWA, or user dismissed
  // Also prioritize mobile devices
  if (!isInstallable || !showPrompt || isInstalled || isStandalone || !isMobile) return null

  const handleInstall = async () => {
    setIsInstalling(true)
    const success = await installApp()
    setIsInstalling(false)
    
    if (success) {
      setIsDialogOpen(false)
      setShowPrompt(false)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
  }

  return (
    <>
      {/* Install button in header */}
      <div className="fixed top-4 right-4 z-50">
        <Button
          onClick={() => setIsDialogOpen(true)}
          size="sm"
          className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg"
        >
          <Download size={16} className="mr-2" />
          Install App
        </Button>
      </div>

      {/* Install dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-black/90 backdrop-blur-md border-white/20 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center text-white flex items-center justify-between">
              Install MotivaMate
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDialogOpen(false)}
                className="h-6 w-6 p-0 text-white/70 hover:text-white"
              >
                <X size={16} />
              </Button>
            </DialogTitle>
            <DialogDescription className="text-white/70 text-center">
              Install MotivaMate as an app for the best experience
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <div className="text-4xl">📱</div>
              <p className="text-sm text-white/80">
                Add MotivaMate to your home screen!
              </p>
              <p className="text-xs text-white/60">
                {isiOS 
                  ? "After tapping 'Add to Home', you'll find MotivaMate on your home screen like any other app."
                  : "After installing, you can find the app on your home screen and use it like any other app."
                }
              </p>
            </div>
            
            <div className="space-y-2 text-sm text-white/70">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-accent rounded-full"></span>
                Works offline
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-accent rounded-full"></span>
                Faster loading
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-accent rounded-full"></span>
                Native app experience
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-accent rounded-full"></span>
                Home screen access
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={handleDismiss}
                variant="outline"
                className="flex-1 border-white/20 text-white hover:bg-white/10"
              >
                Not now
              </Button>
              <Button
                onClick={handleInstall}
                disabled={isInstalling}
                className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                {isInstalling ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    Installing...
                  </>
                ) : (
                  <>
                    <Download size={16} className="mr-2" />
                    Add to Home
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}