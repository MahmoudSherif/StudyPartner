import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isToday } from 'date-fns';
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
  Star,

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
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const monthDays = eachDayOfInterval({ start, end });
    
    // Get the day of week for the first day (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfWeek = start.getDay();
    
    // Add empty cells for days before the first day of the month
    const emptyCells = Array(firstDayOfWeek).fill(null);
    
    return [...emptyCells, ...monthDays];
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return state.importantDates.filter(event => event.date === dateStr);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'exam': return <AlertTriangle size={12} />;
      case 'assignment': return <BookOpen size={12} />;
      case 'deadline': return <Clock size={12} />;
      default: return <Flag size={12} />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'exam': return 'bg-gradient-to-r from-red-500 to-red-600 text-white';
      case 'assignment': return 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white';
      case 'deadline': return 'bg-gradient-to-r from-orange-500 to-orange-600 text-white';
      default: return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white';
    }
  };



  const isUpcoming = (date: string) => {
    return new Date(date) > new Date();
  };

  const isOverdue = (date: string) => {
    return new Date(date) < new Date();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
            <CalendarIcon className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              Calendar
            </h1>
            <p className="text-gray-400 text-sm">Manage your important dates and deadlines</p>
          </div>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-2xl font-semibold hover:from-purple-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2"
        >
          <Plus size={18} />
          <span>Add Important Date</span>
        </button>
      </div>

      {/* Add Date Form */}
      {showAddForm && (
        <div className="card bg-black/20 backdrop-blur-md border border-purple-500/30">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Add Important Date</h2>
            <button 
              onClick={() => setShowAddForm(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Plus size={24} className="rotate-45" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={newDate.title}
                onChange={(e) => setNewDate({ ...newDate, title: e.target.value })}
                placeholder="e.g., Final Exam, Assignment Due"
                className="w-full px-4 py-3 bg-black/30 border border-purple-500/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition-colors"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  value={newDate.date}
                  onChange={(e) => setNewDate({ ...newDate, date: e.target.value })}
                  className="w-full px-4 py-3 bg-black/30 border border-purple-500/50 rounded-xl text-white focus:outline-none focus:border-purple-400 transition-colors"
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
                  className="w-full px-4 py-3 bg-black/30 border border-purple-500/50 rounded-xl text-white focus:outline-none focus:border-purple-400 transition-colors"
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
                Description
              </label>
              <textarea
                value={newDate.description}
                onChange={(e) => setNewDate({ ...newDate, description: e.target.value })}
                placeholder="Add details about this important date..."
                className="w-full px-4 py-3 bg-black/30 border border-purple-500/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition-colors resize-none"
                rows={3}
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="reminder"
                checked={newDate.reminder}
                onChange={(e) => setNewDate({ ...newDate, reminder: e.target.checked })}
                className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500 bg-black/30 border-purple-500/50"
              />
              <label htmlFor="reminder" className="text-sm text-gray-300">
                Set reminder for this date
              </label>
            </div>

            <div className="flex gap-3">
              <button type="submit" className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl">
                Add Date
              </button>
              <button 
                type="button" 
                onClick={() => setShowAddForm(false)}
                className="px-6 py-3 bg-black/30 border border-purple-500/50 text-gray-300 rounded-xl font-semibold hover:bg-black/50 hover:text-white transition-all duration-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Calendar Navigation */}
      <div className="card bg-black/20 backdrop-blur-md border border-purple-500/30">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            className="p-3 bg-black/30 border border-purple-500/50 rounded-xl hover:bg-black/50 hover:border-purple-400 transition-all duration-300 text-white"
          >
            <ChevronLeft size={20} />
          </button>
          
          <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          
          <button
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            className="p-3 bg-black/30 border border-purple-500/50 rounded-xl hover:bg-black/50 hover:border-purple-400 transition-all duration-300 text-white"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Calendar days */}
          {getCalendarDays().map((date, index) => {
            // If date is null, it's an empty cell
            if (!date) {
              return (
                <div
                  key={index}
                  className="min-h-[120px] p-3 rounded-xl border border-purple-500/10 bg-black/5"
                >
                  {/* Empty cell */}
                </div>
              );
            }

            const events = getEventsForDate(date);
            const isCurrentMonthDay = isCurrentMonth(date);
            
            return (
              <div
                key={index}
                className={`min-h-[120px] p-3 rounded-xl border transition-all duration-300 hover:shadow-lg ${
                  isCurrentMonthDay 
                    ? 'bg-black/20 border-purple-500/30 hover:border-purple-400/50' 
                    : 'bg-black/10 border-purple-500/10'
                } ${isToday(date) ? 'ring-2 ring-purple-400 bg-purple-500/20' : ''}`}
              >
                <div className={`text-sm font-semibold mb-2 ${
                  isCurrentMonthDay ? 'text-white' : 'text-gray-500'
                } ${isToday(date) ? 'text-purple-200' : ''}`}>
                  {format(date, 'd')}
                </div>
                
                <div className="space-y-1">
                  {events.slice(0, 2).map((event) => (
                    <div
                      key={event.id}
                      className={`text-xs p-2 rounded-lg ${getTypeColor(event.type)} shadow-sm ${
                        isOverdue(event.date) ? 'opacity-75' : ''
                      }`}
                      title={event.title}
                    >
                      <div className="flex items-center gap-1">
                        {getTypeIcon(event.type)}
                        <span className="truncate font-medium">{event.title}</span>
                      </div>
                    </div>
                  ))}
                  {events.length > 2 && (
                    <div className="text-xs text-purple-300 bg-purple-500/20 px-2 py-1 rounded-lg text-center">
                      +{events.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="card bg-black/20 backdrop-blur-md border border-purple-500/30">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
            <Star size={16} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Upcoming Important Dates</h2>
        </div>
        
        {state.importantDates.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-black/30 border border-purple-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CalendarIcon size={32} className="text-gray-400" />
            </div>
            <p className="text-gray-400 text-lg">No important dates added yet</p>
            <p className="text-gray-500 text-sm mt-2">Add some dates to get started!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {state.importantDates
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .map((event) => (
                <div
                  key={event.id}
                  className={`p-4 rounded-xl border transition-all duration-300 hover:shadow-lg ${
                    isOverdue(event.date) 
                      ? 'bg-red-500/10 border-red-500/30 hover:border-red-400/50' 
                      : isUpcoming(event.date)
                      ? 'bg-blue-500/10 border-blue-500/30 hover:border-blue-400/50'
                      : 'bg-green-500/10 border-green-500/30 hover:border-green-400/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${getTypeColor(event.type)} shadow-lg`}>
                        {getTypeIcon(event.type)}
                      </div>
                      
                      <div>
                        <div className="font-semibold text-white text-lg">{event.title}</div>
                        <div className="text-gray-300 text-sm">
                          {format(new Date(event.date), 'EEEE, MMMM do, yyyy')}
                        </div>
                        {event.description && (
                          <div className="text-gray-400 text-sm mt-1 max-w-md">
                            {event.description}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        isOverdue(event.date) 
                          ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
                          : isUpcoming(event.date)
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : 'bg-green-500/20 text-green-300 border border-green-500/30'
                      }`}>
                        {isOverdue(event.date) ? 'Overdue' : isUpcoming(event.date) ? 'Upcoming' : 'Today'}
                      </span>
                      
                      <button
                        onClick={() => deleteImportantDate(event.id)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all duration-300"
                        title="Delete event"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarView; 