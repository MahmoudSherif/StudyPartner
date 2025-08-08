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
  Trophy,
  LogOut,
  Zap
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import Welcome from './components/Welcome';
import TaskManager from './components/TaskManager';
import CalendarView from './components/CalendarView';
import KnowledgeBase from './components/KnowledgeBase';
import Achievements from './components/Achievements';
import NatureGallery from './components/NatureGallery';
import QuotesBar from './components/QuotesBar';
import DailyChallenges from './components/DailyChallenges';
import UserProfile from './components/UserProfile';
import DailyTasksProgress from './components/DailyTasksProgress';

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
      path: '/dashboard', 
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
      path: '/challenges', 
      icon: Zap, 
      label: 'Challenges', 
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-700'
    },
    { 
      path: '/achievements', 
      icon: Trophy, 
      label: 'Achievements', 
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-700'
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
      {/* Enhanced Header with Navigation Tabs - Mobile Optimized */}
      <nav 
        className="backdrop-blur-md border-b border-white/10 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 shadow-lg safe-area-inset-top text-gray-100"
        style={{ background: theme.colors.headerGradient }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Left Section - Logo/Brand */}
          <div className="flex items-center gap-3">
            <div className="brand-logo w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-lg">
              <Target className="text-white" size={18} />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-white font-bold text-lg">StudyPartner</h1>
              <p className="text-white/80 text-xs">Your Learning Hub</p>
            </div>
          </div>

          {/* Center Section - Navigation Tabs */}
          <div className="top-nav-tabs flex items-center gap-1 sm:gap-2 bg-white/10 backdrop-blur-sm rounded-xl p-1 border border-white/20 flex-1 max-w-md justify-center">
            {/* Learn Tab */}
            <Link
              to="/knowledge"
              className={`top-nav-tab flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 touch-manipulation ${
                isActive('/knowledge') 
                  ? 'active bg-white/20 text-white shadow-lg backdrop-blur-sm' 
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <BookOpen size={16} />
              <span className="font-medium text-sm">Learn</span>
            </Link>
          </div>
          
          {/* Right Section - User Menu */}
          <div className="flex items-center gap-2">
            {/* Dashboard Button */}
            <Link 
              to="/dashboard"
              aria-label="Go to Dashboard"
              className={`user-menu-item flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 touch-manipulation ${
                isActive('/dashboard') 
                  ? 'bg-white/20 text-white' 
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <Target size={16} />
              <span className="header-label text-sm font-medium">Dashboard</span>
            </Link>
            
            {/* Profile Button */}
            <Link 
              to="/profile"
              aria-label="Open Profile"
              className="user-menu-item flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 touch-manipulation text-white/80 hover:text-white hover:bg-white/10"
              title={state.settings.username}
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 p-0.5">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-sm">
                  {state.settings.avatar}
                </div>
              </div>
              <span className="header-label text-sm font-medium">Profile</span>
            </Link>
            
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              aria-label="Sign out"
              className="exit-btn user-menu-item flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 touch-manipulation bg-white text-black border border-black/20 hover:bg-white/90"
            >
              <LogOut size={16} />
              <span className="header-label text-sm font-medium">Exit</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Enhanced Mobile Bottom Navigation - Optimized for All Screen Sizes */}
      <div 
        className="fixed bottom-0 left-0 right-0 z-[999998] backdrop-blur-xl border-t shadow-2xl safe-area-inset-bottom text-white"
        style={{ 
          background: 'rgba(15, 23, 42, 0.85)',
          borderColor: 'rgba(255, 255, 255, 0.15)'
        }}
      >
        <div className="flex max-w-full mx-auto px-0.5 py-1 sm:px-2 sm:py-2 gap-0.5 sm:gap-1 overflow-x-auto scrollbar-hide">
          {navItems.slice(1).filter(item => item.path !== '/knowledge').map((item) => { // Exclude Dashboard and Knowledge
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center gap-0.5 px-0.5 sm:px-2 py-2 rounded-lg transition-all duration-200 touch-manipulation min-h-[46px] sm:min-h-[52px] relative flex-shrink-0 ${
                  active 
                    ? 'scale-105 z-10 bg-white/10' 
                    : 'hover:bg-white/10 active:bg-white/20 active:scale-95'
                }`}
                style={{ 
                  WebkitTapHighlightColor: 'transparent',
                  minWidth: 'calc(100vw / 4.5)',
                  maxWidth: 'calc(100vw / 3.5)'
                }}
              >
                {/* Active indicator */}
                {active && (
                  <div 
                    className="absolute top-1 left-1/2 transform -translate-x-1/2 w-4 sm:w-8 h-0.5 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400"
                  />
                )}
                <Icon size={14} className="flex-shrink-0 sm:size-4" />
                <span 
                  className="bottom-nav-label text-[8px] sm:text-xs font-semibold leading-tight text-center overflow-hidden text-ellipsis"
                  style={{ 
                    color: active ? '#c7d2fe' : 'rgba(255,255,255,0.85)',
                    maxWidth: '100%',
                    display: '-webkit-box',
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: 'vertical'
                  }}
                >
                  <span className="mobile-short hidden">{
                    item.label === 'Achievements' ? 'Awards' :
                    item.label === 'Challenges' ? 'Goals' :
                    item.label === 'Knowledge' ? 'Learn' :
                    item.label
                  }</span>
                  <span className="mobile-full">{item.label}</span>
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
        <div className="min-h-dvh safe-area-inset bg-slate-900 text-gray-100">
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
      className="min-h-dvh safe-area-inset text-gray-100"
      style={{ background: themeBackground }}
    >
      <Navigation />
      
      {/* Daily Tasks Progress - appears below navigation on all pages */}
      <div className="bg-slate-800/30 border-b border-white/10 backdrop-blur-sm">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-2">
          <div className="flex justify-end">
            <DailyTasksProgress isCompact={true} />
          </div>
        </div>
      </div>
      
      <main className="container mx-auto px-3 sm:px-4 lg:px-6 py-2 sm:py-4 lg:py-8 pb-20 sm:pb-24 lg:pb-32 max-w-full overflow-x-hidden">
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tasks" element={<TaskManager />} />
          <Route path="/calendar" element={<CalendarView />} />
          <Route path="/knowledge" element={<KnowledgeBase />} />
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