import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle, Target } from 'lucide-react';

const Signup: React.FC = () => {
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
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      setPasswordError('Password must contain at least one uppercase letter, one lowercase letter, and one number');
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
      text = 'Weak';
      color = 'text-red-400';
    } else if (strength <= 4) {
      text = 'Medium';
      color = 'text-yellow-400';
    } else {
      text = 'Strong';
      color = 'text-green-400';
    }
    
    return { strength, text, color };
  };

  const passwordStrength = getPasswordStrength(password);

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
          top: '15%',
          left: '15%',
          background: 'radial-gradient(circle, rgba(147, 51, 234, 0.4) 0%, transparent 70%)',
          animationDuration: '4s'
        }}
      ></div>
      
      <div 
        className="absolute w-56 h-56 sm:w-72 sm:h-72 lg:w-80 lg:h-80 rounded-full blur-3xl opacity-30 animate-pulse z-10"
        style={{
          top: '60%',
          right: '15%',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%)',
          animationDuration: '4s',
          animationDelay: '2s'
        }}
      ></div>

      {/* Main Content - Fully Responsive */}
      <div className="flex items-center justify-center min-h-screen p-4 relative z-20">
        <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg">
          <div className="backdrop-blur-xl rounded-3xl p-6 sm:p-8 lg:p-12 border-4 border-white/30 shadow-2xl bg-slate-900/95">
            
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
                Join StudyPartner
              </h1>
              <p className="text-gray-400 text-sm sm:text-base">
                Start your cosmic learning adventure today
              </p>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/40 rounded-xl p-4 mb-6 flex items-start">
                <AlertCircle size={20} className="text-red-300 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-red-300 text-sm">{error}</span>
              </div>
            )}

            {/* Signup Form */}
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
                
                {/* Password Strength Indicator */}
                {password && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-400">Password Strength:</span>
                      <span className={`text-xs font-semibold ${passwordStrength.color}`}>
                        {passwordStrength.text}
                      </span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          passwordStrength.strength <= 2 ? 'bg-red-500' : 
                          passwordStrength.strength <= 4 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${(passwordStrength.strength / 6) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                
                {passwordError && (
                  <div className="flex items-center mt-2 text-red-300 text-sm">
                    <AlertCircle size={14} className="mr-2" />
                    {passwordError}
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className="block text-white font-semibold mb-2 text-sm sm:text-base">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    className="w-full bg-slate-800/90 text-white border-2 border-slate-600 rounded-xl px-4 py-3 sm:py-4 pl-12 pr-12 text-sm sm:text-base transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                    placeholder="••••••••"
                    disabled={loading}
                    required
                  />
                  <Lock size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  {confirmPassword && !confirmPasswordError && confirmPassword === password && (
                    <CheckCircle size={18} className="absolute right-12 top-1/2 transform -translate-y-1/2 text-green-400" />
                  )}
                </div>
                {confirmPasswordError && (
                  <div className="flex items-center mt-2 text-red-300 text-sm">
                    <AlertCircle size={14} className="mr-2" />
                    {confirmPasswordError}
                  </div>
                )}
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
                    Creating account...
                  </div>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            {/* Sign In Link */}
            <div className="mt-8 text-center">
              <p className="text-gray-400 text-sm sm:text-base">
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                >
                  Sign in here
                </Link>
              </p>
            </div>
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

export default Signup;
