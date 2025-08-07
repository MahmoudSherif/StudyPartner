import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isToday, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth,
  isSameDay,
  differenceInDays
} from 'date-fns';
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
  Grid,
  List,
  Bell
} from 'lucide-react';

// Import our enhanced styles
import './SmartCalendar.css';

// Enhanced Types
interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'event' | 'exam' | 'assignment' | 'deadline';
  description?: string;
  reminder: boolean;
  priority?: 'low' | 'medium' | 'high';
  location?: string;
  participants?: string[];
}

interface CalendarState {
  currentDate: Date;
  selectedDate: Date | null;
  viewMode: 'month' | 'week' | 'list' | 'agenda';
  showAddModal: boolean;
  showEventModal: boolean;
  selectedEvent: CalendarEvent | null;
  filterType: string;
  searchQuery: string;
  showFilters: boolean;
}

// Advanced Calendar Hook with enhanced state management
const useAdvancedCalendar = (initialDate = new Date()): [CalendarState, {
  setCurrentDate: (date: Date) => void;
  setSelectedDate: (date: Date | null) => void;
  setViewMode: (mode: 'month' | 'week' | 'list' | 'agenda') => void;
  setShowAddModal: (show: boolean) => void;
  setShowEventModal: (show: boolean) => void;
  setSelectedEvent: (event: CalendarEvent | null) => void;
  setFilterType: (filter: string) => void;
  setSearchQuery: (query: string) => void;
  setShowFilters: (show: boolean) => void;
  goToToday: () => void;
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;
  navigateToDate: (date: Date) => void;
}] => {
  const [state, setState] = useState<CalendarState>({
    currentDate: initialDate,
    selectedDate: null,
    viewMode: 'month',
    showAddModal: false,
    showEventModal: false,
    selectedEvent: null,
    filterType: 'all',
    searchQuery: '',
    showFilters: false
  });

  const actions = useMemo(() => ({
    setCurrentDate: (date: Date) => setState(prev => ({ ...prev, currentDate: date })),
    setSelectedDate: (date: Date | null) => setState(prev => ({ ...prev, selectedDate: date })),
    setViewMode: (mode: 'month' | 'week' | 'list' | 'agenda') => setState(prev => ({ ...prev, viewMode: mode })),
    setShowAddModal: (show: boolean) => setState(prev => ({ ...prev, showAddModal: show })),
    setShowEventModal: (show: boolean) => setState(prev => ({ ...prev, showEventModal: show })),
    setSelectedEvent: (event: CalendarEvent | null) => setState(prev => ({ ...prev, selectedEvent: event })),
    setFilterType: (filter: string) => setState(prev => ({ ...prev, filterType: filter })),
    setSearchQuery: (query: string) => setState(prev => ({ ...prev, searchQuery: query })),
    setShowFilters: (show: boolean) => setState(prev => ({ ...prev, showFilters: show })),
    goToToday: () => setState(prev => ({ ...prev, currentDate: new Date() })),
    goToPreviousMonth: () => setState(prev => ({ ...prev, currentDate: subMonths(prev.currentDate, 1) })),
    goToNextMonth: () => setState(prev => ({ ...prev, currentDate: addMonths(prev.currentDate, 1) })),
    navigateToDate: (date: Date) => setState(prev => ({ ...prev, currentDate: date, selectedDate: date }))
  }), []);

  return [state, actions];
};

// Enhanced Event utilities with advanced styling
const getEventTypeConfig = (type: string) => {
  const configs = {
    exam: { 
      icon: AlertTriangle, 
      color: 'bg-gradient-to-r from-red-500 to-red-600', 
      textColor: 'text-white',
      borderColor: 'border-red-400/50',
      bgColor: 'bg-red-500/10',
      accentColor: 'text-red-400',
      emoji: '📝',
      gradient: 'from-red-500/20 to-red-600/20'
    },
    assignment: { 
      icon: BookOpen, 
      color: 'bg-gradient-to-r from-amber-500 to-orange-500', 
      textColor: 'text-white',
      borderColor: 'border-amber-400/50',
      bgColor: 'bg-amber-500/10',
      accentColor: 'text-amber-400',
      emoji: '📚',
      gradient: 'from-amber-500/20 to-orange-500/20'
    },
    deadline: { 
      icon: Clock, 
      color: 'bg-gradient-to-r from-orange-500 to-red-500', 
      textColor: 'text-white',
      borderColor: 'border-orange-400/50',
      bgColor: 'bg-orange-500/10',
      accentColor: 'text-orange-400',
      emoji: '⏰',
      gradient: 'from-orange-500/20 to-red-500/20'
    },
    event: { 
      icon: Flag, 
      color: 'bg-gradient-to-r from-blue-500 to-purple-500', 
      textColor: 'text-white',
      borderColor: 'border-blue-400/50',
      bgColor: 'bg-blue-500/10',
      accentColor: 'text-blue-400',
      emoji: '📅',
      gradient: 'from-blue-500/20 to-purple-500/20'
    }
  };
  return configs[type as keyof typeof configs] || configs.event;
};

