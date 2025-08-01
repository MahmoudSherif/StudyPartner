import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { login } = useAuth();
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
      navigate('/dashboard');
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

  const handleForgotPassword = () => {
    setShowForgotPassword(true);
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden p-4">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        {/* Main Card - Much Larger */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-12 lg:p-16 shadow-2xl border border-white/20 transform transition-all duration-300 hover:scale-[1.01] hover:shadow-3xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-6 shadow-xl transform hover:scale-110 transition-transform duration-300">
              <Lock className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent mb-4">
              Welcome Back
            </h1>
            <p className="text-gray-300 text-xl lg:text-2xl">Sign in to continue your journey</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-8 p-5 bg-red-500/20 backdrop-blur-sm border border-red-400/50 rounded-2xl text-red-200 text-base flex items-center space-x-3 animate-in slide-in-from-top duration-300">
              <AlertCircle className="w-6 h-6 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Forgot Password Message */}
          {showForgotPassword && (
            <div className="mb-8 p-5 bg-blue-500/20 backdrop-blur-sm border border-blue-400/50 rounded-2xl text-blue-200 text-base flex items-center space-x-3 animate-in slide-in-from-top duration-300">
              <CheckCircle className="w-6 h-6 flex-shrink-0" />
              <span>If an account exists with this email, you'll receive password reset instructions.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Email Field */}
            <div className="space-y-3">
              <label className="block text-lg font-semibold text-gray-200 ml-2">
                Email Address
              </label>
              <div className="relative group">
                <Mail className={`absolute left-5 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${
                  emailError ? 'text-red-400' : email ? 'text-blue-400' : 'text-gray-400'
                }`} size={24} />
                <input
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  onBlur={() => email && validateEmail(email)}
                  className={`w-full pl-16 pr-6 py-5 text-lg bg-white/10 backdrop-blur-sm border-2 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-4 transition-all duration-300 ${
                    emailError 
                      ? 'border-red-400/50 focus:ring-red-400/30' 
                      : email
                      ? 'border-green-400/50 focus:ring-blue-400/30'
                      : 'border-white/20 focus:ring-blue-400/30 hover:border-white/40'
                  }`}
                  placeholder="Enter your email"
                  autoComplete="email"
                />
                {email && !emailError && (
                  <CheckCircle className="absolute right-5 top-1/2 transform -translate-y-1/2 text-green-400" size={24} />
                )}
              </div>
              {emailError && (
                <p className="text-red-400 text-base ml-2 flex items-center space-x-2 animate-in slide-in-from-top duration-200">
                  <AlertCircle size={16} />
                  <span>{emailError}</span>
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-3">
              <label className="block text-lg font-semibold text-gray-200 ml-2">
                Password
              </label>
              <div className="relative group">
                <Lock className={`absolute left-5 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${
                  passwordError ? 'text-red-400' : password ? 'text-blue-400' : 'text-gray-400'
                }`} size={24} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={handlePasswordChange}
                  onBlur={() => password && validatePassword(password)}
                  className={`w-full pl-16 pr-16 py-5 text-lg bg-white/10 backdrop-blur-sm border-2 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-4 transition-all duration-300 ${
                    passwordError 
                      ? 'border-red-400/50 focus:ring-red-400/30' 
                      : password
                      ? 'border-green-400/50 focus:ring-blue-400/30'
                      : 'border-white/20 focus:ring-blue-400/30 hover:border-white/40'
                  }`}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200 focus:outline-none p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
                </button>
              </div>
              {passwordError && (
                <p className="text-red-400 text-base ml-2 flex items-center space-x-2 animate-in slide-in-from-top duration-200">
                  <AlertCircle size={16} />
                  <span>{passwordError}</span>
                </p>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-blue-300 hover:text-blue-200 text-base font-medium transition-colors duration-200 focus:outline-none focus:underline"
              >
                Forgot your password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !!emailError || !!passwordError}
              className="w-full group relative py-6 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-2xl font-semibold text-xl shadow-2xl hover:shadow-3xl focus:outline-none focus:ring-4 focus:ring-blue-400/50 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              <div className="relative flex items-center justify-center space-x-3">
                {loading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-200" />
                  </>
                )}
              </div>
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-10 text-center">
            <p className="text-gray-300 text-lg">
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/signup')}
                className="text-blue-300 hover:text-blue-200 font-semibold transition-colors duration-200 focus:outline-none focus:underline"
              >
                Create one now
              </button>
            </p>
          </div>

          {/* Decorative Elements */}
          <div className="absolute -top-4 -right-4 w-32 h-32 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full opacity-20 blur-2xl"></div>
          <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full opacity-20 blur-2xl"></div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-gray-400 text-base">
            🔒 Secure sign-in powered by Firebase Authentication
          </p>
        </div>
      </div>

      <style>{`
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes animate-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-in {
          animation: animate-in 0.3s ease-out;
        }
        .slide-in-from-top {
          animation-name: slide-in-from-top;
        }
        @keyframes slide-in-from-top {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Login; 