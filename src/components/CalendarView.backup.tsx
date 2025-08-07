import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isToday, startOfWeek, endOfWeek, isSameDay, differenceInDays } from 'date-fns';
import { 
  Plus, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  Calendar as CalendarIcon,
  AlertTriangle,
  BookOpen,
  Clock,
  Flag,
  X,
  Eye,
  Star,
  Calendar,
  MapPin
} from 'lucide-react';

const CalendarView: React.FC = () => {
  const { state, addImportantDate, deleteImportantDate } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'month' | 'list'>('month');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [newDate, setNewDate] = useState({
    title: '',
    date: '',
    type: 'event' as const,
    description: '',
    reminder: true
  });

  // Get today's date string for comparisons
  const today = format(new Date(), 'yyyy-MM-dd');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newDate.title.trim() && newDate.date) {
      addImportantDate({
        title: newDate.title.trim(),
        date: newDate.date,
        type: newDate.type,
        description: newDate.description.trim(),
        reminder: newDate.reminder
      });
      setNewDate({ title: '', date: '', type: 'event', description: '', reminder: true });
      setShowAddForm(false);
    }
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    const events = getEventsForDate(date);
    if (events.length === 0) {
      // If no events, prepare to add one for this date
      setNewDate(prev => ({ ...prev, date: format(date, 'yyyy-MM-dd') }));
      setShowAddForm(true);
    }
  };

  const getCalendarDays = () => {
    const start = startOfWeek(startOfMonth(currentDate));
    const end = endOfWeek(endOfMonth(currentDate));
    return eachDayOfInterval({ start, end });
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return state.importantDates.filter(event => event.date === dateStr);
  };

  const getUpcomingEvents = () => {
    return state.importantDates
      .filter(event => event.date >= today)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5); // Show next 5 upcoming events
  };

  const getEventPriorityColor = (type: string, date: string) => {
    const eventDate = new Date(date);
    const daysUntil = differenceInDays(eventDate, new Date());
    
    // Base color by type
    let baseColor = '';
    switch (type) {
      case 'exam': baseColor = 'red'; break;
      case 'assignment': baseColor = 'yellow'; break;
      case 'deadline': baseColor = 'orange'; break;
      default: baseColor = 'blue'; break;
    }
    
    // Intensity by urgency
    if (daysUntil <= 1) return `bg-${baseColor}-600 text-white border-${baseColor}-400`;
    if (daysUntil <= 3) return `bg-${baseColor}-500 text-white border-${baseColor}-300`;
    if (daysUntil <= 7) return `bg-${baseColor}-400 text-white border-${baseColor}-200`;
    return `bg-${baseColor}-500/20 text-${baseColor}-300 border-${baseColor}-500/30`;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'exam': return <AlertTriangle size={14} />;
      case 'assignment': return <BookOpen size={14} />;
      case 'deadline': return <Clock size={14} />;
      default: return <Flag size={14} />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'exam': return 'bg-red-500 text-white';
      case 'assignment': return 'bg-yellow-500 text-white';
      case 'deadline': return 'bg-orange-500 text-white';
      default: return 'bg-blue-500 text-white';
    }
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="min-h-screen space-y-4 sm:space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Mobile-First Header */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              <CalendarIcon className="inline-block mr-2 mb-1" size={28} />
              Calendar
            </h1>
            <p className="text-gray-300 mt-1 text-sm sm:text-base">
              Manage your schedule and important dates
            </p>
          </div>
          
          {/* Mobile-optimized buttons */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button 
              onClick={() => setViewMode(viewMode === 'month' ? 'list' : 'month')}
              className="btn-secondary flex items-center justify-center gap-2 text-sm sm:text-base min-h-[44px]"
            >
              {viewMode === 'month' ? <Eye size={18} /> : <Calendar size={18} />}
              {viewMode === 'month' ? 'List View' : 'Calendar View'}
            </button>
            <button 
              onClick={() => setShowAddForm(true)}
              className="btn flex items-center justify-center gap-2 text-sm sm:text-base min-h-[44px]"
            >
              <Plus size={18} />
              Add Event
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Add Event Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Star className="text-yellow-400" size={20} />
                Add New Event
              </h2>
              <button 
                onClick={() => setShowAddForm(false)}
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-200 mb-2">
                  Event Title *
                </label>
                <input
                  type="text"
                  value={newDate.title}
                  onChange={(e) => setNewDate({ ...newDate, title: e.target.value })}
                  placeholder="e.g., Math Exam, Project Deadline"
                  className="input"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-200 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={newDate.date}
                    onChange={(e) => setNewDate({ ...newDate, date: e.target.value })}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-200 mb-2">
                    Type *
                  </label>
                  <select
                    value={newDate.type}
                    onChange={(e) => setNewDate({ ...newDate, type: e.target.value as any })}
                    className="input"
                  >
                    <option value="event">📅 General Event</option>
                    <option value="exam">📝 Exam</option>
                    <option value="assignment">📚 Assignment</option>
                    <option value="deadline">⏰ Deadline</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-200 mb-2">
                  Description
                </label>
                <textarea
                  value={newDate.description}
                  onChange={(e) => setNewDate({ ...newDate, description: e.target.value })}
                  placeholder="Add additional details (optional)"
                  className="textarea"
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                <input
                  type="checkbox"
                  id="reminder"
                  checked={newDate.reminder}
                  onChange={(e) => setNewDate({ ...newDate, reminder: e.target.checked })}
                  className="w-4 h-4 text-blue-500 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="reminder" className="text-sm text-gray-200">
                  📬 Enable reminders for this event
                </label>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button type="submit" className="btn flex-1 min-h-[44px]">
                  <Plus size={18} className="mr-2" />
                  Create Event
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowAddForm(false)}
                  className="btn-secondary flex-1 min-h-[44px]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                {getTypeIcon(selectedEvent.type)}
                Event Details
              </h2>
              <button 
                onClick={() => setSelectedEvent(null)}
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white">{selectedEvent.title}</h3>
                <p className="text-blue-400 flex items-center gap-2 mt-2">
                  <Calendar size={16} />
                  {format(new Date(selectedEvent.date), 'EEEE, MMMM d, yyyy')}
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(selectedEvent.type)}`}>
                  {selectedEvent.type.charAt(0).toUpperCase() + selectedEvent.type.slice(1)}
                </span>
                {selectedEvent.reminder && (
                  <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm font-medium flex items-center gap-1">
                    <MapPin size={12} />
                    Reminder On
                  </span>
                )}
              </div>
              
              {selectedEvent.description && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-300 mb-2">Description</h4>
                  <p className="text-gray-400 bg-white/5 p-3 rounded-lg">{selectedEvent.description}</p>
                </div>
              )}
              
              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => {
                    deleteImportantDate(selectedEvent.id);
                    setSelectedEvent(null);
                  }}
                  className="btn-secondary flex-1 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  <Trash2 size={16} className="mr-2" />
                  Delete Event
                </button>
                <button 
                  onClick={() => setSelectedEvent(null)}
                  className="btn flex-1"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Calendar View */}
      {viewMode === 'month' && (
        <div className="card">
          {/* Calendar Header with Navigation */}
          <div className="flex flex-col sm:flex-row items-center justify-between mb-6 pb-4 border-b border-white/10 gap-4">
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                className="p-2 sm:p-3 hover:bg-white/10 rounded-lg transition-colors text-white touch-manipulation"
                aria-label="Previous month"
              >
                <ChevronLeft size={20} />
              </button>
              <h2 className="text-xl sm:text-2xl font-bold text-white min-w-[200px] text-center">
                {format(currentDate, 'MMMM yyyy')}
              </h2>
              <button
                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                className="p-2 sm:p-3 hover:bg-white/10 rounded-lg transition-colors text-white touch-manipulation"
                aria-label="Next month"
              >
                <ChevronRight size={20} />
              </button>
            </div>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="text-blue-400 hover:text-blue-300 font-semibold text-sm transition-colors px-3 py-1 hover:bg-blue-500/20 rounded-lg"
            >
              Today
            </button>
          </div>

          {/* Day Headers - Mobile Responsive */}
          <div className="grid grid-cols-7 mb-2 sm:mb-4">
            {dayNames.map((day) => (
              <div key={day} className="p-2 sm:p-3 text-center border-b border-white/10">
                <span className="text-xs sm:text-sm font-semibold text-gray-300 uppercase tracking-wide">
                  {window.innerWidth < 640 ? day.slice(0, 1) : day.slice(0, 3)}
                </span>
              </div>
            ))}
          </div>

          {/* Enhanced Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 bg-white/5 rounded-lg overflow-hidden">
            {getCalendarDays().map((date, index) => {
              const events = getEventsForDate(date);
              const isCurrentMonthDay = isCurrentMonth(date);
              const isTodayDate = isToday(date);
              const isSelectedDate = selectedDate && isSameDay(date, selectedDate);
              
              return (
                <div
                  key={index}
                  onClick={() => handleDateClick(date)}
                  className={`
                    min-h-[80px] sm:min-h-[100px] p-2 sm:p-3 
                    bg-white/5 hover:bg-white/10 transition-all duration-200 cursor-pointer
                    touch-manipulation relative
                    ${!isCurrentMonthDay ? 'opacity-40' : ''}
                    ${isSelectedDate ? 'ring-2 ring-blue-400 bg-blue-500/20' : ''}
                    ${isTodayDate ? 'bg-blue-500/10 ring-1 ring-blue-400/50' : ''}
                  `}
                >
                  {/* Date Number */}
                  <div className={`text-xs sm:text-sm font-medium mb-1 sm:mb-2 ${
                    !isCurrentMonthDay 
                      ? 'text-gray-500' 
                      : isTodayDate 
                      ? 'text-blue-400 font-bold' 
                      : 'text-white'
                  }`}>
                    {isTodayDate ? (
                      <div className="flex items-center justify-center">
                        <span className="bg-blue-500 text-white rounded-full w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-xs font-bold">
                          {format(date, 'd')}
                        </span>
                      </div>
                    ) : (
                      <div className="text-center">{format(date, 'd')}</div>
                    )}
                  </div>
                  
                  {/* Events */}
                  <div className="space-y-0.5 sm:space-y-1">
                    {events.slice(0, window.innerWidth < 640 ? 2 : 3).map((event) => (
                      <div
                        key={event.id}
                        className={`
                          text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded border
                          cursor-pointer transition-all hover:scale-105
                          ${getEventPriorityColor(event.type, event.date)}
                        `}
                        title={`${event.title} - ${format(new Date(event.date), 'MMM d')}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEvent(event);
                        }}
                      >
                        <div className="flex items-center gap-1">
                          {getTypeIcon(event.type)}
                          <span className="truncate font-medium text-xs">
                            {event.title.length > 8 && window.innerWidth < 640 
                              ? event.title.slice(0, 8) + '...' 
                              : event.title
                            }
                          </span>
                        </div>
                      </div>
                    ))}
                    
                    {/* Show more indicator */}
                    {events.length > (window.innerWidth < 640 ? 2 : 3) && (
                      <div className="text-xs text-gray-400 px-1.5 py-0.5 text-center bg-white/10 rounded">
                        +{events.length - (window.innerWidth < 640 ? 2 : 3)} more
                      </div>
                    )}
                  </div>

                  {/* Quick add indicator */}
                  {isCurrentMonthDay && events.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Plus size={16} className="text-gray-400" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="card">
          <div className="mb-6 pb-4 border-b border-white/10">
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <Calendar size={24} />
              Upcoming Events
            </h2>
            <p className="text-gray-300 mt-1 text-sm sm:text-base">
              Next {getUpcomingEvents().length} events in chronological order
            </p>
          </div>
          
          {getUpcomingEvents().length === 0 ? (
            <div className="text-center py-12">
              <CalendarIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No upcoming events</h3>
              <p className="text-gray-400 mb-6">
                Your schedule is clear. Add some events to stay organized!
              </p>
              <button
                onClick={() => setShowAddForm(true)}
                className="btn flex items-center gap-2 mx-auto min-h-[44px]"
              >
                <Plus size={18} />
                Add Your First Event
              </button>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {getUpcomingEvents().map((event) => {
                const eventDate = new Date(event.date);
                const daysUntil = differenceInDays(eventDate, new Date());
                const isToday = daysUntil === 0;
                const isOverdue = daysUntil < 0;
                
                return (
                  <div
                    key={event.id}
                    className={`
                      p-4 border rounded-xl hover:bg-white/5 transition-all duration-200
                      ${isOverdue ? 'border-red-500/50 bg-red-500/10' : 
                        isToday ? 'border-yellow-500/50 bg-yellow-500/10' : 
                        daysUntil <= 3 ? 'border-orange-500/30 bg-orange-500/5' : 
                        'border-white/10'
                      }
                    `}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className={`p-3 rounded-lg ${getTypeColor(event.type)} shrink-0`}>
                          {getTypeIcon(event.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white text-sm sm:text-base break-words">
                            {event.title}
                          </h3>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-1">
                            <p className="text-sm text-gray-300">
                              {format(eventDate, 'EEEE, MMM d, yyyy')}
                            </p>
                            <span className={`
                              text-xs px-2 py-1 rounded-full font-medium w-fit
                              ${isOverdue ? 'bg-red-500/20 text-red-300' :
                                isToday ? 'bg-yellow-500/20 text-yellow-300' :
                                daysUntil === 1 ? 'bg-orange-500/20 text-orange-300' :
                                daysUntil <= 7 ? 'bg-blue-500/20 text-blue-300' :
                                'bg-gray-500/20 text-gray-300'
                              }
                            `}>
                              {isOverdue ? `${Math.abs(daysUntil)} days overdue` :
                               isToday ? 'Today!' :
                               daysUntil === 1 ? 'Tomorrow' :
                               `In ${daysUntil} days`
                              }
                            </span>
                          </div>
                          {event.description && (
                            <p className="text-sm text-gray-400 mt-2 break-words">
                              {event.description}
                            </p>
                          )}
                          {event.reminder && (
                            <div className="flex items-center gap-1 mt-2 text-xs text-green-400">
                              <MapPin size={12} />
                              <span>Reminder enabled</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => deleteImportantDate(event.id)}
                        className="text-gray-400 hover:text-red-400 p-2 transition-colors rounded-lg hover:bg-red-500/10 shrink-0"
                        title="Delete event"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    
                    {/* Progress indicator for urgent items */}
                    {daysUntil <= 7 && daysUntil >= 0 && (
                      <div className="mt-3 pt-3 border-t border-white/10">
                        <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                          <span>Urgency Level</span>
                          <span>{Math.max(0, Math.min(100, (7-daysUntil) * 14.3)).toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              daysUntil <= 1 ? 'bg-red-500' :
                              daysUntil <= 3 ? 'bg-orange-500' :
                              'bg-blue-500'
                            }`}
                            style={{width: `${Math.max(0, Math.min(100, (7-daysUntil) * 14.3))}%`}}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Enhanced Events List for Month View */}
      {viewMode === 'month' && (
        <div className="card">
          <div className="mb-6 pb-4 border-b border-white/10">
            <h2 className="text-xl font-bold text-white">All Events</h2>
            <p className="text-gray-300 mt-1 text-sm">
              {state.importantDates.length} total events
            </p>
          </div>
          
          {state.importantDates.length === 0 ? (
            <div className="text-center py-12">
              <CalendarIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No events scheduled</h3>
              <p className="text-gray-400 mb-6">
                Get started by creating your first event.
              </p>
              <button
                onClick={() => setShowAddForm(true)}
                className="btn flex items-center gap-2 mx-auto min-h-[44px]"
              >
                <Plus size={18} />
                Add Event
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {state.importantDates
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-3 sm:p-4 border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`p-2 sm:p-3 rounded-lg ${getTypeColor(event.type)} shrink-0`}>
                        {getTypeIcon(event.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white text-sm sm:text-base break-words">
                          {event.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-300">
                          {format(new Date(event.date), 'EEEE, MMM d, yyyy')}
                        </p>
                        {event.description && (
                          <p className="text-xs sm:text-sm text-gray-400 mt-1 break-words">
                            {event.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteImportantDate(event.id)}
                      className="text-gray-400 hover:text-red-400 p-2 transition-colors rounded-lg hover:bg-red-500/10 shrink-0 touch-manipulation"
                      title="Delete event"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CalendarView; 