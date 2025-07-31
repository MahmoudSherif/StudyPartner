import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import {
  Calendar,
  CheckSquare,
  BookOpen,
  Target,
  Heart,
  Trophy,
  Image
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import TaskManager from './components/TaskManager';
import CalendarView from './components/CalendarView';
import KnowledgeBase from './components/KnowledgeBase';
import MoodTracker from './components/MoodTracker';
import Achievements from './components/Achievements';
import NatureGallery from './components/NatureGallery';
import QuotesBar from './components/QuotesBar';

const Navigation: React.FC = () => {
  const location = useLocation();
  const { state } = useApp();

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

  return (
    <nav className="nav-glass shadow-2xl border-b border-purple-500/20">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-24">
          {/* Logo Section */}
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl">🚀</span>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              Student Hub
            </h1>
          </div>

          {/* Desktop Navigation - Single Buttons */}
          <div className="hidden lg:flex flex-row space-x-6 overflow-x-auto">
            {navItems.map((item) => (
              <div key={item.path} className="flex-shrink-0 border-2 border-purple-400 rounded-2xl p-1 bg-gradient-to-r from-purple-500/20 to-blue-500/20">
                <Link
                  to={item.path}
                  className={`block px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 bg-black/50 backdrop-blur-md shadow-lg whitespace-nowrap ${
                    isActive(item.path)
                      ? `${item.bgColor} ${item.textColor} shadow-xl`
                      : 'text-gray-300 hover:text-white hover:bg-white/20'
                  }`}
                >
                  {item.label}
                </Link>
              </div>
            ))}
          </div>


        </div>


      </div>
    </nav>
  );
};

const AppContent: React.FC = () => {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="min-h-screen">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
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
        <QuotesBar />
      </div>
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App; 