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
  CheckCircle
} from 'lucide-react';

const TaskManager: React.FC = () => {
  const { state, addTask, toggleTask, deleteTask } = useApp();
  const [showAddForm, setShowAddForm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'dueDate' | 'createdAt'>('priority');
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as const,
    dueDate: ''
  });

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Task Manager</h1>
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
                <option value="all">All Tasks</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <SortAsc size={16} />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="input"
              >
                <option value="priority">Sort by Priority</option>
                <option value="dueDate">Sort by Due Date</option>
                <option value="createdAt">Sort by Created</option>
              </select>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''} 
            {filter === 'all' && ` (${state.tasks.filter(t => !t.completed).length} pending, ${state.tasks.filter(t => t.completed).length} completed)`}
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="card text-center py-12">
            <CheckCircle size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              {filter === 'completed' ? 'No completed tasks yet' : 'No tasks found'}
            </h3>
            <p className="text-gray-500">
              {filter === 'completed' 
                ? 'Complete some tasks to see them here!' 
                : 'Add your first task to get started!'
              }
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`card transition-all duration-200 ${
                task.completed ? 'opacity-75' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 mt-1"
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`font-medium ${task.completed ? 'line-through text-gray-500' : ''}`}>
                        {task.title}
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
                        <span className="flex items-center gap-1">
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