const getEventUrgency = (date: string) => {
  const eventDate = new Date(date);
  const today = new Date();
  const daysUntil = differenceInDays(eventDate, today);
  
  if (daysUntil < 0) return { 
    level: 'overdue', 
    color: 'text-red-400', 
    bg: 'bg-gradient-to-r from-red-500/20 to-red-600/30',
    intensity: 'high',
    label: `${Math.abs(daysUntil)} days overdue`
  };
  if (daysUntil === 0) return { 
    level: 'today', 
    color: 'text-yellow-400', 
    bg: 'bg-gradient-to-r from-yellow-500/20 to-amber-500/30',
    intensity: 'high',
    label: 'Today'
  };
  if (daysUntil === 1) return { 
    level: 'tomorrow', 
    color: 'text-orange-400', 
    bg: 'bg-gradient-to-r from-orange-500/20 to-orange-600/30',
    intensity: 'medium',
    label: 'Tomorrow'
  };
  if (daysUntil <= 3) return { 
    level: 'soon', 
    color: 'text-amber-400', 
    bg: 'bg-gradient-to-r from-amber-500/10 to-amber-600/20',
    intensity: 'medium',
    label: `In ${daysUntil} days`
  };
  if (daysUntil <= 7) return { 
    level: 'week', 
    color: 'text-blue-400', 
    bg: 'bg-gradient-to-r from-blue-500/10 to-blue-600/20',
    intensity: 'low',
    label: `In ${daysUntil} days`
  };
  return { 
    level: 'future', 
    color: 'text-gray-400', 
    bg: 'bg-gradient-to-r from-gray-500/10 to-gray-600/20',
    intensity: 'low',
    label: `In ${daysUntil} days`
  };
};

