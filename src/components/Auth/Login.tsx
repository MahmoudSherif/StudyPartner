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

  // Create animated stars effect
  useEffect(() => {
    const createStars = () => {
      const starsContainer = document.getElementById('stars-container');
      if (!starsContainer) return;

      // Clear existing stars
      starsContainer.innerHTML = '';

      const numStars = 150;
      for (let i = 0; i < numStars; i++) {
        const star = document.createElement('div');
        star.style.cssText = `
          position: absolute;
          width: ${Math.random() * 4 + 1}px;
          height: ${Math.random() * 4 + 1}px;
          background: white;
          border-radius: 50%;
          left: ${Math.random() * 100}%;
          top: ${Math.random() * 100}%;
          animation: twinkle ${Math.random() * 4 + 2}s infinite;
          opacity: ${Math.random() * 0.8 + 0.3};
          box-shadow: 0 0 10px rgba(255,255,255,0.5);
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
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #0f172a 50%, #1e1b4b 75%, #0f172a 100%)',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'Inter, sans-serif'
    }}>
      {/* Stars Container */}
      <div id="stars-container" style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1
      }}></div>
      
      {/* Animated Nebula Effects */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '20%',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(147, 51, 234, 0.3) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(80px)',
        animation: 'pulse 4s ease-in-out infinite',
        zIndex: 1
      }}></div>
      
      <div style={{
        position: 'absolute',
        top: '60%',
        right: '15%',
        width: '350px',
        height: '350px',
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(80px)',
        animation: 'pulse 4s ease-in-out infinite 2s',
        zIndex: 1
      }}></div>

      {/* CSS Animations */}
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.3); }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.2); opacity: 0.5; }
        }
        
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
          50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.6); }
        }
      `}</style>

      {/* LOGIN FORM - RESPONSIVE DESIGN */}
      <div className="flex items-center justify-center min-h-screen p-4 sm:p-6 lg:p-8 relative z-10">
        <div className="w-full max-w-xs sm:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl mx-auto">
          <div 
            className="backdrop-blur-xl rounded-3xl p-6 sm:p-8 lg:p-12 border-4 shadow-2xl"
            style={{
              background: 'rgba(15, 23, 42, 0.95)',
              borderColor: 'rgba(255, 255, 255, 0.3)',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
              animation: 'glow 3s ease-in-out infinite'
            }}
          >
            
            {!showForgotPassword ? (
              /* LOGIN FORM */
              <>
                {/* Logo and Title */}
                <div className="text-center mb-6 sm:mb-8">
                  <div className="inline-block relative mb-4 sm:mb-6">
                }}>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto',
                    boxShadow: '0 10px 30px rgba(59, 130, 246, 0.4)'
                  }}>
                    <Target size={40} color="white" />
                  </div>
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                    borderRadius: '50%',
                    animation: 'pulse 2s ease-in-out infinite',
                    opacity: 0.3,
                    zIndex: -1
                  }}></div>
                </div>
                
                                <h1 style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#ffffff',
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  flexWrap: 'nowrap',
                  whiteSpace: 'nowrap'
                }}>
                  <span style={{ fontSize: '24px' }}>✨</span>
                  <span style={{
                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    whiteSpace: 'nowrap'
                  }}>Join Us and Achieve More</span>
                  <span style={{ fontSize: '24px' }}>🚀</span>
                </h1>
                <p style={{
                  color: '#9ca3af',
                  fontSize: '16px'
                }}>
                  Sign in to continue your journey
                </p>
              </div>

              {/* Error Display */}
              {error && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'flex-start'
                }}>
                  <AlertCircle size={20} color="#fca5a5" style={{ marginRight: '12px', marginTop: '2px' }} />
                  <span style={{ color: '#fca5a5', fontSize: '14px' }}>{error}</span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit}>
                {/* Email Field */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    color: 'white',
                    fontWeight: '600',
                    marginBottom: '8px',
                    fontSize: '14px'
                  }}>
                    Email Address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="email"
                      value={email}
                      onChange={handleEmailChange}
                      style={{
                        width: '100%',
                        background: 'rgba(30, 41, 59, 0.9)',
                        color: 'white',
                        border: '2px solid rgba(71, 85, 105, 0.8)',
                        borderRadius: '12px',
                        padding: '16px 16px 16px 48px',
                        fontSize: '16px',
                        outline: 'none',
                        transition: 'all 0.3s ease',
                        boxSizing: 'border-box'
                      }}
                      placeholder="you@example.com"
                      disabled={loading}
                      required
                      onFocus={(e) => {
                        e.target.style.borderColor = '#3b82f6';
                        e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(71, 85, 105, 0.8)';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                    <Mail size={20} color="#9ca3af" style={{
                      position: 'absolute',
                      left: '16px',
                      top: '50%',
                      transform: 'translateY(-50%)'
                    }} />
                    {email && !emailError && (
                      <CheckCircle size={20} color="#10b981" style={{
                        position: 'absolute',
                        right: '16px',
                        top: '50%',
                        transform: 'translateY(-50%)'
                      }} />
                    )}
                  </div>
                  {emailError && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginTop: '8px',
                      color: '#fca5a5',
                      fontSize: '14px'
                    }}>
                      <AlertCircle size={16} style={{ marginRight: '6px' }} />
                      {emailError}
                    </div>
                  )}
                </div>

                {/* Password Field */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    color: 'white',
                    fontWeight: '600',
                    marginBottom: '8px',
                    fontSize: '14px'
                  }}>
                    Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={handlePasswordChange}
                      style={{
                        width: '100%',
                        background: 'rgba(30, 41, 59, 0.9)',
                        color: 'white',
                        border: '2px solid rgba(71, 85, 105, 0.8)',
                        borderRadius: '12px',
                        padding: '16px 48px 16px 48px',
                        fontSize: '16px',
                        outline: 'none',
                        transition: 'all 0.3s ease',
                        boxSizing: 'border-box'
                      }}
                      placeholder="Your secret key"
                      disabled={loading}
                      required
                      onFocus={(e) => {
                        e.target.style.borderColor = '#3b82f6';
                        e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(71, 85, 105, 0.8)';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                    <Lock size={20} color="#9ca3af" style={{
                      position: 'absolute',
                      left: '16px',
                      top: '50%',
                      transform: 'translateY(-50%)'
                    }} />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '16px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#9ca3af',
                        cursor: 'pointer',
                        padding: '4px'
                      }}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {passwordError && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginTop: '8px',
                      color: '#fca5a5',
                      fontSize: '14px'
                    }}>
                      <AlertCircle size={16} style={{ marginRight: '6px' }} />
                      {passwordError}
                    </div>
                  )}
                </div>

                {/* Remember & Forgot Password */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '30px',
                  fontSize: '14px'
                }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    color: '#9ca3af',
                    cursor: 'pointer'
                  }}>
                    <input type="checkbox" style={{ marginRight: '8px' }} />
                    Remember me
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#3b82f6',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}
                    disabled={loading}
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Sign In Button */}
                <button
                  type="submit"
                  disabled={loading || !!emailError || !!passwordError}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '18px',
                    padding: '16px',
                    borderRadius: '12px',
                    border: 'none',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    opacity: loading || emailError || passwordError ? 0.6 : 1,
                    boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)'
                  }}
                  onMouseEnter={(e) => !loading && ((e.target as HTMLElement).style.transform = 'translateY(-2px)')}
                  onMouseLeave={(e) => ((e.target as HTMLElement).style.transform = 'translateY(0)')}
                >
                  {loading ? (
                    <>
                      <div style={{
                        width: '20px',
                        height: '20px',
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTop: '2px solid white',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }}></div>
                      Signing in...
                    </>
                  ) : (
                    <>
                      <Zap size={20} />
                      Sign In
                    </>
                  )}
                </button>

                {/* Divider */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  margin: '30px 0',
                  color: '#9ca3af'
                }}>
                  <div style={{ flex: 1, height: '1px', background: 'rgba(156, 163, 175, 0.3)' }}></div>
                  <span style={{
                    padding: '0 20px',
                    background: 'rgba(15, 23, 42, 0.8)',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}>
                    New here?
                  </span>
                  <div style={{ flex: 1, height: '1px', background: 'rgba(156, 163, 175, 0.3)' }}></div>
                </div>

                {/* Sign Up Link */}
                <Link 
                  to="/signup" 
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '18px',
                    padding: '16px',
                    borderRadius: '12px',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)'
                  }}
                  onMouseEnter={(e) => ((e.target as HTMLElement).style.transform = 'translateY(-2px)')}
                  onMouseLeave={(e) => ((e.target as HTMLElement).style.transform = 'translateY(0)')}
                >
                  <Star size={20} color="#fbbf24" />
                  Create an account
                  <Crown size={20} color="#fbbf24" />
                </Link>
              </form>
            </>
          ) : (
            /* FORGOT PASSWORD PANEL - SAME STYLING */
            <>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
                <button
                  onClick={closeForgotPassword}
                  style={{
                    padding: '8px',
                    color: '#9ca3af',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    marginRight: '12px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <ArrowLeft size={20} />
                </button>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Lock size={24} color="#3b82f6" />
                  Reset Password
                </h2>
              </div>

              {resetSuccess ? (
                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 24px',
                    boxShadow: '0 10px 30px rgba(16, 185, 129, 0.4)'
                  }}>
                    <CheckCircle size={40} color="white" />
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: 'white', marginBottom: '16px' }}>
                    Email Sent Successfully! 🎉
                  </h3>
                  <p style={{ color: '#9ca3af', marginBottom: '24px' }}>
                    We've sent a password reset link to <strong style={{ color: '#3b82f6' }}>{resetEmail}</strong>
                  </p>
                  <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '32px' }}>
                    Check your inbox and follow the instructions to reset your password.
                  </p>
                  <button
                    onClick={closeForgotPassword}
                    style={{
                      width: '100%',
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '16px',
                      padding: '16px',
                      borderRadius: '12px',
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)'
                    }}
                  >
                    Back to Login
                  </button>
                </div>
              ) : (
                <>
                  <p style={{ color: '#9ca3af', marginBottom: '24px', textAlign: 'center' }}>
                    No worries! Enter your email and we'll send you instructions to reset your password.
                  </p>

                  {resetError && (
                    <div style={{
                      background: 'rgba(239, 68, 68, 0.2)',
                      border: '1px solid rgba(239, 68, 68, 0.4)',
                      borderRadius: '12px',
                      padding: '16px',
                      marginBottom: '20px',
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <AlertCircle size={16} color="#fca5a5" style={{ marginRight: '8px' }} />
                      <span style={{ color: '#fca5a5', fontSize: '14px' }}>{resetError}</span>
                    </div>
                  )}

                  <form onSubmit={handleForgotPassword}>
                    <div style={{ marginBottom: '24px' }}>
                      <label style={{
                        display: 'block',
                        color: 'white',
                        fontWeight: '600',
                        marginBottom: '8px',
                        fontSize: '14px'
                      }}>
                        Email Address
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="email"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          style={{
                            width: '100%',
                            background: 'rgba(30, 41, 59, 0.9)',
                            color: 'white',
                            border: '2px solid rgba(71, 85, 105, 0.8)',
                            borderRadius: '12px',
                            padding: '16px 16px 16px 48px',
                            fontSize: '16px',
                            outline: 'none',
                            boxSizing: 'border-box'
                          }}
                          placeholder="Enter your email"
                          disabled={resetLoading}
                          required
                        />
                        <Mail size={20} color="#9ca3af" style={{
                          position: 'absolute',
                          left: '16px',
                          top: '50%',
                          transform: 'translateY(-50%)'
                        }} />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button
                        type="submit"
                        disabled={resetLoading}
                        style={{
                          flex: 1,
                          background: 'linear-gradient(135deg, #10b981, #059669)',
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '16px',
                          padding: '16px',
                          borderRadius: '12px',
                          border: 'none',
                          cursor: resetLoading ? 'not-allowed' : 'pointer',
                          opacity: resetLoading ? 0.6 : 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px'
                        }}
                      >
                        {resetLoading ? (
                          <>
                            <div style={{
                              width: '16px',
                              height: '16px',
                              border: '2px solid rgba(255,255,255,0.3)',
                              borderTop: '2px solid white',
                              borderRadius: '50%',
                              animation: 'spin 1s linear infinite'
                            }}></div>
                            Sending...
                          </>
                        ) : (
                          'Send Reset Link'
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={closeForgotPassword}
                        style={{
                          flex: 1,
                          background: 'linear-gradient(135deg, #6b7280, #4b5563)',
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '16px',
                          padding: '16px',
                          borderRadius: '12px',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        position: 'absolute',
        bottom: '16px',
        left: 0,
        right: 0,
        textAlign: 'center',
        zIndex: 20
      }}>
        <p style={{
          color: '#6b7280',
          fontSize: '14px'
        }}>
          Built with ❤️ for students who aspire to achieve more
        </p>
      </div>

      {/* Add spin animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @media (max-width: 400px) {
          .responsive-title {
            font-size: 20px !important;
          }
          .responsive-title span {
            font-size: 20px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;
