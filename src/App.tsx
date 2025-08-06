import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import ErrorBoundary from './components/ErrorBoundary';
import OfflineIndicator from './components/OfflineIndicator';
import { shouldResetStreak, resetStreak } from './utils/streakCalculator';
import { applyTheme, getThemeBackground, getHeaderGradient } from './utils/themeUtils';
import {
  Calendar,
  CheckSquare,
  BookOpen,
  Target,
  Heart,
  Trophy,
  Image,
  LogOut,
  Zap,
  User,
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
    { 
      path: '/profile', 
      icon: User, 
      label: 'Profile', 
      color: 'from-gray-500 to-gray-600',
      bgColor: 'bg-gray-50',
      textColor: 'text-gray-700'
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

  const headerGradient = getHeaderGradient(state.settings.theme);

  return (
    <>
      {/* Enhanced Header with User Info */}
      <nav 
        className="backdrop-blur-md border-b border-white/10 px-3 sm:px-6 py-3 sm:py-4 shadow-lg"
        style={{ background: headerGradient }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo - Responsive */}
          <Link to="/" className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Target className="text-yellow-300" size={24} />
            <span className="hidden min-[360px]:block">MotiveMate</span>
            <span className="min-[360px]:hidden">MM</span>
          </Link>
          
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
          <div className="flex items-center space-x-2 sm:space-x-4">
            <span className="text-gray-200 hidden lg:block text-sm">
              {state.settings.username}
            </span>
            
            {/* Avatar */}
            <Link 
              to="/profile"
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 p-0.5 hover:scale-105 transition-transform"
            >
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-lg sm:text-xl">
                {state.settings.avatar}
              </div>
            </Link>
            
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 sm:space-x-2 text-gray-200 hover:text-white transition-colors duration-200 px-2 sm:px-3 py-1 sm:py-2 rounded-lg hover:bg-white/10"
            >
              <LogOut size={16} className="sm:size-[18px]" />
              <span className="hidden sm:block text-sm">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE-RESPONSIVE Bottom Navigation - NO SPACES */}
      <div className="fixed bottom-16 sm:bottom-20 left-0 right-0 z-[999998] bg-white/95 backdrop-blur-xl border-t border-gray-200 shadow-2xl">
        <div className="flex">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center flex-1 h-12 sm:h-14 md:h-16 transition-all duration-200 touch-manipulation ${
                  active 
                    ? 'bg-gradient-to-t from-blue-50 to-purple-50 text-blue-600' 
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50 active:bg-gray-100'
                } ${index > 0 ? 'border-l border-gray-200' : ''}`}
                style={{ minHeight: '48px', WebkitTapHighlightColor: 'transparent' }}
              >
                <Icon size={12} className="sm:size-[14px] md:size-[16px] mb-1" />
                <span className="text-[6px] xs:text-[7px] sm:text-[8px] md:text-[9px] font-medium leading-tight text-center">
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
      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 pb-24 sm:pb-36 max-w-full overflow-x-hidden">
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