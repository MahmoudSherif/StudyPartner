import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle, ArrowLeft, Target, Rocket, Star, Sparkles } from 'lucide-react';

const EnhancedLogin: React.FC = () => {
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

  // Enhanced animated stars and cosmic effects
  useEffect(() => {
    const createCosmicElements = () => {
      const cosmicContainer = document.getElementById('cosmic-container');
      if (!cosmicContainer) return;

      cosmicContainer.innerHTML = '';
      
      // Create stars
      const numStars = window.innerWidth < 640 ? 100 : 200;
      for (let i = 0; i < numStars; i++) {
        const star = document.createElement('div');
        const size = Math.random() * 4 + 1;
        star.style.cssText = `
          position: absolute;
          width: ${size}px;
          height: ${size}px;
          background: ${['#ffffff', '#e0e7ff', '#ddd6fe', '#fef3c7', '#ecfdf5'][Math.floor(Math.random() * 5)]};
          border-radius: 50%;
          left: ${Math.random() * 100}%;
          top: ${Math.random() * 100}%;
          animation: twinkle ${Math.random() * 4 + 2}s infinite ease-in-out, drift ${Math.random() * 20 + 10}s infinite linear;
          opacity: ${Math.random() * 0.8 + 0.3};
          box-shadow: 0 0 ${size * 2}px rgba(255,255,255,0.4);
          z-index: 1;
        `;
        cosmicContainer.appendChild(star);
      }

      // Create floating cosmic particles
      const numParticles = window.innerWidth < 640 ? 20 : 40;
      for (let i = 0; i < numParticles; i++) {
        const particle = document.createElement('div');
        const size = Math.random() * 8 + 2;
        particle.style.cssText = `
          position: absolute;
          width: ${size}px;
          height: ${size}px;
          background: radial-gradient(circle, rgba(147, 51, 234, 0.6) 0%, transparent 70%);
          border-radius: 50%;
          left: ${Math.random() * 100}%;
          top: ${Math.random() * 100}%;
          animation: float ${Math.random() * 15 + 10}s infinite ease-in-out;
          opacity: ${Math.random() * 0.6 + 0.2};
          filter: blur(1px);
          z-index: 1;
        `;
        cosmicContainer.appendChild(particle);
      }

      // Create shooting stars
      if (window.innerWidth >= 640) {
        const numShootingStars = 3;
        for (let i = 0; i < numShootingStars; i++) {
          setTimeout(() => {
            const shootingStar = document.createElement('div');
            shootingStar.style.cssText = `
              position: absolute;
              width: 2px;
              height: 2px;
              background: #ffffff;
              border-radius: 50%;
              left: ${Math.random() * 100}%;
              top: ${Math.random() * 50}%;
              box-shadow: 0 0 6px #ffffff, -200px 0 20px rgba(255,255,255,0.3);
              animation: shoot 3s linear;
              z-index: 2;
            `;
            cosmicContainer.appendChild(shootingStar);
            setTimeout(() => shootingStar.remove(), 3000);
          }, Math.random() * 10000 + i * 3000);
        }
      }
    };

    createCosmicElements();
    
    const interval = setInterval(() => {
      if (window.innerWidth >= 640) {
        // Add occasional shooting stars
        const shootingStar = document.createElement('div');
        shootingStar.style.cssText = `
          position: absolute;
          width: 2px;
          height: 2px;
          background: #ffffff;
          border-radius: 50%;
          left: ${Math.random() * 100}%;
          top: ${Math.random() * 50}%;
          box-shadow: 0 0 6px #ffffff, -200px 0 20px rgba(255,255,255,0.3);
          animation: shoot 3s linear;
          z-index: 2;
        `;
        document.getElementById('cosmic-container')?.appendChild(shootingStar);
        setTimeout(() => shootingStar.remove(), 3000);
      }
    }, 15000);

    window.addEventListener('resize', createCosmicElements);
    return () => {
      window.removeEventListener('resize', createCosmicElements);
      clearInterval(interval);
    };
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
    <>
      <div className="min-h-screen min-h-dvh relative overflow-hidden grid place-items-center" style={{
        background: 'linear-gradient(135deg, #0c0a1a 0%, #1a1347 20%, #2d1b69 40%, #1e293b 60%, #0f172a 80%, #000212 100%)'
      }}>
      {/* Enhanced Cosmic Container */}
      <div id="cosmic-container" className="absolute inset-0"></div>
      
      {/* Dynamic Nebula Effects */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute w-80 h-80 sm:w-96 sm:h-96 lg:w-[500px] lg:h-[500px] rounded-full opacity-20 animate-pulse"
          style={{
            top: '5%',
            left: '5%',
            background: 'radial-gradient(ellipse at center, rgba(139, 92, 246, 0.4) 0%, rgba(59, 130, 246, 0.2) 40%, transparent 70%)',
            filter: 'blur(60px)',
            animationDuration: '8s'
          }}
        />
        <div 
          className="absolute w-72 h-72 sm:w-80 sm:h-80 lg:w-96 lg:h-96 rounded-full opacity-15 animate-pulse"
          style={{
            top: '40%',
            right: '0%',
            background: 'radial-gradient(ellipse at center, rgba(236, 72, 153, 0.4) 0%, rgba(168, 85, 247, 0.2) 40%, transparent 70%)',
            filter: 'blur(80px)',
            animationDuration: '6s',
            animationDelay: '2s'
          }}
        />
        <div 
          className="absolute w-64 h-64 sm:w-72 sm:h-72 lg:w-80 lg:h-80 rounded-full opacity-10 animate-pulse"
          style={{
            bottom: '10%',
            left: '20%',
            background: 'radial-gradient(ellipse at center, rgba(16, 185, 129, 0.3) 0%, rgba(6, 182, 212, 0.2) 40%, transparent 70%)',
            filter: 'blur(70px)',
            animationDuration: '10s',
            animationDelay: '4s'
          }}
        />
      </div>

      {/* Main Content Container - Using CSS Grid for perfect centering */}
      <div className="relative z-10 w-full max-w-md mx-auto p-4 sm:p-6">
          
          {/* Enhanced Login Card */}
          <div className="relative group">
            {/* Modern glowing border effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/50 via-blue-600/50 to-cyan-600/50 rounded-3xl blur-sm opacity-40 group-hover:opacity-60 transition-all duration-500 animate-pulse"></div>
            
            <div className="relative backdrop-blur-xl bg-gradient-to-b from-slate-900/95 to-slate-800/95 border border-white/20 rounded-3xl p-8 sm:p-10 shadow-2xl">
              
              {!showForgotPassword ? (
                // LOGIN FORM
                <>
                  {/* Enhanced Header */}
                  <div className="text-center mb-10">
                    <div className="relative inline-block mb-8">
                      {/* Enhanced animated icon background */}
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/60 via-blue-600/60 to-cyan-500/60 rounded-3xl blur-xl opacity-60 animate-pulse"></div>
                      <div className="relative p-6 bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 rounded-3xl shadow-2xl">
                        <Target className="w-10 h-10 text-white" />
                      </div>
                      {/* Floating sparkles around icon */}
                      <Sparkles className="absolute -top-3 -right-3 w-5 h-5 text-yellow-300 animate-bounce" style={{ animationDelay: '0s' }} />
                      <Star className="absolute -bottom-2 -left-2 w-4 h-4 text-purple-300 animate-bounce" style={{ animationDelay: '1s' }} />
                    </div>
                    
                    <h1 className="text-4xl sm:text-5xl font-black mb-4 bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent leading-tight">
                      StudyPartner
                    </h1>
                    <p className="text-gray-300 text-base sm:text-lg font-medium">
                      🚀 Begin your cosmic learning adventure
                    </p>
                  </div>

                  {/* Error Display */}
                  {error && (
                    <div className="bg-red-500/10 border border-red-400/30 rounded-2xl p-5 mb-8 flex items-start backdrop-blur-sm">
                      <AlertCircle size={22} className="text-red-300 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-red-200 text-sm font-medium">{error}</span>
                    </div>
                  )}

                  {/* Enhanced Login Form */}
                  <form onSubmit={handleSubmit} className="space-y-8">
                    
                    {/* Email Field */}
                    <div className="space-y-3">
                      <label className="block text-white font-semibold text-base sm:text-lg">
                        Email Address
                      </label>
                      <div className="relative group">
                        <input
                          type="email"
                          value={email}
                          onChange={handleEmailChange}
                          className="w-full bg-slate-800/60 text-white border-2 border-slate-600/40 rounded-2xl px-5 py-5 pl-14 text-base sm:text-lg transition-all duration-300 focus:border-purple-400 focus:ring-4 focus:ring-purple-500/10 focus:outline-none focus:bg-slate-800/80 group-hover:border-slate-500/60 placeholder-gray-400"
                          placeholder="you@example.com"
                          disabled={loading}
                          required
                        />
                        <Mail size={20} className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-purple-400 transition-colors" />
                        {email && !emailError && (
                          <CheckCircle size={20} className="absolute right-5 top-1/2 transform -translate-y-1/2 text-green-400" />
                        )}
                      </div>
                      {emailError && (
                        <div className="flex items-center text-red-300 text-sm font-medium mt-2">
                          <AlertCircle size={16} className="mr-2" />
                          {emailError}
                        </div>
                      )}
                    </div>

                    {/* Password Field */}
                    <div className="space-y-3">
                      <label className="block text-white font-semibold text-base sm:text-lg">
                        Password
                      </label>
                      <div className="relative group">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={handlePasswordChange}
                          className="w-full bg-slate-800/60 text-white border-2 border-slate-600/40 rounded-2xl px-5 py-5 pl-14 pr-14 text-base sm:text-lg transition-all duration-300 focus:border-purple-400 focus:ring-4 focus:ring-purple-500/10 focus:outline-none focus:bg-slate-800/80 group-hover:border-slate-500/60 placeholder-gray-400"
                          placeholder="••••••••"
                          disabled={loading}
                          required
                        />
                        <Lock size={20} className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-purple-400 transition-colors" />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                        >
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                      {passwordError && (
                        <div className="flex items-center text-red-300 text-sm font-medium mt-2">
                          <AlertCircle size={16} className="mr-2" />
                          {passwordError}
                        </div>
                      )}
                    </div>

                    {/* Forgot Password Link */}
                    <div className="text-right">
                      <button
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        className="text-purple-400 hover:text-purple-300 text-base font-medium transition-colors hover:underline"
                      >
                        Forgot your password? ✨
                      </button>
                    </div>

                    {/* Enhanced Submit Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full relative overflow-hidden bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 hover:from-purple-700 hover:via-blue-700 hover:to-cyan-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-5 px-8 rounded-2xl text-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl disabled:scale-100 shadow-xl disabled:cursor-not-allowed group"
                    >
                      {/* Enhanced button glow effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/30 via-blue-600/30 to-cyan-600/30 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      <div className="relative flex items-center justify-center">
                        {loading ? (
                          <>
                            <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent mr-3"></div>
                            <span>Launching into space...</span>
                          </>
                        ) : (
                          <>
                            <Rocket className="w-6 h-6 mr-3" />
                            <span>Sign In to StudyPartner</span>
                          </>
                        )}
                      </div>
                    </button>
                  </form>

                  {/* Enhanced Sign Up Link */}
                  <div className="mt-10 text-center">
                    <p className="text-gray-300 text-base sm:text-lg mb-6">
                      New to the cosmic journey? 🌟
                    </p>
                    <Link 
                      to="/signup" 
                      className="inline-flex items-center justify-center w-full bg-gradient-to-r from-slate-700/80 to-slate-600/80 hover:from-slate-600/90 hover:to-slate-500/90 text-white font-semibold py-4 px-8 rounded-2xl text-lg transition-all duration-300 transform hover:scale-[1.02] border border-slate-500/30 hover:border-slate-400/50 backdrop-blur-sm"
                    >
                      <Star className="w-6 h-6 mr-3 text-yellow-300" />
                      Create Your Account
                    </Link>
                  </div>
                </>
              ) : (
                // FORGOT PASSWORD FORM
                <>
                  <div className="text-center mb-8">
                    <button
                      onClick={closeForgotPassword}
                      className="absolute top-4 left-4 text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-800/50"
                    >
                      <ArrowLeft size={20} />
                    </button>
                    
                    <div className="inline-block mb-4 p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl">
                      <Lock size={24} className="text-white" />
                    </div>
                    
                    <h2 className="text-2xl font-bold text-white mb-2">Reset Password</h2>
                    <p className="text-gray-300 text-sm">
                      Enter your email to receive a reset link 📧
                    </p>
                  </div>

                  {resetSuccess ? (
                    <div className="bg-green-500/20 border border-green-400/50 rounded-xl p-6 text-center backdrop-blur-sm">
                      <CheckCircle size={48} className="text-green-400 mx-auto mb-4" />
                      <p className="text-green-200 font-semibold mb-2">Password reset email sent! 🎉</p>
                      <p className="text-gray-300 text-sm mb-6">
                        Check your inbox and follow the instructions to reset your password.
                      </p>
                      <button
                        onClick={closeForgotPassword}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300"
                      >
                        Back to Login
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleForgotPassword} className="space-y-6">
                      {resetError && (
                        <div className="bg-red-500/20 border border-red-400/50 rounded-xl p-4 flex items-start backdrop-blur-sm">
                          <AlertCircle size={20} className="text-red-300 mr-3 mt-0.5" />
                          <span className="text-red-200 text-sm font-medium">{resetError}</span>
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        <label className="block text-white font-semibold text-sm sm:text-base">
                          Email Address
                        </label>
                        <div className="relative">
                          <input
                            type="email"
                            value={resetEmail}
                            onChange={(e) => setResetEmail(e.target.value)}
                            className="w-full bg-slate-800/80 text-white border-2 border-slate-600/50 rounded-xl px-4 py-4 pl-12 text-sm sm:text-base transition-all duration-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none"
                            placeholder="you@example.com"
                            disabled={resetLoading}
                            required
                          />
                          <Mail size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button
                          type="submit"
                          disabled={resetLoading}
                          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 disabled:cursor-not-allowed"
                        >
                          {resetLoading ? (
                            <div className="flex items-center justify-center">
                              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                              Sending...
                            </div>
                          ) : (
                            'Send Reset Link'
                          )}
                        </button>
                        
                        <button
                          type="button"
                          onClick={closeForgotPassword}
                          className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-4 px-6 rounded-xl transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Animations */}
        <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1) rotate(0deg); }
          50% { opacity: 1; transform: scale(1.2) rotate(180deg); }
        }
        
        @keyframes drift {
          from { transform: translateX(-10px); }
          to { transform: translateX(10px); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        @keyframes shoot {
          0% { transform: translateX(0) translateY(0) rotate(45deg); opacity: 1; }
          100% { transform: translateX(300px) translateY(150px) rotate(45deg); opacity: 0; }
        }
        
        /* Enhanced mobile optimizations */
        @media (max-width: 640px) {
          .text-4xl { font-size: 2rem; }
          .text-5xl { font-size: 2.5rem; }
          input { font-size: 16px !important; } /* Prevents zoom on iOS */
        }
        
        /* Better touch targets for mobile and accessibility */
        button, input, [role="button"] {
          min-height: 48px;
          touch-action: manipulation;
        }
        
        /* Enhanced focus styles for better accessibility */
        input:focus, button:focus {
          outline: 3px solid rgba(139, 92, 246, 0.4);
          outline-offset: 2px;
        }
        
        /* Improved form field styling */
        input::placeholder {
          color: rgba(156, 163, 175, 0.6);
          font-weight: 500;
        }
        
        input:focus::placeholder {
          color: rgba(156, 163, 175, 0.3);
        }
        
        /* Enhanced container centering using CSS Grid */
        .grid.place-items-center {
          display: grid;
          place-items: center;
          min-height: 100vh;
          min-height: 100dvh;
        }
      `}</style>
      </div>
    </>
  );
};

export default EnhancedLogin;