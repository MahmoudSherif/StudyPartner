import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isToday, startOfWeek, endOfWeek } from 'date-fns';
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
  X
} from 'lucide-react';

const CalendarView: React.FC = () => {
  const { state, addImportantDate, deleteImportantDate } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDate, setNewDate] = useState({
    title: '',
    date: '',
    type: 'event' as const,
    description: '',
    reminder: true
  });

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

  const getCalendarDays = () => {
    const start = startOfWeek(startOfMonth(currentDate));
    const end = endOfWeek(endOfMonth(currentDate));
    return eachDayOfInterval({ start, end });
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return state.importantDates.filter(event => event.date === dateStr);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between card">
        <div>
          <h1 className="text-3xl font-bold text-white">Calendar</h1>
          <p className="text-gray-300 mt-1">Manage your schedule and important dates</p>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          className="btn flex items-center gap-2"
        >
          <Plus size={18} />
          Add Event
        </button>
      </div>

      {/* Add Event Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="card max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Add New Event</h2>
              <button 
                onClick={() => setShowAddForm(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Event Title
                </label>
                <input
                  type="text"
                  value={newDate.title}
                  onChange={(e) => setNewDate({ ...newDate, title: e.target.value })}
                  placeholder="Enter event title"
                  className="input"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Date
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
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Type
                  </label>
                  <select
                    value={newDate.type}
                    onChange={(e) => setNewDate({ ...newDate, type: e.target.value as any })}
                    className="input"
                  >
                    <option value="event">Event</option>
                    <option value="exam">Exam</option>
                    <option value="assignment">Assignment</option>
                    <option value="deadline">Deadline</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={newDate.description}
                  onChange={(e) => setNewDate({ ...newDate, description: e.target.value })}
                  placeholder="Add event description"
                  className="textarea"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" className="btn flex-1">
                  Add Event
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowAddForm(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Calendar */}
      <div className="card">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
            >
              <ChevronLeft size={20} />
            </button>
            <h2 className="text-2xl font-bold text-white">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <button
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
            >
              <ChevronRight size={20} />
            </button>
          </div>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="text-blue-400 hover:text-blue-300 font-medium text-sm transition-colors"
          >
            Today
          </button>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 mb-4">
          {dayNames.map((day) => (
            <div key={day} className="p-3 text-center border-b border-white/10">
              <span className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
                {day}
              </span>
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-px bg-white/5 rounded-lg overflow-hidden">
          {getCalendarDays().map((date, index) => {
            const events = getEventsForDate(date);
            const isCurrentMonthDay = isCurrentMonth(date);
            const isTodayDate = isToday(date);
            
            return (
              <div
                key={index}
                className={`min-h-[100px] p-3 bg-white/5 hover:bg-white/10 transition-colors ${
                  !isCurrentMonthDay ? 'opacity-40' : ''
                }`}
              >
                <div className={`text-sm font-medium mb-2 ${
                  !isCurrentMonthDay 
                    ? 'text-gray-500' 
                    : isTodayDate 
                    ? 'text-blue-400 font-bold' 
                    : 'text-white'
                }`}>
                  {isTodayDate ? (
                    <div className="flex items-center justify-center">
                      <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                        {format(date, 'd')}
                      </span>
                    </div>
                  ) : (
                    <div className="text-center">{format(date, 'd')}</div>
                  )}
                </div>
                
                <div className="space-y-1">
                  {events.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      className={`text-xs px-2 py-1 rounded ${getTypeColor(event.type)} cursor-pointer`}
                      title={event.title}
                    >
                      <div className="flex items-center gap-1">
                        {getTypeIcon(event.type)}
                        <span className="truncate font-medium">{event.title}</span>
                      </div>
                    </div>
                  ))}
                  {events.length > 3 && (
                    <div className="text-xs text-gray-400 px-2 py-1 text-center">
                      +{events.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Events List */}
      <div className="card">
        <div className="mb-6 pb-4 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">Upcoming Events</h2>
        </div>
        <div>
          {state.importantDates.length === 0 ? (
            <div className="text-center py-12">
              <CalendarIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No events scheduled</h3>
              <p className="text-gray-400 mb-6">
                Get started by creating your first event.
              </p>
              <button
                onClick={() => setShowAddForm(true)}
                className="btn flex items-center gap-2 mx-auto"
              >
                <Plus size={18} />
                Add Event
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {state.importantDates
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-4 border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-lg ${getTypeColor(event.type)}`}>
                        {getTypeIcon(event.type)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{event.title}</h3>
                        <p className="text-sm text-gray-300">
                          {format(new Date(event.date), 'EEEE, MMM d, yyyy')}
                        </p>
                        {event.description && (
                          <p className="text-sm text-gray-400 mt-1">{event.description}</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteImportantDate(event.id)}
                      className="text-gray-400 hover:text-red-400 p-2 transition-colors"
                      title="Delete event"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarView; 