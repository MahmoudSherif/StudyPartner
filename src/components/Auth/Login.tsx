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
          height: 100dvh !important; /* Dynamic viewport height for mobile */
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          z-index: 9999 !important;
          padding: 1rem !important;
          box-sizing: border-box !important;
        }
        
        /* Ensure proper mobile viewport handling */
        @media (max-width: 640px) {
          #login-container {
            padding: 0.75rem !important;
            align-items: flex-start !important;
            padding-top: max(1rem, env(safe-area-inset-top)) !important;
            padding-bottom: max(1rem, env(safe-area-inset-bottom)) !important;
          }
        }
        
        /* Ultra-small screens */
        @media (max-width: 320px) {
          #login-container {
            padding: 0.5rem !important;
          }
        }
      `}</style>
      <div 
        id="login-container"
        style={{
          background: 'linear-gradient(135deg, #475569 0%, #64748b 20%, #94a3b8 40%, #cbd5e1 60%, #e2e8f0 80%, #f1f5f9 100%)',
          backgroundSize: '400% 400%',
          animation: 'gradientShift 15s ease infinite'
        }}
      >
        {/* Dynamic animated overlay for depth */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at 30% 20%, rgba(59, 130, 246, 0.3) 0%, transparent 25%), radial-gradient(circle at 70% 80%, rgba(29, 78, 216, 0.4) 0%, transparent 35%), linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, transparent 40%, rgba(51, 65, 85, 0.5) 70%, rgba(71, 85, 105, 0.7) 100%)'
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
              background: 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, rgba(29, 78, 216, 0.3) 40%, transparent 70%)'
            }}
          ></div>
          <div 
            className="absolute w-48 h-48 sm:w-96 sm:h-96 rounded-full filter blur-3xl opacity-40 animate-blob animation-delay-2000"
            style={{
              bottom: '-5rem',
              right: '-5rem',
              background: 'radial-gradient(circle, rgba(16, 185, 129, 0.4) 0%, rgba(5, 150, 105, 0.3) 40%, transparent 70%)'
            }}
          ></div>
          <div 
            className="absolute w-48 h-48 sm:w-96 sm:h-96 rounded-full filter blur-3xl opacity-35 animate-blob animation-delay-4000"
            style={{
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'radial-gradient(circle, rgba(34, 211, 238, 0.3) 0%, rgba(6, 182, 212, 0.25) 40%, transparent 70%)'
            }}
          ></div>
        </div>

        {/* Main Login Container - Mobile Optimized */}
                {/* Main Login Container */}
        <div className="relative z-10 w-full max-w-sm sm:max-w-md lg:max-w-lg mx-auto px-3 sm:px-4 md:px-6 flex flex-col justify-center min-h-[calc(100vh-2rem)] sm:min-h-screen">
          {!showForgotPassword ? (
            <div 
              className="backdrop-blur-2xl rounded-2xl sm:rounded-3xl lg:rounded-[2rem] shadow-[0_20px_40px_-8px_rgba(59,130,246,0.3)] sm:shadow-[0_25px_80px_-12px_rgba(59,130,246,0.4)] p-4 sm:p-6 md:p-8 lg:p-12 border border-white/20 transform hover:scale-[1.002] sm:hover:scale-[1.005] transition-all duration-500 max-h-[calc(100vh-1rem)] sm:max-h-[92vh] overflow-y-auto"
              style={{
                background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.92) 25%, rgba(241, 245, 249, 0.90) 75%, rgba(226, 232, 240, 0.88) 100%)',
                borderImage: 'linear-gradient(135deg, rgba(59, 130, 246, 0.6), rgba(99, 102, 241, 0.4), rgba(168, 85, 247, 0.5)) 1',
                borderWidth: '1px',
                borderStyle: 'solid',
                boxShadow: `
                  0 20px 40px -8px rgba(59, 130, 246, 0.25),
                  0 0 0 1px rgba(99, 102, 241, 0.1) inset,
                  0 2px 4px rgba(59, 130, 246, 0.08),
                  0 8px 16px rgba(99, 102, 241, 0.12)
                `
              }}
            >
              {/* Logo and Title Section - Mobile Responsive */}
                            {/* Logo and Title Section */}
              <div className="text-center mb-6 sm:mb-8 lg:mb-12">
                {/* Animated Logo with enhanced gaming effects */}
                <div className="relative inline-block mb-4 sm:mb-6 lg:mb-10">
                  <div 
                    className="relative inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 xl:w-28 xl:h-28 rounded-full shadow-[0_0_30px_rgba(59,130,246,0.6)] sm:shadow-[0_0_40px_rgba(59,130,246,0.8)] transform hover:scale-105 sm:hover:scale-110 transition-all duration-500 animate-pulse"
                    style={{
                      background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 50%, #1E40AF 100%)',
                      boxShadow: '0 0 30px rgba(59, 130, 246, 0.6), 0 0 60px rgba(29, 78, 216, 0.4), inset 0 0 15px rgba(255, 255, 255, 0.2)'
                    }}
                  >
                    <Target className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 xl:w-16 xl:h-16 text-white drop-shadow-2xl" />
                    {/* Rotating ring around logo */}
                    <div 
                      className="absolute inset-0 rounded-full border-2 sm:border-[3px] lg:border-[4px] border-transparent animate-spin"
                      style={{
                        background: 'linear-gradient(45deg, transparent, rgba(59, 130, 246, 0.9), transparent, rgba(29, 78, 216, 0.9)) border-box',
                        animation: 'spin 4s linear infinite'
                      }}
                    ></div>
                  </div>
                  <div className="absolute -top-2 sm:-top-3 lg:-top-4 -right-2 sm:-right-3 lg:-right-4 animate-bounce">
                    <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 xl:w-10 xl:h-10 text-yellow-400" style={{ filter: 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.8))' }} />
                  </div>
                  <div className="absolute -bottom-1.5 sm:-bottom-2 lg:-bottom-3 -left-1.5 sm:-left-2 lg:-left-3 animate-pulse">
                    <Crown className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 xl:w-8 xl:h-8 text-amber-400" style={{ filter: 'drop-shadow(0 0 6px rgba(245, 158, 11, 0.6))' }} />
                  </div>
                </div>
                
                {/* Welcome Text with gradient - Mobile Optimized */}
                                {/* Welcome Text with gradient */}
                <h1 
                  className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-2 sm:mb-3 lg:mb-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent animate-gradient-x leading-tight px-2 sm:px-0"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  Welcome Back, Hero! 🎮
                </h1>
                <p className="text-gray-700 text-sm sm:text-base lg:text-lg xl:text-xl font-medium mb-1.5 sm:mb-2 lg:mb-4 leading-relaxed px-2 sm:px-0">Ready to continue your epic journey? ⚡</p>
                <p className="text-gray-600 text-xs sm:text-sm lg:text-base xl:text-lg leading-relaxed px-2 sm:px-0">Level up your productivity and unlock achievements! 🚀</p>
                
                {/* Enhanced Stats Bar with more gaming elements */}
                <div className="flex justify-center gap-2 sm:gap-3 lg:gap-6 mt-4 sm:mt-6 lg:mt-10 flex-wrap px-2 sm:px-0">
                  <div 
                    className="bg-gradient-to-r from-blue-100 to-blue-50 px-2 sm:px-3 lg:px-6 py-1.5 sm:py-2 lg:py-4 rounded-xl sm:rounded-2xl border border-blue-200 sm:border-2 sm:border-blue-300 shadow-md sm:shadow-lg hover:shadow-lg sm:hover:shadow-xl transition-all hover:scale-105 transform"
                    style={{ borderImage: 'linear-gradient(45deg, #3B82F6, #1D4ED8) 1' }}
                  >
                    <span className="text-blue-700 text-xs sm:text-sm lg:text-base font-bold flex items-center gap-1 sm:gap-2">
                      🏆 <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent whitespace-nowrap">1000+ Heroes</span>
                    </span>
                  </div>
                  <div 
                    className="bg-gradient-to-r from-emerald-100 to-emerald-50 px-2 sm:px-3 lg:px-6 py-1.5 sm:py-2 lg:py-4 rounded-xl sm:rounded-2xl border border-emerald-200 sm:border-2 sm:border-emerald-300 shadow-md sm:shadow-lg hover:shadow-lg sm:hover:shadow-xl transition-all hover:scale-105 transform"
                    style={{ borderImage: 'linear-gradient(45deg, #10B981, #34D399) 1' }}
                  >
                    <span className="text-emerald-700 text-xs sm:text-sm lg:text-base font-bold flex items-center gap-1 sm:gap-2">
                      ⭐ <span className="bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent whitespace-nowrap">Legendary</span>
                    </span>
                  </div>
                </div>
                
                {/* Enhanced Stats Bar with mobile optimization */}
                <div className="flex flex-col xs:flex-row justify-center items-center gap-2 sm:gap-3 md:gap-4 lg:gap-6 mt-4 sm:mt-6 lg:mt-10">
                  <div 
                    className="bg-gradient-to-r from-blue-100 to-blue-50 px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 rounded-xl sm:rounded-2xl border-2 border-blue-300 shadow-md hover:shadow-lg transition-all hover:scale-105 transform w-full xs:w-auto max-w-[200px]"
                    style={{ borderImage: 'linear-gradient(45deg, #3B82F6, #1D4ED8) 1' }}
                  >
                    <span className="text-blue-700 text-xs sm:text-sm md:text-base font-bold flex items-center justify-center gap-1 sm:gap-2">
                      🏆 <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">1000+ Heroes</span>
                    </span>
                  </div>
                  <div 
                    className="bg-gradient-to-r from-emerald-100 to-emerald-50 px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 rounded-xl sm:rounded-2xl border-2 border-emerald-300 shadow-md hover:shadow-lg transition-all hover:scale-105 transform w-full xs:w-auto max-w-[200px]"
                    style={{ borderImage: 'linear-gradient(45deg, #10B981, #34D399) 1' }}
                  >
                    <span className="text-emerald-700 text-xs sm:text-sm md:text-base font-bold flex items-center justify-center gap-1 sm:gap-2">
                      ⭐ <span className="bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">Legendary</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="mb-4 sm:mb-6 lg:mb-8 p-3 sm:p-4 lg:p-5 bg-gradient-to-r from-red-50 to-pink-50 backdrop-blur-sm border border-red-200 sm:border-2 rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg mx-1 sm:mx-0">
                  <p className="text-red-700 text-sm sm:text-base flex items-start font-medium">
                    <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </p>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 lg:space-y-10">
                {/* Email Field */}
                <div>
                  <label className="block text-sm sm:text-base lg:text-lg font-bold text-gray-800 mb-2 sm:mb-3 lg:mb-4 tracking-wide">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={handleEmailChange}
                      className="w-full bg-white/98 backdrop-blur-sm border border-gray-200 sm:border-2 rounded-xl sm:rounded-2xl py-3 sm:py-4 lg:py-5 px-4 sm:px-5 lg:px-6 pl-10 sm:pl-12 lg:pl-16 text-gray-800 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 sm:focus:ring-4 focus:ring-blue-100 transition-all duration-300 hover:border-gray-300 text-sm sm:text-base lg:text-xl shadow-inner"
                      placeholder="hero@motivate.com"
                      disabled={loading}
                      required
                    />
                    <Mail className="absolute left-3 sm:left-4 lg:left-5 top-3 sm:top-4 lg:top-5 w-4 h-4 sm:w-5 sm:h-5 lg:w-7 lg:h-7 text-gray-500" />
                    {email && !emailError && (
                      <CheckCircle className="absolute right-3 sm:right-4 lg:right-5 top-3 sm:top-4 lg:top-5 w-4 h-4 sm:w-5 sm:h-5 lg:w-7 lg:h-7 text-green-600 animate-scale-in" />
                    )}
                  </div>
                  {emailError && (
                    <p className="mt-1.5 sm:mt-2 lg:mt-3 text-xs sm:text-sm text-red-600 flex items-start gap-1.5 sm:gap-2 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 mt-0.5" />
                      <span>{emailError}</span>
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-sm sm:text-base lg:text-lg font-bold text-gray-800 mb-2 sm:mb-3 lg:mb-4 tracking-wide">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={handlePasswordChange}
                      className="w-full bg-white/98 backdrop-blur-sm border border-gray-200 sm:border-2 rounded-xl sm:rounded-2xl py-3 sm:py-4 lg:py-5 px-4 sm:px-5 lg:px-6 pl-10 sm:pl-12 lg:pl-16 pr-10 sm:pr-12 lg:pr-16 text-gray-800 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 sm:focus:ring-4 focus:ring-blue-100 transition-all duration-300 hover:border-gray-300 text-sm sm:text-base lg:text-xl shadow-inner"
                      placeholder="Your secret key"
                      disabled={loading}
                      required
                    />
                    <Lock className="absolute left-3 sm:left-4 lg:left-5 top-3 sm:top-4 lg:top-5 w-4 h-4 sm:w-5 sm:h-5 lg:w-7 lg:h-7 text-gray-500" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 sm:right-4 lg:right-5 top-2.5 sm:top-3.5 lg:top-4.5 text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-lg hover:bg-gray-100"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5 lg:w-7 lg:h-7" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5 lg:w-7 lg:h-7" />}
                    </button>
                  </div>
                  {passwordError && (
                    <p className="mt-1.5 sm:mt-2 lg:mt-3 text-xs sm:text-sm text-red-600 flex items-start gap-1.5 sm:gap-2 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 mt-0.5" />
                      <span>{passwordError}</span>
                    </p>
                  )}
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between py-2 sm:py-3 gap-2">
                  <label className="flex items-center cursor-pointer group">
                    <input
                      type="checkbox"
                      className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-600 border border-gray-300 sm:border-2 rounded-md sm:rounded-lg focus:ring-2 sm:focus:ring-4 focus:ring-blue-100 transition-all"
                    />
                    <span className="ml-2 sm:ml-3 lg:ml-4 text-gray-700 text-xs sm:text-sm lg:text-base xl:text-lg font-medium group-hover:text-gray-900 transition-colors">Remember me</span>
                  </label>
                  
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm lg:text-base xl:text-lg font-semibold transition-colors hover:underline py-1 px-2 rounded-lg hover:bg-blue-50/50 min-h-[36px] sm:min-h-[40px] touch-manipulation"
                    disabled={loading}
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Sign In Button - Enhanced Gamified Design */}
                <button
                  type="submit"
                  disabled={loading || !!emailError || !!passwordError}
                  className="w-full text-white font-bold py-3 sm:py-4 lg:py-5 px-4 sm:px-6 lg:px-8 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 relative overflow-hidden group mt-6 sm:mt-8 min-h-[48px] sm:min-h-[56px] lg:min-h-[64px] active:scale-[0.98] touch-manipulation"
                  style={{
                    background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 50%, #1E40AF 100%)',
                    boxShadow: '0 10px 25px rgba(59, 130, 246, 0.4), 0 0 20px rgba(29, 78, 216, 0.3)'
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-all duration-700"></div>
                  <span className="flex items-center justify-center gap-2 sm:gap-3 lg:gap-4 relative z-10">
                    {loading ? (
                      <>
                        <div className="w-4 h-4 sm:w-6 sm:h-6 lg:w-7 lg:h-7 border-2 sm:border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span className="text-sm sm:text-base lg:text-lg xl:text-xl">Entering the Arena...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 sm:w-6 sm:h-6 lg:w-7 lg:h-7 animate-pulse" />
                        <span className="text-sm sm:text-lg lg:text-xl xl:text-2xl font-bold">⚡ START EPIC JOURNEY ⚡</span>
                        <Trophy className="w-4 h-4 sm:w-6 sm:h-6 lg:w-7 lg:h-7 animate-bounce" />
                      </>
                    )}
                  </span>
                </button>

                {/* Divider */}
                <div className="relative my-6 sm:my-8 lg:my-10">
                  <div className="absolute inset-0 flex items-center">
                    <div 
                      className="w-full border-t border-gray-300 sm:border-t-2"
                      style={{
                        borderImage: 'linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.3), rgba(29, 78, 216, 0.4), rgba(59, 130, 246, 0.3), transparent) 1'
                      }}
                    ></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span 
                      className="px-4 sm:px-6 lg:px-8 py-1.5 sm:py-2 lg:py-3 text-gray-600 font-semibold rounded-full text-xs sm:text-sm lg:text-base"
                      style={{ 
                        background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.96) 100%)',
                        boxShadow: '0 4px 8px rgba(59, 130, 246, 0.1)'
                      }}
                    >
                      🎮 New Player? Join the Guild! 🎮
                    </span>
                  </div>
                </div>

                {/* Sign Up Link - Enhanced Gaming Style */}
                <Link 
                  to="/signup" 
                  className="w-full font-bold py-3 sm:py-4 lg:py-5 px-4 sm:px-6 lg:px-8 rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 sm:gap-3 lg:gap-4 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-[1.02] relative overflow-hidden group min-h-[48px] sm:min-h-[56px] lg:min-h-[64px] active:scale-[0.98] touch-manipulation"
                  style={{
                    background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 50%, #4C1D95 100%)',
                    boxShadow: '0 10px 25px rgba(124, 58, 237, 0.4), 0 0 20px rgba(91, 33, 182, 0.3)',
                    color: '#000000'
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-all duration-700"></div>
                  <Star className="w-4 h-4 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-yellow-300 animate-spin flex-shrink-0" style={{ animationDuration: '3s' }} />
                  <span className="text-sm sm:text-lg lg:text-xl xl:text-2xl relative z-10 font-bold" style={{ color: '#000000' }}>🚀 CREATE HERO ACCOUNT 🚀</span>
                  <Crown className="w-4 h-4 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-yellow-300 animate-pulse flex-shrink-0" />
                </Link>
              </form>

              {/* Features Showcase - Enhanced Gaming Theme */}
              <div className="mt-6 sm:mt-8 lg:mt-10 pt-4 sm:pt-6 lg:pt-8 border-t border-gray-200 sm:border-t-2" style={{ borderImage: 'linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.2), transparent) 1' }}>
                <p className="text-center text-gray-600 text-sm sm:text-lg lg:text-xl font-bold mb-3 sm:mb-4 lg:mb-6 px-2">🌟 Join thousands of legendary achievers! 🌟</p>
                <div className="grid grid-cols-1 gap-2 sm:gap-3 lg:gap-4">
                  <div className="text-center p-2 sm:p-3 lg:p-4 rounded-lg sm:rounded-xl bg-gradient-to-b from-blue-50 to-blue-100 border border-blue-200 hover:scale-105 transition-transform">
                    <p className="text-xs sm:text-sm lg:text-base text-blue-700 font-bold mb-1 lg:mb-2">Epic Goals</p>
                    <p className="text-xs sm:text-xs lg:text-sm text-blue-600">Track & conquer your missions</p>
                  </div>
                  <div className="text-center p-2 sm:p-3 lg:p-4 rounded-lg sm:rounded-xl bg-gradient-to-b from-green-50 to-green-100 border border-green-200 hover:scale-105 transition-transform">
                    <p className="text-xs sm:text-sm lg:text-base text-green-700 font-bold mb-1 lg:mb-2">Daily Streaks</p>
                    <p className="text-xs sm:text-xs lg:text-sm text-green-600">Build unstoppable momentum</p>
                  </div>
                  <div className="text-center p-2 sm:p-3 lg:p-4 rounded-lg sm:rounded-xl bg-gradient-to-b from-purple-50 to-purple-100 border border-purple-200 hover:scale-105 transition-transform">
                    <p className="text-xs sm:text-sm lg:text-base text-purple-700 font-bold mb-1 lg:mb-2">Achievement Unlocks</p>
                    <p className="text-xs sm:text-xs lg:text-sm text-purple-600">Earn legendary badges</p>
                  </div>
                  <div className="text-center p-2 sm:p-3 lg:p-4 rounded-lg sm:rounded-xl bg-gradient-to-b from-amber-50 to-amber-100 border border-amber-200 hover:scale-105 transition-transform">
                    <p className="text-xs sm:text-sm lg:text-base text-amber-700 font-bold mb-1 lg:mb-2">Level Progress</p>
                    <p className="text-xs sm:text-xs lg:text-sm text-amber-600">Climb the ranks to greatness</p>
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