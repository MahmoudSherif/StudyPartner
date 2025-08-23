import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Trash, Palette, Target, Settings } from '@phosphor-icons/react'
import { Subject } from '@/lib/types'
import { SUBJECT_COLORS } from '@/lib/constants'
import { formatTime } from '@/lib/utils'

interface SubjectManagementProps {
  subjects: Subject[]
  onAddSubject: (subject: Omit<Subject, 'id'>) => void
  onDeleteSubject: (id: string) => void
  onSelectSubject: (subject: Subject) => void
  onUpdateSubject: (id: string, updates: Partial<Subject>) => void
  selectedSubject: Subject | null
}

export function SubjectManagement({ 
  subjects, 
  onAddSubject, 
  onDeleteSubject,
  onSelectSubject,
  onUpdateSubject,
  selectedSubject 
}: SubjectManagementProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isTargetDialogOpen, setIsTargetDialogOpen] = useState(false)
  const [targetSubject, setTargetSubject] = useState<Subject | null>(null)
  const [newSubjectName, setNewSubjectName] = useState('')
  const [selectedColor, setSelectedColor] = useState(SUBJECT_COLORS[0])
  const [dailyTarget, setDailyTarget] = useState('')
  const [weeklyTarget, setWeeklyTarget] = useState('')

  const handleAddSubject = () => {
    if (newSubjectName.trim()) {
      onAddSubject({
        name: newSubjectName.trim(),
        color: selectedColor,
        totalTime: 0
      })
      setNewSubjectName('')
      setSelectedColor(SUBJECT_COLORS[0])
      setIsDialogOpen(false)
    }
  }

  const handleSetTargets = (subject: Subject) => {
    setTargetSubject(subject)
    setDailyTarget(subject.dailyTarget?.toString() || '')
    setWeeklyTarget(subject.weeklyTarget?.toString() || '')
    setIsTargetDialogOpen(true)
  }

  const handleSaveTargets = () => {
    if (targetSubject) {
      const dailyTargetValue = dailyTarget ? parseInt(dailyTarget, 10) : undefined
      const weeklyTargetValue = weeklyTarget ? parseInt(weeklyTarget, 10) : undefined
      
      onUpdateSubject(targetSubject.id, {
        dailyTarget: dailyTargetValue,
        weeklyTarget: weeklyTargetValue
      })
      
      setIsTargetDialogOpen(false)
      setTargetSubject(null)
      setDailyTarget('')
      setWeeklyTarget('')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Study Subjects</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus size={16} className="mr-1" />
              Add Subject
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Subject</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Subject Name</label>
                <Input
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  placeholder="e.g., Mathematics, History..."
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSubject()}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Color</label>
                <div className="grid grid-cols-4 gap-2">
                  {SUBJECT_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-12 h-12 rounded-lg border-2 transition-all ${
                        selectedColor === color ? 'border-foreground scale-110' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <Button onClick={handleAddSubject} className="w-full">
                Add Subject
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {subjects.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <Palette size={48} className="mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">
              No subjects yet. Add your first subject to start studying!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {subjects.map((subject) => (
            <Card 
              key={subject.id} 
              className={`cursor-pointer transition-all ${
                selectedSubject?.id === subject.id 
                  ? 'ring-2 ring-primary bg-primary/5' 
                  : 'hover:bg-muted/50'
              }`}
              onClick={() => onSelectSubject(subject)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: subject.color }}
                    />
                    <div>
                      <h3 className="font-medium">{subject.name}</h3>
                      <div className="text-xs text-muted-foreground space-y-0.5">
                        <div>{formatTime(subject.totalTime)} studied</div>
                        {(subject.dailyTarget || subject.weeklyTarget) && (
                          <div className="flex items-center gap-1">
                            <Target size={10} />
                            {subject.dailyTarget && <span>{subject.dailyTarget}m/day</span>}
                            {subject.dailyTarget && subject.weeklyTarget && <span>•</span>}
                            {subject.weeklyTarget && <span>{formatTime(subject.weeklyTarget)}/week</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSetTargets(subject)
                      }}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Settings size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteSubject(subject.id)
                      }}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash size={16} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Target Setting Dialog */}
      <Dialog open={isTargetDialogOpen} onOpenChange={setIsTargetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Study Targets for {targetSubject?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Daily Target (minutes)</label>
              <Input
                type="number"
                value={dailyTarget}
                onChange={(e) => setDailyTarget(e.target.value)}
                placeholder="e.g., 30"
                min="0"
              />
              <p className="text-xs text-muted-foreground mt-1">
                How many minutes you want to study this subject daily
              </p>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Weekly Target (minutes)</label>
              <Input
                type="number"
                value={weeklyTarget}
                onChange={(e) => setWeeklyTarget(e.target.value)}
                placeholder="e.g., 180"
                min="0"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Total minutes you want to study this subject per week
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsTargetDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button onClick={handleSaveTargets} className="flex-1">
                Save Targets
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}