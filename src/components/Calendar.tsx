import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { CalendarEvent, Subject } from '@/lib/types'
import { CaretLeft, CaretRight, Plus, Clock, MapPin } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface CalendarProps {
  subjects: Subject[]
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const EVENT_TYPES = [
  { value: 'study', label: '📚 Study Session', color: 'bg-blue-500' },
  { value: 'exam', label: '📝 Exam', color: 'bg-red-500' },
  { value: 'deadline', label: '⏰ Deadline', color: 'bg-orange-500' },
  { value: 'reminder', label: '🔔 Reminder', color: 'bg-purple-500' },
  { value: 'break', label: '☕ Break', color: 'bg-green-500' }
]

export function Calendar({ subjects }: CalendarProps) {
  const { user } = useAuth()
  
  // Get user-specific data
  const currentUserId = user?.uid || 'anonymous'
  const userDataKey = (key: string) => `${currentUserId}-${key}`
  
  // Temporarily disabled GitHub Spark KV to prevent rate limit errors
  const [events, setEvents] = useState<CalendarEvent[]>([])
  // const [events, setEvents] = useKV<CalendarEvent[]>(userDataKey('calendar-events'), [])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isAddEventOpen, setIsAddEventOpen] = useState(false)
  const [newEvent, setNewEvent] = useState<Partial<CalendarEvent>>({
    title: '',
    description: '',
    type: 'study',
    isAllDay: false,
    startTime: '09:00',
    endTime: '10:00'
  })

  const today = new Date()
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())

  // Generate calendar days
  const calendarDays = []
  const currentCalendarDate = new Date(startDate)
  
  for (let i = 0; i < 42; i++) {
    calendarDays.push(new Date(currentCalendarDate))
    currentCalendarDate.setDate(currentCalendarDate.getDate() + 1)
  }

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date)
      return eventDate.toDateString() === date.toDateString()
    })
  }

  // Navigate months
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1)
      } else {
        newDate.setMonth(newDate.getMonth() + 1)
      }
      return newDate
    })
  }

  // Handle date selection
  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    setNewEvent(prev => ({
      ...prev,
      date
    }))
  }

  // Add new event
  const handleAddEvent = () => {
    if (!newEvent.title || !selectedDate) {
      toast.error('Please fill in all required fields')
      return
    }

    const event: CalendarEvent = {
      id: Date.now().toString(),
      title: newEvent.title,
      description: newEvent.description || '',
      date: selectedDate,
      startTime: newEvent.isAllDay ? undefined : newEvent.startTime,
      endTime: newEvent.isAllDay ? undefined : newEvent.endTime,
      subjectId: newEvent.subjectId,
      type: newEvent.type as CalendarEvent['type'],
      isAllDay: newEvent.isAllDay || false,
      color: newEvent.subjectId 
        ? subjects.find(s => s.id === newEvent.subjectId)?.color 
        : EVENT_TYPES.find(t => t.value === newEvent.type)?.color
    }

    setEvents(current => [...current, event])
    setIsAddEventOpen(false)
    setNewEvent({
      title: '',
      description: '',
      type: 'study',
      isAllDay: false,
      startTime: '09:00',
      endTime: '10:00'
    })
    setSelectedDate(null)
    toast.success('Event added successfully!')
  }

  // Delete event
  const handleDeleteEvent = (eventId: string) => {
    setEvents(current => current.filter(e => e.id !== eventId))
    toast.success('Event deleted')
  }

  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString()
  }

  const isSelected = (date: Date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString()
  }

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === month
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Calendar</h2>
          <p className="text-sm text-white/70">Plan your study schedule</p>
        </div>
        <Button
          onClick={() => {
            setSelectedDate(today)
            setIsAddEventOpen(true)
          }}
          className="bg-accent hover:bg-accent/80 text-accent-foreground"
          size="sm"
        >
          <Plus size={16} className="mr-1" />
          Add Event
        </Button>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between bg-white/5 rounded-lg p-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigateMonth('prev')}
          className="text-white hover:bg-white/10"
        >
          <CaretLeft size={16} />
        </Button>
        
        <div className="text-center">
          <h3 className="font-semibold text-white">
            {MONTHS[month]} {year}
          </h3>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigateMonth('next')}
          className="text-white hover:bg-white/10"
        >
          <CaretRight size={16} />
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="space-y-2">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1">
          {DAYS.map(day => (
            <div key={day} className="text-center text-xs font-medium text-white/60 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((date, index) => {
            const dayEvents = getEventsForDate(date)
            const hasEvents = dayEvents.length > 0
            return (
              <button
                key={index}
                onClick={() => handleDateClick(date)}
                className={cn(
                  "aspect-square p-1 rounded-lg text-sm transition-colors relative",
                  "hover:bg-white/10",
                  isCurrentMonth(date) ? "text-white" : "text-white/30",
                  isToday(date) && "bg-accent/30 border border-accent",
                  isSelected(date) && "bg-white/20 border border-white/40",
                  hasEvents && isCurrentMonth(date) && "ring-1 ring-accent/50 bg-accent/10"
                )}
              >
                {/* Event Flag - Top Right Corner */}
                {hasEvents && isCurrentMonth(date) && (
                  <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-accent rounded-full border border-background flex items-center justify-center">
                    <span className="text-[8px] text-accent-foreground font-bold">
                      {dayEvents.length > 9 ? '9+' : dayEvents.length}
                    </span>
                  </div>
                )}
                
                <div className="flex flex-col h-full">
                  <span className="text-xs">{date.getDate()}</span>
                  {dayEvents.length > 0 && (
                    <div className="flex-1 flex flex-col justify-end">
                      {dayEvents.slice(0, 2).map((event, i) => (
                        <div
                          key={event.id}
                          className="h-1 rounded-full mb-0.5 opacity-80"
                          style={{ backgroundColor: event.color || '#6366f1' }}
                        />
                      ))}
                      {dayEvents.length > 2 && (
                        <span className="text-[8px] text-white/60">+{dayEvents.length - 2}</span>
                      )}
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Selected Date Events */}
      {selectedDate && (
        <div className="bg-white/5 rounded-lg p-4 space-y-3">
          <h3 className="font-medium text-white">
            {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h3>
          
          {getEventsForDate(selectedDate).length === 0 ? (
            <p className="text-sm text-white/60">No events scheduled</p>
          ) : (
            <div className="space-y-2">
              {getEventsForDate(selectedDate).map(event => (
                <div 
                  key={event.id}
                  className="bg-white/5 rounded-lg p-3 border-l-4"
                  style={{ borderLeftColor: event.color || '#6366f1' }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-white text-sm">{event.title}</h4>
                      {event.description && (
                        <p className="text-xs text-white/70 mt-1">{event.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-xs text-white/60">
                        {!event.isAllDay && event.startTime && (
                          <div className="flex items-center gap-1">
                            <Clock size={12} />
                            {event.startTime} - {event.endTime}
                          </div>
                        )}
                        {event.subjectId && (
                          <div className="flex items-center gap-1">
                            <MapPin size={12} />
                            {subjects.find(s => s.id === event.subjectId)?.name}
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteEvent(event.id)}
                      className="text-white/60 hover:text-red-400 hover:bg-red-500/10 h-6 w-6 p-0"
                    >
                      ×
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Event Dialog */}
      <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
        <DialogContent className="bg-black/80 backdrop-blur-md border-white/20 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white">Add New Event</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-white">Event Title *</Label>
              <Input
                id="title"
                value={newEvent.title}
                onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter event title"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-white">Description</Label>
              <Textarea
                id="description"
                value={newEvent.description}
                onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Add description (optional)"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 h-20"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white">Event Type</Label>
              <Select 
                value={newEvent.type} 
                onValueChange={(value) => setNewEvent(prev => ({ ...prev, type: value as CalendarEvent['type'] }))}
              >
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-white/20">
                  {EVENT_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value} className="text-white hover:bg-white/10">
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {subjects.length > 0 && (
              <div className="space-y-2">
                <Label className="text-white">Subject (Optional)</Label>
                <Select 
                  value={newEvent.subjectId || 'no-subject'} 
                  onValueChange={(value) => setNewEvent(prev => ({ ...prev, subjectId: value === 'no-subject' ? undefined : value }))}
                >
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent className="bg-black/90 border-white/20">
                    <SelectItem value="no-subject" className="text-white hover:bg-white/10">None</SelectItem>
                    {subjects.map(subject => (
                      <SelectItem key={subject.id} value={subject.id} className="text-white hover:bg-white/10">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: subject.color }}
                          />
                          {subject.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Switch
                id="all-day"
                checked={newEvent.isAllDay}
                onCheckedChange={(checked) => setNewEvent(prev => ({ ...prev, isAllDay: checked }))}
              />
              <Label htmlFor="all-day" className="text-white">All day event</Label>
            </div>

            {!newEvent.isAllDay && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="start-time" className="text-white">Start Time</Label>
                  <Input
                    id="start-time"
                    type="time"
                    value={newEvent.startTime}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, startTime: e.target.value }))}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-time" className="text-white">End Time</Label>
                  <Input
                    id="end-time"
                    type="time"
                    value={newEvent.endTime}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, endTime: e.target.value }))}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button
                onClick={() => setIsAddEventOpen(false)}
                variant="outline"
                className="flex-1 border-white/20 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddEvent}
                className="flex-1 bg-accent hover:bg-accent/80 text-accent-foreground"
              >
                Add Event
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}