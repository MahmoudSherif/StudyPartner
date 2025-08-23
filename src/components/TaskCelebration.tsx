import { useEffect } from 'react'
import confetti from 'canvas-confetti'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Trophy, Star, Target, Sparkle } from '@phosphor-icons/react'
import { mobileFeedback } from '@/lib/mobileFeedback'

interface TaskCelebrationProps {
  isOpen: boolean
  onClose: () => void
  taskTitle: string
  isChallenge?: boolean
  challengeTitle?: string
  points?: number
}

export function TaskCelebration({
  isOpen,
  onClose,
  taskTitle,
  isChallenge = false,
  challengeTitle,
  points
}: TaskCelebrationProps) {
  
  useEffect(() => {
    if (isOpen) {
      // Trigger mobile feedback
      if (isChallenge) {
        mobileFeedback.achievement()
      } else {
        mobileFeedback.taskComplete()
      }
      
      // Trigger confetti animation
      const duration = 3000
      const animationEnd = Date.now() + duration
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min
      }

      const interval: NodeJS.Timeout = setInterval(function() {
        const timeLeft = animationEnd - Date.now()

        if (timeLeft <= 0) {
          return clearInterval(interval)
        }

        const particleCount = 50 * (timeLeft / duration)
        
        // Left side
        confetti(Object.assign({}, defaults, {
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        }))
        
        // Right side  
        confetti(Object.assign({}, defaults, {
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        }))
      }, 250)

      return () => clearInterval(interval)
    }
  }, [isOpen, isChallenge])

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-purple-900/90 to-blue-900/90 backdrop-blur-md border-white/20 text-white max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white text-center">
            {isChallenge ? '🏆 Challenge Task Complete!' : '🎉 Task Complete!'}
          </DialogTitle>
          <DialogDescription className="text-white/70 text-center">
            {isChallenge ? 'Great job completing a challenge task!' : 'Congratulations on completing your task!'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="text-center space-y-6 py-4">
          {/* Celebration Icon */}
          <div className="relative">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-bounce">
              {isChallenge ? (
                <Trophy size={40} className="text-white" />
              ) : (
                <Star size={40} className="text-white" />
              )}
            </div>
            <div className="absolute -top-2 -right-2 text-yellow-400 animate-pulse">
              <Sparkle size={24} />
            </div>
            <div className="absolute -bottom-1 -left-1 text-yellow-400 animate-pulse">
              <Sparkle size={16} />
            </div>
          </div>

          {/* Task Title and Challenge Info */}
          <div className="space-y-2">
            <p className="text-lg text-white/90 font-medium">
              {taskTitle}
            </p>
            {isChallenge && challengeTitle && (
              <p className="text-sm text-white/70">
                in {challengeTitle}
              </p>
            )}
          </div>

          {/* Points/Rewards */}
          {points && (
            <div className="bg-white/10 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-center gap-2 text-yellow-400">
                <Target size={20} />
                <span className="font-bold text-xl">+{points} points</span>
              </div>
              <p className="text-sm text-white/70">Great job on completing this challenge task!</p>
            </div>
          )}

          {/* Motivational Message */}
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-sm text-white/80 italic">
              {isChallenge 
                ? "You're making great progress in the challenge! Keep it up!" 
                : "Another step closer to your goals! You're doing amazing!"
              }
            </p>
          </div>

          {/* Close Button */}
          <Button 
            onClick={onClose}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-3"
          >
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}