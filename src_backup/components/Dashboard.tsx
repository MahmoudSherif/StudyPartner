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
  Plus
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { state, addTask, toggleTask, addAchievement, updateStreak } = useApp();
  const navigate = useNavigate();
  const [newTask, setNewTask] = useState('');

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
        
        {/* Header - Mobile Optimized */}
        <div className="text-center pt-2 sm:pt-4">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-100 mb-1 sm:mb-2">
            Welcome back! 👋
          </h1>
          <p className="text-sm sm:text-base text-slate-300">
            {format(new Date(), 'EEEE, MMMM do, yyyy')}
          </p>
        </div>

        {/* Quick Stats - Mobile Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="card text-center p-3 sm:p-4">
            <div className="streak mb-2 flex items-center justify-center gap-2">
              <TrendingUp size={16} className="sm:w-5 sm:h-5 text-blue-400" />
              <span className="text-sm sm:text-base font-semibold text-slate-100">{state.streak.current} Day Streak</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300">{getStreakMessage()}</p>
          </div>

          <div className="card text-center p-3 sm:p-4">
            <div className="text-xl sm:text-2xl font-bold text-blue-400 mb-2">
              {completedToday}
            </div>
            <p className="text-xs sm:text-sm text-slate-300">Tasks Completed Today</p>
          </div>

          <div className="card text-center p-3 sm:p-4">
            <div className="text-xl sm:text-2xl font-bold text-green-400 mb-2">
              {state.achievements.length}
            </div>
            <p className="text-xs sm:text-sm text-slate-300">Total Achievements</p>
          </div>
        </div>

        {/* Quick Add Task - Mobile Optimized */}
        <div className="card p-3 sm:p-4">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 flex items-center gap-2 text-white">
            <Target size={18} className="sm:w-5 sm:h-5 text-blue-400" />
            Quick Add Task
          </h2>
          <form onSubmit={handleAddTask} className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="What do you want to accomplish today?"
              className="input min-h-[44px] touch-manipulation"
            />
            <button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2 text-sm sm:text-base min-h-[44px] touch-manipulation ring-1 ring-white/10"
            >
              <Plus size={16} className="sm:w-4 sm:h-4" />
              Add Task
            </button>
          </form>
        </div>

        {/* Today's Tasks - Mobile Optimized */}
        <div className="card p-3 sm:p-4">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 flex items-center gap-2 text-white">
            <CheckCircle size={18} className="sm:w-5 sm:h-5 text-green-400" />
            <span className="text-sm sm:text-base">Today's Tasks ({todayTasks.filter(t => !t.completed).length} remaining)</span>
          </h2>
          {todayTasks.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="text-4xl sm:text-6xl mb-4 opacity-70">📝</div>
              <p className="text-slate-300 text-sm sm:text-base mb-2">
                No tasks for today! Add some tasks to get started.
              </p>
              <p className="text-slate-400 text-xs sm:text-sm">
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
                      ? 'bg-emerald-900/20 border-emerald-500/30' 
                      : 'bg-slate-800/40 border-white/10 hover:border-white/20 hover:bg-slate-800/60'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleCompleteTask(task.id)}
                    className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400 rounded-md border-2 border-slate-500 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-0 transition-all duration-200 flex-shrink-0 touch-manipulation cursor-pointer bg-slate-900"
                  />
                  <span className={`flex-1 transition-all duration-200 text-sm sm:text-base leading-relaxed ${
                    task.completed ? 'line-through text-slate-400' : 'text-slate-100'
                  }`}>
                    {task.title}
                  </span>
                  {task.completed && (
                    <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  )}
                </div>
              ))}
              
              {todayTasks.length > 8 && (
                <div className="text-center py-2">
                  <button
                    onClick={() => navigate('/tasks')}
                    className="text-blue-400 hover:text-blue-300 text-sm sm:text-base font-medium transition-colors"
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
            className="card p-3 sm:p-4 hover:shadow-md hover:ring-1 hover:ring-white/15 transition-all duration-200 group touch-manipulation"
          >
            <div className="flex flex-col items-center text-center space-y-2">
              <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400 group-hover:scale-110 transition-transform" />
              <span className="text-xs sm:text-sm font-medium text-slate-100">Knowledge</span>
            </div>
          </button>

          <button
            onClick={handleTrackMood}
            className="card p-3 sm:p-4 hover:shadow-md hover:ring-1 hover:ring-white/15 transition-all duration-200 group touch-manipulation"
          >
            <div className="flex flex-col items-center text-center space-y-2">
              <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-pink-400 group-hover:scale-110 transition-transform" />
              <span className="text-xs sm:text-sm font-medium text-slate-100">Mood</span>
            </div>
          </button>

          <button
            onClick={handleAddImportantDate}
            className="card p-3 sm:p-4 hover:shadow-md hover:ring-1 hover:ring-white/15 transition-all duration-200 group touch-manipulation"
          >
            <div className="flex flex-col items-center text-center space-y-2">
              <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-green-400 group-hover:scale-110 transition-transform" />
              <span className="text-xs sm:text-sm font-medium text-slate-100">Calendar</span>
            </div>
          </button>

          <button
            onClick={handleViewAllAchievements}
            className="card p-3 sm:p-4 hover:shadow-md hover:ring-1 hover:ring-white/15 transition-all duration-200 group touch-manipulation"
          >
            <div className="flex flex-col items-center text-center space-y-2">
              <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-300 group-hover:scale-110 transition-transform" />
              <span className="text-xs sm:text-sm font-medium text-slate-100">Achievements</span>
            </div>
          </button>
        </div>

        {/* Recent Achievements - Mobile Optimized */}
        {recentAchievements.length > 0 && (
          <div className="card p-3 sm:p-4">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-white flex items-center gap-2">
                <Trophy size={18} className="sm:w-5 sm:h-5 text-yellow-300" />
                Recent Achievements
              </h2>
              <button
                onClick={handleViewAllAchievements}
                className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
              >
                View All →
              </button>
            </div>
            <div className="space-y-2 sm:space-y-3">
              {recentAchievements.map((achievement, index) => (
                <div key={index} className="flex items-center gap-3 p-2 sm:p-3 rounded-lg bg-yellow-900/15 border border-yellow-500/30">
                  <div className="text-lg sm:text-xl">🏆</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm sm:text-base font-medium text-slate-100 truncate">{achievement.title}</p>
                    <p className="text-xs sm:text-sm text-slate-300 truncate">{achievement.description}</p>
                  </div>
                  <div className="text-xs sm:text-sm text-yellow-300 font-medium">+{achievement.points}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Dates - Mobile Optimized */}
        {upcomingDates.length > 0 && (
          <div className="card p-3 sm:p-4">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-white flex items-center gap-2">
              <Calendar size={18} className="sm:w-5 sm:h-5 text-green-400" />
              Upcoming Events
            </h2>
            <div className="space-y-2 sm:space-y-3">
              {upcomingDates.map((date) => (
                <div key={date.id} className="flex items-center gap-3 p-2 sm:p-3 rounded-lg bg-blue-900/15 border border-blue-500/30">
                  <div className="text-lg sm:text-xl">📅</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm sm:text-base font-medium text-slate-100 truncate">{date.title}</p>
                    <p className="text-xs sm:text-sm text-slate-300">
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