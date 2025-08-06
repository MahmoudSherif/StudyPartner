import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle, ArrowLeft, Trophy, Star, Zap, Target, Sparkles, Crown, Gift } from 'lucide-react';

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

  return (
    <>
      <style>{`
        #login-container {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          z-index: 9999 !important;
        }
      `}</style>
      <div 
        id="login-container"
        style={{
          background: 'linear-gradient(135deg, #0C0A1E 0%, #1A0B2E 15%, #2D1B69 30%, #3730A3 50%, #6366F1 70%, #8B5CF6 85%, #C084FC 100%)',
          backgroundSize: '400% 400%',
          animation: 'gradientShift 15s ease infinite'
        }}
      >
        {/* Dynamic animated overlay for depth */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at 30% 20%, rgba(139, 92, 246, 0.3) 0%, transparent 25%), radial-gradient(circle at 70% 80%, rgba(99, 102, 241, 0.4) 0%, transparent 35%), linear-gradient(135deg, rgba(12, 10, 30, 0.6) 0%, transparent 40%, rgba(45, 27, 105, 0.5) 70%, rgba(55, 48, 163, 0.7) 100%)'
          }}
        ></div>
        
        {/* Animated particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute animate-pulse" style={{ top: '10%', left: '5%', animationDelay: '0s' }}>
            <div className="w-2 h-2 bg-yellow-400 rounded-full opacity-70"></div>
          </div>
          <div className="absolute animate-pulse" style={{ top: '20%', right: '15%', animationDelay: '2s' }}>
            <div className="w-1 h-1 bg-cyan-400 rounded-full opacity-60"></div>
          </div>
          <div className="absolute animate-pulse" style={{ bottom: '30%', left: '10%', animationDelay: '4s' }}>
            <div className="w-3 h-3 bg-pink-400 rounded-full opacity-50"></div>
          </div>
          <div className="absolute animate-pulse" style={{ bottom: '10%', right: '20%', animationDelay: '6s' }}>
            <div className="w-2 h-2 bg-emerald-400 rounded-full opacity-80"></div>
          </div>
        </div>
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Floating Icons - enhanced game-like theme with vibrant colors */}
          <div className="absolute top-5 sm:top-10 left-5 sm:left-10 animate-float hidden sm:block">
            <Trophy className="w-12 h-12 sm:w-16 md:w-20 sm:h-16 md:h-20 text-yellow-400/90 drop-shadow-lg filter" style={{ filter: 'drop-shadow(0 0 20px rgba(251, 191, 36, 0.5))' }} />
          </div>
          <div className="absolute top-20 sm:top-40 right-10 sm:right-20 animate-float-delayed hidden sm:block">
            <Star className="w-10 h-10 sm:w-14 md:w-16 sm:h-14 md:h-16 text-cyan-300/90" style={{ filter: 'drop-shadow(0 0 15px rgba(34, 211, 238, 0.6))' }} />
          </div>
          <div className="absolute bottom-10 sm:bottom-20 left-16 sm:left-32 animate-float-slow hidden sm:block">
            <Zap className="w-16 h-16 sm:w-20 md:w-24 sm:h-20 md:h-24 text-purple-400/85" style={{ filter: 'drop-shadow(0 0 25px rgba(168, 85, 247, 0.7))' }} />
          </div>
          <div className="absolute bottom-20 sm:bottom-40 right-20 sm:right-40 animate-float hidden sm:block">
            <Crown className="w-12 h-12 sm:w-16 md:w-18 sm:h-16 md:h-18 text-amber-400/90" style={{ filter: 'drop-shadow(0 0 18px rgba(245, 158, 11, 0.6))' }} />
          </div>
          <div className="absolute top-40 sm:top-60 left-1/2 animate-float-delayed hidden md:block">
            <Gift className="w-10 h-10 sm:w-12 md:w-14 sm:h-12 md:h-14 text-pink-400/85" style={{ filter: 'drop-shadow(0 0 12px rgba(244, 114, 182, 0.6))' }} />
          </div>
          <div className="absolute bottom-30 sm:bottom-60 right-5 sm:right-10 animate-float-slow hidden md:block">
            <Target className="w-14 h-14 sm:w-18 md:w-22 sm:h-18 md:h-22 text-emerald-400/85" style={{ filter: 'drop-shadow(0 0 22px rgba(52, 211, 153, 0.7))' }} />
          </div>
          
          {/* Mobile-specific smaller floating elements */}
          <div className="absolute top-10 right-5 animate-float sm:hidden">
            <Star className="w-6 h-6 text-cyan-300/80" style={{ filter: 'drop-shadow(0 0 8px rgba(34, 211, 238, 0.5))' }} />
          </div>
          <div className="absolute bottom-20 left-8 animate-float-delayed sm:hidden">
            <Crown className="w-6 h-6 text-amber-400/80" style={{ filter: 'drop-shadow(0 0 8px rgba(245, 158, 11, 0.5))' }} />
          </div>
          <div className="absolute top-1/3 left-5 animate-float-slow sm:hidden">
            <Trophy className="w-8 h-8 text-yellow-400/80" style={{ filter: 'drop-shadow(0 0 10px rgba(251, 191, 36, 0.4))' }} />
          </div>
          
          {/* Enhanced Space-themed Gradient Orbs with more vibrant colors */}
          <div 
            className="absolute w-48 h-48 sm:w-96 sm:h-96 rounded-full filter blur-3xl opacity-40 animate-blob"
            style={{
              top: '-5rem',
              left: '-5rem',
              background: 'radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, rgba(99, 102, 241, 0.3) 40%, transparent 70%)'
            }}
          ></div>
          <div 
            className="absolute w-48 h-48 sm:w-96 sm:h-96 rounded-full filter blur-3xl opacity-40 animate-blob animation-delay-2000"
            style={{
              bottom: '-5rem',
              right: '-5rem',
              background: 'radial-gradient(circle, rgba(236, 72, 153, 0.4) 0%, rgba(168, 85, 247, 0.3) 40%, transparent 70%)'
            }}
          ></div>
          <div 
            className="absolute w-48 h-48 sm:w-96 sm:h-96 rounded-full filter blur-3xl opacity-35 animate-blob animation-delay-4000"
            style={{
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'radial-gradient(circle, rgba(34, 211, 238, 0.3) 0%, rgba(16, 185, 129, 0.25) 40%, transparent 70%)'
            }}
          ></div>
        </div>

        {/* Main Login Container */}
        <div className="relative z-10 w-full max-w-md mx-auto px-4 sm:px-6 md:px-4">
          {!showForgotPassword ? (
            <div 
              className="backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 md:p-8 border-2 transform hover:scale-[1.01] transition-all duration-300 max-h-[90vh] overflow-y-auto"
              style={{
                background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.92) 20%, rgba(241, 245, 249, 0.90) 60%, rgba(226, 232, 240, 0.88) 100%)',
                borderImage: 'linear-gradient(135deg, rgba(139, 92, 246, 0.6), rgba(99, 102, 241, 0.5), rgba(236, 72, 153, 0.6)) 1',
                borderWidth: '3px',
                borderStyle: 'solid',
                boxShadow: `
                  0 25px 50px -12px rgba(139, 92, 246, 0.4),
                  0 0 0 1px rgba(99, 102, 241, 0.1) inset,
                  0 2px 4px rgba(139, 92, 246, 0.1),
                  0 8px 16px rgba(99, 102, 241, 0.15)
                `
              }}
            >
              {/* Logo and Title Section */}
              <div className="text-center mb-6 sm:mb-8">
                {/* Animated Logo with enhanced gaming effects */}
                <div className="relative inline-block mb-4 sm:mb-6">
                  <div 
                    className="relative inline-flex items-center justify-center w-16 h-16 sm:w-20 md:w-24 sm:h-20 md:h-24 rounded-full shadow-2xl transform hover:scale-110 transition-all duration-300 animate-pulse"
                    style={{
                      background: 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 50%, #06B6D4 100%)',
                      boxShadow: '0 0 30px rgba(139, 92, 246, 0.6), 0 0 60px rgba(59, 130, 246, 0.4)'
                    }}
                  >
                    <Target className="w-8 h-8 sm:w-10 md:w-12 sm:h-10 md:h-12 text-white drop-shadow-2xl" />
                    {/* Rotating ring around logo */}
                    <div 
                      className="absolute inset-0 rounded-full border-2 sm:border-4 border-transparent animate-spin"
                      style={{
                        background: 'linear-gradient(45deg, transparent, rgba(236, 72, 153, 0.8), transparent, rgba(139, 92, 246, 0.8)) border-box',
                        animation: 'spin 3s linear infinite'
                      }}
                    ></div>
                  </div>
                  <div className="absolute -top-1 sm:-top-2 -right-1 sm:-right-2 animate-bounce">
                    <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400" style={{ filter: 'drop-shadow(0 0 10px rgba(251, 191, 36, 0.8))' }} />
                  </div>
                  <div className="absolute -bottom-1 -left-1 animate-pulse">
                    <Crown className="w-4 h-4 sm:w-6 sm:h-6 text-amber-400" style={{ filter: 'drop-shadow(0 0 8px rgba(245, 158, 11, 0.6))' }} />
                  </div>
                </div>
                
                {/* Welcome Text with gradient */}
                <h1 
                  className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent animate-gradient-x"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  Welcome Back, Hero! 🎮
                </h1>
                <p className="text-gray-700 text-base sm:text-lg font-medium mb-1 sm:mb-2">Ready to continue your epic journey? ⚡</p>
                <p className="text-gray-600 text-xs sm:text-sm">Level up your productivity and unlock achievements! 🚀</p>
                
                {/* Enhanced Stats Bar with more gaming elements */}
                <div className="flex justify-center gap-2 sm:gap-3 mt-4 sm:mt-6 flex-wrap">
                  <div 
                    className="bg-gradient-to-r from-blue-100 to-blue-50 px-2 sm:px-4 py-1 sm:py-2 rounded-full border-2 border-blue-300 shadow-md hover:shadow-lg transition-all hover:scale-105"
                    style={{ borderImage: 'linear-gradient(45deg, #3B82F6, #06B6D4) 1' }}
                  >
                    <span className="text-blue-700 text-xs sm:text-sm font-bold flex items-center gap-1">
                      🏆 <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">1000+ Heroes</span>
                    </span>
                  </div>
                  <div 
                    className="bg-gradient-to-r from-emerald-100 to-emerald-50 px-2 sm:px-4 py-1 sm:py-2 rounded-full border-2 border-emerald-300 shadow-md hover:shadow-lg transition-all hover:scale-105"
                    style={{ borderImage: 'linear-gradient(45deg, #10B981, #34D399) 1' }}
                  >
                    <span className="text-emerald-700 text-xs sm:text-sm font-bold flex items-center gap-1">
                      ⭐ <span className="bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">Legendary</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="mb-6 p-4 bg-red-50/90 backdrop-blur-sm border border-red-300 rounded-xl">
                  <p className="text-red-700 text-sm flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    {error}
                  </p>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                {/* Email Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={handleEmailChange}
                      className="w-full bg-white/90 backdrop-blur-sm border-2 border-gray-200 rounded-xl py-2.5 sm:py-3 px-3 sm:px-4 pl-10 sm:pl-11 text-gray-800 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 hover:border-gray-300 text-sm sm:text-base"
                      placeholder="hero@motivate.com"
                      disabled={loading}
                      required
                    />
                    <Mail className="absolute left-2.5 sm:left-3 top-2.5 sm:top-3.5 w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                    {email && !emailError && (
                      <CheckCircle className="absolute right-2.5 sm:right-3 top-2.5 sm:top-3.5 w-4 h-4 sm:w-5 sm:h-5 text-green-600 animate-scale-in" />
                    )}
                  </div>
                  {emailError && (
                    <p className="mt-2 text-xs sm:text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {emailError}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={handlePasswordChange}
                      className="w-full bg-white/90 backdrop-blur-sm border-2 border-gray-200 rounded-xl py-2.5 sm:py-3 px-3 sm:px-4 pl-10 sm:pl-11 pr-10 sm:pr-11 text-gray-800 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 hover:border-gray-300 text-sm sm:text-base"
                      placeholder="Your secret key"
                      disabled={loading}
                      required
                    />
                    <Lock className="absolute left-2.5 sm:left-3 top-2.5 sm:top-3.5 w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 sm:right-3 top-2.5 sm:top-3.5 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                    </button>
                  </div>
                  {passwordError && (
                    <p className="mt-2 text-xs sm:text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {passwordError}
                    </p>
                  )}
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-1.5 sm:ml-2 text-gray-700 text-xs sm:text-sm">Remember me</span>
                  </label>
                  
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium transition-colors"
                    disabled={loading}
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Sign In Button - Enhanced Gamified Design */}
                <button
                  type="submit"
                  disabled={loading || !!emailError || !!passwordError}
                  className="w-full text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 relative overflow-hidden group"
                  style={{
                    background: 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 50%, #06B6D4 100%)',
                    boxShadow: '0 10px 25px rgba(139, 92, 246, 0.4), 0 0 20px rgba(59, 130, 246, 0.3)'
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-all duration-700"></div>
                  <span className="flex items-center justify-center gap-1.5 sm:gap-2 relative z-10">
                    {loading ? (
                      <>
                        <div className="w-5 h-5 sm:w-6 sm:h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span className="text-sm sm:text-base">Entering the Arena...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
                        <span className="text-base sm:text-lg">⚡ START EPIC JOURNEY ⚡</span>
                        <Trophy className="w-5 h-5 sm:w-6 sm:h-6 animate-bounce" />
                      </>
                    )}
                  </span>
                </button>

                {/* Divider */}
                <div className="relative my-6 sm:my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div 
                      className="w-full border-t-2"
                      style={{
                        borderImage: 'linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.3), rgba(59, 130, 246, 0.4), rgba(139, 92, 246, 0.3), transparent) 1'
                      }}
                    ></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span 
                      className="px-4 sm:px-6 py-1.5 sm:py-2 text-gray-600 font-semibold rounded-full text-xs sm:text-sm"
                      style={{ 
                        background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.92) 100%)',
                        boxShadow: '0 4px 8px rgba(139, 92, 246, 0.1)'
                      }}
                    >
                      🎮 New Player? Join the Guild! 🎮
                    </span>
                  </div>
                </div>

                {/* Sign Up Link - Enhanced Gaming Style */}
                <Link 
                  to="/signup" 
                  className="w-full text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-xl flex items-center justify-center gap-2 sm:gap-3 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-[1.02] relative overflow-hidden group"
                  style={{
                    background: 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 50%, #3B82F6 100%)',
                    boxShadow: '0 10px 25px rgba(236, 72, 153, 0.4), 0 0 20px rgba(139, 92, 246, 0.3)'
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-all duration-700"></div>
                  <Star className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-300 animate-spin" style={{ animationDuration: '3s' }} />
                  <span className="text-base sm:text-lg relative z-10">🚀 CREATE HERO ACCOUNT 🚀</span>
                  <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-300 animate-pulse" />
                </Link>
              </form>

              {/* Features Showcase - Enhanced Gaming Theme */}
              <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t-2" style={{ borderImage: 'linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.2), transparent) 1' }}>
                <p className="text-center text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 font-semibold">🌟 Join thousands of legendary achievers! 🌟</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
                  <div className="text-center p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-b from-blue-50 to-blue-100 border border-blue-200 hover:scale-105 transition-transform">
                    <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">🎯</div>
                    <p className="text-xs text-blue-700 font-bold">Epic Goals</p>
                  </div>
                  <div className="text-center p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-b from-yellow-50 to-yellow-100 border border-yellow-200 hover:scale-105 transition-transform">
                    <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">🏆</div>
                    <p className="text-xs text-yellow-700 font-bold">Legendary Rewards</p>
                  </div>
                  <div className="text-center p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-b from-green-50 to-green-100 border border-green-200 hover:scale-105 transition-transform">
                    <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">📈</div>
                    <p className="text-xs text-green-700 font-bold">Power Stats</p>
                  </div>
                  <div className="text-center p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-b from-purple-50 to-purple-100 border border-purple-200 hover:scale-105 transition-transform">
                    <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">💎</div>
                    <p className="text-xs text-purple-700 font-bold">Rare Gems</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Forgot Password Modal */
            <div 
              className="backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 md:p-8 border-2 max-h-[90vh] overflow-y-auto"
              style={{
                background: 'linear-gradient(135deg, rgba(254, 243, 199, 0.98) 0%, rgba(253, 230, 138, 0.95) 30%, rgba(251, 191, 36, 0.92) 70%, rgba(245, 158, 11, 0.9) 100%)',
                borderColor: 'rgba(251, 191, 36, 0.4)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(251, 191, 36, 0.2) inset'
              }}
            >
              <div className="flex items-center mb-4 sm:mb-6">
                <button
                  onClick={closeForgotPassword}
                  className="p-1.5 sm:p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all mr-2 sm:mr-3"
                >
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
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
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">Email Sent Successfully! 🎉</h3>
                  <p className="text-gray-700 mb-4 sm:mb-6 text-sm sm:text-base">
                    We've sent a password reset link to <strong className="text-blue-600">{resetEmail}</strong>
                  </p>
                  <p className="text-gray-600 text-xs sm:text-sm mb-4 sm:mb-6">
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
                  <p className="text-gray-700 mb-4 sm:mb-6 text-sm sm:text-base">
                    No worries! Enter your email and we'll send you instructions to reset your password.
                  </p>

                  {resetError && (
                    <div className="mb-4 p-3 sm:p-4 bg-red-50/90 backdrop-blur-sm border border-red-300 rounded-xl">
                      <p className="text-red-700 text-xs sm:text-sm flex items-center">
                        <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                        {resetError}
                      </p>
                    </div>
                  )}

                  <form onSubmit={handleForgotPassword} className="space-y-4 sm:space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          className="w-full bg-white/90 backdrop-blur-sm border-2 border-gray-200 rounded-xl py-2.5 sm:py-3 px-3 sm:px-4 pl-10 sm:pl-11 text-gray-800 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 hover:border-gray-300 text-sm sm:text-base"
                          placeholder="Enter your email"
                          disabled={resetLoading}
                          required
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
                          background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
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
    </>
  );
};

export default Login; 