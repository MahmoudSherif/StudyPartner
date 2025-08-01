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
  const { state, addTask, toggleTask, addAchievement, updateStreak } = useApp();
  const [newTask, setNewTask] = useState('');
  const [showCompletionMessage, setShowCompletionMessage] = useState(false);
  const [completedTaskTitle, setCompletedTaskTitle] = useState('');

  const today = new Date().toISOString().split('T')[0];
  const todayTasks = state.tasks
    .filter(task => 
      task.dueDate === today || (!task.dueDate && !task.completed)
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); // Newest first
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

      // Hide completion message after 5 seconds (longer for MEGA animation)
      setTimeout(() => {
        setShowCompletionMessage(false);
        setCompletedTaskTitle('');
      }, 5000);
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
      {/* Proper Pop-up Window - Rational Size & Positioning */}
      {showCompletionMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          {/* Pop-up Window Container - Rational Sizing */}
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl animate-in zoom-in duration-500 transform relative overflow-hidden">
            
            {/* Window Header Bar */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              </div>
              <h3 className="font-bold text-white text-sm sm:text-base">🎉 Task Completed!</h3>
              <button 
                onClick={() => {
                  setShowCompletionMessage(false);
                  setCompletedTaskTitle('');
                }}
                className="text-white/80 hover:text-white text-lg font-bold w-6 h-6 flex items-center justify-center rounded hover:bg-white/20 transition-colors"
              >
                ×
              </button>
            </div>

            {/* Confetti Overlay */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-1/4 left-1/4 w-1 h-1 sm:w-2 sm:h-2 bg-yellow-400 rounded-full animate-ping" style={{animationDelay: '0s'}}></div>
              <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-pink-400 rounded-full animate-ping" style={{animationDelay: '0.3s'}}></div>
              <div className="absolute bottom-1/3 left-1/3 w-1 h-1 sm:w-2 sm:h-2 bg-blue-400 rounded-full animate-ping" style={{animationDelay: '0.6s'}}></div>
              <div className="absolute top-1/2 left-1/6 w-1 h-1 sm:w-2 sm:h-2 bg-purple-400 rounded-full animate-ping" style={{animationDelay: '0.9s'}}></div>
              <div className="absolute bottom-1/4 right-1/6 w-2 h-2 bg-orange-400 rounded-full animate-ping" style={{animationDelay: '1.2s'}}></div>
            </div>
            
            {/* Window Content */}
            <div className="bg-white p-4 sm:p-6 text-center space-y-4">
              
              {/* Main Celebration */}
              <div className="flex items-center justify-center gap-2">
                <div className="text-3xl sm:text-4xl animate-bounce">🎉</div>
                <div className="text-2xl sm:text-3xl animate-pulse">⭐</div>
                <div className="text-3xl sm:text-4xl animate-bounce" style={{animationDelay: '0.2s'}}>🎊</div>
              </div>
              
              <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-green-500 mx-auto" />
              
              {/* Message */}
              <div className="space-y-3">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                  FANTASTIC! 🌟
                </h2>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm sm:text-base font-medium text-green-800 mb-1">Task Successfully Completed!</p>
                  <p className="text-xs sm:text-sm text-green-600 italic bg-green-100 px-2 py-1 rounded inline-block">
                    "{completedTaskTitle}"
                  </p>
                </div>
              </div>
              
              {/* Rewards */}
              <div className="space-y-2">
                <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-4 py-2 rounded-full shadow-md flex items-center justify-center gap-2">
                  <Trophy className="w-4 h-4 animate-bounce" />
                  <span className="font-bold text-sm sm:text-base">+10 Points!</span>
                  <Trophy className="w-4 h-4 animate-bounce" style={{animationDelay: '0.1s'}} />
                </div>
                
                {state.streak.current > 0 && (
                  <div className="bg-gradient-to-r from-red-400 to-pink-400 text-white px-3 py-1 rounded-full flex items-center justify-center gap-2">
                    <span className="text-sm">🔥</span>
                    <span className="font-medium text-sm">{state.streak.current} Day Streak!</span>
                    <span className="text-sm">🔥</span>
                  </div>
                )}
              </div>
              
              {/* Motivational */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <div className="space-y-1">
                  <div className="text-sm sm:text-base font-semibold text-gray-700">Keep up the amazing work! 💪</div>
                  <div className="text-xs sm:text-sm text-gray-600">You're crushing your goals!</div>
                </div>
              </div>
              
              {/* Achievement Badge */}
              <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-3 py-2 rounded-full">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-sm">🏆</span>
                  <span className="font-medium text-xs sm:text-sm">ACHIEVEMENT UNLOCKED!</span>
                  <span className="text-sm">🏆</span>
                </div>
              </div>
              
              {/* Auto-close */}
              <div className="text-xs text-gray-500">
                Auto-closing in a few seconds...
              </div>
            </div>
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