// Advanced Calendar Component
const CalendarView: React.FC = () => {
  const { state: appState, addImportantDate, deleteImportantDate } = useApp();
  const [calendarState, calendarActions] = useAdvancedCalendar();
  
  // Enhanced Form state with validation
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    type: 'event' as const,
    description: '',
    reminder: true,
    priority: 'medium' as 'low' | 'medium' | 'high',
    location: '',
    participants: [] as string[]
  });

  // Advanced computed values using useMemo for performance
  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(calendarState.currentDate));
    const end = endOfWeek(endOfMonth(calendarState.currentDate));
    return eachDayOfInterval({ start, end });
  }, [calendarState.currentDate]);

  const filteredAndSearchedEvents = useMemo(() => {
    let events = appState.importantDates;
    
    // Apply type filter
    if (calendarState.filterType !== 'all') {
      events = events.filter(event => event.type === calendarState.filterType);
    }
    
    // Apply search query
    if (calendarState.searchQuery.trim()) {
      const query = calendarState.searchQuery.toLowerCase();
      events = events.filter(event => 
        event.title.toLowerCase().includes(query) ||
        event.description?.toLowerCase().includes(query) ||
        event.type.toLowerCase().includes(query)
      );
    }
    
    return events;
  }, [appState.importantDates, calendarState.filterType, calendarState.searchQuery]);

  const upcomingEvents = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return filteredAndSearchedEvents
      .filter(event => event.date >= today)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 15);
  }, [filteredAndSearchedEvents]);

  const getEventsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return filteredAndSearchedEvents.filter(event => event.date === dateStr);
  };

  // Enhanced Event handlers with validation
  const resetForm = () => {
    setFormData({ 
      title: '', 
      date: '', 
      type: 'event', 
      description: '', 
      reminder: true,
      priority: 'medium',
      location: '',
      participants: []
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title.trim() && formData.date) {
      addImportantDate({
        title: formData.title.trim(),
        date: formData.date,
        type: formData.type,
        description: formData.description.trim(),
        reminder: formData.reminder
      });
      resetForm();
      calendarActions.setShowAddModal(false);
    }
  };

  const handleDateClick = (date: Date) => {
    calendarActions.setSelectedDate(date);
    const events = getEventsForDate(date);
    
    if (events.length === 0) {
      // Quick add event for this date
      setFormData(prev => ({ ...prev, date: format(date, 'yyyy-MM-dd') }));
      calendarActions.setShowAddModal(true);
    } else if (events.length === 1) {
      // Show single event details
      calendarActions.setSelectedEvent(events[0] as CalendarEvent);
      calendarActions.setShowEventModal(true);
    }
  };

  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    calendarActions.setSelectedEvent(event);
    calendarActions.setShowEventModal(true);
  };

  // Enhanced Responsive breakpoints
  const [screenSize, setScreenSize] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: true
  });

  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth;
      setScreenSize({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024
      });
    };
    
    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="smart-calendar">
      <div className="calendar-container">
        
        {/* Modern Enhanced Header */}
        <div className="calendar-header">
          <div className="header-content">
            <div className="title-section">
              <div className="title-wrapper">
                <div className="title-icon">
                  <CalendarIcon size={screenSize.isMobile ? 28 : 32} />
                </div>
                <div>
                  <h1 className="calendar-title">Smart Calendar</h1>
                  <p className="calendar-subtitle">
                    Intelligent scheduling and event management
                  </p>
                </div>
              </div>
            </div>
            
            <div className="controls-section">
              {/* Search Bar */}
              {!screenSize.isMobile && (
                <div className="search-container">
                  <input
                    type="text"
                    placeholder="Search events..."
                    value={calendarState.searchQuery}
                    onChange={(e) => calendarActions.setSearchQuery(e.target.value)}
                    className="search-input"
                  />
                </div>
              )}
              
              {/* View Toggle */}
              <div className="view-toggle">
                {(['month', 'list'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => calendarActions.setViewMode(mode)}
                    className={`view-button ${calendarState.viewMode === mode ? 'active' : ''}`}
                  >
                    {mode === 'month' ? <Grid size={18} /> : <List size={18} />}
                    {!screenSize.isMobile && (
                      <span>{mode === 'month' ? 'Calendar' : 'Agenda'}</span>
                    )}
                  </button>
                ))}
              </div>
              
              {/* Filter Dropdown */}
              <select
                value={calendarState.filterType}
                onChange={(e) => calendarActions.setFilterType(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Events</option>
                <option value="event">📅 General</option>
                <option value="exam">📝 Exams</option>
                <option value="assignment">📚 Assignments</option>
                <option value="deadline">⏰ Deadlines</option>
              </select>
              
              {/* Add Event Button */}
              <button
                onClick={() => calendarActions.setShowAddModal(true)}
                className="add-button"
              >
                <Plus size={20} />
                {!screenSize.isMobile && <span>Add Event</span>}
              </button>
            </div>
          </div>
        </div>

        {/* Modern Calendar Month View */}
        {calendarState.viewMode === 'month' && (
          <div className="calendar-grid-container">
            {/* Navigation Header */}
            <div className="calendar-navigation">
              <div className="nav-controls">
                <button
                  onClick={calendarActions.goToPreviousMonth}
                  className="nav-button"
                  aria-label="Previous month"
                >
                  <ChevronLeft size={24} />
                </button>
                
                <h2 className="current-month">
                  {format(calendarState.currentDate, screenSize.isMobile ? 'MMM yyyy' : 'MMMM yyyy')}
                </h2>
                
                <button
                  onClick={calendarActions.goToNextMonth}
                  className="nav-button"
                  aria-label="Next month"
                >
                  <ChevronRight size={24} />
                </button>
              </div>
              
              <button
                onClick={calendarActions.goToToday}
                className="today-button"
              >
                Today
              </button>
            </div>

            {/* Day Headers */}
            <div className="calendar-weekdays">
              {dayNames.map((day) => (
                <div key={day} className="weekday-header">
                  <span className="weekday-text">
                    {screenSize.isMobile ? day.slice(0, 1) : screenSize.isTablet ? day.slice(0, 3) : day}
                  </span>
                </div>
              ))}
            </div>

            {/* Enhanced Calendar Grid */}
            <div className="calendar-days-grid">
              {calendarDays.map((date, index) => {
                const events = getEventsForDate(date);
                const isCurrentMonth = isSameMonth(date, calendarState.currentDate);
                const isTodayDate = isToday(date);
                const isSelected = calendarState.selectedDate && isSameDay(date, calendarState.selectedDate);
                const hasEvents = events.length > 0;
                
                return (
                  <div
                    key={index}
                    onClick={() => handleDateClick(date)}
                    className={`calendar-day ${!isCurrentMonth ? 'other-month' : ''} ${
                      isTodayDate ? 'today' : ''
                    } ${isSelected ? 'selected' : ''} ${hasEvents ? 'has-events' : ''}`}
                  >
                    {/* Date Number */}
                    <div className="day-number">
                      {isTodayDate ? (
                        <div className="today-indicator">
                          <span className="today-number">{format(date, 'd')}</span>
                        </div>
                      ) : (
                        <span className={`date-text ${!isCurrentMonth ? 'other-month-text' : ''}`}>
                          {format(date, 'd')}
                        </span>
                      )}
                    </div>
                    
                    {/* Events */}
                    <div className="day-events">
                      {events.slice(0, screenSize.isMobile ? 2 : screenSize.isTablet ? 3 : 4).map((event) => {
                        const config = getEventTypeConfig(event.type);
                        const urgency = getEventUrgency(event.date);
                        
                        return (
                          <div
                            key={event.id}
                            onClick={(e) => handleEventClick(event as CalendarEvent, e)}
                            className={`event-badge ${event.type} ${urgency.level}`}
                            title={`${event.title} - ${format(new Date(event.date), 'MMM d')}`}
                          >
                            <div className="event-content">
                              <config.icon size={screenSize.isMobile ? 10 : 12} />
                              <span className="event-title">
                                {event.title.length > (screenSize.isMobile ? 6 : screenSize.isTablet ? 10 : 15) 
                                  ? event.title.slice(0, screenSize.isMobile ? 6 : screenSize.isTablet ? 10 : 15) + '...' 
                                  : event.title
                                }
                              </span>
                            </div>
                          </div>
                        );
                      })}
                      
                      {/* More Events Indicator */}
                      {events.length > (screenSize.isMobile ? 2 : screenSize.isTablet ? 3 : 4) && (
                        <div className="more-events">
                          +{events.length - (screenSize.isMobile ? 2 : screenSize.isTablet ? 3 : 4)} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Enhanced List/Agenda View */}
        {calendarState.viewMode === 'list' && (
          <div className="agenda-container">
            <div className="agenda-header">
              <div className="agenda-title">
                <List size={24} />
                <div>
                  <h2>Upcoming Events</h2>
                  <p>{upcomingEvents.length} events scheduled</p>
                </div>
              </div>
            </div>
            
            {upcomingEvents.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <CalendarIcon size={48} />
                </div>
                <h3>No upcoming events</h3>
                <p>Your schedule is clear. Time to plan something exciting!</p>
                <button
                  onClick={() => calendarActions.setShowAddModal(true)}
                  className="empty-action-button"
                >
                  <Plus size={20} />
                  Create Your First Event
                </button>
              </div>
            ) : (
              <div className="events-list">
                {upcomingEvents.map((event) => {
                  const config = getEventTypeConfig(event.type);
                  const urgency = getEventUrgency(event.date);
                  const eventDate = new Date(event.date);
                  
                  return (
                    <div
                      key={event.id}
                      className={`event-card ${urgency.level}`}
                      onClick={() => {
                        calendarActions.setSelectedEvent(event as CalendarEvent);
                        calendarActions.setShowEventModal(true);
                      }}
                    >
                      <div className="event-card-content">
                        <div className="event-main">
                          <div className={`event-icon ${event.type}`}>
                            <config.icon size={20} />
                          </div>
                          
                          <div className="event-details">
                            <h3 className="event-card-title">{event.title}</h3>
                            
                            <div className="event-meta">
                              <span className="event-date">
                                {format(eventDate, 'EEEE, MMM d, yyyy')}
                              </span>
                              <span className={`urgency-badge ${urgency.level}`}>
                                {urgency.label}
                              </span>
                            </div>
                            
                            {event.description && (
                              <p className="event-description">
                                {event.description.length > 120 
                                  ? event.description.slice(0, 120) + '...' 
                                  : event.description
                                }
                              </p>
                            )}
                            
                            <div className="event-tags">
                              <span className={`type-tag ${event.type}`}>
                                {config.emoji} {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                              </span>
                              {event.reminder && (
                                <span className="reminder-tag">
                                  <Bell size={12} />
                                  Reminder
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteImportantDate(event.id);
                          }}
                          className="delete-button"
                          title="Delete event"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Enhanced Add Event Modal */}
        {calendarState.showAddModal && (
          <div className="modal-overlay">
            <div className="modal-container">
              <div className="modal-header">
                <div className="modal-title">
                  <div className="modal-icon">
                    <Plus size={20} />
                  </div>
                  <h2>Create Event</h2>
                </div>
                <button
                  onClick={() => calendarActions.setShowAddModal(false)}
                  className="modal-close"
                >
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="modal-form">
                <div className="form-field">
                  <label className="form-label">Event Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Math Final Exam, Project Presentation"
                    className="form-input"
                    required
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-field">
                    <label className="form-label">Date *</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Category *</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                      className="form-select"
                    >
                      <option value="event">📅 General Event</option>
                      <option value="exam">📝 Exam</option>
                      <option value="assignment">📚 Assignment</option>
                      <option value="deadline">⏰ Deadline</option>
                    </select>
                  </div>
                </div>

                <div className="form-field">
                  <label className="form-label">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Add additional details, notes, or requirements..."
                    className="form-textarea"
                    rows={3}
                  />
                </div>

                <div className="form-checkbox">
                  <input
                    type="checkbox"
                    id="reminder"
                    checked={formData.reminder}
                    onChange={(e) => setFormData({ ...formData, reminder: e.target.checked })}
                    className="checkbox-input"
                  />
                  <label htmlFor="reminder" className="checkbox-label">
                    <Bell size={16} />
                    Enable notifications and reminders
                  </label>
                </div>

                <div className="modal-actions">
                  <button type="submit" className="button-primary">
                    Create Event
                  </button>
                  <button 
                    type="button" 
                    onClick={() => calendarActions.setShowAddModal(false)}
                    className="button-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Enhanced Event Details Modal */}
        {calendarState.showEventModal && calendarState.selectedEvent && (
          <div className="modal-overlay">
            <div className="modal-container">
              <div className="modal-header">
                <div className="modal-title">
                  <div className={`modal-icon ${calendarState.selectedEvent.type}`}>
                    {React.createElement(
                      getEventTypeConfig(calendarState.selectedEvent.type).icon, 
                      { size: 20 }
                    )}
                  </div>
                  <h2>Event Details</h2>
                </div>
                <button
                  onClick={() => calendarActions.setShowEventModal(false)}
                  className="modal-close"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="event-details-content">
                <div className="event-header">
                  <h3 className="event-title">{calendarState.selectedEvent.title}</h3>
                  <div className="event-date">
                    <CalendarIcon size={16} />
                    <span>{format(new Date(calendarState.selectedEvent.date), 'EEEE, MMMM d, yyyy')}</span>
                  </div>
                </div>
                
                <div className="event-badges">
                  <span className={`event-type-badge ${calendarState.selectedEvent.type}`}>
                    {getEventTypeConfig(calendarState.selectedEvent.type).emoji}{' '}
                    {calendarState.selectedEvent.type.charAt(0).toUpperCase() + calendarState.selectedEvent.type.slice(1)}
                  </span>
                  {calendarState.selectedEvent.reminder && (
                    <span className="reminder-badge">
                      <Bell size={14} />
                      Reminder Enabled
                    </span>
                  )}
                </div>
                
                {calendarState.selectedEvent.description && (
                  <div className="event-description-section">
                    <h4>Description</h4>
                    <div className="event-description-text">
                      {calendarState.selectedEvent.description}
                    </div>
                  </div>
                )}
                
                <div className="modal-actions">
                  <button
                    onClick={() => {
                      deleteImportantDate(calendarState.selectedEvent!.id);
                      calendarActions.setShowEventModal(false);
                    }}
                    className="button-danger"
                  >
                    <Trash2 size={16} />
                    Delete Event
                  </button>
                  <button
                    onClick={() => calendarActions.setShowEventModal(false)}
                    className="button-secondary"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarView;