import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle, Target, Rocket, Star, Sparkles, Shield } from 'lucide-react';

const EnhancedSignup: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  // Enhanced animated cosmos effect
  useEffect(() => {
    const createCosmicElements = () => {
      const cosmicContainer = document.getElementById('cosmic-container');
      if (!cosmicContainer) return;

      cosmicContainer.innerHTML = '';
      
      // Create stars with varied colors and sizes
      const numStars = window.innerWidth < 640 ? 120 : 250;
      for (let i = 0; i < numStars; i++) {
        const star = document.createElement('div');
        const size = Math.random() * 4 + 1;
        const colors = ['#ffffff', '#fef3c7', '#ddd6fe', '#ecfdf5', '#fce7f3', '#e0f2fe'];
        star.style.cssText = `
          position: absolute;
          width: ${size}px;
          height: ${size}px;
          background: ${colors[Math.floor(Math.random() * colors.length)]};
          border-radius: 50%;
          left: ${Math.random() * 100}%;
          top: ${Math.random() * 100}%;
          animation: twinkle ${Math.random() * 4 + 2}s infinite ease-in-out, drift ${Math.random() * 20 + 10}s infinite linear;
          opacity: ${Math.random() * 0.8 + 0.3};
          box-shadow: 0 0 ${size * 3}px rgba(255,255,255,0.3);
          z-index: 1;
        `;
        cosmicContainer.appendChild(star);
      }

      // Create cosmic dust particles
      const numDust = window.innerWidth < 640 ? 30 : 60;
      for (let i = 0; i < numDust; i++) {
        const dust = document.createElement('div');
        const size = Math.random() * 6 + 1;
        dust.style.cssText = `
          position: absolute;
          width: ${size}px;
          height: ${size}px;
          background: radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, rgba(59, 130, 246, 0.2) 50%, transparent 80%);
          border-radius: 50%;
          left: ${Math.random() * 100}%;
          top: ${Math.random() * 100}%;
          animation: float ${Math.random() * 15 + 8}s infinite ease-in-out;
          opacity: ${Math.random() * 0.5 + 0.2};
          filter: blur(1px);
          z-index: 1;
        `;
        cosmicContainer.appendChild(dust);
      }

      // Create constellation lines (desktop only)
      if (window.innerWidth >= 768) {
        const numConstellations = 3;
        for (let i = 0; i < numConstellations; i++) {
          const constellation = document.createElement('div');
          constellation.style.cssText = `
            position: absolute;
            width: ${Math.random() * 100 + 50}px;
            height: 2px;
            background: linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.3), transparent);
            left: ${Math.random() * 80 + 10}%;
            top: ${Math.random() * 80 + 10}%;
            animation: fadeInOut ${Math.random() * 10 + 5}s infinite ease-in-out;
            transform: rotate(${Math.random() * 360}deg);
            z-index: 1;
          `;
          cosmicContainer.appendChild(constellation);
        }
      }

      // Create shooting stars periodically
      if (window.innerWidth >= 640) {
        const createShootingStar = () => {
          const shootingStar = document.createElement('div');
          shootingStar.style.cssText = `
            position: absolute;
            width: 3px;
            height: 3px;
            background: #ffffff;
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 50}%;
            box-shadow: 0 0 8px #ffffff, -300px 0 30px rgba(255,255,255,0.2);
            animation: shoot 4s linear;
            z-index: 2;
          `;
          cosmicContainer.appendChild(shootingStar);
          setTimeout(() => shootingStar.remove(), 4000);
        };

        // Initial shooting stars
        for (let i = 0; i < 2; i++) {
          setTimeout(createShootingStar, Math.random() * 5000 + i * 2000);
        }

        // Periodic shooting stars
        const shootingInterval = setInterval(createShootingStar, 12000);
        return () => clearInterval(shootingInterval);
      }
    };

    createCosmicElements();
    window.addEventListener('resize', createCosmicElements);
    return () => window.removeEventListener('resize', createCosmicElements);
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
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      setPasswordError('Password must contain uppercase, lowercase, and number');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const validateConfirmPassword = (confirmPassword: string): boolean => {
    if (!confirmPassword.trim()) {
      setConfirmPasswordError('Please confirm your password');
      return false;
    }
    if (confirmPassword !== password) {
      setConfirmPasswordError('Passwords do not match');
      return false;
    }
    setConfirmPasswordError('');
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
    // Re-validate confirm password if it exists
    if (confirmPassword) {
      validateConfirmPassword(confirmPassword);
    }
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setConfirmPassword(value);
    if (value.trim()) {
      validateConfirmPassword(value);
    } else {
      setConfirmPasswordError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    const isConfirmPasswordValid = validateConfirmPassword(confirmPassword);
    
    if (!isEmailValid || !isPasswordValid || !isConfirmPasswordValid) {
      return;
    }

    try {
      setError('');
      setLoading(true);
      await signup(email, password);
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Signup error:', error);
      const errorMessage = error.message.toLowerCase();
      
      if (errorMessage.includes('email-already-in-use')) {
        setError('An account with this email already exists');
      } else if (errorMessage.includes('weak-password')) {
        setError('Password is too weak. Please choose a stronger password');
      } else if (errorMessage.includes('invalid-email')) {
        setError('Invalid email address');
      } else {
        setError('Failed to create account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (password: string): { strength: number; text: string; color: string } => {
    if (password.length === 0) return { strength: 0, text: '', color: '' };
    
    let strength = 0;
    let text = '';
    let color = '';
    
    if (password.length >= 6) strength += 1;
    if (password.length >= 8) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/\d/.test(password)) strength += 1;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 1;
    
    if (strength <= 2) {
      text = 'Weak 🔴';
      color = 'text-red-400';
    } else if (strength <= 4) {
      text = 'Medium 🟡';
      color = 'text-yellow-400';
    } else {
      text = 'Strong 🟢';
      color = 'text-green-400';
    }
    
    return { strength, text, color };
  };

  const passwordStrength = getPasswordStrength(password);

  return (
    <div className="min-h-screen relative overflow-hidden" style={{
      background: 'linear-gradient(135deg, #0c0a1a 0%, #1a1347 15%, #2d1b69 30%, #4c1d95 45%, #1e293b 60%, #0f172a 80%, #000212 100%)'
    }}>
      
      {/* Enhanced Cosmic Container */}
      <div id="cosmic-container" className="absolute inset-0"></div>
      
      {/* Advanced Nebula Effects */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute w-96 h-96 sm:w-[500px] sm:h-[500px] lg:w-[600px] lg:h-[600px] rounded-full opacity-15 animate-pulse"
          style={{
            top: '0%',
            left: '0%',
            background: 'radial-gradient(ellipse at center, rgba(168, 85, 247, 0.6) 0%, rgba(139, 92, 246, 0.3) 30%, rgba(59, 130, 246, 0.2) 50%, transparent 70%)',
            filter: 'blur(80px)',
            animationDuration: '12s'
          }}
        />
        <div 
          className="absolute w-80 h-80 sm:w-96 sm:h-96 lg:w-[500px] lg:h-[500px] rounded-full opacity-20 animate-pulse"
          style={{
            top: '30%',
            right: '-10%',
            background: 'radial-gradient(ellipse at center, rgba(236, 72, 153, 0.5) 0%, rgba(168, 85, 247, 0.3) 40%, rgba(59, 130, 246, 0.1) 70%, transparent 80%)',
            filter: 'blur(60px)',
            animationDuration: '8s',
            animationDelay: '3s'
          }}
        />
        <div 
          className="absolute w-72 h-72 sm:w-80 sm:h-80 lg:w-96 lg:h-96 rounded-full opacity-12 animate-pulse"
          style={{
            bottom: '0%',
            left: '10%',
            background: 'radial-gradient(ellipse at center, rgba(16, 185, 129, 0.4) 0%, rgba(6, 182, 212, 0.3) 50%, rgba(147, 51, 234, 0.2) 80%, transparent 90%)',
            filter: 'blur(90px)',
            animationDuration: '15s',
            animationDelay: '6s'
          }}
        />
      </div>

      {/* Enhanced Main Content Container with Better Centering */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md mx-auto">
          {/* Grid fallback for better browser support */}
          <div className="hidden sm:block absolute inset-0 min-h-screen" style={{
            display: 'grid',
            placeItems: 'center',
            gridTemplateRows: '1fr auto 1fr',
            pointerEvents: 'none'
          }}></div>
          
          {/* Enhanced Signup Card with Better Modern Design */}
          <div className="relative group transform transition-all duration-300 hover:scale-[1.01]">
            {/* Enhanced multi-layer glowing border effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 via-blue-600 to-cyan-600 rounded-3xl blur-sm opacity-25 group-hover:opacity-40 transition duration-500 animate-pulse"></div>
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 rounded-3xl blur-xs opacity-15 group-hover:opacity-25 transition duration-300"></div>
            
            <div className="relative backdrop-blur-2xl bg-slate-900/95 border border-white/20 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl">
              {/* Enhanced glass morphism effect */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/5 via-white/10 to-transparent pointer-events-none"></div>
              
              {/* Enhanced Header with Better Typography */}
              <div className="text-center mb-8 lg:mb-10">
                <div className="relative inline-block mb-6 lg:mb-8">
                  {/* Enhanced multi-layer animated background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-500 rounded-2xl blur-2xl opacity-40 animate-pulse"></div>
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl blur-lg opacity-60 animate-pulse" style={{animationDelay: '1s'}}></div>
                  
                  <div className="relative p-4 lg:p-5 bg-gradient-to-br from-purple-600 via-pink-500 to-cyan-500 rounded-2xl shadow-2xl transform hover:scale-110 transition-all duration-500">
                    <Target className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
                  </div>
                  
                  {/* Enhanced floating sparkles with better positioning */}
                  <Sparkles className="absolute -top-2 -right-2 w-4 h-4 lg:w-5 lg:h-5 text-yellow-300 animate-bounce" style={{ animationDelay: '0s' }} />
                  <Star className="absolute -bottom-1 -left-1 w-3 h-3 lg:w-4 lg:h-4 text-purple-300 animate-bounce" style={{ animationDelay: '1s' }} />
                  <Star className="absolute top-1 -right-3 w-2 h-2 text-cyan-300 animate-bounce" style={{ animationDelay: '2s' }} />
                  <Star className="absolute -top-1 left-1/2 w-2 h-2 text-pink-300 animate-bounce" style={{ animationDelay: '2.5s' }} />
                </div>
                
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-3 lg:mb-4 bg-gradient-to-r from-white via-purple-200 via-pink-200 to-cyan-200 bg-clip-text text-transparent leading-tight tracking-tight">
                  Join StudyPartner
                </h1>
                <p className="text-gray-300 text-sm sm:text-base lg:text-lg font-medium leading-relaxed">
                  🌟 Begin your cosmic learning adventure today
                </p>
              </div>

              {/* Error Display */}
              {error && (
                <div className="bg-red-500/20 border border-red-400/50 rounded-xl p-4 mb-6 flex items-start backdrop-blur-sm">
                  <AlertCircle size={20} className="text-red-300 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-red-200 text-sm font-medium">{error}</span>
                </div>
              )}

              {/* Enhanced Signup Form with Better Spacing */}
              <form onSubmit={handleSubmit} className="space-y-6 lg:space-y-7">
                
                {/* Enhanced Email Field */}
                <div className="space-y-2 lg:space-y-3">
                  <label className="flex items-center text-white font-semibold text-sm sm:text-base lg:text-lg">
                    <Mail size={16} className="mr-2 text-purple-400" />
                    Email Address
                  </label>
                  <div className="relative group">
                    <input
                      type="email"
                      value={email}
                      onChange={handleEmailChange}
                      className="w-full bg-slate-800/80 text-white border-2 border-slate-600/50 rounded-xl px-4 py-4 lg:py-5 pl-12 lg:pl-14 text-sm sm:text-base lg:text-lg transition-all duration-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none focus:bg-slate-800/90 group-hover:border-slate-500 group-hover:bg-slate-800/85"
                      placeholder="astronaut@cosmos.com"
                      disabled={loading}
                      required
                    />
                    <Mail size={18} className="absolute left-4 lg:left-5 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-purple-400 transition-colors" />
                    {email && !emailError && (
                      <CheckCircle size={18} className="absolute right-4 lg:right-5 top-1/2 transform -translate-y-1/2 text-green-400" />
                    )}
                  </div>
                  {emailError && (
                    <div className="flex items-center text-red-300 text-sm lg:text-base font-medium">
                      <AlertCircle size={14} className="mr-2" />
                      {emailError}
                    </div>
                  )}
                </div>

                {/* Enhanced Password Field */}
                <div className="space-y-2 lg:space-y-3">
                  <label className="flex items-center text-white font-semibold text-sm sm:text-base lg:text-lg">
                    <Shield size={16} className="mr-2 text-purple-400" />
                    Password
                  </label>
                  <div className="relative group">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={handlePasswordChange}
                      className="w-full bg-slate-800/80 text-white border-2 border-slate-600/50 rounded-xl px-4 py-4 lg:py-5 pl-12 lg:pl-14 pr-12 lg:pr-14 text-sm sm:text-base lg:text-lg transition-all duration-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none focus:bg-slate-800/90 group-hover:border-slate-500 group-hover:bg-slate-800/85"
                      placeholder="Create a strong password"
                      disabled={loading}
                      required
                    />
                    <Lock size={18} className="absolute left-4 lg:left-5 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-purple-400 transition-colors" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 lg:right-5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-700/50"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  
                  {/* Enhanced Password Strength Indicator */}
                  {password && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">Password Strength:</span>
                        <span className={`text-xs font-semibold ${passwordStrength.color}`}>
                          {passwordStrength.text}
                        </span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${
                            passwordStrength.strength <= 2 ? 'bg-gradient-to-r from-red-500 to-red-400' : 
                            passwordStrength.strength <= 4 ? 'bg-gradient-to-r from-yellow-500 to-orange-400' : 
                            'bg-gradient-to-r from-green-500 to-emerald-400'
                          }`}
                          style={{ 
                            width: `${(passwordStrength.strength / 6) * 100}%`,
                            boxShadow: passwordStrength.strength > 4 ? '0 0 10px rgba(16, 185, 129, 0.3)' : ''
                          }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  {passwordError && (
                    <div className="flex items-center text-red-300 text-sm font-medium">
                      <AlertCircle size={14} className="mr-2" />
                      {passwordError}
                    </div>
                  )}
                </div>

                {/* Enhanced Confirm Password Field */}
                <div className="space-y-2 lg:space-y-3">
                  <label className="flex items-center text-white font-semibold text-sm sm:text-base lg:text-lg">
                    <Shield size={16} className="mr-2 text-purple-400" />
                    Confirm Password
                  </label>
                  <div className="relative group">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={handleConfirmPasswordChange}
                      className="w-full bg-slate-800/80 text-white border-2 border-slate-600/50 rounded-xl px-4 py-4 lg:py-5 pl-12 lg:pl-14 pr-12 lg:pr-14 text-sm sm:text-base lg:text-lg transition-all duration-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none focus:bg-slate-800/90 group-hover:border-slate-500 group-hover:bg-slate-800/85"
                      placeholder="Confirm your password"
                      disabled={loading}
                      required
                    />
                    <Lock size={18} className="absolute left-4 lg:left-5 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-purple-400 transition-colors" />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 lg:right-5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-700/50"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                    {confirmPassword && !confirmPasswordError && confirmPassword === password && (
                      <CheckCircle size={18} className="absolute right-12 lg:right-14 top-1/2 transform -translate-y-1/2 text-green-400" />
                    )}
                  </div>
                  {confirmPasswordError && (
                    <div className="flex items-center text-red-300 text-sm lg:text-base font-medium">
                      <AlertCircle size={14} className="mr-2" />
                      {confirmPasswordError}
                    </div>
                  )}
                </div>

                {/* Enhanced Submit Button with Better Modern Design */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-600 hover:from-purple-700 hover:via-pink-600 hover:to-cyan-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-4 lg:py-5 px-6 lg:px-8 rounded-xl text-base lg:text-lg transition-all duration-300 transform hover:scale-[1.02] disabled:scale-100 shadow-xl hover:shadow-2xl disabled:cursor-not-allowed group"
                >
                  {/* Enhanced button glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/50 via-pink-500/50 to-cyan-600/50 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="relative flex items-center justify-center gap-3">
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 lg:h-6 lg:w-6 border-2 border-white border-t-transparent"></div>
                        <span className="font-semibold">Creating your cosmic account...</span>
                      </>
                    ) : (
                      <>
                        <Rocket className="w-5 h-5 lg:w-6 lg:h-6" />
                        <span className="font-semibold">Launch Your Journey</span>
                        <Sparkles className="w-4 h-4 lg:w-5 lg:h-5" />
                      </>
                    )}
                  </div>
                </button>
              </form>

              {/* Enhanced Sign In Link with Better Spacing */}
              <div className="mt-8 lg:mt-10 text-center">
                <p className="text-gray-300 text-sm sm:text-base lg:text-lg mb-4 lg:mb-6 leading-relaxed">
                  Already part of our cosmic community? ✨
                </p>
                <Link 
                  to="/login" 
                  className="inline-flex items-center justify-center w-full bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-white font-semibold py-3 lg:py-4 px-6 lg:px-8 rounded-xl text-base lg:text-lg transition-all duration-300 transform hover:scale-[1.02] border border-slate-500/50 hover:border-slate-400/50 shadow-lg hover:shadow-xl"
                >
                  <Star className="w-5 h-5 lg:w-6 lg:h-6 mr-3 text-yellow-300" />
                  Sign In Instead
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Animations */}
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1) rotate(0deg); }
          50% { opacity: 1; transform: scale(1.3) rotate(180deg); }
        }
        
        @keyframes drift {
          from { transform: translateX(-15px); }
          to { transform: translateX(15px); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-15px) rotate(120deg); }
          66% { transform: translateY(-30px) rotate(240deg); }
        }
        
        @keyframes shoot {
          0% { transform: translateX(0) translateY(0) rotate(45deg); opacity: 1; }
          100% { transform: translateX(400px) translateY(200px) rotate(45deg); opacity: 0; }
        }
        
        @keyframes fadeInOut {
          0%, 100% { opacity: 0; }
          50% { opacity: 0.3; }
        }
        
        /* Enhanced mobile optimizations */
        @media (max-width: 640px) {
          .text-3xl { font-size: 1.875rem; }
          .text-4xl { font-size: 2.25rem; }
          input { font-size: 16px !important; } /* Prevents zoom on iOS */
        }
        
        /* Better touch targets for mobile */
        button, input, [role="button"] {
          min-height: 44px;
          touch-action: manipulation;
        }
        
        /* Enhanced accessibility */
        input:focus, button:focus {
          outline: 2px solid rgba(168, 85, 247, 0.5);
          outline-offset: 2px;
        }
        
        /* Smooth scrolling for better UX */
        html {
          scroll-behavior: smooth;
        }
        
        /* Improved form field styling */
        input::placeholder {
          color: rgba(156, 163, 175, 0.7);
        }
        
        input:focus::placeholder {
          color: rgba(156, 163, 175, 0.4);
        }
      `}</style>
    </div>
  );
};

export default EnhancedSignup;