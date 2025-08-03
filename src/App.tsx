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
import {
  Calendar,
  CheckSquare,
  BookOpen,
  Target,
  Heart,
  Trophy,
  Image,
  LogOut
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import TaskManager from './components/TaskManager';
import CalendarView from './components/CalendarView';
import KnowledgeBase from './components/KnowledgeBase';
import MoodTracker from './components/MoodTracker';
import Achievements from './components/Achievements';
import NatureGallery from './components/NatureGallery';
import QuotesBar from './components/QuotesBar';

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

const Navigation: React.FC = () => {
  const location = useLocation();
  const { state } = useApp();
  const { currentUser, logout } = useAuth();

  const navItems = [
    { 
      path: '/', 
      icon: Target, 
      label: 'Dashboard', 
      count: state.tasks.filter(t => !t.completed).length,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700'
    },
    { 
      path: '/tasks', 
      icon: CheckSquare, 
      label: 'Tasks', 
      count: state.tasks.length,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700'
    },
    { 
      path: '/calendar', 
      icon: Calendar, 
      label: 'Calendar', 
      count: state.importantDates.length,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700'
    },
    { 
      path: '/knowledge', 
      icon: BookOpen, 
      label: 'Knowledge', 
      count: state.questions.length,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700'
    },
    { 
      path: '/mood', 
      icon: Heart, 
      label: 'Mood', 
      count: state.moodEntries.length,
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50',
      textColor: 'text-pink-700'
    },
    { 
      path: '/achievements', 
      icon: Trophy, 
      label: 'Achievements', 
      count: state.achievements.length,
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-700'
    },
    { 
      path: '/nature', 
      icon: Image, 
      label: 'Nature', 
      count: 0,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-700'
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
    <nav className="bg-black/20 backdrop-blur-md border-b border-white/10 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link to="/" className="text-2xl font-bold text-white">
            MotiveMate
          </Link>
          <div className="hidden md:flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    active
                      ? 'bg-white/20 text-white shadow-lg'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon size={18} />
                  <span className="font-medium">{item.label}</span>
                  {item.count > 0 && (
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      active ? 'bg-white/30' : 'bg-white/20'
                    }`}>
                      {item.count}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <span className="text-gray-300 hidden sm:block">
            {currentUser.email}
          </span>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-white/10"
          >
            <LogOut size={18} />
            <span className="hidden sm:block">Logout</span>
          </button>
        </div>
      </div>
    </nav>
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
                <QuotesBar />
                <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
                  <Navigation />
                  <main className="container mx-auto px-4 py-8" style={{ paddingBottom: '100px' }}>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/tasks" element={<TaskManager />} />
                      <Route path="/calendar" element={<CalendarView />} />
                      <Route path="/knowledge" element={<KnowledgeBase />} />
                      <Route path="/mood" element={<MoodTracker />} />
                      <Route path="/achievements" element={<Achievements />} />
                      <Route path="/nature" element={<NatureGallery />} />
                    </Routes>
                  </main>
                </div>
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