import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { format } from 'date-fns';
import { 
  Trophy,
  Star,
  Target,
  TrendingUp,
  Calendar,
  Award,
  Lock,
  CheckCircle2,
  Zap,
  Crown,
  Filter
} from 'lucide-react';
import { getRarityColor, getRarityBorder } from '../utils/gamificationEngine';

const Achievements: React.FC = () => {
  const { state } = useApp();
  const [filter, setFilter] = useState<'all' | 'task' | 'streak' | 'milestone' | 'daily-challenge' | 'social' | 'special'>('all');
  const [rarityFilter, setRarityFilter] = useState<'all' | 'common' | 'rare' | 'epic' | 'legendary'>('all');
  const [showUnlocked, setShowUnlocked] = useState<'all' | 'unlocked' | 'locked'>('all');

  const unlockedAchievements = state.achievements.filter(a => a.unlocked);
  const lockedAchievements = state.availableAchievements.filter(a => 
    !state.achievements.some(unlocked => unlocked.id === a.id)
  );

  const allAchievements = [...unlockedAchievements, ...lockedAchievements];

  const filteredAchievements = allAchievements
    .filter(achievement => filter === 'all' || achievement.type === filter)
    .filter(achievement => rarityFilter === 'all' || achievement.rarity === rarityFilter)
    .filter(achievement => {
      if (showUnlocked === 'unlocked') return achievement.unlocked;
      if (showUnlocked === 'locked') return !achievement.unlocked;
      return true;
    })
    .sort((a, b) => {
      // Sort by unlocked status first, then by rarity, then by date
      if (a.unlocked !== b.unlocked) {
        return a.unlocked ? -1 : 1;
      }
      
      const rarityOrder = { legendary: 4, epic: 3, rare: 2, common: 1 };
      const rarityDiff = rarityOrder[b.rarity] - rarityOrder[a.rarity];
      if (rarityDiff !== 0) return rarityDiff;
      
      if (a.unlocked && b.unlocked) {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      
      return 0;
    });

  const totalPoints = unlockedAchievements.reduce((sum, achievement) => sum + achievement.points, 0);
  const achievementCount = unlockedAchievements.length;
  const totalAchievements = state.availableAchievements.length;
  const completionPercentage = (achievementCount / totalAchievements) * 100;

  const rarityStats = {
    common: unlockedAchievements.filter(a => a.rarity === 'common').length,
    rare: unlockedAchievements.filter(a => a.rarity === 'rare').length,
    epic: unlockedAchievements.filter(a => a.rarity === 'epic').length,
    legendary: unlockedAchievements.filter(a => a.rarity === 'legendary').length,
  };

  const getAchievementIcon = (type: string) => {
    switch (type) {
      case 'task': return <Target size={24} />;
      case 'streak': return <TrendingUp size={24} />;
      case 'milestone': return <Star size={24} />;
      case 'daily-challenge': return <Zap size={24} />;
      case 'special': return <Crown size={24} />;
      default: return <Trophy size={24} />;
    }
  };

  const getAchievementTypeColor = (type: string) => {
    switch (type) {
      case 'task': return 'bg-green-100 text-green-800';
      case 'streak': return 'bg-orange-100 text-orange-800';
      case 'milestone': return 'bg-purple-100 text-purple-800';
      case 'daily-challenge': return 'bg-yellow-100 text-yellow-800';
      case 'special': return 'bg-pink-100 text-pink-800';
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
        <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
          <Trophy className="text-yellow-500" size={32} />
          Achievements
        </h1>
        <p className="text-gray-600 mb-4">{getMotivationalMessage()}</p>
      </div>

      {/* Achievement Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <div className="text-3xl mb-2">🏆</div>
          <div className="text-2xl font-bold text-yellow-600 mb-2">
            {achievementCount}
          </div>
          <p className="text-sm text-gray-600">Unlocked</p>
        </div>

        <div className="card text-center">
          <div className="text-3xl mb-2">⭐</div>
          <div className="text-2xl font-bold text-blue-600 mb-2">
            {totalPoints}
          </div>
          <p className="text-sm text-gray-600">Total Points</p>
        </div>

        <div className="card text-center">
          <div className="text-3xl mb-2">📊</div>
          <div className="text-2xl font-bold text-green-600 mb-2">
            {completionPercentage.toFixed(1)}%
          </div>
          <p className="text-sm text-gray-600">Complete</p>
        </div>

        <div className="card text-center">
          <div className="text-3xl mb-2">🔥</div>
          <div className="text-2xl font-bold text-orange-600 mb-2">
            {state.streak.current}
          </div>
          <p className="text-sm text-gray-600">Current Streak</p>
        </div>
      </div>

      {/* Rarity Breakdown */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Crown className="text-purple-500" size={20} />
          Rarity Collection
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">{rarityStats.common}</div>
            <div className="text-sm text-gray-500">Common</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{rarityStats.rare}</div>
            <div className="text-sm text-blue-500">Rare</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{rarityStats.epic}</div>
            <div className="text-sm text-purple-500">Epic</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{rarityStats.legendary}</div>
            <div className="text-sm text-yellow-500">Legendary</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex items-center gap-4 mb-4">
          <Filter size={20} className="text-gray-600" />
          <span className="text-lg font-medium text-gray-700">Filters</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="input"
            >
              <option value="all">All Types</option>
              <option value="task">Task Achievements</option>
              <option value="streak">Streak Achievements</option>
              <option value="milestone">Milestone Achievements</option>
              <option value="daily-challenge">Daily Challenge</option>
              <option value="special">Special Achievements</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rarity</label>
            <select
              value={rarityFilter}
              onChange={(e) => setRarityFilter(e.target.value as any)}
              className="input"
            >
              <option value="all">All Rarities</option>
              <option value="common">Common</option>
              <option value="rare">Rare</option>
              <option value="epic">Epic</option>
              <option value="legendary">Legendary</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={showUnlocked}
              onChange={(e) => setShowUnlocked(e.target.value as any)}
              className="input"
            >
              <option value="all">All Achievements</option>
              <option value="unlocked">Unlocked Only</option>
              <option value="locked">Locked Only</option>
            </select>
          </div>
        </div>
        
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredAchievements.length} achievement{filteredAchievements.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAchievements.length === 0 ? (
          <div className="col-span-2 card text-center py-12">
            <Trophy size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              No achievements found
            </h3>
            <p className="text-gray-500">
              Try adjusting your filters to see more achievements.
            </p>
          </div>
        ) : (
          filteredAchievements.map((achievement) => {
            const isLocked = !achievement.unlocked;
            
            return (
              <div 
                key={achievement.id} 
                className={`card relative overflow-hidden transition-all duration-300 ${
                  isLocked 
                    ? 'opacity-70 grayscale hover:grayscale-0 hover:opacity-100' 
                    : 'hover:shadow-lg'
                } ${getRarityBorder(achievement.rarity)} border-2`}
              >
                {/* Rarity Glow Effect */}
                {!isLocked && (
                  <div className={`absolute inset-0 ${getRarityColor(achievement.rarity).split(' ')[1]} opacity-5`}></div>
                )}
                
                <div className="relative">
                  <div className="flex items-start gap-4">
                    {/* Achievement Icon */}
                    <div className={`p-3 rounded-full ${
                      isLocked 
                        ? 'bg-gray-200 text-gray-400' 
                        : getRarityColor(achievement.rarity)
                    } relative`}>
                      {isLocked ? <Lock size={24} /> : getAchievementIcon(achievement.type)}
                    </div>

                    {/* Achievement Details */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-semibold flex items-center gap-2">
                            {achievement.title}
                            {!isLocked && <CheckCircle2 size={20} className="text-green-500" />}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRarityColor(achievement.rarity)}`}>
                              {achievement.rarity}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAchievementTypeColor(achievement.type)}`}>
                              {achievement.type}
                            </span>
                          </div>
                        </div>
                        
                        {!isLocked && (
                          <div className="text-right">
                            <div className="text-lg font-bold text-blue-600">+{achievement.points}</div>
                            <div className="text-xs text-gray-500">XP</div>
                          </div>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-700 mb-3">
                        {achievement.description}
                      </p>
                      
                      {!isLocked && achievement.date && (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Calendar size={12} />
                          Unlocked on {format(new Date(achievement.date), 'MMM do, yyyy')}
                        </div>
                      )}

                      {achievement.icon && !isLocked && (
                        <div className="absolute top-2 right-2 text-2xl">
                          {achievement.icon}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Special Effects for Legendary Achievements */}
                {achievement.rarity === 'legendary' && !isLocked && (
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent animate-pulse"></div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Achievement Tips */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Star className="text-yellow-500" size={20} />
          How to Earn More Achievements
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <Target size={16} />
              Task Achievements
            </h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                Complete daily tasks consistently
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                Finish high-priority tasks on time
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                Complete multiple tasks in a day
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <TrendingUp size={16} />
              Streak & Special Achievements
            </h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                Maintain daily completion streaks
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                Complete daily challenges
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                Track mood and add knowledge regularly
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Achievements; 