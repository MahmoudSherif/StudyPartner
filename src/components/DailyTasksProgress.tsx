import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle, Calendar, Flame } from 'lucide-react';

interface DailyTasksProgressProps {
  isCompact?: boolean; // For mobile/small displays
}

const DailyTasksProgress: React.FC<DailyTasksProgressProps> = ({ isCompact = false }) => {
  const { state } = useApp();

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  // Filter daily tasks (tasks created today, due today, or marked as daily)
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
  const totalDailyTasks = dailyTasks.length;
  const completionPercentage = totalDailyTasks > 0 ? Math.round((completedDailyTasks.length / totalDailyTasks) * 100) : 0;

  // Clean up old celebration entries on mount
  useEffect(() => {
    const cleanupOldCelebrations = () => {
      try {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('dailyTasksCelebration_')) {
            const dateStr = key.replace('dailyTasksCelebration_', '');
            const date = new Date(dateStr);
            const daysDiff = Math.floor((new Date().getTime() - date.getTime()) / (1000 * 3600 * 24));
            if (daysDiff > 7) {
              keysToRemove.push(key);
            }
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
      } catch {
        // Ignore cleanup errors
      }
    };
    
    cleanupOldCelebrations();
  }, []); // Only run once on mount

  // Don't render if no daily tasks
  if (totalDailyTasks === 0) {
    return null;
  }

  const circleSize = isCompact ? 40 : 60;
  const strokeWidth = isCompact ? 3 : 4;
  const radius = (circleSize - strokeWidth * 2) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (completionPercentage / 100) * circumference;

  const getProgressColor = () => {
    if (completionPercentage === 100) return '#10b981'; // green
    if (completionPercentage >= 70) return '#f59e0b'; // yellow
    if (completionPercentage >= 40) return '#3b82f6'; // blue
    return '#6b7280'; // gray
  };

  return (
    <>
      <div 
        className={`flex items-center gap-2 ${isCompact ? 'px-0' : 'px-4'}`}
        style={isCompact ? { 
          position: 'relative',
          right: '0',
          marginLeft: 'auto',
          display: 'flex',
          justifyContent: 'flex-end'
        } : {}}
      >
        {/* Progress Circle */}
        <div className="relative">
          <svg 
            width={circleSize} 
            height={circleSize} 
            className="transform -rotate-90"
          >
            {/* Background circle */}
            <circle
              cx={circleSize / 2}
              cy={circleSize / 2}
              r={radius}
              stroke="#e5e7eb"
              strokeWidth={strokeWidth}
              fill="none"
              className="opacity-20"
            />
            {/* Progress circle */}
            <circle
              cx={circleSize / 2}
              cy={circleSize / 2}
              r={radius}
              stroke={getProgressColor()}
              strokeWidth={strokeWidth}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-500 ease-in-out"
              style={{
                filter: completionPercentage === 100 ? 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.6))' : 'none'
              }}
            />
          </svg>
          
          {/* Center content */}
          <div className="absolute inset-0 flex items-center justify-center">
            {completionPercentage === 100 ? (
              <CheckCircle 
                className={`text-green-500 ${isCompact ? 'w-4 h-4' : 'w-6 h-6'}`}
              />
            ) : (
              <span className={`font-bold text-gray-700 ${isCompact ? 'text-xs' : 'text-sm'}`}>
                {completionPercentage}%
              </span>
            )}
          </div>
        </div>

        {/* Task info - only show on larger displays */}
        {!isCompact && (
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-700">
                Daily Tasks
              </span>
            </div>
            <span className="text-xs text-gray-500">
              {completedDailyTasks.length} of {totalDailyTasks} completed
            </span>
          </div>
        )}

        {/* Mobile info - compact version */}
        {isCompact && (
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-blue-500" />
            <span className="text-xs text-gray-600">
              {completedDailyTasks.length}/{totalDailyTasks}
            </span>
            {completionPercentage === 100 && (
              <Flame className="w-3 h-3 text-orange-500" />
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default DailyTasksProgress;
