import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { format } from 'date-fns';
import { 
  Trophy,
  Star,
  Target,
  TrendingUp,
  Calendar,
  Award
} from 'lucide-react';

const Achievements: React.FC = () => {
  const { state } = useApp();
  const [filter, setFilter] = useState<'all' | 'task' | 'streak' | 'milestone'>('all');

  const filteredAchievements = state.achievements
    .filter(achievement => filter === 'all' || achievement.type === filter)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalPoints = state.achievements.reduce((sum, achievement) => sum + achievement.points, 0);
  const achievementCount = state.achievements.length;
  const recentAchievements = state.achievements
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  const getAchievementIcon = (type: string) => {
    switch (type) {
      case 'task': return <Target size={24} />;
      case 'streak': return <TrendingUp size={24} />;
      case 'milestone': return <Star size={24} />;
      default: return <Trophy size={24} />;
    }
  };

  const getAchievementColor = (type: string) => {
    switch (type) {
      case 'task': return 'bg-green-100 text-green-800';
      case 'streak': return 'bg-blue-100 text-blue-800';
      case 'milestone': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMotivationalMessage = () => {
    if (achievementCount === 0) {
      return "Start your journey! Every achievement begins with a single step.";
    } else if (achievementCount < 5) {
      return "Great start! You're building momentum. Keep going!";
    } else if (achievementCount < 10) {
      return "Impressive progress! You're developing excellent habits.";
    } else if (achievementCount < 20) {
      return "Outstanding! You're becoming a productivity master!";
    } else {
      return "Incredible! You're an inspiration to others!";
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Achievements</h1>
        <p className="text-gray-600">{getMotivationalMessage()}</p>
      </div>

      {/* Achievement Stats */}
      <div className="grid grid-3 gap-4">
        <div className="card text-center">
          <div className="text-3xl mb-2">🏆</div>
          <div className="text-2xl font-bold text-yellow-600 mb-2">
            {achievementCount}
          </div>
          <p className="text-sm text-gray-600">Total Achievements</p>
        </div>

        <div className="card text-center">
          <div className="text-3xl mb-2">⭐</div>
          <div className="text-2xl font-bold text-blue-600 mb-2">
            {totalPoints}
          </div>
          <p className="text-sm text-gray-600">Total Points</p>
        </div>

        <div className="card text-center">
          <div className="text-3xl mb-2">🔥</div>
          <div className="text-2xl font-bold text-orange-600 mb-2">
            {state.streak.current}
          </div>
          <p className="text-sm text-gray-600">Current Streak</p>
        </div>
      </div>

      {/* Filter */}
      <div className="card">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">Filter by:</span>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="input"
          >
            <option value="all">All Achievements</option>
            <option value="task">Task Achievements</option>
            <option value="streak">Streak Achievements</option>
            <option value="milestone">Milestone Achievements</option>
          </select>
          
          <div className="text-sm text-gray-600">
            {filteredAchievements.length} achievement{filteredAchievements.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Achievements List */}
      <div className="space-y-4">
        {filteredAchievements.length === 0 ? (
          <div className="card text-center py-12">
            <Trophy size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              {filter === 'all' ? 'No achievements yet' : `No ${filter} achievements yet`}
            </h3>
            <p className="text-gray-500">
              {filter === 'all' 
                ? 'Complete tasks and build streaks to earn achievements!' 
                : `Keep working on ${filter} activities to earn achievements!`
              }
            </p>
          </div>
        ) : (
          filteredAchievements.map((achievement) => (
            <div key={achievement.id} className="achievement">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-full ${getAchievementColor(achievement.type)}`}>
                  {getAchievementIcon(achievement.type)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold">{achievement.title}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">+{achievement.points} pts</span>
                      <span className={`badge ${getAchievementColor(achievement.type)}`}>
                        {achievement.type}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-sm opacity-90 mb-2">{achievement.description}</p>
                  
                  <div className="flex items-center gap-2 text-xs opacity-75">
                    <Calendar size={12} />
                    {format(new Date(achievement.date), 'MMM do, yyyy')}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Recent Achievements Highlight */}
      {recentAchievements.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Award size={20} />
            Recent Achievements
          </h2>
          <div className="grid grid-2 gap-4">
            {recentAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-full ${getAchievementColor(achievement.type)}`}>
                    {getAchievementIcon(achievement.type)}
                  </div>
                  <div>
                    <h3 className="font-medium">{achievement.title}</h3>
                    <p className="text-sm text-gray-600">+{achievement.points} points</p>
                  </div>
                </div>
                <p className="text-sm text-gray-700">{achievement.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Achievement Tips */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">How to Earn More Achievements</h2>
        <div className="grid grid-2 gap-4">
          <div>
            <h3 className="font-medium mb-2 flex items-center gap-2">
              <Target size={16} />
              Task Achievements
            </h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Complete daily tasks consistently</li>
              <li>• Finish high-priority tasks on time</li>
              <li>• Complete multiple tasks in a day</li>
              <li>• Maintain task completion streaks</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium mb-2 flex items-center gap-2">
              <TrendingUp size={16} />
              Streak Achievements
            </h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Complete tasks for consecutive days</li>
              <li>• Build longer and longer streaks</li>
              <li>• Don't break your momentum</li>
              <li>• Celebrate milestone streaks</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Achievements; 