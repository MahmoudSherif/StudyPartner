import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Play, Pause, Square, RotateCcw } from '@phosphor-icons/react'
import { formatDuration } from '@/lib/utils'
import { Subject } from '@/lib/types'
import { mobileFeedback } from '@/lib/mobileFeedback'

interface TimerProps {
  subject: Subject | null
  onSessionComplete: (duration: number) => void
  onSessionCancel: () => void
}

export function Timer({ subject, onSessionComplete, onSessionCancel }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(25 * 60) // 25 minutes in seconds
  const [initialTime, setInitialTime] = useState(25 * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [sessionStarted, setSessionStarted] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false)
            setSessionStarted(false)
            onSessionComplete(initialTime / 60) // Convert to minutes
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, timeLeft, initialTime, onSessionComplete])

  const handleStart = () => {
    mobileFeedback.buttonPress()
    setIsRunning(true)
    setSessionStarted(true)
  }

  const handlePause = () => {
    mobileFeedback.buttonPress()
    setIsRunning(false)
  }

  const handleStop = () => {
    mobileFeedback.buttonPress()
    setIsRunning(false)
    setSessionStarted(false)
    const studiedTime = (initialTime - timeLeft) / 60 // Convert to minutes
    if (studiedTime > 0) {
      onSessionComplete(studiedTime)
    } else {
      onSessionCancel()
    }
    setTimeLeft(initialTime)
  }

  const handleReset = () => {
    mobileFeedback.buttonPress()
    setIsRunning(false)
    setSessionStarted(false)
    setTimeLeft(initialTime)
  }

  const progress = ((initialTime - timeLeft) / initialTime) * 100

  const presetTimes = [
    { label: '15m', value: 15 * 60 },
    { label: '25m', value: 25 * 60 },
    { label: '45m', value: 45 * 60 },
    { label: '60m', value: 60 * 60 }
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-6">
            {subject && (
              <div className="flex items-center justify-center space-x-2">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: subject.color }}
                />
                <span className="text-lg font-medium">{subject.name}</span>
              </div>
            )}

            <div className="relative">
              <div className="text-6xl font-bold text-primary tabular-nums">
                {formatDuration(timeLeft)}
              </div>
              <Progress 
                value={progress} 
                className="mt-4 h-2" 
                style={{
                  '--progress-foreground': subject?.color || 'var(--primary)'
                } as React.CSSProperties}
              />
            </div>

            <div className="flex justify-center space-x-3">
              {!sessionStarted ? (
                <Button 
                  onClick={handleStart}
                  size="lg"
                  className="w-16 h-16 rounded-full"
                  disabled={!subject}
                >
                  <Play size={24} weight="fill" />
                </Button>
              ) : (
                <>
                  <Button 
                    onClick={isRunning ? handlePause : handleStart}
                    size="lg"
                    className="w-16 h-16 rounded-full"
                    variant={isRunning ? "secondary" : "default"}
                  >
                    {isRunning ? <Pause size={24} weight="fill" /> : <Play size={24} weight="fill" />}
                  </Button>
                  <Button 
                    onClick={handleStop}
                    size="lg"
                    className="w-16 h-16 rounded-full"
                    variant="destructive"
                  >
                    <Square size={24} weight="fill" />
                  </Button>
                  <Button 
                    onClick={handleReset}
                    size="lg"
                    className="w-16 h-16 rounded-full"
                    variant="outline"
                  >
                    <RotateCcw size={24} />
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {!sessionStarted && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium mb-3">Session Duration</h3>
            <div className="grid grid-cols-4 gap-2">
              {presetTimes.map((preset) => (
                <Button
                  key={preset.value}
                  variant={timeLeft === preset.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    mobileFeedback.buttonPress()
                    setTimeLeft(preset.value)
                    setInitialTime(preset.value)
                  }}
                  className="h-12"
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}