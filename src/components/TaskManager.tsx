import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { format } from 'date-fns';
import { 
  Plus, 
  Trash2, 
  Filter, 
  SortAsc, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  Trophy,
  Sparkles
} from 'lucide-react';

const TaskManager: React.FC = () => {
  const { state, addTask, toggleTask, deleteTask, addAchievement, updateStreak } = useApp();
  const [showAddForm, setShowAddForm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('pending'); // Default to pending
  const [sortBy, setSortBy] = useState<'priority' | 'dueDate' | 'createdAt'>('createdAt'); // Default to newest first
  const [completedTaskId, setCompletedTaskId] = useState<string | null>(null);
  const [showCompletionMessage, setShowCompletionMessage] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as const,
    dueDate: ''
  });

  const handleTaskToggle = (taskId: string) => {
    const task = state.tasks.find(t => t.id === taskId);
    if (task && !task.completed) {
      // Task is being completed
      toggleTask(taskId);
      setCompletedTaskId(taskId);
      setShowCompletionMessage(true);
      
      // Update streak
      const today = new Date().toISOString().split('T')[0];
      const newStreak = state.streak.lastCompletedDate === today 
        ? state.streak 
        : {
            current: state.streak.lastCompletedDate === new Date(Date.now() - 86400000).toISOString().split('T')[0] 
              ? state.streak.current + 1 
              : 1,
            longest: Math.max(state.streak.longest, state.streak.current + 1),
            lastCompletedDate: today
          };
      
      updateStreak(newStreak);
      
      // Add achievement for task completion
      addAchievement({
        title: '✅ Task Completed!',
        description: `You completed: "${task.title}"`,
        date: new Date().toISOString(),
        type: 'task',
        points: 10
      });

      // Add streak achievement if it's a milestone
      if (newStreak.current > state.streak.current && [3, 7, 14, 30, 50, 100].includes(newStreak.current)) {
        addAchievement({
          title: `🔥 ${newStreak.current}-Day Streak!`,
          description: `Amazing consistency! You've completed tasks for ${newStreak.current} days in a row!`,
          date: new Date().toISOString(),
          type: 'streak',
          points: newStreak.current * 5
        });
      }

      // Auto-hide completed task after animation
      setTimeout(() => {
        setCompletedTaskId(null);
        // Switch to pending view if we're on 'all' to hide completed task
        if (filter === 'all') {
          setFilter('pending');
        }
      }, 2000);

      // Hide completion message after 5 seconds (longer for MEGA animation)
      setTimeout(() => {
        setShowCompletionMessage(false);
      }, 5000);
    } else {
      // Task is being uncompleted
      toggleTask(taskId);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask.title.trim()) {
      addTask({
        title: newTask.title.trim(),
        description: newTask.description.trim(),
        completed: false,
        priority: newTask.priority,
        dueDate: newTask.dueDate || undefined
      });
      setNewTask({ title: '', description: '', priority: 'medium', dueDate: '' });
      setShowAddForm(false);
    }
  };

  const filteredTasks = state.tasks
    .filter(task => {
      if (filter === 'pending') return !task.completed;
      if (filter === 'completed') return task.completed;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'dueDate':
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case 'createdAt':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date() && dueDate !== '';
  };

  const pendingTasksCount = state.tasks.filter(t => !t.completed).length;
  const completedTasksCount = state.tasks.filter(t => t.completed).length;

  return (
    <div className="space-y-6">
      {/* Proper Pop-up Window - Rational Size & Positioning */}
      {showCompletionMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          {/* Pop-up Window Container - MUCH LARGER for PC */}
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl 2xl:max-w-4xl animate-in zoom-in duration-500 transform relative overflow-hidden">
            
            {/* Window Header Bar */}
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              </div>
              <h3 className="font-bold text-white text-sm sm:text-base">⚡ Task Complete!</h3>
              <button 
                onClick={() => setShowCompletionMessage(false)}
                className="text-white/80 hover:text-white text-lg font-bold w-6 h-6 flex items-center justify-center rounded hover:bg-white/20 transition-colors"
              >
                ×
              </button>
            </div>

            {/* Confetti Overlay */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-1/4 left-1/4 w-1 h-1 sm:w-2 sm:h-2 bg-yellow-400 rounded-full animate-ping" style={{animationDelay: '0s'}}></div>
              <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-pink-400 rounded-full animate-ping" style={{animationDelay: '0.3s'}}></div>
              <div className="absolute bottom-1/3 left-1/3 w-1 h-1 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-ping" style={{animationDelay: '0.6s'}}></div>
              <div className="absolute top-1/2 left-1/6 w-1 h-1 sm:w-2 sm:h-2 bg-red-400 rounded-full animate-ping" style={{animationDelay: '0.9s'}}></div>
              <div className="absolute bottom-1/4 right-1/6 w-2 h-2 bg-orange-400 rounded-full animate-ping" style={{animationDelay: '1.2s'}}></div>
            </div>
            
            {/* Window Content */}
            <div className="bg-white p-6 sm:p-8 md:p-10 lg:p-12 xl:p-16 text-center space-y-6 md:space-y-8 lg:space-y-10">
              
              {/* Main Celebration */}
              <div className="flex items-center justify-center gap-3 md:gap-4 lg:gap-6">
                <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl animate-bounce">⚡</div>
                <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl animate-pulse">💎</div>
                <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl animate-bounce" style={{animationDelay: '0.2s'}}>🚀</div>
              </div>
              
              <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 xl:w-20 xl:h-20 animate-spin text-purple-500 mx-auto" />
              
              {/* Message */}
              <div className="space-y-4 md:space-y-6 lg:space-y-8">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-800">
                  EXCELLENT WORK! ⚡
                </h2>
                
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 md:p-6 lg:p-8">
                  <p className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-medium text-purple-800 mb-2 md:mb-4">Task Successfully Completed!</p>
                  <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-purple-600 italic bg-purple-100 px-3 py-2 md:px-4 md:py-3 lg:px-6 lg:py-4 rounded inline-block">
                    Achievement Unlocked!
                  </p>
                </div>
              </div>
              
              {/* Rewards */}
              <div className="space-y-3 md:space-y-4 lg:space-y-6">
                <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-6 py-3 md:px-8 md:py-4 lg:px-10 lg:py-6 rounded-full shadow-md flex items-center justify-center gap-3 md:gap-4">
                  <Trophy className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 xl:w-10 xl:h-10 animate-bounce" />
                  <span className="font-bold text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl">+10 Points!</span>
                  <Trophy className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 xl:w-10 xl:h-10 animate-bounce" style={{animationDelay: '0.1s'}} />
                </div>
                
                {state.streak.current > 0 && (
                  <div className="bg-gradient-to-r from-red-400 to-pink-400 text-white px-4 py-2 md:px-6 md:py-3 lg:px-8 lg:py-4 rounded-full flex items-center justify-center gap-2 md:gap-3">
                    <span className="text-base md:text-lg lg:text-xl xl:text-2xl">🔥</span>
                    <span className="font-medium text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl">{state.streak.current} Day Streak!</span>
                    <span className="text-base md:text-lg lg:text-xl xl:text-2xl">🔥</span>
                  </div>
                )}
              </div>
              
              {/* Motivational */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 md:p-6 lg:p-8">
                <div className="space-y-2 md:space-y-3 lg:space-y-4">
                  <div className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-semibold text-gray-700">You're crushing your goals! 🎯</div>
                  <div className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-gray-600">Unstoppable progress!</div>
                </div>
              </div>
              
              {/* Achievement Badge */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-3 md:px-6 md:py-4 lg:px-8 lg:py-6 rounded-full">
                <div className="flex items-center justify-center gap-2 md:gap-3 lg:gap-4">
                  <span className="text-base md:text-lg lg:text-xl xl:text-2xl">🏆</span>
                  <span className="font-medium text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl">PRODUCTIVITY MASTER!</span>
                  <span className="text-base md:text-lg lg:text-xl xl:text-2xl">🏆</span>
                </div>
              </div>
              
              {/* Auto-close */}
              <div className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-500">
                Auto-closing in a few seconds...
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Task Manager</h1>
          <p className="text-gray-600 mt-1">
            {pendingTasksCount} pending • {completedTasksCount} completed
          </p>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          className="btn"
        >
          <Plus size={18} />
          Add Task
        </button>
      </div>

      {/* Add Task Form */}
      {showAddForm && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Add New Task</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Task Title *
              </label>
              <input
                type="text"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="Enter task title"
                className="input"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="Enter task description (optional)"
                className="textarea"
                rows={3}
              />
            </div>

            <div className="grid grid-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
                  className="input"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  className="input"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button type="submit" className="btn">
                Add Task
              </button>
              <button 
                type="button" 
                onClick={() => setShowAddForm(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters and Stats */}
      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter size={16} />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="input"
              >
                <option value="pending">📋 Active Tasks ({pendingTasksCount})</option>
                <option value="completed">✅ Completed ({completedTasksCount})</option>
                <option value="all">📊 All Tasks ({state.tasks.length})</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <SortAsc size={16} />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="input"
              >
                <option value="createdAt">🆕 Newest First</option>
                <option value="priority">Sort by Priority</option>
                <option value="dueDate">Sort by Due Date</option>
              </select>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''} shown
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="card text-center py-12">
            {filter === 'pending' ? (
              <>
                <CheckCircle size={48} className="mx-auto text-green-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">
                  🎉 All caught up!
                </h3>
                <p className="text-gray-500">
                  You have no pending tasks. Great work!
                </p>
              </>
            ) : filter === 'completed' ? (
              <>
                <Trophy size={48} className="mx-auto text-yellow-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">
                  No completed tasks yet
                </h3>
                <p className="text-gray-500">
                  Complete some tasks to see your achievements here!
                </p>
              </>
            ) : (
              <>
                <CheckCircle size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">
                  No tasks found
                </h3>
                <p className="text-gray-500">
                  Add your first task to get started!
                </p>
              </>
            )}
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`card transition-all duration-500 ${
                task.completed ? 'opacity-75 bg-green-50 border-green-200' : ''
              } ${
                completedTaskId === task.id ? 'animate-pulse bg-green-100 scale-[1.02] shadow-lg' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleTaskToggle(task.id)}
                    className="w-5 h-5 text-green-600 rounded focus:ring-green-500 mt-1 transition-all duration-200"
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`font-medium ${
                        task.completed ? 'line-through text-gray-500' : ''
                      } ${
                        completedTaskId === task.id ? 'text-green-600' : ''
                      }`}>
                        {task.title}
                        {completedTaskId === task.id && (
                          <span className="ml-2 text-green-500">
                            <CheckCircle size={16} className="inline animate-bounce" />
                          </span>
                        )}
                      </h3>
                      {task.dueDate && isOverdue(task.dueDate) && !task.completed && (
                        <span className="text-red-500 text-sm flex items-center gap-1">
                          <AlertTriangle size={14} />
                          Overdue
                        </span>
                      )}
                    </div>
                    
                    {task.description && (
                      <p className={`text-sm text-gray-600 mb-2 ${task.completed ? 'line-through' : ''}`}>
                        {task.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className={`px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      
                      {task.dueDate && (
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {format(new Date(task.dueDate), 'MMM do, yyyy')}
                        </span>
                      )}
                      
                      {task.completedAt && (
                        <span className="flex items-center gap-1 text-green-600">
                          <CheckCircle size={12} />
                          Completed {format(new Date(task.completedAt), 'MMM do')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                    title="Delete task"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TaskManager; 