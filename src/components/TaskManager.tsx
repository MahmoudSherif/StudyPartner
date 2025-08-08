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
  Trophy
} from 'lucide-react';
import CelebrationOverlay from './CelebrationOverlay';

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