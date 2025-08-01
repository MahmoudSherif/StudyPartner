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
      {/* MEGA Completion Success Celebration - HUGE and Motivational */}
      {showCompletionMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md">
          <div className="bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 text-white p-12 rounded-3xl shadow-2xl flex flex-col items-center gap-6 animate-in zoom-in duration-700 transform scale-125 max-w-lg mx-4 border-4 border-white/30">
            {/* Confetti Effect */}
            <div className="absolute inset-0 overflow-hidden rounded-3xl">
              <div className="absolute top-0 left-1/4 w-2 h-2 bg-yellow-300 rounded-full animate-ping" style={{animationDelay: '0s'}}></div>
              <div className="absolute top-1/4 right-1/4 w-3 h-3 bg-pink-400 rounded-full animate-ping" style={{animationDelay: '0.3s'}}></div>
              <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-blue-400 rounded-full animate-ping" style={{animationDelay: '0.6s'}}></div>
              <div className="absolute top-1/3 left-1/6 w-2 h-2 bg-purple-400 rounded-full animate-ping" style={{animationDelay: '0.9s'}}></div>
              <div className="absolute bottom-1/3 right-1/6 w-3 h-3 bg-orange-400 rounded-full animate-ping" style={{animationDelay: '1.2s'}}></div>
            </div>
            
            {/* Main Content */}
            <div className="relative z-10 flex flex-col items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="text-8xl animate-bounce">🎉</div>
                <div className="text-6xl animate-pulse">⭐</div>
                <div className="text-8xl animate-bounce" style={{animationDelay: '0.2s'}}>🎊</div>
              </div>
              
              <Sparkles className="w-12 h-12 animate-spin text-yellow-300" />
              
              <div className="text-center space-y-3">
                <p className="text-4xl font-black mb-3 animate-pulse bg-gradient-to-r from-yellow-200 to-white bg-clip-text text-transparent">
                  FANTASTIC! 🌟
                </p>
                <p className="text-2xl font-bold mb-2">TASK COMPLETED!</p>
                <p className="text-lg opacity-90 italic font-medium bg-white/20 px-4 py-2 rounded-full">
                  "{completedTaskTitle}"
                </p>
              </div>
              
              <div className="flex flex-col items-center gap-3">
                <div className="flex items-center gap-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-black px-6 py-3 rounded-full shadow-lg">
                  <Trophy className="w-6 h-6 animate-bounce" />
                  <span className="font-black text-lg">+10 POINTS EARNED!</span>
                  <Trophy className="w-6 h-6 animate-bounce" style={{animationDelay: '0.1s'}} />
                </div>
                
                {state.streak.current > 0 && (
                  <div className="flex items-center gap-2 bg-gradient-to-r from-red-400 to-pink-400 text-white px-4 py-2 rounded-full">
                    <span className="text-xl">🔥</span>
                    <span className="font-bold">{state.streak.current} Day Streak!</span>
                    <span className="text-xl">🔥</span>
                  </div>
                )}
              </div>
              
              <div className="text-center space-y-2">
                <div className="text-xl font-bold">Keep up the AMAZING work! 💪</div>
                <div className="text-base opacity-90">You're absolutely CRUSHING your goals!</div>
                <div className="text-sm opacity-80">Every task brings you closer to SUCCESS! 🚀</div>
              </div>
              
              {/* Achievement Badge */}
              <div className="bg-white/20 px-6 py-3 rounded-full border-2 border-white/30">
                <div className="flex items-center gap-2 text-yellow-200">
                  <span className="text-2xl">🏆</span>
                  <span className="font-bold text-lg">ACHIEVEMENT UNLOCKED!</span>
                  <span className="text-2xl">🏆</span>
                </div>
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