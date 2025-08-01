import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { format } from 'date-fns';
import { 
  Target, 
  CheckCircle, 
  Calendar, 
  BookOpen, 
  Heart, 
  Trophy,
  TrendingUp,
  Sparkles
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { state, addTask, toggleTask, addAchievement } = useApp();
  const [newTask, setNewTask] = useState('');
  const [showCompletionMessage, setShowCompletionMessage] = useState(false);
  const [completedTaskTitle, setCompletedTaskTitle] = useState('');

  const today = new Date().toISOString().split('T')[0];
  const todayTasks = state.tasks.filter(task => 
    task.dueDate === today || (!task.dueDate && !task.completed)
  );
  const completedToday = state.tasks.filter(task => 
    task.completedAt && task.completedAt.startsWith(today)
  ).length;

  const upcomingDates = state.importantDates
    .filter(date => date.date >= today)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  const recentAchievements = state.achievements
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask.trim()) {
      addTask({
        title: newTask.trim(),
        completed: false,
        priority: 'medium',
        dueDate: today
      });
      setNewTask('');
      // No animation for adding tasks - only for completing them
    }
  };

  const handleCompleteTask = (taskId: string) => {
    const task = state.tasks.find(t => t.id === taskId);
    if (task && !task.completed) {
      // Task is being completed
      toggleTask(taskId);
      setCompletedTaskTitle(task.title);
      setShowCompletionMessage(true);
      
      // Add achievement for task completion
      addAchievement({
        title: '✅ Task Completed!',
        description: `You completed: "${task.title}"`,
        date: new Date().toISOString(),
        type: 'task',
        points: 10
      });

      // Hide completion message after 3 seconds
      setTimeout(() => {
        setShowCompletionMessage(false);
        setCompletedTaskTitle('');
      }, 3000);
    } else {
      // Task is being uncompleted
      toggleTask(taskId);
    }
  };

  const getStreakMessage = () => {
    if (state.streak.current === 0) {
      return "Start your streak today!";
    } else if (state.streak.current === 1) {
      return "Great start! Keep it going!";
    } else if (state.streak.current < 7) {
      return `You're on a ${state.streak.current}-day streak!`;
    } else if (state.streak.current < 30) {
      return `Amazing! ${state.streak.current} days strong!`;
    } else {
      return `Incredible! ${state.streak.current} days! You're unstoppable!`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Completion Success Message */}
      {showCompletionMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white p-4 rounded-lg shadow-lg flex items-center gap-3 animate-in slide-in-from-top duration-300">
          <Sparkles className="w-5 h-5" />
          <div>
            <p className="font-semibold">Great job! 🎉</p>
            <p className="text-sm">"{completedTaskTitle}" completed!</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Welcome back! 👋
        </h1>
        <p className="text-gray-600">
          {format(new Date(), 'EEEE, MMMM do, yyyy')}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-3 gap-4">
        <div className="card text-center">
          <div className="streak mb-2">
            <TrendingUp size={20} />
            <span>{state.streak.current} Day Streak</span>
          </div>
          <p className="text-sm text-gray-600">{getStreakMessage()}</p>
        </div>

        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-600 mb-2">
            {completedToday}
          </div>
          <p className="text-sm text-gray-600">Tasks Completed Today</p>
        </div>

        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600 mb-2">
            {state.achievements.length}
          </div>
          <p className="text-sm text-gray-600">Total Achievements</p>
        </div>
      </div>

      {/* Quick Add Task */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Target size={20} />
          Quick Add Task
        </h2>
        <form onSubmit={handleAddTask} className="flex gap-2">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="What do you want to accomplish today?"
            className="input flex-1"
          />
          <button type="submit" className="btn">
            Add Task
          </button>
        </form>
      </div>

      {/* Today's Tasks */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <CheckCircle size={20} />
          Today's Tasks ({todayTasks.filter(t => !t.completed).length} remaining)
        </h2>
        {todayTasks.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No tasks for today! Add some tasks to get started.
          </p>
        ) : (
          <div className="space-y-3">
            {todayTasks.slice(0, 5).map((task) => (
              <div
                key={task.id}
                className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-300 ${
                  task.completed ? 'bg-green-50 border-green-200 opacity-75' : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleCompleteTask(task.id)}
                    className="w-4 h-4 text-green-600 rounded focus:ring-green-500 transition-all duration-200"
                  />
                  <span className={`transition-all duration-200 ${
                    task.completed ? 'line-through text-gray-500' : 'text-gray-800'
                  }`}>
                    {task.title}
                  </span>
                  {task.completed && (
                    <CheckCircle size={16} className="text-green-500" />
                  )}
                </div>
                <span className={`badge badge-${task.priority === 'high' ? 'danger' : task.priority === 'medium' ? 'warning' : 'info'}`}>
                  {task.priority}
                </span>
              </div>
            ))}
            {todayTasks.length > 5 && (
              <p className="text-center text-gray-500">
                And {todayTasks.length - 5} more tasks...
              </p>
            )}
          </div>
        )}
      </div>

      {/* Upcoming Important Dates */}
      {upcomingDates.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Calendar size={20} />
            Upcoming Important Dates
          </h2>
          <div className="space-y-3">
            {upcomingDates.map((date) => (
              <div key={date.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <div className="font-medium">{date.title}</div>
                  <div className="text-sm text-gray-600">
                    {format(new Date(date.date), 'MMM do, yyyy')}
                  </div>
                </div>
                <span className={`badge badge-${date.type === 'exam' ? 'danger' : date.type === 'assignment' ? 'warning' : 'info'}`}>
                  {date.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Achievements */}
      {recentAchievements.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Trophy size={20} />
            Recent Achievements
          </h2>
          <div className="space-y-3">
            {recentAchievements.map((achievement) => (
              <div key={achievement.id} className="achievement">
                <div className="font-semibold">{achievement.title}</div>
                <div className="text-sm opacity-90">{achievement.description}</div>
                <div className="text-xs opacity-75 mt-1">
                  {format(new Date(achievement.date), 'MMM do, yyyy')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-2 gap-4">
          <button className="btn btn-secondary">
            <BookOpen size={18} />
            Add Study Question
          </button>
          <button className="btn btn-secondary">
            <Heart size={18} />
            Track Mood
          </button>
          <button className="btn btn-secondary">
            <Calendar size={18} />
            Add Important Date
          </button>
          <button className="btn btn-secondary">
            <Trophy size={18} />
            View All Achievements
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 