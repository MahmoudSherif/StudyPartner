import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Login from './components/Auth/Login.responsive';
import Signup from './components/Auth/Signup.responsive';
import ErrorBoundary from './components/ErrorBoundary';
import OfflineIndicator from './components/OfflineIndicator';
import { shouldResetStreak, resetStreak } from './utils/streakCalculator';
import { applyTheme, getThemeBackground } from './utils/themeUtils';
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
      {/* Enhanced Space Galaxy Navigation */}
      <nav 
        className="fixed top-0 left-0 right-0 z-[999999] backdrop-blur-xl border-b-8 shadow-2xl"
        style={{ 
          backgroundColor: '#0a0118',
          borderBottomColor: '#ffffff',
          borderBottomWidth: '6px',
          backgroundImage: `
            radial-gradient(4px 4px at 20px 30px, #ffffff, transparent),
            radial-gradient(3px 3px at 40px 70px, #e879f9, transparent),
            radial-gradient(2px 2px at 90px 40px, #3b82f6, transparent),
            radial-gradient(3px 3px at 140px 80px, #10b981, transparent),
            radial-gradient(2px 2px at 180px 30px, #f59e0b, transparent),
            radial-gradient(4px 4px at 200px 60px, #ec4899, transparent),
            radial-gradient(2px 2px at 240px 85px, #ffffff, transparent),
            radial-gradient(3px 3px at 60px 20px, #8b5cf6, transparent),
            radial-gradient(1px 1px at 160px 10px, #06b6d4, transparent),
            radial-gradient(2px 2px at 100px 90px, #ffffff, transparent)
          `,
          backgroundRepeat: 'repeat',
          backgroundSize: '280px 140px'
        }}
      >
        <div 
          className="absolute inset-0" 
          style={{ 
            background: 'linear-gradient(135deg, #0a0118 0%, #1a1a2e 20%, #16213e 40%, #0f172a 60%, #1e293b 80%, #334155 100%)',
            opacity: 0.75
          }}
        ></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="flex items-center justify-between h-24 sm:h-28 lg:h-32">
            
            {/* Premium Logo Section */}
            <Link to="/dashboard" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 rounded-2xl blur-lg opacity-50 group-hover:opacity-70 transition-opacity duration-500"></div>
                <div 
                  className="relative p-3 rounded-2xl shadow-lg"
                  style={{ 
                    background: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 30%, #3b82f6 60%, #10b981 100%)',
                    boxShadow: '0 0 25px rgba(147, 51, 234, 0.4)'
                  }}
                >
                  <Target className="w-6 h-6 text-white drop-shadow-sm" />
                </div>
              </div>
              <div className="flex items-center gap-4 sm:gap-6">
                <span className="font-bold text-xl sm:text-2xl text-white tracking-wide">Home</span>
                <div className="hidden sm:block">
                  <h1 
                    className="text-3xl sm:text-4xl font-black leading-none"
                    style={{
                      background: 'linear-gradient(45deg, #ffffff 0%, #e879f9 25%, #9333ea 50%, #3b82f6 75%, #10b981 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      textShadow: '0 0 25px rgba(147, 51, 234, 0.6)'
                    }}
                  >
                    StudyPartner
                  </h1>
                  <div className="flex items-center gap-3 mt-1">
                    <div 
                      className="w-2 h-2 rounded-full animate-pulse"
                      style={{ 
                        background: 'radial-gradient(circle, #e879f9 0%, #9333ea 50%, #3b82f6 100%)',
                        boxShadow: '0 0 12px rgba(232, 121, 249, 0.8)'
                      }}
                    ></div>
                    <span 
                      className="text-sm sm:text-base font-medium tracking-wider"
                      style={{ color: '#c084fc' }}
                    >
                      COSMIC LEARNING 🌌
                    </span>
                  </div>
                </div>
              </div>
            </Link>

            {/* Unified Navigation Menu */}
            <div className="flex items-center gap-3 sm:gap-6">
              {/* Main Navigation Items */}
              <div 
                className="flex flex-wrap items-center gap-4 sm:gap-6 lg:gap-8 backdrop-blur-xl rounded-full p-6 sm:p-8 lg:p-10 border-4"
                style={{ 
                  backgroundColor: 'rgba(10, 1, 24, 0.8)', 
                  borderColor: 'rgba(255, 255, 255, 0.8)',
                  boxShadow: '0 6px 30px rgba(255, 255, 255, 0.2)'
                }}
              >
                {[
                  { path: '/knowledge', icon: BookOpen, label: 'Learning', color: 'from-orange-500 to-red-500', galaxyColor: 'from-pink-500 to-purple-600' },
                  { path: '/tasks', icon: CheckSquare, label: 'Tasks', color: 'from-green-500 to-emerald-600', galaxyColor: 'from-emerald-400 to-cyan-500' },
                  { path: '/calendar', icon: Calendar, label: 'Calendar', color: 'from-purple-500 to-pink-600', galaxyColor: 'from-violet-500 to-fuchsia-500' },
                  { path: '/achievements', icon: Trophy, label: 'Achievements', color: 'from-yellow-500 to-orange-500', galaxyColor: 'from-amber-400 to-orange-500' },
                  { path: '/challenges', icon: Zap, label: 'Goals', color: 'from-indigo-500 to-purple-600', galaxyColor: 'from-indigo-500 to-purple-700' }
                ].map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`relative group flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 px-4 sm:px-8 lg:px-12 py-6 sm:py-8 lg:py-10 rounded-2xl transition-all duration-300 overflow-hidden border-4 ${
                        active 
                          ? 'shadow-2xl scale-105 text-white border-white' 
                          : 'text-slate-200 hover:text-white hover:scale-105 border-white hover:border-blue-300'
                      }`}
                      style={{
                        backgroundColor: active ? 'rgba(59, 130, 246, 0.4)' : 'rgba(10, 1, 24, 0.8)',
                        boxShadow: active ? '0 0 40px rgba(59, 130, 246, 0.6)' : '0 4px 12px rgba(0, 0, 0, 0.5)',
                        borderColor: active ? '#ffffff' : 'rgba(255, 255, 255, 0.8)',
                        minWidth: '120px'
                      }}
                      onMouseEnter={(e) => {
                        if (!active) {
                          e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.3)';
                          e.currentTarget.style.boxShadow = '0 0 35px rgba(59, 130, 246, 0.5)';
                          e.currentTarget.style.borderColor = '#93c5fd';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!active) {
                          e.currentTarget.style.backgroundColor = 'rgba(10, 1, 24, 0.8)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.5)';
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.8)';
                        }
                      }}
                    >
                      {active && (
                        <>
                          <div className={`absolute inset-0 bg-gradient-to-r ${item.galaxyColor} opacity-20 rounded-2xl`}></div>
                          <div className={`absolute inset-0 bg-gradient-to-r ${item.galaxyColor} opacity-10 rounded-2xl blur-md`}></div>
                        </>
                      )}
                      <Icon className={`w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 relative z-10 flex-shrink-0 ${active ? 'drop-shadow-2xl' : ''}`} />
                      <span className="relative z-10 font-black text-lg sm:text-xl lg:text-3xl xl:text-4xl tracking-wide text-center sm:text-left whitespace-nowrap">
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
              </div>

              {/* Separate User Actions */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                {/* Profile Button */}
                <Link
                  to="/profile"
                  className={`group relative flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 px-4 sm:px-8 lg:px-12 py-6 sm:py-8 lg:py-10 rounded-2xl transition-all duration-300 overflow-hidden border-4 ${
                    isActive('/profile')
                      ? 'shadow-2xl text-white scale-105 border-white'
                      : 'text-slate-200 hover:text-white hover:scale-105 border-white hover:border-blue-300'
                  }`}
                  style={{
                    backgroundColor: isActive('/profile') ? 'rgba(59, 130, 246, 0.4)' : 'rgba(10, 1, 24, 0.8)',
                    boxShadow: isActive('/profile') ? '0 0 40px rgba(59, 130, 246, 0.6)' : '0 4px 12px rgba(0, 0, 0, 0.5)',
                    borderColor: isActive('/profile') ? '#ffffff' : 'rgba(255, 255, 255, 0.8)',
                    minWidth: '120px'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive('/profile')) {
                      e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.3)';
                      e.currentTarget.style.boxShadow = '0 0 35px rgba(59, 130, 246, 0.5)';
                      e.currentTarget.style.borderColor = '#93c5fd';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive('/profile')) {
                      e.currentTarget.style.backgroundColor = 'rgba(10, 1, 24, 0.8)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.5)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.8)';
                    }
                  }}
                >
                  {isActive('/profile') && (
                    <>
                      <div 
                        className="absolute inset-0 rounded-2xl"
                        style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)' }}
                      ></div>
                      <div 
                        className="absolute inset-0 rounded-2xl blur-md"
                        style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
                      ></div>
                    </>
                  )}
                  <div className="relative">
                    <div 
                      className="absolute inset-0 rounded-full blur-lg opacity-50 group-hover:opacity-70 transition-opacity duration-300"
                      style={{ backgroundColor: '#3b82f6' }}
                    ></div>
                    <div 
                      className="relative w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-full flex items-center justify-center text-white text-xl sm:text-2xl lg:text-3xl font-black shadow-2xl"
                      style={{ 
                        background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #06b6d4 100%)',
                        boxShadow: '0 0 25px rgba(59, 130, 246, 0.7)'
                      }}
                    >
                      {state.settings.avatar}
                    </div>
                  </div>
                  <span className="relative z-10 font-black text-lg sm:text-xl lg:text-3xl xl:text-4xl tracking-wide text-center sm:text-left whitespace-nowrap">Profile</span>
                </Link>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="group relative flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 px-4 sm:px-8 lg:px-12 py-6 sm:py-8 lg:py-10 rounded-2xl transition-all duration-300 overflow-hidden text-slate-200 hover:text-red-300 hover:scale-105 border-4 border-white hover:border-red-400"
                  style={{ 
                    backgroundColor: 'rgba(10, 1, 24, 0.8)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
                    borderColor: 'rgba(255, 255, 255, 0.8)',
                    minWidth: '120px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(220, 38, 38, 0.3)';
                    e.currentTarget.style.boxShadow = '0 0 35px rgba(220, 38, 38, 0.5)';
                    e.currentTarget.style.borderColor = '#f87171';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(10, 1, 24, 0.8)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.5)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.8)';
                  }}
                >
                  <LogOut className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 relative z-10 flex-shrink-0" />
                  <span className="relative z-10 font-black text-lg sm:text-xl lg:text-3xl xl:text-4xl tracking-wide text-center sm:text-left whitespace-nowrap">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Add top padding to prevent content overlap */}
      <div className="h-48 sm:h-56 lg:h-64"></div>
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