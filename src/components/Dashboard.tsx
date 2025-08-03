import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { calculateNewStreak, shouldResetStreak, resetStreak } from '../utils/streakCalculator';
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
  const navigate = useNavigate();
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

  // Check and reset streak on component mount if needed
  useEffect(() => {
    if (state.streak && shouldResetStreak(state.streak)) {
      console.log('Resetting streak due to missed days');
      const resetStreakData = resetStreak(state.streak);
      updateStreak(resetStreakData);
    }
  }, []); // Only run on mount

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

  // Quick Action Handlers
  const handleAddStudyQuestion = () => {
    navigate('/knowledge');
  };

  const handleTrackMood = () => {
    navigate('/mood');
  };

  const handleAddImportantDate = () => {
    navigate('/calendar');
  };

  const handleViewAllAchievements = () => {
    navigate('/achievements');
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
    <div className="space-y-6 pb-8">
      {/* FULL-SCREEN MEGA CELEBRATION - Covers Entire Screen */}
      {showCompletionMessage && (
        <div className="fixed inset-0 z-50 bg-gradient-to-br from-pink-400 via-purple-500 via-blue-500 via-green-400 to-yellow-400 animate-gradient-x flex items-center justify-center p-8">
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
              onClick={() => {
                setShowCompletionMessage(false);
                setCompletedTaskTitle('');
              }}
              className="absolute top-0 right-0 text-white/80 hover:text-white text-6xl font-bold w-16 h-16 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
            >
              ×
            </button>
            
            {/* GIANT Emojis */}
            <div className="flex items-center justify-center gap-8">
              <div className="text-9xl md:text-[12rem] lg:text-[15rem] animate-bounce">🎉</div>
              <div className="text-8xl md:text-[10rem] lg:text-[12rem] animate-pulse">⭐</div>
              <div className="text-9xl md:text-[12rem] lg:text-[15rem] animate-bounce" style={{animationDelay: '0.2s'}}>🎊</div>
            </div>
            
            {/* MASSIVE Sparkles */}
            <Sparkles className="w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 animate-spin text-yellow-300 mx-auto drop-shadow-2xl" />
            
            {/* HUGE Title */}
            <div className="space-y-6">
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-white drop-shadow-2xl animate-pulse">
                FANTASTIC! 🌟
              </h1>
              
              <div className="bg-white/20 backdrop-blur-lg border-4 border-white/40 rounded-3xl p-8 shadow-2xl">
                <p className="text-3xl md:text-4xl lg:text-6xl font-bold text-white mb-4">Task Successfully Completed!</p>
                <p className="text-xl md:text-2xl lg:text-4xl text-yellow-200 italic bg-white/20 px-6 py-4 rounded-2xl inline-block font-medium">
                  "{completedTaskTitle}"
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
                <div className="text-3xl md:text-4xl lg:text-6xl font-black text-white drop-shadow-lg">Keep up the AMAZING work! 💪</div>
                <div className="text-xl md:text-2xl lg:text-4xl text-yellow-200 font-bold">You're absolutely CRUSHING your goals!</div>
              </div>
            </div>
            
            {/* MASSIVE Achievement Badge */}
            <div className="bg-gradient-to-r from-purple-400 to-indigo-500 text-white px-8 py-6 rounded-full border-4 border-white/50 shadow-2xl">
              <div className="flex items-center justify-center gap-4">
                <span className="text-4xl md:text-5xl lg:text-6xl">🏆</span>
                <span className="font-black text-2xl md:text-3xl lg:text-5xl">ACHIEVEMENT UNLOCKED!</span>
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
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={handleAddStudyQuestion}
            className="btn btn-secondary flex items-center justify-center gap-2 hover:bg-blue-50 hover:border-blue-300 transition-colors"
          >
            <BookOpen size={18} />
            Add Study Question
          </button>
          <button 
            onClick={handleTrackMood}
            className="btn btn-secondary flex items-center justify-center gap-2 hover:bg-pink-50 hover:border-pink-300 transition-colors"
          >
            <Heart size={18} />
            Track Mood
          </button>
          <button 
            onClick={handleAddImportantDate}
            className="btn btn-secondary flex items-center justify-center gap-2 hover:bg-green-50 hover:border-green-300 transition-colors"
          >
            <Calendar size={18} />
            Add Important Date
          </button>
          <button 
            onClick={handleViewAllAchievements}
            className="btn btn-secondary flex items-center justify-center gap-2 hover:bg-yellow-50 hover:border-yellow-300 transition-colors"
          >
            <Trophy size={18} />
            View All Achievements
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 