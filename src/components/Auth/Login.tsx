import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle, ArrowLeft, Target } from 'lucide-react';

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

  // Create animated stars effect
  useEffect(() => {
    const createStars = () => {
      const starsContainer = document.getElementById('stars-container');
      if (!starsContainer) return;

      starsContainer.innerHTML = '';
      const numStars = window.innerWidth < 640 ? 80 : 150; // Fewer stars on mobile
      
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
          opacity: ${Math.random() * 0.8 + 0.3};
          box-shadow: 0 0 8px rgba(255,255,255,0.4);
        `;
        starsContainer.appendChild(star);
      }
    };

    createStars();
    window.addEventListener('resize', createStars);
    return () => window.removeEventListener('resize', createStars);
  }, []);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
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

  const validatePassword = (password: string): boolean => {
    if (!password.trim()) {
      setPasswordError('Password is required');
      return false;
    }
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (value.trim()) {
      validateEmail(value);
    } else {
      setEmailError('');
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    if (value.trim()) {
      validatePassword(value);
    } else {
      setPasswordError('');
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
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.message.toLowerCase();
      
      if (errorMessage.includes('user-not-found') || errorMessage.includes('wrong-password')) {
        setError('Invalid email or password');
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
    <div className="min-h-screen relative overflow-hidden font-sans" style={{
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #0f172a 50%, #1e1b4b 75%, #0f172a 100%)'
    }}>
      
      {/* Stars Container */}
      <div id="stars-container" className="absolute inset-0 z-10"></div>
      
      {/* Animated Nebula Effects - Responsive */}
      <div 
        className="absolute w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 rounded-full blur-3xl opacity-30 animate-pulse z-10"
        style={{
          top: '10%',
          left: '10%',
          background: 'radial-gradient(circle, rgba(147, 51, 234, 0.4) 0%, transparent 70%)',
          animationDuration: '4s'
        }}
      ></div>
      
      <div 
        className="absolute w-56 h-56 sm:w-72 sm:h-72 lg:w-80 lg:h-80 rounded-full blur-3xl opacity-30 animate-pulse z-10"
        style={{
          top: '60%',
          right: '10%',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%)',
          animationDuration: '4s',
          animationDelay: '2s'
        }}
      ></div>

      {/* Main Content - Fully Responsive */}
      <div className="flex items-center justify-center min-h-screen p-4 relative z-20">
        <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg">
          <div className="backdrop-blur-xl rounded-3xl p-6 sm:p-8 lg:p-12 border-4 border-white/30 shadow-2xl bg-slate-900/95">
            
            {!showForgotPassword ? (
              // LOGIN FORM
              <>
                {/* Logo and Title */}
                <div className="text-center mb-6 sm:mb-8">
                  <div className="inline-block relative mb-4 sm:mb-6">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 rounded-2xl blur-lg opacity-60 animate-pulse"></div>
                    <div 
                      className="relative p-3 sm:p-4 rounded-2xl shadow-lg"
                      style={{ 
                        background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #06b6d4 100%)'
                      }}
                    >
                      <Target className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    </div>
                  </div>
                  
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mb-2 bg-gradient-to-r from-white via-blue-200 to-cyan-200 bg-clip-text text-transparent">
                    StudyPartner
                  </h1>
                  <p className="text-gray-400 text-sm sm:text-base">
                    Sign in to continue your cosmic learning journey
                  </p>
                </div>

                {/* Error Display */}
                {error && (
                  <div className="bg-red-500/20 border border-red-500/40 rounded-xl p-4 mb-6 flex items-start">
                    <AlertCircle size={20} className="text-red-300 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-red-300 text-sm">{error}</span>
                  </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email Field */}
                  <div>
                    <label className="block text-white font-semibold mb-2 text-sm sm:text-base">
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={email}
                        onChange={handleEmailChange}
                        className="w-full bg-slate-800/90 text-white border-2 border-slate-600 rounded-xl px-4 py-3 sm:py-4 pl-12 text-sm sm:text-base transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                        placeholder="you@example.com"
                        disabled={loading}
                        required
                      />
                      <Mail size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      {email && !emailError && (
                        <CheckCircle size={18} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-green-400" />
                      )}
                    </div>
                    {emailError && (
                      <div className="flex items-center mt-2 text-red-300 text-sm">
                        <AlertCircle size={14} className="mr-2" />
                        {emailError}
                      </div>
                    )}
                  </div>

                  {/* Password Field */}
                  <div>
                    <label className="block text-white font-semibold mb-2 text-sm sm:text-base">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={handlePasswordChange}
                        className="w-full bg-slate-800/90 text-white border-2 border-slate-600 rounded-xl px-4 py-3 sm:py-4 pl-12 pr-12 text-sm sm:text-base transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                        placeholder="••••••••"
                        disabled={loading}
                        required
                      />
                      <Lock size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {passwordError && (
                      <div className="flex items-center mt-2 text-red-300 text-sm">
                        <AlertCircle size={14} className="mr-2" />
                        {passwordError}
                      </div>
                    )}
                  </div>

                  {/* Forgot Password Link */}
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
                    >
                      Forgot your password?
                    </button>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-3 sm:py-4 px-6 rounded-xl text-sm sm:text-base transition-all duration-300 transform hover:scale-[1.02] disabled:scale-100 shadow-lg disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                        Signing in...
                      </div>
                    ) : (
                      'Sign In'
                    )}
                  </button>
                </form>

                {/* Sign Up Link */}
                <div className="mt-8 text-center">
                  <p className="text-gray-400 text-sm sm:text-base">
                    Don't have an account?{' '}
                    <Link 
                      to="/signup" 
                      className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                    >
                      Sign up here
                    </Link>
                  </p>
                </div>
              </>
            ) : (
              // FORGOT PASSWORD FORM
              <>
                <div className="text-center mb-6 sm:mb-8">
                  <button
                    onClick={closeForgotPassword}
                    className="absolute top-4 left-4 text-gray-400 hover:text-white transition-colors"
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Reset Password</h2>
                  <p className="text-gray-400 text-sm sm:text-base">
                    Enter your email to receive a reset link
                  </p>
                </div>

                {resetSuccess ? (
                  <div className="bg-green-500/20 border border-green-500/40 rounded-xl p-6 text-center">
                    <CheckCircle size={48} className="text-green-400 mx-auto mb-4" />
                    <p className="text-green-300 mb-4">Password reset email sent!</p>
                    <p className="text-gray-400 text-sm mb-4">
                      Check your inbox and follow the instructions to reset your password.
                    </p>
                    <button
                      onClick={closeForgotPassword}
                      className="text-blue-400 hover:text-blue-300 font-semibold"
                    >
                      Back to login
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleForgotPassword} className="space-y-6">
                    {resetError && (
                      <div className="bg-red-500/20 border border-red-500/40 rounded-xl p-4 flex items-start">
                        <AlertCircle size={20} className="text-red-300 mr-3 mt-0.5" />
                        <span className="text-red-300 text-sm">{resetError}</span>
                      </div>
                    )}
                    
                    <div>
                      <label className="block text-white font-semibold mb-2 text-sm sm:text-base">
                        Email Address
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          className="w-full bg-slate-800/90 text-white border-2 border-slate-600 rounded-xl px-4 py-3 sm:py-4 pl-12 text-sm sm:text-base transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                          placeholder="you@example.com"
                          disabled={resetLoading}
                          required
                        />
                        <Mail size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={resetLoading}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-3 sm:py-4 px-6 rounded-xl text-sm sm:text-base transition-all duration-300 transform hover:scale-[1.02] disabled:scale-100 shadow-lg disabled:cursor-not-allowed"
                    >
                      {resetLoading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                          Sending...
                        </div>
                      ) : (
                        'Send Reset Email'
                      )}
                    </button>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Add animations */}
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.3); }
        }
      `}</style>
    </div>
  );
};

export default Login;
