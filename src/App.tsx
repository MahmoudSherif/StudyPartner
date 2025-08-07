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
      {/* Enhanced Header with User Info - Mobile Optimized */}
      <nav 
        className="backdrop-blur-md border-b border-white/10 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 shadow-lg safe-area-inset-top"
        style={{ background: theme.colors.headerGradient }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          {/* User Stats - Mobile Responsive */}
          <div className="flex items-center gap-1 sm:gap-2 lg:gap-4">
            {/* Level Badge - Always visible but smaller on mobile */}
            <div className="flex items-center gap-1 sm:gap-2 bg-white/10 backdrop-blur-sm px-2 sm:px-3 py-1 sm:py-2 rounded-full border border-white/20">
              <Crown className="text-yellow-300" size={14} />
              <span className="text-white font-semibold text-xs sm:text-sm">
                Lv.{state.userStats.level.level}
              </span>
            </div>

            {/* XP Display - Hidden on mobile, shown on larger screens */}
            <div className="hidden md:flex items-center gap-2 bg-white/10 backdrop-blur-sm px-2 sm:px-3 py-1 sm:py-2 rounded-full border border-white/20">
              <Zap className="text-blue-300" size={16} />
              <span className="text-white font-semibold text-sm">
                {state.userStats.totalXP.toLocaleString()} XP
              </span>
            </div>

            {/* Coins - Smaller on mobile */}
            <div className="flex items-center gap-1 sm:gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 px-2 sm:px-3 py-1 sm:py-2 rounded-full shadow-lg">
              <span className="text-sm sm:text-base">🪙</span>
              <span className="text-white font-bold text-xs sm:text-sm">
                {state.coins}
              </span>
            </div>

            {/* Streak - Smaller on mobile */}
            <div className="flex items-center gap-1 sm:gap-2 bg-white/10 backdrop-blur-sm px-2 sm:px-3 py-1 sm:py-2 rounded-full border border-white/20">
              <span className="text-sm sm:text-base">🔥</span>
              <span className="text-white font-semibold text-xs sm:text-sm">
                {state.streak.current}
              </span>
            </div>
          </div>
          
          {/* User Menu - Mobile Optimized */}
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="text-gray-200 hidden lg:block text-sm mr-2">
              {state.settings.username}
            </span>
            
            {/* Dashboard Button - Mobile Optimized */}
            <Link 
              to="/"
              className={`flex flex-col items-center space-y-0.5 sm:space-y-1 hover:scale-105 transition-transform mr-2 sm:mr-4 touch-manipulation ${
                isActive('/') ? 'text-yellow-300' : 'text-gray-200 hover:text-white'
              }`}
            >
              <span className="text-xs">Dashboard</span>
              <Target size={14} className="sm:size-4" />
            </Link>
            
            {/* Avatar with Profile text - Mobile Optimized */}
            <Link 
              to="/profile"
              className="flex flex-col items-center space-y-0.5 sm:space-y-1 hover:scale-105 transition-transform mr-2 sm:mr-4 touch-manipulation"
            >
              <span className="text-gray-200 text-xs">Profile</span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 p-0.5">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-base sm:text-lg lg:text-xl">
                  {state.settings.avatar}
                </div>
              </div>
            </Link>
            
            <button
              onClick={handleLogout}
              className="flex items-center justify-center space-x-1 transition-colors duration-200 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg shadow-lg min-w-fit whitespace-nowrap min-h-[36px] sm:min-h-[40px] touch-manipulation"
              style={{
                backgroundColor: '#000000',
                borderColor: '#000000',
                borderWidth: '2px',
                borderStyle: 'solid',
                color: '#ffffff',
                fontWeight: 'bold'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#333333';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#000000';
              }}
            >
              <LogOut size={12} className="sm:size-[14px] lg:size-[16px]" />
              <span className="text-xs sm:text-sm font-bold">EXIT</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Enhanced Mobile Bottom Navigation - Optimized for All Screen Sizes */}
      <div 
        className="fixed bottom-0 left-0 right-0 z-[999998] backdrop-blur-xl border-t shadow-2xl safe-area-inset-bottom"
        style={{ 
          background: getThemeBackground(state.settings.theme).replace('to bottom right', 'to top').replace('linear-gradient', 'linear-gradient') + ', rgba(255, 255, 255, 0.9)',
          borderColor: 'rgba(255, 255, 255, 0.3)'
        }}
      >
        <div className="flex max-w-full mx-auto px-1 py-1 sm:px-2 sm:py-2 overflow-x-auto scrollbar-hide">
          {navItems.slice(1).map((item) => { // Exclude Dashboard (index 0) but include all others
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center px-1 sm:px-2 py-2 rounded-lg transition-all duration-200 touch-manipulation min-h-[48px] sm:min-h-[56px] relative min-w-0 flex-1 ${
                  active 
                    ? 'scale-105' 
                    : 'hover:bg-white/30 active:bg-white/40 active:scale-95'
                }`}
                style={{ 
                  WebkitTapHighlightColor: 'transparent',
                  minWidth: 'calc(100vw / 7)', // Ensure minimum width for 7 items (6 nav + potential overflow)
                  ...(active ? {
                    background: `linear-gradient(135deg, rgba(79, 70, 229, 0.15), rgba(99, 102, 241, 0.15))`,
                    color: '#4f46e5',
                    boxShadow: '0 2px 8px rgba(79, 70, 229, 0.3)'
                  } : {
                    color: 'rgba(0, 0, 0, 0.7)'
                  })
                }}
              >
                {/* Active indicator */}
                {active && (
                  <div 
                    className="absolute top-1 left-1/2 transform -translate-x-1/2 w-6 h-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                  />
                )}
                
                <Icon size={16} className="sm:size-5 mb-0.5 sm:mb-1 flex-shrink-0" />
                <span 
                  className="text-[10px] sm:text-xs font-medium leading-tight text-center whitespace-nowrap overflow-hidden text-ellipsis w-full"
                  style={{ 
                    maxWidth: '100%',
                    fontSize: window.innerWidth < 350 ? '9px' : window.innerWidth < 400 ? '10px' : '11px'
                  }}
                >
                  {window.innerWidth < 350 
                    ? item.label.length > 5 ? item.label.slice(0, 4) + '…' : item.label
                    : window.innerWidth < 400
                    ? item.label.length > 7 ? item.label.slice(0, 6) + '…' : item.label
                    : item.label
                  }
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
        <div className="min-h-dvh safe-area-inset">
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
      className="min-h-dvh safe-area-inset"
      style={{ background: themeBackground }}
    >
      <Navigation />
      <main className="container mx-auto px-3 sm:px-4 lg:px-6 py-2 sm:py-4 lg:py-8 pb-20 sm:pb-24 lg:pb-32 max-w-full overflow-x-hidden">
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