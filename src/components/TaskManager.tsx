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
  Zap
} from 'lucide-react';
import CelebrationOverlay from './CelebrationOverlay';
import DailyTasksProgress from './DailyTasksProgress';

const TaskManager: React.FC = () => {
  const { state, addTask, toggleTask, deleteTask, addAchievement, updateStreak } = useApp();
  const [showAddForm, setShowAddForm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('pending'); // Default to pending
  const [sortBy, setSortBy] = useState<'priority' | 'dueDate' | 'createdAt'>('createdAt'); // Default to newest first
  const [completedTaskId, setCompletedTaskId] = useState<string | null>(null);
  const [showCompletionMessage, setShowCompletionMessage] = useState(false);
  const [lastCompletedTitle, setLastCompletedTitle] = useState<string>('');
  const [rewardPoints, setRewardPoints] = useState<number>(10);
  const [rewardCoins, setRewardCoins] = useState<number>(2);
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
      setLastCompletedTitle(task.title);
      // Reward logic (slightly higher for high priority)
      const points = task.priority === 'high' ? 25 : 15;
      const coins = task.priority === 'high' ? 5 : 2;
      setRewardPoints(points);
      setRewardCoins(coins);
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
        points: 10,
        rarity: 'common',
        unlocked: true
      });

      // Add streak achievement if it's a milestone
      if (isMilestone && milestoneMessage) {
        addAchievement({
          title: milestoneMessage,
          description: `Amazing consistency! You've completed tasks for ${newStreak.current} days in a row!`,
          date: new Date().toISOString(),
          type: 'streak',
          points: newStreak.current * 5,
          rarity: newStreak.current >= 30 ? 'epic' : newStreak.current >= 7 ? 'rare' : 'common',
          unlocked: true
        });
      }

      // Add special achievement for new personal record
      if (isNewRecord && newStreak.current > 1) {
        addAchievement({
          title: '🏆 New Personal Record!',
          description: `You've achieved your longest streak ever: ${newStreak.current} days!`,
          date: new Date().toISOString(),
          type: 'milestone',
          points: newStreak.current * 10,
          rarity: newStreak.current >= 50 ? 'legendary' : newStreak.current >= 25 ? 'epic' : 'rare',
          unlocked: true
        });
      }

      // Check if this completion results in all daily tasks being completed
      const today = new Date().toISOString().split('T')[0];
      const allDailyTasks = state.tasks.filter(t => {
        // Task is daily if:
        // 1. It has "daily" in title or description (case-insensitive)
        // 2. Its due date is today
        // 3. It was created today (fallback for older logic)
        const hasDaily = t.title.toLowerCase().includes('daily') || 
                        t.description?.toLowerCase().includes('daily');
        const isDueToday = t.dueDate === today;
        const wasCreatedToday = t.createdAt.split('T')[0] === today;
        
        return hasDaily || isDueToday || wasCreatedToday;
      });
      
      // Count completed daily tasks after this task is toggled
      const completedDailyTasksAfterToggle = allDailyTasks.filter(t => 
        t.id === taskId ? true : t.completed // This task will be completed, others keep their current state
      );
      
      // If all daily tasks are now completed, check if we should show daily celebration
      if (allDailyTasks.length > 0 && completedDailyTasksAfterToggle.length === allDailyTasks.length) {
        const celebrationKey = `dailyTasksCelebration_${today}`;
        try {
          const alreadyShown = localStorage.getItem(celebrationKey) === 'shown';
          if (!alreadyShown) {
            localStorage.setItem(celebrationKey, 'shown');
            // We could trigger a different celebration here or extend the current one
            // For now, we'll let the individual task celebration show, and the daily progress indicator will update
          }
        } catch {
          // Ignore localStorage errors
        }
      }

      // Auto-hide completed task after animation
      setTimeout(() => {
        setCompletedTaskId(null);
        if (filter === 'all') {
          setFilter('pending');
        }
      }, 1200);

      // Hide completion message after a few seconds
      setTimeout(() => {
        setShowCompletionMessage(false);
      }, 4200);
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
      case 'high': return 'text-red-300 bg-red-900/30 border border-red-500/30';
      case 'medium': return 'text-yellow-300 bg-yellow-900/20 border border-yellow-500/30';
      case 'low': return 'text-emerald-300 bg-emerald-900/30 border border-emerald-500/30';
      default: return 'text-slate-300 bg-slate-800/50 border border-white/10';
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date() && dueDate !== '';
  };

  const pendingTasksCount = state.tasks.filter(t => !t.completed).length;
  const completedTasksCount = state.tasks.filter(t => t.completed).length;

  // Daily tasks logic
  const today = new Date().toISOString().split('T')[0];
  const dailyTasks = state.tasks.filter(task => {
    // Task is daily if:
    // 1. It has "daily" in title or description (case-insensitive)
    // 2. Its due date is today
    // 3. It was created today (fallback for older logic)
    const hasDaily = task.title.toLowerCase().includes('daily') || 
                    task.description?.toLowerCase().includes('daily');
    const isDueToday = task.dueDate === today;
    const wasCreatedToday = task.createdAt.split('T')[0] === today;
    
    return hasDaily || isDueToday || wasCreatedToday;
  });
  const completedDailyTasks = dailyTasks.filter(task => task.completed);
  const dailyTasksPercentage = dailyTasks.length > 0 ? Math.round((completedDailyTasks.length / dailyTasks.length) * 100) : 0;

  const handleAddDailyTask = () => {
    setNewTask({ 
      title: '', 
      description: 'Daily task - complete today', 
      priority: 'medium', 
      dueDate: today 
    });
    setShowAddForm(true);
  };

  return (
    <div className="space-y-6">
      {/* Celebration Overlay */}
      <CelebrationOverlay
        visible={showCompletionMessage}
        onClose={() => setShowCompletionMessage(false)}
        title="Excellent Work! ⚡"
        subtitle={lastCompletedTitle ? `“${lastCompletedTitle}” completed` : 'Task completed'}
        points={rewardPoints}
        coins={rewardCoins}
        streak={state.streak.current}
      />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Task Manager</h1>
          <p className="text-slate-400 mt-1">
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

      {/* Daily Tasks Section - Always Visible */}
      <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-2xl p-4 sm:p-6 border border-blue-500/20">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Today's Tasks</h2>
              <p className="text-blue-200 text-sm">
                {completedDailyTasks.length} of {dailyTasks.length} completed ({dailyTasksPercentage}%)
              </p>
            </div>
          </div>
          
          {/* Mobile: Progress elements stacked, Desktop: Side by side */}
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
            {/* Progress Bar and Circle */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-end">
              <div className="w-24 sm:w-32 bg-slate-700 rounded-full h-3 border border-slate-600">
                <div 
                  className="h-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${dailyTasksPercentage}%` }}
                ></div>
              </div>
              <DailyTasksProgress isCompact={true} />
            </div>
            
            {/* Add Task Button */}
            <button
              onClick={handleAddDailyTask}
              className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-all duration-200 text-blue-200 hover:text-white border border-blue-500/30 w-full sm:w-auto"
            >
              <Zap className="w-4 h-4" />
              <span className="text-sm font-medium">Add Daily Task</span>
            </button>
          </div>
        </div>

        {/* Daily Tasks List */}
        {dailyTasks.length > 0 ? (
          <div className="grid gap-2">
            {dailyTasks.slice(0, 3).map(task => (
              <div key={task.id} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <button
                  onClick={() => handleTaskToggle(task.id)}
                  className={`w-5 h-5 rounded border-2 transition-all duration-200 flex items-center justify-center ${
                    task.completed 
                      ? 'bg-green-500 border-green-500 text-white' 
                      : 'border-slate-400 hover:border-blue-400'
                  }`}
                >
                  {task.completed && <CheckCircle size={14} />}
                </button>
                <span className={`flex-1 ${task.completed ? 'text-slate-400 line-through' : 'text-white'}`}>
                  {task.title}
                </span>
                <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
              </div>
            ))}
            {dailyTasks.length > 3 && (
              <p className="text-slate-400 text-sm text-center mt-2">
                +{dailyTasks.length - 3} more daily tasks
              </p>
            )}
          </div>
        ) : (
          <div className="p-4 text-center bg-slate-800/30 rounded-lg border border-slate-700/50">
            <p className="text-slate-400 text-sm mb-2">No daily tasks yet</p>
            <p className="text-slate-500 text-xs">Click "Add Daily Task" to create your first daily task</p>
          </div>
        )}
        
        {dailyTasksPercentage === 100 && dailyTasks.length > 0 && (
          <div className="mt-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-green-400" />
              <span className="text-green-200 font-medium">All daily tasks completed! 🎉</span>
            </div>
          </div>
        )}
      </div>

      {/* Add Task Form */}
      {showAddForm && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 text-slate-100">Add New Task</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
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
              <label className="block text-sm font-medium text-slate-300 mb-1">
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
                <label className="block text-sm font-medium text-slate-300 mb-1">
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
                <label className="block text-sm font-medium text-slate-300 mb-1">
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

          <div className="text-sm text-slate-400">
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
                <CheckCircle size={48} className="mx-auto text-emerald-400 mb-4" />
                <h3 className="text-lg font-medium text-slate-200 mb-2">
                  🎉 All caught up!
                </h3>
                <p className="text-slate-400">
                  You have no pending tasks. Great work!
                </p>
              </>
            ) : filter === 'completed' ? (
              <>
                <Trophy size={48} className="mx-auto text-yellow-400 mb-4" />
                <h3 className="text-lg font-medium text-slate-200 mb-2">
                  No completed tasks yet
                </h3>
                <p className="text-slate-400">
                  Complete some tasks to see your achievements here!
                </p>
              </>
            ) : (
              <>
                <CheckCircle size={48} className="mx-auto text-slate-400 mb-4" />
                <h3 className="text-lg font-medium text-slate-200 mb-2">
                  No tasks found
                </h3>
                <p className="text-slate-400">
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
                task.completed ? 'opacity-80 bg-emerald-500/5 border-emerald-500/30' : ''
              } ${
                completedTaskId === task.id ? 'animate-pulse bg-emerald-500/10 scale-[1.02] ring-1 ring-emerald-500/30' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleTaskToggle(task.id)}
                    className="w-5 h-5 text-emerald-500 rounded focus:ring-emerald-500 mt-1 transition-all duration-200 bg-slate-800/60 border-white/20"
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`font-medium ${
                        task.completed ? 'line-through text-slate-400' : 'text-slate-200'
                      } ${
                        completedTaskId === task.id ? 'text-emerald-400' : ''
                      }`}>
                        {task.title}
                        {completedTaskId === task.id && (
                          <span className="ml-2 text-emerald-400">
                            <CheckCircle size={16} className="inline animate-bounce" />
                          </span>
                        )}
                      </h3>
                      {task.dueDate && isOverdue(task.dueDate) && !task.completed && (
                        <span className="text-red-400 text-sm flex items-center gap-1">
                          <AlertTriangle size={14} />
                          Overdue
                        </span>
                      )}
                    </div>
                    
                    {task.description && (
                      <p className={`text-sm text-slate-400 mb-2 ${task.completed ? 'line-through' : ''}`}>
                        {task.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
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
                        <span className="flex items-center gap-1 text-emerald-400">
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
                    className="text-red-400 hover:text-red-300 transition-colors"
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