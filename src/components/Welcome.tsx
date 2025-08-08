import React from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckSquare, 
  Calendar, 
  BookOpen, 
  Trophy, 
  Zap, 
  Target,
  ArrowRight,
  Star,
  Clock,
  Users,
  TrendingUp,
  Sparkles
} from 'lucide-react';

const Welcome: React.FC = () => {
  const features = [
    {
      icon: CheckSquare,
      title: 'Smart Task Management',
      description: 'Organize your tasks with intelligent prioritization, deadlines, and progress tracking. Never miss an important assignment again.',
      image: '📝',
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-50',
      link: '/tasks'
    },
    {
      icon: Calendar,
      title: 'Intelligent Calendar',
      description: 'Schedule your study sessions, exams, and deadlines with our smart calendar system that adapts to your learning patterns.',
      image: '📅',
      color: 'from-purple-500 to-violet-600',
      bgColor: 'bg-purple-50',
      link: '/calendar'
    },
    {
      icon: BookOpen,
      title: 'Knowledge Base',
      description: 'Build your personal learning library with notes, resources, and study materials organized by subjects and topics.',
      image: '📚',
      color: 'from-orange-500 to-amber-600',
      bgColor: 'bg-orange-50',
      link: '/knowledge'
    },
    {
      icon: Trophy,
      title: 'Achievement System',
      description: 'Earn badges, track your progress, and celebrate milestones as you complete goals and maintain study streaks.',
      image: '🏆',
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'bg-yellow-50',
      link: '/achievements'
    },
    {
      icon: Zap,
      title: 'Daily Challenges',
      description: 'Stay motivated with daily study challenges, streak tracking, and gamified learning experiences.',
      image: '⚡',
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-50',
      link: '/challenges'
    },
    {
      icon: Target,
      title: 'Progress Dashboard',
      description: 'Monitor your learning journey with detailed analytics, progress charts, and personalized insights.',
      image: '🎯',
      color: 'from-teal-500 to-cyan-600',
      bgColor: 'bg-teal-50',
      link: '/dashboard'
    }
  ];

  const stats = [
    { icon: Users, value: '10K+', label: 'Active Students' },
    { icon: Clock, value: '1M+', label: 'Study Hours' },
    { icon: TrendingUp, value: '85%', label: 'Success Rate' },
    { icon: Star, value: '4.9', label: 'User Rating' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full opacity-20 animate-pulse animation-delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-green-400 to-blue-400 rounded-full opacity-10 animate-spin-slow"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
          {/* Main Title */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-white/40">
              <Sparkles className="text-purple-500" size={20} />
              <span className="text-gray-700 font-medium">Welcome to the Future of Learning</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
              StudyPartner
            </h1>
            
            <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Your intelligent companion for academic success. Organize, learn, and achieve your goals with our comprehensive study management platform.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              to="/tasks"
              className="group inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
            >
              Get Started
              <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
            </Link>
            
            <Link
              to="/knowledge"
              className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm text-gray-700 px-8 py-4 rounded-xl font-semibold shadow-lg border border-gray-200 hover:bg-white hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
            >
              Explore Features
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/40">
                <stat.icon className="text-indigo-600 mx-auto mb-3" size={28} />
                <div className="text-2xl font-bold text-gray-800 mb-1">{stat.value}</div>
                <div className="text-gray-600 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover the powerful features that make StudyPartner the perfect companion for your academic journey.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 border border-gray-100"
              >
                {/* Feature Image */}
                <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-200`}>
                  <span className="text-2xl">{feature.image}</span>
                </div>

                {/* Feature Content */}
                <h3 className="text-xl font-bold text-gray-800 mb-4 group-hover:text-indigo-600 transition-colors">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {feature.description}
                </p>

                {/* Feature Link */}
                <Link
                  to={feature.link}
                  className="inline-flex items-center gap-2 text-indigo-600 font-semibold hover:text-indigo-700 group-hover:gap-3 transition-all"
                >
                  Explore Feature
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="py-20 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Studies?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of students who have already elevated their academic performance with StudyPartner.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/dashboard"
              className="group inline-flex items-center gap-2 bg-white text-indigo-600 px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
            >
              Start Your Journey
              <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="py-8 bg-gray-50 text-center">
        <p className="text-gray-600">
          Built with ❤️ for students who aspire to achieve more
        </p>
      </div>
    </div>
  );
};

export default Welcome;
