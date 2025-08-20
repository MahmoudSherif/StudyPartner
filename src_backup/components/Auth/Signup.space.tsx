import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle, Star, Sparkles, ArrowLeft } from 'lucide-react';

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

  const validateConfirmPassword = (confirmPassword: string, password: string) => {
    if (!confirmPassword) {
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
    // Re-validate confirm password if it has been filled
    if (confirmPassword) {
      validateConfirmPassword(confirmPassword, value);
    }
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setConfirmPassword(value);
    if (value && confirmPasswordError) {
      validateConfirmPassword(value, password);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    const isConfirmPasswordValid = validateConfirmPassword(confirmPassword, password);
    
    if (!isEmailValid || !isPasswordValid || !isConfirmPasswordValid) {
      return;
    }

    try {
      setError('');
      setLoading(true);
      await signup(email, password);
      navigate('/');
    } catch (error: any) {
      const errorMessage = error.message.toLowerCase();
      if (errorMessage.includes('email-already-in-use')) {
        setError('An account with this email already exists');
      } else if (errorMessage.includes('weak-password')) {
        setError('Password is too weak. Please choose a stronger password');
      } else if (errorMessage.includes('invalid-email')) {
        setError('Invalid email address');
      } else {
        setError('Failed to create account. Please try again');
      }
    } finally {
      setLoading(false);
    }
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
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {/* SIGNUP FORM - USING FLEXBOX TABLE DISPLAY */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '20px',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{
          width: '100%',
          maxWidth: '450px',
          background: 'rgba(15, 23, 42, 0.95)',
          border: '2px solid rgba(59, 130, 246, 0.4)',
          borderRadius: '24px',
          padding: '40px',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
          animation: 'glow 3s ease-in-out infinite'
        }}>
          
          {/* Logo and Title */}
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <div style={{
              display: 'inline-block',
              position: 'relative',
              marginBottom: '20px'
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
                <Star size={40} color="white" />
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
              fontSize: '28px',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '8px'
            }}>
              ✨ Join the Space Academy 🚀
            </h1>
            <p style={{
              color: '#9ca3af',
              fontSize: '16px'
            }}>
              Create your account and start your journey
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

          {/* Signup Form */}
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
                  placeholder="Create a strong password"
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

            {/* Confirm Password Field */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                color: 'white',
                fontWeight: '600',
                marginBottom: '8px',
                fontSize: '14px'
              }}>
                Confirm Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
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
                  placeholder="Confirm your password"
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
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
                {confirmPassword && !confirmPasswordError && confirmPassword === password && (
                  <CheckCircle size={20} color="#10b981" style={{
                    position: 'absolute',
                    right: '48px',
                    top: '50%',
                    transform: 'translateY(-50%)'
                  }} />
                )}
              </div>
              {confirmPasswordError && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginTop: '8px',
                  color: '#fca5a5',
                  fontSize: '14px'
                }}>
                  <AlertCircle size={16} style={{ marginRight: '6px' }} />
                  {confirmPasswordError}
                </div>
              )}
            </div>

            {/* Create Account Button */}
            <button
              type="submit"
              disabled={loading || !!emailError || !!passwordError || !!confirmPasswordError}
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
                opacity: loading || emailError || passwordError || confirmPasswordError ? 0.6 : 1,
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
                  Creating account...
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  Create Account
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
                Already have an account?
              </span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(156, 163, 175, 0.3)' }}></div>
            </div>

            {/* Sign In Link */}
            <Link 
              to="/login" 
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
              <ArrowLeft size={20} />
              Sign In Instead
            </Link>
          </form>
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
    </div>
  );
};

export default Signup;
