import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { format } from 'date-fns';
import { 
  Star, 
  TrendingUp, 
  Calendar, 
  Trophy,
  Settings,
  User,
  Zap,
  Target,
  Coins,
  Crown,
  Edit3,
  Save,
  X
} from 'lucide-react';
import { getRarityColor } from '../utils/gamificationEngine';
import { themes, getThemeGradient } from '../utils/themeUtils';

const UserProfile: React.FC = () => {
  const { state, updateSettings } = useApp();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [tempUsername, setTempUsername] = useState(state.settings.username);
  const [tempAvatar, setTempAvatar] = useState(state.settings.avatar);

  const avatarOptions = ['🎯', '🚀', '⭐', '🎮', '🔥', '💎', '👑', '🌟', '⚡', '🎪', '🎨', '🎭'];

  const handleSaveProfile = () => {
    updateSettings({
      username: tempUsername,
      avatar: tempAvatar
    });
    setIsEditingProfile(false);
  };

  const handleCancelEdit = () => {
    setTempUsername(state.settings.username);
    setTempAvatar(state.settings.avatar);
    setIsEditingProfile(false);
  };

  const progressToNextLevel = (state.userStats.level.currentXP / (state.userStats.level.currentXP + state.userStats.level.xpToNext)) * 100;

  const recentAchievements = state.achievements
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const statsCards = [
    {
      icon: Target,
      label: 'Tasks Completed',
      value: state.userStats.totalTasksCompleted,
      color: 'text-green-600 bg-green-100'
    },
    {
      icon: TrendingUp,
      label: 'Current Streak',
      value: state.streak.current,
      color: 'text-orange-600 bg-orange-100'
    },
    {
      icon: Trophy,
      label: 'Achievements',
      value: state.achievements.length,
      color: 'text-yellow-600 bg-yellow-100'
    },
    {
      icon: Calendar,
      label: 'Days Active',
      value: Math.floor((new Date().getTime() - new Date(state.userStats.joinedDate).getTime()) / (1000 * 60 * 60 * 24)),
      color: 'text-purple-600 bg-purple-100'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="card relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-10"
          style={{ background: getThemeGradient(state.settings.theme) }}
        ></div>
        
        <div className="relative">
          <div className="flex items-start gap-6">
            {/* Avatar and Basic Info */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 p-1 shadow-lg">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-4xl">
                    {isEditingProfile ? tempAvatar : state.settings.avatar}
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                  LV {state.userStats.level.level}
                </div>
              </div>
              
              {!isEditingProfile && (
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="mt-2 text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1 text-sm"
                >
                  <Edit3 size={14} />
                  Edit
                </button>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1">
              {isEditingProfile ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                    <input
                      type="text"
                      value={tempUsername}
                      onChange={(e) => setTempUsername(e.target.value)}
                      className="input"
                      placeholder="Enter username"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Avatar</label>
                    <div className="grid grid-cols-6 gap-2">
                      {avatarOptions.map((avatar) => (
                        <button
                          key={avatar}
                          onClick={() => setTempAvatar(avatar)}
                          className={`w-10 h-10 rounded-lg border-2 text-xl hover:scale-110 transition-all ${
                            tempAvatar === avatar 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {avatar}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveProfile}
                      className="btn bg-green-600 text-white hover:bg-green-700 flex items-center gap-1"
                    >
                      <Save size={16} />
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="btn btn-secondary flex items-center gap-1"
                    >
                      <X size={16} />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <h1 className="text-2xl font-bold text-gray-800 mb-1">{state.settings.username}</h1>
                  <p className="text-lg text-blue-600 font-medium mb-2 flex items-center gap-2">
                    <Crown size={20} />
                    {state.userStats.level.title}
                  </p>
                  <p className="text-gray-600 text-sm">
                    Member since {format(new Date(state.userStats.joinedDate), 'MMMM do, yyyy')}
                  </p>
                </div>
              )}
            </div>

            {/* Coins */}
            <div className="text-right">
              <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full shadow-lg">
                <span className="text-xl">🪙</span>
                <span className="font-bold text-lg">{state.coins}</span>
              </div>
              <p className="text-xs text-gray-600 mt-1">MotiveCoins</p>
            </div>
          </div>
        </div>
      </div>

      {/* Level Progress */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Zap className="text-yellow-500" size={20} />
          Level Progress
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-800">Level {state.userStats.level.level}</div>
              <div className="text-sm text-gray-600">{state.userStats.level.title}</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-blue-600">{state.userStats.totalXP.toLocaleString()} XP</div>
              <div className="text-sm text-gray-600">{state.userStats.level.xpToNext} to next level</div>
            </div>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className="h-full transition-all duration-1000 ease-out"
              style={{ 
                background: getThemeGradient(state.settings.theme),
                width: `${progressToNextLevel}%` 
              }}
            ></div>
          </div>
          
          <div className="text-center text-sm text-gray-600">
            {progressToNextLevel.toFixed(1)}% to Level {state.userStats.level.level + 1}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="card text-center">
              <div className={`inline-flex p-3 rounded-full ${stat.color} mb-3`}>
                <Icon size={24} />
              </div>
              <div className="text-2xl font-bold text-gray-800 mb-1">
                {stat.value.toLocaleString()}
              </div>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Achievements */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Trophy className="text-yellow-500" size={20} />
          Recent Achievements
        </h2>
        
        {recentAchievements.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Trophy size={48} className="mx-auto text-gray-400 mb-2" />
            <p>No achievements yet!</p>
            <p className="text-sm">Start completing tasks to earn your first achievement.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentAchievements.map((achievement) => (
              <div key={achievement.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl">{achievement.icon || '🏆'}</div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800">{achievement.title}</h3>
                  <p className="text-sm text-gray-600">{achievement.description}</p>
                </div>
                <div className="text-right">
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${getRarityColor(achievement.rarity)}`}>
                    {achievement.rarity}
                  </div>
                  <div className="text-sm text-blue-600 font-medium">+{achievement.points} XP</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Theme Settings */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Settings className="text-gray-600" size={20} />
          Theme Settings
        </h2>
        
        <div className="grid grid-cols-1 gap-3">
          {Object.values(themes).map((theme) => (
            <button
              key={theme.id}
              onClick={() => updateSettings({ theme: theme.id as any })}
              className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                state.settings.theme === theme.id 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div 
                className="w-8 h-8 rounded-full shadow-md"
                style={{ background: theme.colors.gradient }}
              ></div>
              <span className="font-medium">{theme.name}</span>
              {state.settings.theme === theme.id && (
                <Star size={16} className="text-blue-500 ml-auto" />
              )}
            </button>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Current theme:</span> {themes[state.settings.theme]?.name || 'Default'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Themes change the color scheme throughout the app including headers, backgrounds, and progress bars.
          </p>
        </div>
      </div>

      {/* App Settings */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">App Settings</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Notifications</h3>
              <p className="text-sm text-gray-600">Get notified about streaks and achievements</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={state.settings.notifications}
                onChange={(e) => updateSettings({ notifications: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Sound Effects</h3>
              <p className="text-sm text-gray-600">Play sounds for achievements and completions</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={state.settings.soundEffects}
                onChange={(e) => updateSettings({ soundEffects: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile; 