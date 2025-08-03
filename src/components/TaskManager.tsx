import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { format } from 'date-fns';
import { calculateNewStreak, shouldResetStreak, resetStreak } from '../utils/streakCalculator';
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

  // Check and reset streak on component mount if needed
  useEffect(() => {
    if (state.streak && shouldResetStreak(state.streak)) {
      console.log('Resetting streak due to missed days');
      const resetStreakData = resetStreak(state.streak);
      updateStreak(resetStreakData);
    }
  }, []); // Only run on mount

  const handleTaskToggle = (taskId: string) => {
    const task = state.tasks.find(t => t.id === taskId);
    if (task && !task.completed) {
      // Task is being completed
      toggleTask(taskId);
      setCompletedTaskId(taskId);
      setShowCompletionMessage(true);
      
      // Update streak using the new calculator
      const { newStreak, isNewRecord, isMilestone, milestoneMessage } = calculateNewStreak(state.streak);
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
      if (isMilestone && milestoneMessage) {
        addAchievement({
          title: milestoneMessage,
          description: `Amazing consistency! You've completed tasks for ${newStreak.current} days in a row!`,
          date: new Date().toISOString(),
          type: 'streak',
          points: newStreak.current * 5
        });
      }

      // Add special achievement for new personal record
      if (isNewRecord && newStreak.current > 1) {
        addAchievement({
          title: '🏆 New Personal Record!',
          description: `You've achieved your longest streak ever: ${newStreak.current} days!`,
          date: new Date().toISOString(),
          type: 'milestone',
          points: newStreak.current * 10
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
      {/* FULL-SCREEN MEGA CELEBRATION - Covers Entire Screen */}
      {showCompletionMessage && (
        <div className="fixed inset-0 z-50 bg-gradient-to-br from-green-400 via-blue-500 via-purple-500 via-pink-400 to-orange-400 animate-gradient-x flex items-center justify-center p-8">
          {/* Animated Background Effects */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-10 left-10 w-32 h-32 bg-white/20 rounded-full animate-bounce"></div>
            <div className="absolute top-20 right-20 w-24 h-24 bg-yellow-300/30 rounded-full animate-pulse"></div>
            <div className="absolute bottom-20 left-20 w-40 h-40 bg-pink-300/20 rounded-full animate-bounce" style={{animationDelay: '0.5s'}}></div>
            <div className="absolute bottom-10 right-10 w-28 h-28 bg-green-300/30 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
            <div className="absolute top-1/2 left-1/4 w-20 h-20 bg-blue-300/30 rounded-full animate-bounce" style={{animationDelay: '0.3s'}}></div>
            <div className="absolute top-1/3 right-1/3 w-36 h-36 bg-purple-300/20 rounded-full animate-pulse" style={{animationDelay: '0.8s'}}></div>
          </div>

          {/* Confetti Particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className={`absolute w-4 h-4 rounded-full animate-ping ${
                  i % 4 === 0 ? 'bg-yellow-400' :
                  i % 4 === 1 ? 'bg-pink-400' :
                  i % 4 === 2 ? 'bg-blue-400' : 'bg-green-400'
                }`}
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`
                }}
              ></div>
            ))}
          </div>
          
          {/* Main Content - MASSIVE */}
          <div className="relative z-10 text-center space-y-8 max-w-4xl">
            
            {/* Close Button */}
            <button 
              onClick={() => setShowCompletionMessage(false)}
              className="absolute top-0 right-0 text-white/80 hover:text-white text-6xl font-bold w-16 h-16 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
            >
              ×
            </button>
            
            {/* GIANT Emojis */}
            <div className="flex items-center justify-center gap-8">
              <div className="text-9xl md:text-[12rem] lg:text-[15rem] animate-bounce">⚡</div>
              <div className="text-8xl md:text-[10rem] lg:text-[12rem] animate-pulse">💎</div>
              <div className="text-9xl md:text-[12rem] lg:text-[15rem] animate-bounce" style={{animationDelay: '0.2s'}}>🚀</div>
            </div>
            
            {/* MASSIVE Sparkles */}
            <Sparkles className="w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 animate-spin text-yellow-300 mx-auto drop-shadow-2xl" />
            
            {/* HUGE Title */}
            <div className="space-y-6">
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-white drop-shadow-2xl animate-pulse">
                EXCELLENT WORK! ⚡
              </h1>
              
              <div className="bg-white/20 backdrop-blur-lg border-4 border-white/40 rounded-3xl p-8 shadow-2xl">
                <p className="text-3xl md:text-4xl lg:text-6xl font-bold text-white mb-4">Task Successfully Completed!</p>
                <p className="text-xl md:text-2xl lg:text-4xl text-yellow-200 italic bg-white/20 px-6 py-4 rounded-2xl inline-block font-medium">
                  Achievement Unlocked!
                </p>
              </div>
            </div>
            
            {/* HUGE Rewards */}
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-yellow-300 to-orange-400 text-black px-12 py-6 rounded-full shadow-2xl flex items-center justify-center gap-6 border-4 border-white/50">
                <Trophy className="w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 animate-bounce drop-shadow-lg" />
                <span className="font-black text-3xl md:text-4xl lg:text-6xl">+10 POINTS!</span>
                <Trophy className="w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 animate-bounce drop-shadow-lg" style={{animationDelay: '0.1s'}} />
              </div>
              
              {state.streak.current > 0 && (
                <div className="bg-gradient-to-r from-red-400 to-pink-500 text-white px-8 py-4 rounded-full flex items-center justify-center gap-4 border-4 border-white/50 shadow-2xl">
                  <span className="text-4xl md:text-5xl lg:text-6xl">🔥</span>
                  <span className="font-bold text-2xl md:text-3xl lg:text-5xl">{state.streak.current} Day Streak!</span>
                  <span className="text-4xl md:text-5xl lg:text-6xl">🔥</span>
                </div>
              )}
            </div>
            
            {/* HUGE Motivational */}
            <div className="bg-white/20 backdrop-blur-lg border-4 border-white/40 rounded-3xl p-8 shadow-2xl">
              <div className="space-y-4">
                <div className="text-3xl md:text-4xl lg:text-6xl font-black text-white drop-shadow-lg">You're CRUSHING your goals! 🎯</div>
                <div className="text-xl md:text-2xl lg:text-4xl text-yellow-200 font-bold">Absolutely UNSTOPPABLE progress!</div>
              </div>
            </div>
            
            {/* MASSIVE Achievement Badge */}
            <div className="bg-gradient-to-r from-green-400 to-emerald-500 text-white px-8 py-6 rounded-full border-4 border-white/50 shadow-2xl">
              <div className="flex items-center justify-center gap-4">
                <span className="text-4xl md:text-5xl lg:text-6xl">🏆</span>
                <span className="font-black text-2xl md:text-3xl lg:text-5xl">PRODUCTIVITY MASTER!</span>
                <span className="text-4xl md:text-5xl lg:text-6xl">🏆</span>
              </div>
            </div>
            
            {/* Auto-close indicator */}
            <div className="text-xl md:text-2xl lg:text-3xl text-white/90 font-medium">
              Celebrating your success! Auto-closing in a few seconds... ✨
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