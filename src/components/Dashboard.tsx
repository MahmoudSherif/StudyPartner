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
  Sparkles,
  Plus
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
  }, []); // Run only once on mount

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
          rarity: 'rare',
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
          rarity: 'epic',
          unlocked: true
        });
      }

      // Hide completion message after 5 seconds
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
    <div className="min-h-dvh safe-area-inset">
      {/* Mobile-First Container */}
      <div className="space-y-3 sm:space-y-4 lg:space-y-6 pb-4 sm:pb-6 lg:pb-8 w-full max-w-full overflow-hidden px-3 sm:px-4 lg:px-0">
        
        {/* FULL-SCREEN CELEBRATION - Mobile Optimized */}
        {showCompletionMessage && (
          <div className="fixed inset-0 z-50 bg-gradient-to-br from-pink-400 via-purple-500 via-blue-500 via-green-400 to-yellow-400 animate-gradient-x flex items-center justify-center p-3 sm:p-4 lg:p-8 safe-area-inset">
            {/* Animated Background Effects */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-5 sm:top-10 left-5 sm:left-10 w-16 sm:w-32 h-16 sm:h-32 bg-white/20 rounded-full animate-bounce"></div>
              <div className="absolute top-10 sm:top-20 right-10 sm:right-20 w-12 sm:w-24 h-12 sm:h-24 bg-yellow-300/30 rounded-full animate-pulse"></div>
              <div className="absolute bottom-10 sm:bottom-20 left-10 sm:left-20 w-20 sm:w-40 h-20 sm:h-40 bg-pink-300/20 rounded-full animate-bounce" style={{animationDelay: '0.5s'}}></div>
              <div className="absolute bottom-5 sm:bottom-10 right-5 sm:right-10 w-14 sm:w-28 h-14 sm:h-28 bg-green-300/30 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
            </div>

            {/* Confetti Particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className={`absolute w-2 sm:w-4 h-2 sm:h-4 rounded-full animate-ping ${
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
            
            {/* Main Content - Mobile Responsive */}
            <div className="relative z-10 text-center space-y-2 sm:space-y-4 lg:space-y-8 max-w-sm sm:max-w-2xl lg:max-w-4xl w-full px-2 sm:px-4">
              
              {/* Close Button */}
              <button 
                onClick={() => {
                  setShowCompletionMessage(false);
                  setCompletedTaskTitle('');
                }}
                className="absolute -top-1 sm:-top-2 lg:top-0 -right-1 sm:-right-2 lg:right-0 text-white/80 hover:text-white text-2xl sm:text-3xl lg:text-6xl font-bold w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors touch-manipulation"
              >
                ×
              </button>
              
              {/* Emojis */}
              <div className="flex items-center justify-center gap-1 sm:gap-2 lg:gap-8">
                <div className="text-3xl sm:text-6xl md:text-8xl lg:text-9xl animate-bounce">🎉</div>
                <div className="text-2xl sm:text-5xl md:text-7xl lg:text-8xl animate-pulse">⭐</div>
                <div className="text-3xl sm:text-6xl md:text-8xl lg:text-9xl animate-bounce" style={{animationDelay: '0.2s'}}>🎊</div>
              </div>
              
              {/* Sparkles */}
              <Sparkles className="w-8 h-8 sm:w-12 sm:h-12 md:w-20 md:h-20 lg:w-24 lg:h-24 animate-spin text-yellow-300 mx-auto drop-shadow-2xl" />
              
              {/* Title */}
              <div className="space-y-1 sm:space-y-3 lg:space-y-6">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-black text-white drop-shadow-2xl animate-pulse leading-tight">
                  FANTASTIC! 🌟
                </h1>
                
                <div className="bg-white/20 backdrop-blur-lg border border-white/40 sm:border-2 lg:border-4 rounded-lg sm:rounded-xl lg:rounded-3xl p-2 sm:p-4 lg:p-8 shadow-2xl">
                  <p className="text-sm sm:text-lg md:text-xl lg:text-3xl font-bold text-white mb-1 sm:mb-2 lg:mb-4">Task Successfully Completed!</p>
                  <p className="text-xs sm:text-sm md:text-base lg:text-xl text-yellow-200 italic bg-white/20 px-2 sm:px-3 lg:px-6 py-1 sm:py-2 lg:py-4 rounded-md sm:rounded-lg lg:rounded-2xl inline-block font-medium break-words max-w-full">
                    "{completedTaskTitle}"
                  </p>
                </div>
              </div>
              
              {/* Rewards */}
              <div className="space-y-2 sm:space-y-3 lg:space-y-6">
                <div className="bg-gradient-to-r from-yellow-300 to-orange-400 text-black px-3 sm:px-4 lg:px-12 py-2 sm:py-3 lg:py-6 rounded-full shadow-2xl flex items-center justify-center gap-1 sm:gap-2 lg:gap-6 border border-white/50 sm:border-2 lg:border-4">
                  <Trophy className="w-4 h-4 sm:w-6 sm:h-6 lg:w-12 lg:h-12 animate-bounce drop-shadow-lg flex-shrink-0" />
                  <span className="font-black text-sm sm:text-lg lg:text-3xl">+10 POINTS!</span>
                  <Trophy className="w-4 h-4 sm:w-6 sm:h-6 lg:w-12 lg:h-12 animate-bounce drop-shadow-lg flex-shrink-0" style={{animationDelay: '0.1s'}} />
                </div>
                
                {state.streak.current > 0 && (
                  <div className="bg-gradient-to-r from-red-400 to-pink-500 text-white px-3 sm:px-4 lg:px-8 py-1.5 sm:py-2 lg:py-4 rounded-full flex items-center justify-center gap-1 sm:gap-2 lg:gap-4 border border-white/50 sm:border-2 lg:border-4 shadow-2xl">
                    <span className="text-lg sm:text-2xl lg:text-4xl">🔥</span>
                    <span className="font-bold text-sm sm:text-lg lg:text-2xl">{state.streak.current} Day Streak!</span>
                    <span className="text-lg sm:text-2xl lg:text-4xl">🔥</span>
                  </div>
                )}
              </div>
              
              {/* Motivational */}
              <div className="bg-white/20 backdrop-blur-lg border border-white/40 sm:border-2 lg:border-4 rounded-lg sm:rounded-xl lg:rounded-3xl p-2 sm:p-4 lg:p-8 shadow-2xl">
                <div className="space-y-1 sm:space-y-2 lg:space-y-4">
                  <div className="text-base sm:text-xl lg:text-3xl font-black text-white drop-shadow-lg">Keep up the AMAZING work! 💪</div>
                  <div className="text-sm sm:text-lg lg:text-xl text-yellow-200 font-bold">You're absolutely CRUSHING your goals!</div>
                </div>
              </div>
              
              {/* Achievement Badge */}
              <div className="bg-gradient-to-r from-purple-400 to-indigo-500 text-white px-3 sm:px-4 lg:px-8 py-2 sm:py-3 lg:py-6 rounded-full border border-white/50 sm:border-2 lg:border-4 shadow-2xl">
                <div className="flex items-center justify-center gap-1 sm:gap-2 lg:gap-4">
                  <span className="text-lg sm:text-2xl lg:text-4xl">🏆</span>
                  <span className="font-black text-sm sm:text-lg lg:text-2xl">ACHIEVEMENT UNLOCKED!</span>
                  <span className="text-lg sm:text-2xl lg:text-4xl">🏆</span>
                </div>
              </div>
              
              {/* Auto-close indicator */}
              <div className="text-xs sm:text-base lg:text-xl text-white/90 font-medium">
                Celebrating your success! Auto-closing in a few seconds... ✨
              </div>
            </div>
          </div>
        )}

        {/* Header - Mobile Optimized */}
        <div className="text-center pt-2 sm:pt-4">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">
            Welcome back! 👋
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            {format(new Date(), 'EEEE, MMMM do, yyyy')}
          </p>
        </div>

        {/* Quick Stats - Mobile Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="card text-center p-3 sm:p-4 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="streak mb-2 flex items-center justify-center gap-2">
              <TrendingUp size={16} className="sm:w-5 sm:h-5 text-blue-500" />
              <span className="text-sm sm:text-base font-semibold text-gray-800">{state.streak.current} Day Streak</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-600">{getStreakMessage()}</p>
          </div>

          <div className="card text-center p-3 sm:p-4 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="text-xl sm:text-2xl font-bold text-blue-600 mb-2">
              {completedToday}
            </div>
            <p className="text-xs sm:text-sm text-gray-600">Tasks Completed Today</p>
          </div>

          <div className="card text-center p-3 sm:p-4 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="text-xl sm:text-2xl font-bold text-green-600 mb-2">
              {state.achievements.length}
            </div>
            <p className="text-xs sm:text-sm text-gray-600">Total Achievements</p>
          </div>
        </div>

        {/* Quick Add Task - Mobile Optimized */}
        <div className="card bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 flex items-center gap-2 text-gray-800">
            <Target size={18} className="sm:w-5 sm:h-5 text-blue-500" />
            Quick Add Task
          </h2>
          <form onSubmit={handleAddTask} className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="What do you want to accomplish today?"
              className="flex-1 px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base min-h-[44px] touch-manipulation"
            />
            <button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2 text-sm sm:text-base min-h-[44px] touch-manipulation"
            >
              <Plus size={16} className="sm:w-4 sm:h-4" />
              Add Task
            </button>
          </form>
        </div>

        {/* Today's Tasks - Mobile Optimized */}
        <div className="card bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 flex items-center gap-2 text-gray-800">
            <CheckCircle size={18} className="sm:w-5 sm:h-5 text-green-500" />
            <span className="text-sm sm:text-base">Today's Tasks ({todayTasks.filter(t => !t.completed).length} remaining)</span>
          </h2>
          {todayTasks.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="text-4xl sm:text-6xl mb-4 opacity-50">📝</div>
              <p className="text-gray-500 text-sm sm:text-base mb-2">
                No tasks for today! Add some tasks to get started.
              </p>
              <p className="text-gray-400 text-xs sm:text-sm">
                Use the form above to add your first task.
              </p>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {todayTasks.slice(0, 8).map((task) => (
                <div
                  key={task.id}
                  className={`flex items-center gap-3 p-3 sm:p-4 rounded-lg border transition-all duration-300 min-h-[52px] sm:min-h-[56px] ${
                    task.completed 
                      ? 'bg-green-50 border-green-200 opacity-75' 
                      : 'bg-gray-50 border-gray-200 hover:border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleCompleteTask(task.id)}
                    className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 rounded-md border-2 border-gray-300 focus:ring-2 focus:ring-green-500 focus:ring-offset-0 transition-all duration-200 flex-shrink-0 touch-manipulation cursor-pointer"
                  />
                  <span className={`flex-1 transition-all duration-200 text-sm sm:text-base leading-relaxed ${
                    task.completed ? 'line-through text-gray-500' : 'text-gray-800'
                  }`}>
                    {task.title}
                  </span>
                  {task.completed && (
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  )}
                </div>
              ))}
              
              {todayTasks.length > 8 && (
                <div className="text-center py-2">
                  <button
                    onClick={() => navigate('/tasks')}
                    className="text-blue-600 hover:text-blue-700 text-sm sm:text-base font-medium transition-colors"
                  >
                    View all {todayTasks.length} tasks →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Actions - Mobile Optimized */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <button
            onClick={handleAddStudyQuestion}
            className="card bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 hover:shadow-md hover:border-blue-300 transition-all duration-200 group touch-manipulation"
          >
            <div className="flex flex-col items-center text-center space-y-2">
              <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 group-hover:scale-110 transition-transform" />
              <span className="text-xs sm:text-sm font-medium text-gray-800">Knowledge</span>
            </div>
          </button>

          <button
            onClick={handleTrackMood}
            className="card bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 hover:shadow-md hover:border-pink-300 transition-all duration-200 group touch-manipulation"
          >
            <div className="flex flex-col items-center text-center space-y-2">
              <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-pink-500 group-hover:scale-110 transition-transform" />
              <span className="text-xs sm:text-sm font-medium text-gray-800">Mood</span>
            </div>
          </button>

          <button
            onClick={handleAddImportantDate}
            className="card bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 hover:shadow-md hover:border-green-300 transition-all duration-200 group touch-manipulation"
          >
            <div className="flex flex-col items-center text-center space-y-2">
              <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-green-500 group-hover:scale-110 transition-transform" />
              <span className="text-xs sm:text-sm font-medium text-gray-800">Calendar</span>
            </div>
          </button>

          <button
            onClick={handleViewAllAchievements}
            className="card bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 hover:shadow-md hover:border-yellow-300 transition-all duration-200 group touch-manipulation"
          >
            <div className="flex flex-col items-center text-center space-y-2">
              <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500 group-hover:scale-110 transition-transform" />
              <span className="text-xs sm:text-sm font-medium text-gray-800">Achievements</span>
            </div>
          </button>
        </div>

        {/* Recent Achievements - Mobile Optimized */}
        {recentAchievements.length > 0 && (
          <div className="card bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center gap-2">
                <Trophy size={18} className="sm:w-5 sm:h-5 text-yellow-500" />
                Recent Achievements
              </h2>
              <button
                onClick={handleViewAllAchievements}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
              >
                View All →
              </button>
            </div>
            <div className="space-y-2 sm:space-y-3">
              {recentAchievements.map((achievement, index) => (
                <div key={index} className="flex items-center gap-3 p-2 sm:p-3 rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200">
                  <div className="text-lg sm:text-xl">🏆</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm sm:text-base font-medium text-gray-800 truncate">{achievement.title}</p>
                    <p className="text-xs sm:text-sm text-gray-600 truncate">{achievement.description}</p>
                  </div>
                  <div className="text-xs sm:text-sm text-yellow-600 font-medium">+{achievement.points}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Dates - Mobile Optimized */}
        {upcomingDates.length > 0 && (
          <div className="card bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-800 flex items-center gap-2">
              <Calendar size={18} className="sm:w-5 sm:h-5 text-green-500" />
              Upcoming Events
            </h2>
            <div className="space-y-2 sm:space-y-3">
              {upcomingDates.map((date) => (
                <div key={date.id} className="flex items-center gap-3 p-2 sm:p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="text-lg sm:text-xl">📅</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm sm:text-base font-medium text-gray-800 truncate">{date.title}</p>
                    <p className="text-xs sm:text-sm text-gray-600">
                      {format(new Date(date.date), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;