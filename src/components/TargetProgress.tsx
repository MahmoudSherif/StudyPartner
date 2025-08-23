import { Subject, StudySession, SubjectProgress } from '@/lib/types'
import { calculateSubjectProgress, formatTime } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Target, Calendar, Clock } from '@phosphor-icons/react'

interface TargetProgressProps {
  subjects: Subject[]
  sessions: StudySession[]
}

export function TargetProgress({ subjects, sessions }: TargetProgressProps) {
  const subjectsWithTargets = subjects.filter(subject => 
    subject.dailyTarget || subject.weeklyTarget
  )

  if (subjectsWithTargets.length === 0) {
    return (
      <Card>
        <CardContent className="p-4 text-center">
          <Target size={32} className="mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            Set daily or weekly targets in your subjects to track progress here
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Target size={16} />
        <span>Target Progress</span>
      </div>
      
      {subjectsWithTargets.map(subject => {
        const progress = calculateSubjectProgress(subject, sessions)
        
        return (
          <Card key={subject.id}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: subject.color }}
                  />
                  <span className="font-medium text-sm">{subject.name}</span>
                </div>
                <div className="flex gap-1">
                  {progress.isBehindDaily && (
                    <Badge variant="destructive" className="text-xs">
                      Behind Daily
                    </Badge>
                  )}
                  {progress.isBehindWeekly && (
                    <Badge variant="outline" className="text-xs border-yellow-500 text-yellow-700">
                      Behind Weekly
                    </Badge>
                  )}
                </div>
              </div>

              {subject.dailyTarget && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1">
                      <Clock size={12} />
                      <span>Daily Goal</span>
                    </div>
                    <span className="text-muted-foreground">
                      {formatTime(progress.todayTime)} / {formatTime(subject.dailyTarget)}
                    </span>
                  </div>
                  <Progress 
                    value={progress.dailyProgress} 
                    className="h-2"
                  />
                  <div className="text-right text-xs text-muted-foreground">
                    {Math.round(progress.dailyProgress)}%
                  </div>
                </div>
              )}

              {subject.weeklyTarget && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      <span>Weekly Goal</span>
                    </div>
                    <span className="text-muted-foreground">
                      {formatTime(progress.weekTime)} / {formatTime(subject.weeklyTarget)}
                    </span>
                  </div>
                  <Progress 
                    value={progress.weeklyProgress} 
                    className="h-2"
                  />
                  <div className="text-right text-xs text-muted-foreground">
                    {Math.round(progress.weeklyProgress)}%
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}