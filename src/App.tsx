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
import { applyTheme, getThemeBackground } from './utils/themeUtils';
import {
  Calendar,
  CheckSquare,
  BookOpen,
  Target,
  Trophy,
  LogOut,
  Zap,
  Menu,
  X,
  Users,
  StickyNote,
  RotateCcw,
  ChevronDown
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
import InspirationalFigures from './components/InspirationalFigures';
import StickyNotesBoard from './components/StickyNotesBoard';
import RestoreMode from './components/RestoreMode';

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
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
        
        {/* Desktop Navigation - Enhanced Modern Bar Style with Increased Size */}
        <div className="desktop-navigation relative max-w-7xl mx-auto px-6 py-6 lg:py-8">
          <div className="flex items-center justify-between h-16 lg:h-20 xl:h-24">
            
            {/* Compact Logo Section */}
            <Link to="/dashboard" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 rounded-xl blur-sm opacity-50 group-hover:opacity-70 transition-opacity duration-300"></div>
                <div 
                  className="relative p-2 rounded-xl shadow-lg"
                  style={{ 
                    background: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 30%, #3b82f6 60%, #10b981 100%)',
                    boxShadow: '0 0 15px rgba(147, 51, 234, 0.4)'
                  }}
                >
                  <Target className="w-5 h-5 text-white drop-shadow-sm" />
                </div>
              </div>
              <span className="font-black text-xl text-white tracking-wide">StudyPartner</span>
            </Link>

            {/* Modern Navigation Bar - Enhanced Size for PC */}
            <div className="flex items-center gap-2 lg:gap-4">
              {/* Main Navigation Items - Horizontal Bar with Grouped Menus for PC */}
              <div 
                className="flex items-center gap-1 lg:gap-2 backdrop-blur-xl rounded-full px-3 lg:px-5 xl:px-6 py-2 lg:py-3 border-2"
                style={{ 
                  backgroundColor: 'rgba(10, 1, 24, 0.9)', 
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
                }}
              >
                {/* Individual Navigation Items */}
                {[
                  { path: '/tasks', icon: CheckSquare, label: 'Tasks', color: 'from-green-500 to-emerald-600' },
                  { path: '/calendar', icon: Calendar, label: 'Calendar', color: 'from-purple-500 to-pink-600' }
                ].map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`relative group flex items-center gap-2 lg:gap-3 px-4 lg:px-6 xl:px-8 py-3 lg:py-4 rounded-full transition-all duration-300 ${
                        active 
                          ? 'text-white shadow-lg border-2 border-white/30' 
                          : 'text-slate-300 hover:text-white border-2 border-transparent hover:border-blue-300/50'
                      }`}
                      style={{
                        backgroundColor: active ? 'rgba(59, 130, 246, 0.6)' : 'transparent',
                        boxShadow: active ? '0 0 20px rgba(59, 130, 246, 0.4)' : 'none'
                      }}
                      onMouseEnter={(e) => {
                        if (!active) {
                          e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.3)';
                          e.currentTarget.style.boxShadow = '0 0 15px rgba(59, 130, 246, 0.4)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!active) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.boxShadow = 'none';
                        }
                      }}
                    >
                      <Icon className="w-5 h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7 relative z-10 flex-shrink-0" />
                      <span className="relative z-10 font-semibold text-sm lg:text-base xl:text-lg whitespace-nowrap">
                        {item.label}
                      </span>
                    </Link>
                  );
                })}

                {/* Learning Menu Group */}
                <div className="relative group">
                  <button className="flex items-center gap-2 lg:gap-3 px-4 lg:px-6 xl:px-8 py-3 lg:py-4 rounded-full transition-all duration-300 text-slate-300 hover:text-white border-2 border-transparent hover:border-blue-300/50">
                    <BookOpen className="w-5 h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7 relative z-10 flex-shrink-0" />
                    <span className="relative z-10 font-semibold text-sm lg:text-base xl:text-lg whitespace-nowrap">Learning</span>
                    <ChevronDown className="w-4 h-4 lg:w-5 lg:h-5" />
                  </button>
                  
                  <div className="absolute top-full left-0 mt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                    <div className="bg-slate-800 rounded-lg shadow-xl border border-white/20 p-2">
                      <Link to="/knowledge" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors text-white">
                        <BookOpen className="w-4 h-4" />
                        Knowledge Base
                      </Link>
                      <Link to="/inspirational-figures" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors text-white">
                        <Users className="w-4 h-4" />
                        Inspirational Figures
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Progress Menu Group */}
                <div className="relative group">
                  <button className="flex items-center gap-2 lg:gap-3 px-4 lg:px-6 xl:px-8 py-3 lg:py-4 rounded-full transition-all duration-300 text-slate-300 hover:text-white border-2 border-transparent hover:border-blue-300/50">
                    <Trophy className="w-5 h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7 relative z-10 flex-shrink-0" />
                    <span className="relative z-10 font-semibold text-sm lg:text-base xl:text-lg whitespace-nowrap">Progress</span>
                    <ChevronDown className="w-4 h-4 lg:w-5 lg:h-5" />
                  </button>
                  
                  <div className="absolute top-full left-0 mt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                    <div className="bg-slate-800 rounded-lg shadow-xl border border-white/20 p-2">
                      <Link to="/achievements" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors text-white">
                        <Trophy className="w-4 h-4" />
                        Achievements
                      </Link>
                      <Link to="/challenges" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors text-white">
                        <Zap className="w-4 h-4" />
                        Goals
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Tools Menu Group */}
                <div className="relative group">
                  <button className="flex items-center gap-2 lg:gap-3 px-4 lg:px-6 xl:px-8 py-3 lg:py-4 rounded-full transition-all duration-300 text-slate-300 hover:text-white border-2 border-transparent hover:border-blue-300/50">
                    <StickyNote className="w-5 h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7 relative z-10 flex-shrink-0" />
                    <span className="relative z-10 font-semibold text-sm lg:text-base xl:text-lg whitespace-nowrap">Tools</span>
                    <ChevronDown className="w-4 h-4 lg:w-5 lg:h-5" />
                  </button>
                  
                  <div className="absolute top-full left-0 mt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                    <div className="bg-slate-800 rounded-lg shadow-xl border border-white/20 p-2">
                      <Link to="/sticky-notes" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors text-white">
                        <StickyNote className="w-4 h-4" />
                        Sticky Notes
                      </Link>
                      <Link to="/restore-mode" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors text-white">
                        <RotateCcw className="w-4 h-4" />
                        Restore Mode
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* User Actions Bar */}
              <div className="flex items-center gap-2 ml-4">
                {/* Profile Button */}
                <Link
                  to="/profile"
                  className={`group relative flex items-center gap-2 px-4 py-3 rounded-full transition-all duration-300 border-2 ${
                    isActive('/profile')
                      ? 'text-white shadow-lg border-white/30'
                      : 'text-slate-300 hover:text-white border-transparent hover:border-blue-300/50'
                  }`}
                  style={{
                    backgroundColor: isActive('/profile') ? 'rgba(59, 130, 246, 0.6)' : 'rgba(10, 1, 24, 0.7)',
                    boxShadow: isActive('/profile') ? '0 0 20px rgba(59, 130, 246, 0.4)' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive('/profile')) {
                      e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.3)';
                      e.currentTarget.style.boxShadow = '0 0 15px rgba(59, 130, 246, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive('/profile')) {
                      e.currentTarget.style.backgroundColor = 'rgba(10, 1, 24, 0.7)';
                      e.currentTarget.style.boxShadow = 'none';
                    }
                  }}
                >
                  <div className="relative">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg"
                      style={{ 
                        background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #06b6d4 100%)',
                        boxShadow: '0 0 15px rgba(59, 130, 246, 0.5)'
                      }}
                    >
                      {state?.settings?.avatar || '👤'}
                    </div>
                  </div>
                  <span className="relative z-10 font-semibold text-sm whitespace-nowrap">Profile</span>
                </Link>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="group relative flex items-center gap-2 px-4 py-3 rounded-full transition-all duration-300 text-slate-300 hover:text-red-300 border-2 border-transparent hover:border-red-400/50"
                  style={{ 
                    backgroundColor: 'rgba(10, 1, 24, 0.7)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(220, 38, 38, 0.3)';
                    e.currentTarget.style.boxShadow = '0 0 15px rgba(220, 38, 38, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(10, 1, 24, 0.7)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <LogOut className="w-5 h-5 relative z-10 flex-shrink-0" />
                  <span className="relative z-10 font-semibold text-sm whitespace-nowrap">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        <div className="mobile-navigation relative px-4 py-6">
          <div className="flex items-center justify-between">
            {/* Mobile Logo */}
            <Link to="/dashboard" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 rounded-xl blur-sm opacity-50 group-hover:opacity-70 transition-opacity duration-500"></div>
                <div 
                  className="relative p-2 rounded-xl shadow-lg"
                  style={{ 
                    background: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 30%, #3b82f6 60%, #10b981 100%)',
                    boxShadow: '0 0 15px rgba(147, 51, 234, 0.4)'
                  }}
                >
                  <Target className="w-5 h-5 text-white" />
                </div>
              </div>
              <span className="font-black text-lg text-white tracking-wide">StudyPartner</span>
            </Link>

            {/* Hamburger Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="relative p-2 rounded-xl backdrop-blur-xl border-2 transition-all duration-300"
              style={{
                backgroundColor: 'rgba(10, 1, 24, 0.8)',
                borderColor: 'rgba(255, 255, 255, 0.8)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)'
              }}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-white" />
              ) : (
                <Menu className="w-6 h-6 text-white" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="mobile-navigation fixed inset-0 z-50 overflow-hidden">
            {/* Solid Backdrop - Fixed transparency issue */}
            <div 
              className="absolute inset-0"
              style={{ 
                backgroundColor: 'rgba(10, 1, 24, 1)' // Fully opaque now
              }}
              onClick={closeMobileMenu}
            ></div>
            
            {/* Menu Content - Fixed alignment and made fully opaque */}
            <div 
              className="relative h-full overflow-y-auto"
              style={{ 
                backgroundColor: '#0a0118' // Solid background for menu content
              }}
            >
              <div className="flex flex-col min-h-full">
                {/* Header - Improved alignment */}
                <div className="flex items-center justify-between p-6 border-b border-white/20">
                  <div className="flex items-center gap-3">
                    <div 
                      className="p-2 rounded-xl"
                      style={{ 
                        background: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 30%, #3b82f6 60%, #10b981 100%)',
                      }}
                    >
                      <Target className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-black text-xl text-white">Menu</span>
                  </div>
                  <button
                    onClick={closeMobileMenu}
                    className="p-2 rounded-xl text-white hover:bg-white/10 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Menu Items - Updated with new pages */}
                <div className="flex-1 p-6">
                  <div className="space-y-3">
                    {[
                      { path: '/dashboard', icon: Target, label: 'Dashboard', color: 'from-blue-500 to-purple-600' },
                      { path: '/knowledge', icon: BookOpen, label: 'Knowledge Base', color: 'from-orange-500 to-red-500' },
                      { path: '/inspirational-figures', icon: Users, label: 'Inspirational Figures', color: 'from-indigo-500 to-blue-500' },
                      { path: '/tasks', icon: CheckSquare, label: 'Tasks', color: 'from-green-500 to-emerald-600' },
                      { path: '/calendar', icon: Calendar, label: 'Calendar', color: 'from-purple-500 to-pink-600' },
                      { path: '/achievements', icon: Trophy, label: 'Achievements', color: 'from-yellow-500 to-orange-500' },
                      { path: '/challenges', icon: Zap, label: 'Goals', color: 'from-indigo-500 to-purple-600' },
                      { path: '/sticky-notes', icon: StickyNote, label: 'Sticky Notes', color: 'from-amber-500 to-orange-500' },
                      { path: '/restore-mode', icon: RotateCcw, label: 'Restore Mode', color: 'from-red-500 to-pink-500' },
                      { path: '/profile', icon: Target, label: 'Profile', color: 'from-blue-500 to-cyan-500' }
                    ].map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.path);
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={closeMobileMenu}
                          className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 border ${
                            active 
                              ? 'text-white shadow-lg border-white/30' 
                              : 'text-slate-200 hover:text-white border-transparent hover:border-blue-300/50'
                          }`}
                          style={{
                            backgroundColor: active ? 'rgba(59, 130, 246, 0.8)' : 'rgba(30, 41, 59, 0.8)', // Fully opaque backgrounds
                            boxShadow: active ? '0 0 20px rgba(59, 130, 246, 0.4)' : 'none'
                          }}
                        >
                          <div className={`p-3 rounded-xl bg-gradient-to-r ${item.color} shadow-lg`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <span className="font-bold text-lg flex-1">{item.label}</span>
                          {active && (
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* Footer Actions - Improved alignment */}
                <div className="p-6 border-t border-white/20">
                  <button
                    onClick={() => {
                      handleLogout();
                      closeMobileMenu();
                    }}
                    className="w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-300 text-slate-200 hover:text-red-300 border border-transparent hover:border-red-400/50"
                    style={{
                      backgroundColor: 'rgba(220, 38, 38, 0.8)', // Fully opaque background
                      boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)'
                    }}
                  >
                    <div className="p-3 rounded-xl bg-gradient-to-r from-red-500 to-pink-600 shadow-lg">
                      <LogOut className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-lg">Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </nav>

      {/* Add top padding to prevent content overlap - smaller padding for modern bar */}
      <div className="mobile-nav-spacer"></div>
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
          <Route path="/inspirational-figures" element={<InspirationalFigures />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/challenges" element={<DailyChallenges />} />
          <Route path="/sticky-notes" element={<StickyNotesBoard />} />
          <Route path="/restore-mode" element={<RestoreMode />} />
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