import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import ErrorBoundary from './components/ErrorBoundary';
import OfflineIndicator from './components/OfflineIndicator';
import { shouldResetStreak, resetStreak } from './utils/streakCalculator';
import { applyTheme, getThemeBackground, getTheme } from './utils/themeUtils';
import {
  Calendar,
  CheckSquare,
  BookOpen,
  Target,
  Heart,
  Trophy,
  LogOut,
  Zap,
  Crown
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import TaskManager from './components/TaskManager';
import CalendarView from './components/CalendarView';
import KnowledgeBase from './components/KnowledgeBase';
import MoodTracker from './components/MoodTracker';
import Achievements from './components/Achievements';
import NatureGallery from './components/NatureGallery';
import QuotesBar from './components/QuotesBar';
import DailyChallenges from './components/DailyChallenges';
import UserProfile from './components/UserProfile';

// Component to check and reset streak on app load
const StreakChecker: React.FC = () => {
  const { state, updateStreak } = useApp();

  useEffect(() => {
    if (state.streak && shouldResetStreak(state.streak)) {
      console.log('Resetting streak due to missed days');
      const resetStreakData = resetStreak(state.streak);
      updateStreak(resetStreakData);
    }
  }, []); // Only run on mount

  return null;
};

// Theme applier component
const ThemeApplier: React.FC = () => {
  const { state } = useApp();
  
  useEffect(() => {
    // Apply theme when it changes
    applyTheme(state.settings.theme);
  }, [state.settings.theme]);

  return null;
};

const Navigation: React.FC = () => {
  const location = useLocation();
  const { state } = useApp();
  const { currentUser, logout } = useAuth();
  const theme = getTheme(state.settings.theme);

  const navItems = [
    { 
      path: '/', 
      icon: Target, 
      label: 'Dashboard', 
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700'
    },
    { 
      path: '/tasks', 
      icon: CheckSquare, 
      label: 'Tasks', 
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700'
    },
    { 
      path: '/calendar', 
      icon: Calendar, 
      label: 'Calendar', 
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700'
    },
    { 
      path: '/knowledge', 
      icon: BookOpen, 
      label: 'Knowledge', 
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700'
    },
    { 
      path: '/mood', 
      icon: Heart, 
      label: 'Mood', 
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50',
      textColor: 'text-pink-700'
    },
    { 
      path: '/achievements', 
      icon: Trophy, 
      label: 'Achievements', 
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-700'
    },
    { 
      path: '/challenges', 
      icon: Zap, 
      label: 'Challenges', 
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-700'
    },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (!currentUser) return null;

  return (
    <>
      {/* Enhanced Header with User Info */}
      <nav 
        className="backdrop-blur-md border-b border-white/10 px-3 sm:px-6 py-3 sm:py-4 shadow-lg"
        style={{ background: theme.colors.headerGradient }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          {/* User Stats - Hidden on small mobile, compact on medium */}
          <div className="hidden sm:flex items-center gap-3 lg:gap-6">
            {/* Level Badge */}
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-2 lg:px-3 py-1 lg:py-2 rounded-full border border-white/20">
              <Crown className="text-yellow-300" size={16} />
              <span className="text-white font-semibold text-sm">
                Lv.{state.userStats.level.level}
              </span>
            </div>

            {/* XP Display - Hidden on medium, shown on large */}
            <div className="hidden lg:flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-full border border-white/20">
              <Zap className="text-blue-300" size={18} />
              <span className="text-white font-semibold">
                {state.userStats.totalXP.toLocaleString()} XP
              </span>
            </div>

            {/* Coins */}
            <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 px-2 lg:px-3 py-1 lg:py-2 rounded-full shadow-lg">
              <span className="text-base lg:text-lg">🪙</span>
              <span className="text-white font-bold text-sm lg:text-base">
                {state.coins}
              </span>
            </div>

            {/* Streak */}
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-2 lg:px-3 py-1 lg:py-2 rounded-full border border-white/20">
              <span className="text-base lg:text-lg">🔥</span>
              <span className="text-white font-semibold text-sm lg:text-base">
                {state.streak.current}
              </span>
            </div>
          </div>
          
          {/* User Menu */}
          <div className="flex items-center">
            <span className="text-gray-200 hidden lg:block text-sm mr-8">
              {state.settings.username}
            </span>
            
            {/* Dashboard Button */}
            <Link 
              to="/"
              className={`flex flex-col items-center space-y-1 hover:scale-105 transition-transform mr-8 ${
                isActive('/') ? 'text-yellow-300' : 'text-gray-200 hover:text-white'
              }`}
            >
              <Target size={20} />
              <span className="text-xs">Dashboard</span>
            </Link>
            
            {/* Avatar with Profile text */}
            <Link 
              to="/profile"
              className="flex flex-col items-center space-y-1 hover:scale-105 transition-transform mr-12"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 p-0.5">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-lg sm:text-xl">
                  {state.settings.avatar}
                </div>
              </div>
              <span className="text-gray-200 text-xs">Profile</span>
            </Link>
            
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 sm:space-x-2 text-gray-100 hover:text-gray-300 transition-colors duration-200 px-3 sm:px-4 py-2 sm:py-3 rounded-lg bg-gray-800 hover:bg-gray-900 border-2 border-gray-700 shadow-lg"
            >
              <LogOut size={16} className="sm:size-[18px]" />
              <span className="hidden sm:block text-sm font-bold">EXIT</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Vertical Navigation for Other Tabs */}
      <div 
        className="fixed bottom-0 left-0 right-0 z-[999998] backdrop-blur-xl border-t shadow-2xl"
        style={{ 
          background: getThemeBackground(state.settings.theme).replace('to bottom right', 'to top').replace('linear-gradient', 'linear-gradient') + ', rgba(255, 255, 255, 0.8)',
          borderColor: 'rgba(255, 255, 255, 0.3)'
        }}
      >
        <div className="flex flex-col max-w-sm mx-auto px-2 py-1 space-y-0">
          {navItems.slice(1).map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            const theme = getTheme(state.settings.theme);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-200 touch-manipulation ${
                  active 
                    ? 'border-l-4' 
                    : 'hover:bg-white/30 active:bg-white/40'
                }`}
                style={{ 
                  WebkitTapHighlightColor: 'transparent',
                  ...(active ? {
                    background: `linear-gradient(to right, ${theme.colors.primary}20, ${theme.colors.secondary}20)`,
                    color: theme.colors.primary,
                    borderLeftColor: theme.colors.primary
                  } : {
                    color: 'rgba(0, 0, 0, 0.7)'
                  })
                }}
              >
                <Icon size={18} />
                <span className="text-sm font-medium">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
};

const AppContent: React.FC = () => {
  return (
    <AuthProvider>
      <AppProvider>
        <div className="min-h-screen">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/*" element={
              <ProtectedRoute>
                <StreakChecker />
                <ThemeApplier />
                <QuotesBar />
                <ThemedMainContent />
              </ProtectedRoute>
            } />
          </Routes>
          {/* Security Components */}
          <OfflineIndicator />
        </div>
      </AppProvider>
    </AuthProvider>
  );
};

const ThemedMainContent: React.FC = () => {
  const { state } = useApp();
  const themeBackground = getThemeBackground(state.settings.theme);

  return (
    <div 
      className="min-h-screen"
      style={{ background: themeBackground }}
    >
      <Navigation />
      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 pb-56 max-w-full overflow-x-hidden">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tasks" element={<TaskManager />} />
          <Route path="/calendar" element={<CalendarView />} />
          <Route path="/knowledge" element={<KnowledgeBase />} />
          <Route path="/mood" element={<MoodTracker />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/challenges" element={<DailyChallenges />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/nature" element={<NatureGallery />} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AppContent />
      </Router>
    </ErrorBoundary>
  );
}

export default App; 