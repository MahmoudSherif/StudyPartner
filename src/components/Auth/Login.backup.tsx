import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle, ArrowLeft, Star, Zap, Target, Crown } from 'lucide-react';

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

  // Create animated stars effect - Updated version
  useEffect(() => {
    const createStars = () => {
      const starsContainer = document.getElementById('stars-container');
      if (!starsContainer) return;

      // Clear existing stars
      starsContainer.innerHTML = '';

      const numStars = 100;
      for (let i = 0; i < numStars; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.cssText = `
          position: absolute;
          width: ${Math.random() * 3 + 1}px;
          height: ${Math.random() * 3 + 1}px;
          background: white;
          border-radius: 50%;
          left: ${Math.random() * 100}%;
          top: ${Math.random() * 100}%;
          animation: twinkle ${Math.random() * 4 + 2}s infinite;
          opacity: ${Math.random() * 0.8 + 0.2};
        `;
        starsContainer.appendChild(star);
      }
    };

    createStars();
  }, []);

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
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Animated Space Background with Stars */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Stars Container */}
        <div id="stars-container" className="absolute inset-0"></div>
        
        {/* Animated Nebula Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>

        {/* Shooting Stars */}
        <div className="absolute inset-0">
          <div className="shooting-star"></div>
          <div className="shooting-star delay-1000"></div>
          <div className="shooting-star delay-2000"></div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        
        @keyframes shooting {
          0% { transform: translateX(-100px) translateY(100px); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateX(300px) translateY(-100px); opacity: 0; }
        }
        
        .shooting-star {
          position: absolute;
          top: 20%;
          left: 0;
          width: 2px;
          height: 2px;
          background: linear-gradient(45deg, white, transparent);
          border-radius: 50%;
          animation: shooting 3s infinite;
        }
        
        .shooting-star::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 50px;
          height: 1px;
          background: linear-gradient(90deg, white, transparent);
          transform: translateX(-50px);
        }
        
        .delay-1000 {
          animation-delay: 1s;
          top: 40%;
        }
        
        .delay-2000 {
          animation-delay: 2s;
          top: 60%;
        }
      `}</style>

      {/* PERFECTLY CENTERED LOGIN FORM - TRANSFORM APPROACH */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md px-4 z-10">
        <div>
          {!showForgotPassword ? (
            /* Login Form */
            <div className="relative rounded-3xl shadow-2xl p-8" style={{
              background: 'rgba(15, 23, 42, 0.95)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '2px solid rgba(59, 130, 246, 0.3)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              minHeight: '500px'
            }}>
              
              {/* Logo and Title */}
              <div className="text-center mb-8">
                <div className="relative inline-block mb-6">
                  <div className="w-24 h-24 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-2xl mx-auto">
                    <Target className="w-12 h-12 text-white" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-ping opacity-20"></div>
                </div>
                
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                  🚀 Welcome to Space Login 🌟
                </h2>
                <p className="text-gray-300">Sign in to continue your journey</p>
              </div>

              {/* Error Display */}
              {error && (
                <div className="mb-6 p-4 bg-red-500/20 backdrop-blur-sm border border-red-400/30 rounded-xl">
                  <p className="text-red-200 text-sm flex items-start font-medium">
                    <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </p>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div>
                  <label className="block text-white font-semibold mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={handleEmailChange}
                      className="w-full text-white border-2 rounded-xl py-4 px-4 pl-12 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all duration-200"
                      style={{
                        background: 'rgba(30, 41, 59, 0.8)',
                        borderColor: 'rgba(71, 85, 105, 0.8)'
                      }}
                      placeholder="you@example.com"
                      disabled={loading}
                      required
                    />
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-300" />
                    {email && !emailError && (
                      <CheckCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-400" />
                    )}
                  </div>
                  {emailError && (
                    <p className="mt-2 text-sm text-red-300 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>{emailError}</span>
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-white font-semibold mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={handlePasswordChange}
                      className="w-full text-white border-2 rounded-xl py-4 px-4 pl-12 pr-12 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all duration-200"
                      style={{
                        background: 'rgba(30, 41, 59, 0.8)',
                        borderColor: 'rgba(71, 85, 105, 0.8)'
                      }}
                      placeholder="Your secret key"
                      disabled={loading}
                      required
                    />
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-300" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {passwordError && (
                    <p className="mt-2 text-sm text-red-300 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>{passwordError}</span>
                    </p>
                  )}
                </div>

                {/* Remember & Forgot Password */}
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center text-gray-300 cursor-pointer">
                    <input type="checkbox" className="mr-2 rounded border-gray-600 bg-white/20" />
                    Remember me
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
                    disabled={loading}
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Sign In Button */}
                <button
                  type="submit"
                  disabled={loading || !!emailError || !!passwordError}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl shadow-2xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-all duration-700"></div>
                  <span className="flex items-center justify-center gap-3 relative z-10">
                    {loading ? (
                      <>
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Signing in...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-6 h-6" />
                        <span className="text-lg font-bold">Sign In</span>
                      </>
                    )}
                  </span>
                </button>

                {/* Divider */}
                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/30"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-4 py-2 bg-white/10 backdrop-blur-sm text-gray-300 font-medium rounded-full border border-white/20">
                      New here?
                    </span>
                  </div>
                </div>

                {/* Sign Up Link */}
                <Link 
                  to="/signup" 
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 shadow-2xl transform hover:scale-[1.02] transition-all duration-200 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-all duration-700"></div>
                  <Star className="w-6 h-6 text-yellow-300 relative z-10" />
                  <span className="text-lg font-bold relative z-10">Create an account</span>
                  <Crown className="w-6 h-6 text-yellow-300 relative z-10" />
                </Link>
              </form>
            </div>
          ) : (
            /* Forgot Password Panel */
            <div className="relative rounded-3xl shadow-2xl p-8" style={{
              background: 'rgba(15, 23, 42, 0.95)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '2px solid rgba(59, 130, 246, 0.3)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              minHeight: '400px'
            }}>
              
              <div className="flex items-center mb-6">
                <button
                  onClick={closeForgotPassword}
                  className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all mr-3"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Lock className="w-6 h-6 text-blue-400" />
                  Reset Password
                </h2>
              </div>

              {resetSuccess ? (
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                    <CheckCircle className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">Email Sent Successfully! 🎉</h3>
                  <p className="text-gray-300 mb-6">
                    We've sent a password reset link to <strong className="text-blue-400">{resetEmail}</strong>
                  </p>
                  <p className="text-gray-400 text-sm mb-8">
                    Check your inbox and follow the instructions to reset your password.
                  </p>
                  <button
                    onClick={closeForgotPassword}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-xl shadow-2xl transform hover:scale-[1.02] transition-all duration-200"
                  >
                    Back to Login
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-gray-300 mb-6 text-center">
                    No worries! Enter your email and we'll send you instructions to reset your password.
                  </p>

                  {resetError && (
                    <div className="mb-6 p-4 bg-red-500/20 backdrop-blur-sm border border-red-400/30 rounded-xl">
                      <p className="text-red-200 text-sm flex items-center">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        {resetError}
                      </p>
                    </div>
                  )}

                  <form onSubmit={handleForgotPassword} className="space-y-6">
                    <div>
                      <label className="block text-white font-semibold mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          className="w-full text-white border-2 rounded-xl py-4 px-4 pl-12 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all duration-200"
                          style={{
                            background: 'rgba(30, 41, 59, 0.8)',
                            borderColor: 'rgba(71, 85, 105, 0.8)'
                          }}
                          placeholder="Enter your email"
                          disabled={resetLoading}
                          required
                        />
                        <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-300" />
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        type="submit"
                        disabled={resetLoading}
                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-xl shadow-2xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {resetLoading ? (
                          <span className="flex items-center justify-center">
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                            Sending...
                          </span>
                        ) : (
                          'Send Reset Link'
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={closeForgotPassword}
                        className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-4 px-6 rounded-xl shadow-2xl transform hover:scale-[1.02] transition-all duration-200"
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

      {/* Footer */}
      <div className="absolute bottom-4 left-0 right-0 z-20">
        <div className="text-center">
          <p className="text-gray-400 text-sm">
            Built with ❤️ for students who aspire to achieve more
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
