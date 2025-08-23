import { useEffect, useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { TargetNotification, Subject, StudySession } from '@/lib/types'
import { generateTargetNotifications } from '@/lib/utils'
import { X, Target, AlertTriangle } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface TargetNotificationsProps {
  subjects: Subject[]
  sessions: StudySession[]
  onSelectSubject: (subject: Subject) => void
}

export function TargetNotifications({ subjects, sessions, onSelectSubject }: TargetNotificationsProps) {
  const { user } = useAuth()
  
  // Get user-specific data
  const currentUserId = user?.uid || 'anonymous'
  const userDataKey = (key: string) => `${currentUserId}-${key}`
  
  const [dismissedNotifications, setDismissedNotifications] = useKV<string[]>(userDataKey('dismissed-notifications'), [])
  const [notifications, setNotifications] = useState<TargetNotification[]>([])

  useEffect(() => {
    // Check for notifications every 30 minutes
    const checkNotifications = () => {
      const newNotifications = generateTargetNotifications(subjects, sessions)
      
      // Filter out dismissed notifications (reset dismissed list daily)
      const today = new Date().toDateString()
      const dismissedToday = dismissedNotifications.filter(id => id.includes(today))
      
      const filteredNotifications = newNotifications.filter(notification => 
        !dismissedToday.includes(notification.id)
      )
      
      setNotifications(filteredNotifications)
      
      // Show toast for new critical notifications
      filteredNotifications
        .filter(n => n.severity === 'danger')
        .forEach(notification => {
          toast.warning(notification.message, {
            duration: 8000,
            action: {
              label: 'Study Now',
              onClick: () => {
                const subject = subjects.find(s => s.id === notification.subjectId)
                if (subject) {
                  onSelectSubject(subject)
                }
              }
            }
          })
        })
    }

    checkNotifications()
    const interval = setInterval(checkNotifications, 30 * 60 * 1000) // 30 minutes

    return () => clearInterval(interval)
  }, [subjects, sessions, dismissedNotifications])

  const dismissNotification = (notificationId: string) => {
    setDismissedNotifications(current => [...current, notificationId])
    setNotifications(current => current.filter(n => n.id !== notificationId))
  }

  const handleStudyNow = (subjectId: string) => {
    const subject = subjects.find(s => s.id === subjectId)
    if (subject) {
      onSelectSubject(subject)
      toast.success(`Switched to ${subject.name}. Let's reach that goal!`)
    }
  }

  if (notifications.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Target size={16} />
        <span>Target Alerts</span>
      </div>
      
      {notifications.map(notification => (
        <Alert 
          key={notification.id}
          className={`relative ${
            notification.severity === 'danger' 
              ? 'border-destructive/50 bg-destructive/5' 
              : 'border-yellow-500/50 bg-yellow-500/5'
          }`}
        >
          <AlertTriangle 
            size={16} 
            className={notification.severity === 'danger' ? 'text-destructive' : 'text-yellow-600'} 
          />
          <AlertDescription className="pr-8">
            {notification.message}
          </AlertDescription>
          
          <div className="absolute top-2 right-2 flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => handleStudyNow(notification.subjectId)}
            >
              Study Now
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => dismissNotification(notification.id)}
            >
              <X size={12} />
            </Button>
          </div>
        </Alert>
      ))}
    </div>
  )
}