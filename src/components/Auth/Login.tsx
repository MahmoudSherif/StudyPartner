import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle, ArrowLeft, Star, Zap, Target, Sparkles, Crown, ArrowRight } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState('');
  const { login, resetPassword } = useAuth();
  const navigate = useNavigate();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('Email is required');
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (password: string) => {
    if (!password) {
      setPasswordError('Password is required');
      return false;
    }
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (value && emailError) {
      validateEmail(value);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    if (value && passwordError) {
      validatePassword(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    
    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate('/');
    } catch (error: any) {
      const errorMessage = error.message.toLowerCase();
      if (errorMessage.includes('user-not-found')) {
        setError('No account found with this email address');
      } else if (errorMessage.includes('wrong-password')) {
        setError('Incorrect password');
      } else if (errorMessage.includes('invalid-email')) {
        setError('Invalid email address');
      } else if (errorMessage.includes('too-many-requests')) {
        setError('Too many failed attempts. Please try again later');
      } else {
        setError('Failed to sign in. Please check your credentials');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setResetError('');
      setResetLoading(true);
      await resetPassword(resetEmail);
      setResetSuccess(true);
    } catch (error: any) {
      const errorMessage = error.message.toLowerCase();
      if (errorMessage.includes('user-not-found')) {
        setResetError('No account found with this email address');
      } else if (errorMessage.includes('invalid-email')) {
        setResetError('Invalid email address');
      } else {
        setResetError('Failed to send password reset email. Please try again.');
      }
    } finally {
      setResetLoading(false);
    }
  };

  const closeForgotPassword = () => {
    setShowForgotPassword(false);
    setResetEmail('');
    setResetError('');
    setResetSuccess(false);
  };

  // Features data copied from Welcome (only required properties)
  const features = [
    {
      title: 'Smart Task Management',
      description: 'Organize your tasks with intelligent prioritization, deadlines, and progress tracking. Never miss an important assignment again.',
      image: '📝',
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-50',
      link: '/tasks'
    },
    {
      title: 'Intelligent Calendar',
      description: 'Schedule your study sessions, exams, and deadlines with our smart calendar system that adapts to your learning patterns.',
      image: '📅',
      color: 'from-purple-500 to-violet-600',
      bgColor: 'bg-purple-50',
      link: '/calendar'
    },
    {
      title: 'Achievement System',
      description: 'Earn badges, track your progress, and celebrate milestones as you complete goals and maintain study streaks.',
      image: '🏆',
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'bg-yellow-50',
      link: '/achievements'
    },
    {
      title: 'Daily Challenges',
      description: 'Stay motivated with daily study challenges, streak tracking, and gamified learning experiences.',
      image: '⚡',
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-50',
      link: '/challenges'
    }
  ];

  return (
    <div className="relative min-h-screen text-gray-100">
      {/* Background copied from Welcome */}
      <div
        className="absolute inset-0 -z-10"
        aria-hidden="true"
        style={{
          backgroundColor: '#0f172a',
          backgroundImage:
            'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'800\' height=\'800\' viewBox=\'0 0 800 800\'><rect width=\'800\' height=\'800\' fill=\'%230f172a\'/><g fill=\'%23ffffff\' fill-opacity=\'0.06\' font-family=\'monospace\' font-size=\'28\'><text x=\'40\' y=\'60\'>∑</text><text x=\'120\' y=\'140\'>π</text><text x=\'200\' y=\'220\'>∫</text><text x=\'280\' y=\'300\'>E=mc²</text><text x=\'360\' y=\'380\'>f(x)=ax²+bx+c</text><text x=\'80\' y=\'360\'>A+</text><text x=\'460\' y=\'160\'>Δ</text><text x=\'540\' y=\'240\'>√x</text><text x=\'620\' y=\'320\'>logₙx</text><text x=\'700\' y=\'400\'>∞</text><text x=\'80\' y=\'440\'>≈</text><text x=\'140\' y=\'520\'>⚕</text><text x=\'220\' y=\'600\'>✚</text><text x=\'300\' y=\'680\'>♥</text><text x=\'380\' y=\'520\'>⚗</text><text x=\'460\' y=\'600\'>⚛</text><text x=\'540\' y=\'680\'>⚕</text><text x=\'620\' y=\'520\'>✚</text></g></svg>")',
          backgroundRepeat: 'repeat',
          backgroundSize: '800px 800px',
          backgroundAttachment: 'fixed',
        }}
      />
      <div className="absolute inset-0 -z-10 bg-black/60" aria-hidden="true" />

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-12 sm:pt-16 lg:pt-20 pb-10 sm:pb-14 lg:pb-16">
          {/* Grid */}
          <div className="grid lg:grid-cols-2 gap-6 sm:gap-10 lg:gap-12 items-center">
            {/* Left Column - Text Content (from Welcome) */}
            <div className="text-center lg:text-left">
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full shadow-lg border border-white/20">
                  <Sparkles className="text-purple-300" size={20} />
                  <span className="text-white font-medium">Welcome to the Future of Learning</span>
                </div>
                
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
                  StudyPartner
                </h1>
                
                <p className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto lg:mx-0 leading-relaxed mb-8">
                  Your intelligent companion for academic success. Organize, learn, and achieve your goals with our comprehensive study management platform.
                </p>
              </div>
            </div>

            {/* Right Column - Login Card */}
            <div className="relative">
              {!showForgotPassword ? (
                <div 
                  className="max-w-md w-full mx-auto backdrop-blur-2xl rounded-2xl sm:rounded-3xl lg:rounded-[2rem] shadow-[0_20px_40px_-8px_rgba(59,130,246,0.3)] sm:shadow-[0_25px_80px_-12px_rgba(59,130,246,0.4)] p-4 sm:p-6 md:p-8 lg:p-10 border border-white/20 bg-white/5"
                >
                  {/* Logo and Title Section */}
                  <div className="text-center mb-6 sm:mb-8">
                    <div className="relative inline-block mb-4 sm:mb-6">
                      <div 
                        className="relative inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full shadow-[0_0_30px_rgba(59,130,246,0.6)]"
                        style={{
                          background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 50%, #1E40AF 100%)',
                          boxShadow: '0 0 30px rgba(59, 130, 246, 0.6), 0 0 60px rgba(29, 78, 216, 0.4), inset 0 0 15px rgba(255, 255, 255, 0.2)'
                        }}
                      >
                        <Target className="w-10 h-10 text-white" />
                      </div>
                    </div>
                    <h1 
                      className="text-2xl md:text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent"
                    >
                      Welcome Back
                    </h1>
                    <p className="text-gray-300 text-sm md:text-base">Sign in to continue your journey</p>
                  </div>

                  {/* Error Display */}
                  {error && (
                    <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50/10 backdrop-blur-sm border border-red-400/30 rounded-xl">
                      <p className="text-red-200 text-sm sm:text-base flex items-start font-medium">
                        <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" />
                        <span>{error}</span>
                      </p>
                    </div>
                  )}

                  {/* Login Form */}
                  <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                    {/* Email */}
                    <div>
                      <label className="block text-sm sm:text-base font-semibold text-gray-100 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          value={email}
                          onChange={handleEmailChange}
                          className="w-full bg-white text-gray-800 border border-gray-200 rounded-xl py-3 sm:py-4 px-4 sm:px-5 pl-10 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                          placeholder="you@example.com"
                          disabled={loading}
                          required
                          style={{ fontSize: '16px' }}
                        />
                        <Mail className="absolute left-3 sm:left-4 top-3.5 sm:top-4.5 w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                        {email && !emailError && (
                          <CheckCircle className="absolute right-3 sm:right-4 top-3.5 sm:top-4.5 w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                        )}
                      </div>
                      {emailError && (
                        <p className="mt-1.5 text-xs sm:text-sm text-red-300 flex items-start gap-1.5 font-medium">
                          <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 mt-0.5" />
                          <span>{emailError}</span>
                        </p>
                      )}
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-sm sm:text-base font-semibold text-gray-100 mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={handlePasswordChange}
                          className="w-full bg-white text-gray-800 border border-gray-200 rounded-xl py-3 sm:py-4 px-4 sm:px-5 pl-10 pr-10 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                          placeholder="Your secret key"
                          disabled={loading}
                          required
                          style={{ fontSize: '16px' }}
                        />
                        <Lock className="absolute left-3 sm:left-4 top-3.5 sm:top-4.5 w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 sm:right-4 top-2.5 sm:top-3.5 text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-lg hover:bg-gray-100"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                        </button>
                      </div>
                      {passwordError && (
                        <p className="mt-1.5 text-xs sm:text-sm text-red-300 flex items-start gap-1.5 font-medium">
                          <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 mt-0.5" />
                          <span>{passwordError}</span>
                        </p>
                      )}
                    </div>

                    {/* Remember & Forgot */}
                    <div className="flex items-center justify-between py-1 sm:py-2 gap-2">
                      <label className="flex items-center cursor-pointer group">
                        <input
                          type="checkbox"
                          className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-100 transition-all"
                        />
                        <span className="ml-2 sm:ml-3 text-gray-200 text-xs sm:text-sm font-medium group-hover:text-white transition-colors">Remember me</span>
                      </label>
                      
                      <button
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        className="text-indigo-300 hover:text-white text-xs sm:text-sm font-semibold transition-colors hover:underline py-1 px-2 rounded-lg hover:bg-white/10"
                        disabled={loading}
                      >
                        Forgot password?
                      </button>
                    </div>

                    {/* Sign In Button */}
                    <button
                      type="submit"
                      disabled={loading || !!emailError || !!passwordError}
                      className="w-full text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 relative overflow-hidden group mt-4"
                      style={{
                        background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 50%, #1E40AF 100%)',
                        boxShadow: '0 10px 25px rgba(59, 130, 246, 0.4), 0 0 20px rgba(29, 78, 216, 0.3)'
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-all duration-700"></div>
                      <span className="flex items-center justify-center gap-2 sm:gap-3 relative z-10">
                        {loading ? (
                          <>
                            <div className="w-4 h-4 sm:w-6 sm:h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span className="text-sm sm:text-base">Signing in...</span>
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4 sm:w-6 sm:h-6" />
                            <span className="text-sm sm:text-lg font-bold">Sign In</span>
                          </>
                        )}
                      </span>
                    </button>

                    {/* Divider */}
                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <div 
                          className="w-full border-t border-white/20"
                        ></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span 
                          className="px-4 py-1.5 text-slate-200 font-medium rounded-full bg-white/5"
                        >
                          New here?
                        </span>
                      </div>
                    </div>

                    {/* Sign Up Link */}
                    <Link 
                      to="/signup" 
                      className="w-full font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-[1.02] relative overflow-hidden group"
                      style={{
                        background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 50%, #4C1D95 100%)',
                        boxShadow: '0 10px 25px rgba(124, 58, 237, 0.4), 0 0 20px rgba(91, 33, 182, 0.3)',
                        color: '#000000'
                      }}
                    >
                      <Star className="w-4 h-4 sm:w-6 sm:h-6 text-yellow-300" />
                      <span className="text-sm sm:text-lg font-bold" style={{ color: '#000000' }}>Create an account</span>
                      <Crown className="w-4 h-4 sm:w-6 sm:h-6 text-yellow-300" />
                    </Link>
                  </form>
                </div>
              ) : (
                /* Forgot Password Panel */
                <div 
                  className="max-w-md w-full mx-auto backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 md:p-8 border bg-white/5 border-white/20"
                >
                  <div className="flex items-center mb-4 sm:mb-6">
                    <button
                      onClick={closeForgotPassword}
                      className="p-1.5 sm:p-2 text-gray-200 hover:text-white hover:bg-white/10 rounded-lg transition-all mr-2 sm:mr-3"
                    >
                      <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                      <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-blue-300" />
                      Reset Password
                    </h2>
                  </div>

                  {resetSuccess ? (
                    <div className="text-center py-6 sm:py-8">
                      <div className="relative inline-block mb-4">
                        <div 
                          className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto shadow-lg"
                          style={{
                            background: 'linear-gradient(135deg, #10B981, #059669)'
                          }}
                        >
                          <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                        </div>
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Email Sent Successfully! 🎉</h3>
                      <p className="text-slate-200 mb-4 sm:mb-6 text-sm sm:text-base">
                        We've sent a password reset link to <strong className="text-blue-200">{resetEmail}</strong>
                      </p>
                      <p className="text-slate-300 text-xs sm:text-sm mb-4 sm:mb-6">
                        Check your inbox and follow the instructions to reset your password.
                      </p>
                      <button
                        onClick={closeForgotPassword}
                        className="w-full text-white font-bold py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl shadow-lg text-sm sm:text-base"
                        style={{
                          background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                        }}
                      >
                        Back to Login
                      </button>
                    </div>
                  ) : (
                    <>
                      <p className="text-slate-200 mb-4 sm:mb-6 text-sm sm:text-base">
                        No worries! Enter your email and we'll send you instructions to reset your password.
                      </p>

                      {resetError && (
                        <div className="mb-4 p-3 sm:p-4 bg-red-50/10 backdrop-blur-sm border border-red-400/30 rounded-xl">
                          <p className="text-red-200 text-xs sm:text-sm flex items-center">
                            <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                            {resetError}
                          </p>
                        </div>
                      )}

                      <form onSubmit={handleForgotPassword} className="space-y-4 sm:space-y-6">
                        <div>
                          <label className="block text-sm font-semibold text-slate-100 mb-2">
                            Email Address
                          </label>
                          <div className="relative">
                            <input
                              type="email"
                              value={resetEmail}
                              onChange={(e) => setResetEmail(e.target.value)}
                              className="w-full bg-white text-gray-800 border border-gray-200 rounded-xl py-2.5 sm:py-3 px-3 sm:px-4 pl-10 text-gray-800 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                              placeholder="Enter your email"
                              disabled={resetLoading}
                              required
                              style={{ fontSize: '16px' }}
                            />
                            <Mail className="absolute left-2.5 sm:left-3 top-2.5 sm:top-3.5 w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                          <button
                            type="submit"
                            disabled={resetLoading}
                            className="flex-1 text-white font-bold py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                            style={{
                              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                            }}
                          >
                            {resetLoading ? (
                              <span className="flex items-center justify-center">
                                <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                                Sending...
                              </span>
                            ) : (
                              'Send Reset Link'
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={closeForgotPassword}
                            className="flex-1 text-white font-semibold py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl transition-all duration-200 shadow-md text-sm sm:text-base"
                            style={{
                              background: 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)'
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section (copied from Welcome) */}
      <div className="py-12 sm:py-16 lg:py-20 bg-slate-900/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-14 lg:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto">
              Discover the powerful features that make StudyPartner the perfect companion for your academic journey.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-5 sm:gap-8 max-w-4xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-slate-800/70 rounded-2xl p-5 sm:p-7 lg:p-8 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-white/10"
              >
                {/* Feature Preview Image */}
                <div className="mb-4 rounded-xl overflow-hidden bg-blue-50 h-28 sm:h-36 lg:h-28 xl:h-24 flex items-center justify-center">
                  {index === 0 && (
                    <svg
                      viewBox="0 0 800 384"
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-[90%] sm:w-[85%] lg:w-[65%] xl:w-[55%] h-auto block"
                      role="img"
                      aria-label="Digital Kanban board with To Do, Doing, and Done columns"
                    >
                      <defs>
                        <linearGradient id="kanbanBg" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#eff6ff" />
                          <stop offset="100%" stopColor="#dbeafe" />
                        </linearGradient>
                        <filter id="cardShadow" x="-20%" y="-20%" width="140%" height="140%">
                          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#0f172a" floodOpacity="0.15" />
                        </filter>
                      </defs>

                      <rect width="800" height="384" fill="url(#kanbanBg)" />

                      <g transform="translate(24,24)" fontFamily="Inter, system-ui" fontSize="18" fill="#0f172a">
                        <g>
                          <rect x="0" y="0" width="240" height="336" rx="14" fill="#ffffff" stroke="#e5e7eb" />
                          <text x="16" y="36" fontWeight="600">To Do</text>
                          <g filter="url(#cardShadow)">
                            <rect x="16" y="60" width="208" height="56" rx="10" fill="#dbeafe" />
                            <rect x="16" y="128" width="208" height="68" rx="10" fill="#fef3c7" />
                            <rect x="16" y="204" width="208" height="44" rx="10" fill="#e9d5ff" />
                          </g>
                        </g>

                        <g transform="translate(256,0)">
                          <rect x="0" y="0" width="240" height="336" rx="14" fill="#ffffff" stroke="#e5e7eb" />
                          <text x="16" y="36" fontWeight="600">Doing</text>
                          <g filter="url(#cardShadow)">
                            <rect x="16" y="60" width="208" height="80" rx="10" fill="#dcfce7" />
                            <rect x="16" y="148" width="208" height="56" rx="10" fill="#fee2e2" />
                          </g>
                          <rect x="16" y="224" width="160" height="10" rx="5" fill="#e5e7eb" />
                          <rect x="16" y="224" width="96" height="10" rx="5" fill="#34d399" />
                        </g>

                        <g transform="translate(512,0)">
                          <rect x="0" y="0" width="240" height="336" rx="14" fill="#ffffff" stroke="#e5e7eb" />
                          <text x="16" y="36" fontWeight="600">Done</text>
                          <g filter="url(#cardShadow)">
                            <rect x="16" y="60" width="208" height="56" rx="10" fill="#bfdbfe" />
                            <rect x="16" y="128" width="208" height="44" rx="10" fill="#ddd6fe" />
                            <rect x="16" y="180" width="208" height="44" rx="10" fill="#fde68a" />
                          </g>
                          <g fill="#22c55e">
                            <circle cx="32" cy="240" r="8" />
                            <circle cx="56" cy="240" r="8" />
                            <circle cx="80" cy="240" r="8" />
                          </g>
                        </g>
                      </g>
                    </svg>
                  )}
                  
                  {index === 1 && (
                    <svg
                      viewBox="0 0 800 384"
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-[90%] sm:w-[85%] lg:w-[65%] xl:w-[55%] h-auto block"
                      role="img"
                      aria-label="Digital calendar planner with events and clock"
                    >
                      <rect width="800" height="384" fill="#eff6ff" />
                      <rect x="48" y="64" width="704" height="256" rx="16" fill="#ffffff" stroke="#e5e7eb" />
                      <rect x="48" y="64" width="704" height="48" rx="16" fill="#e0e7ff" />
                      <circle cx="88" cy="88" r="10" fill="#6366f1" />
                      <rect x="120" y="78" width="100" height="20" rx="6" fill="#c7d2fe" />

                      <g fill="#eef2ff">
                        <rect x="72" y="132" width="96" height="60" rx="10" />
                        <rect x="180" y="132" width="96" height="60" rx="10" />
                        <rect x="288" y="132" width="96" height="60" rx="10" />
                        <rect x="396" y="132" width="96" height="60" rx="10" />
                        <rect x="504" y="132" width="96" height="60" rx="10" />
                        <rect x="612" y="132" width="96" height="60" rx="10" />

                        <rect x="72" y="206" width="96" height="60" rx="10" />
                        <rect x="180" y="206" width="96" height="60" rx="10" />
                        <rect x="288" y="206" width="96" height="60" rx="10" />
                        <rect x="396" y="206" width="96" height="60" rx="10" />
                        <rect x="504" y="206" width="96" height="60" rx="10" />
                        <rect x="612" y="206" width="96" height="60" rx="10" />

                        <rect x="72" y="280" width="96" height="28" rx="10" />
                        <rect x="180" y="280" width="96" height="28" rx="10" />
                        <rect x="288" y="280" width="96" height="28" rx="10" />
                        <rect x="396" y="280" width="96" height="28" rx="10" />
                      </g>

                      <rect x="192" y="144" width="72" height="12" rx="6" fill="#60a5fa" />
                      <rect x="300" y="222" width="56" height="12" rx="6" fill="#34d399" />
                      <rect x="620" y="150" width="72" height="12" rx="6" fill="#f59e0b" />

                      <g transform="translate(700,88)">
                        <circle cx="0" cy="0" r="18" fill="#ffffff" stroke="#c7d2fe" />
                        <path d="M0 -10 V 0 L 8 6" stroke="#6366f1" strokeWidth="3" fill="none" strokeLinecap="round" />
                      </g>
                    </svg>
                  )}
                  
                  {index === 2 && (
                    <svg
                      viewBox="0 0 800 384"
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-[90%] sm:w-[85%] lg:w-[65%] xl:w-[55%] h-auto block"
                      role="img"
                      aria-label="Golden trophy with laurels and stars"
                    >
                      <rect width="800" height="384" fill="#eff6ff" />
                      <g transform="translate(400,190)">
                        <rect x="-80" y="80" width="160" height="20" rx="6" fill="#fbbf24" />
                        <rect x="-60" y="60" width="120" height="20" rx="6" fill="#f59e0b" />
                        <path d="M-70 -40 h140 a20 20 0 0 1 20 20 v10 a70 70 0 0 1 -70 70 h-40 a70 70 0 0 1 -70 -70 v-10 a20 20 0 0 1 20 -20z" fill="#f59e0b" />
                        <rect x="-24" y="40" width="48" height="24" rx="6" fill="#f59e0b" />
                        <rect x="-16" y="-60" width="32" height="100" rx="10" fill="#fbbf24" />
                      </g>
                      <g fill="#fcd34d">
                        <circle cx="220" cy="120" r="6" />
                        <circle cx="580" cy="120" r="6" />
                        <circle cx="520" cy="80" r="4" />
                        <circle cx="260" cy="80" r="4" />
                        <circle cx="400" cy="60" r="5" />
                      </g>
                      <g stroke="#86efac" strokeWidth="8" fill="none" opacity="0.8">
                        <path d="M140,210 q60,-80 140,-100" />
                        <path d="M660,210 q-60,-80 -140,-100" />
                      </g>
                    </svg>
                  )}
                  
                  {index === 3 && (
                    <svg
                      viewBox="0 0 800 384"
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-[90%] sm:w-[85%] lg:w-[65%] xl:w-[55%] h-auto block"
                      role="img"
                      aria-label="Stack of study books with checklist and lightning bolt"
                    >
                      <rect width="800" height="384" fill="#eff6ff" />
                      <g transform="translate(120,220)">
                        <rect x="0" y="0" width="560" height="20" rx="10" fill="#1d4ed8" />
                        <rect x="20" y="-28" width="520" height="28" rx="8" fill="#3b82f6" />
                        <rect x="40" y="-56" width="480" height="28" rx="8" fill="#60a5fa" />
                        <rect x="60" y="-84" width="440" height="28" rx="8" fill="#93c5fd" />
                      </g>
                      <g transform="translate(560,120)">
                        <rect x="-40" y="-40" width="120" height="80" rx="12" fill="#ffffff" stroke="#bfdbfe" />
                        <rect x="-24" y="-16" width="72" height="10" rx="5" fill="#60a5fa" />
                        <rect x="-24" y="4" width="48" height="10" rx="5" fill="#22c55e" />
                      </g>
                      <path d="M520 80 L480 160 L540 160 L500 240" fill="#f59e0b" />
                    </svg>
                  )}
                </div>

                {/* Feature Icon */}
                <div className={`inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r ${feature.color} rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-200`}>
                  <span className="text-xl sm:text-2xl">{feature.image}</span>
                </div>

                {/* Feature Content */}
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3 group-hover:text-indigo-300 transition-colors">
                  {feature.title}
                </h3>
                
                <p className="text-slate-300 mb-0 sm:mb-1 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Call to Action Section (copied from Welcome) */}
      <div className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Studies?
          </h2>
          <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of students who have already elevated their academic performance with StudyPartner.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/dashboard"
              className="group inline-flex items-center gap-2 bg-slate-900/90 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-xl font-semibold shadow-xl ring-1 ring-white/20 hover:ring-white/30 hover:bg-slate-900 transform hover:-translate-y-1 transition-all duration-200"
            >
              Start Your Journey
              <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="py-6 sm:py-8 bg-slate-900/60 text-center">
        <p className="text-slate-400">
          Built with ❤️ for students who aspire to achieve more
        </p>
      </div>
    </div>
  );
};

export default Login;