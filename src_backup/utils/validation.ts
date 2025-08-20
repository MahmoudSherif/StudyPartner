// Comprehensive validation and sanitization utilities
// XSS Prevention & Input Security

export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const sanitizedEmail = sanitizeText(email, 254); // RFC 5321 limit
  
  if (!sanitizedEmail) {
    return { isValid: false, error: "Email is required" };
  }
  
  if (sanitizedEmail.length > 254) {
    return { isValid: false, error: "Email address is too long" };
  }
  
  if (!emailRegex.test(sanitizedEmail)) {
    return { isValid: false, error: "Please enter a valid email address" };
  }
  
  return { isValid: true };
};

export const validatePassword = (password: string): { 
  isValid: boolean; 
  error?: string; 
  strength?: string 
} => {
  if (!password) {
    return { isValid: false, error: "Password is required" };
  }
  
  if (password.length < 8) {
    return { isValid: false, error: "Password must be at least 8 characters long" };
  }
  
  if (password.length > 128) {
    return { isValid: false, error: "Password is too long (max 128 characters)" };
  }
  
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const strengthChecks = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar];
  const strengthScore = strengthChecks.filter(Boolean).length;
  
  if (strengthScore < 3) {
    return { 
      isValid: false, 
      error: "Password must contain at least 3 of: uppercase, lowercase, numbers, special characters" 
    };
  }
  
  const strength = strengthScore === 4 ? "Strong" : "Good";
  return { isValid: true, strength };
};

// XSS Prevention - Text Sanitization
export const sanitizeText = (text: string, maxLength: number = 1000): string => {
  if (typeof text !== 'string') return '';
  
  return text
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim()
    .slice(0, maxLength);
};

// HTML Sanitization (more aggressive)
export const sanitizeHtml = (html: string): string => {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
};

// URL Validation
export const validateUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

// Rate Limiting Class
export class RateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map();
  private maxAttempts: number;
  private windowMs: number;

  constructor(maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000) { // 15 minutes
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  canAttempt(identifier: string): boolean {
    const now = Date.now();
    const record = this.attempts.get(identifier);

    if (!record || now > record.resetTime) {
      this.attempts.set(identifier, { count: 1, resetTime: now + this.windowMs });
      return true;
    }

    if (record.count >= this.maxAttempts) {
      return false;
    }

    record.count++;
    return true;
  }

  getRemainingTime(identifier: string): number {
    const record = this.attempts.get(identifier);
    if (!record || record.count < this.maxAttempts) return 0;
    
    return Math.max(0, record.resetTime - Date.now());
  }

  reset(identifier: string): void {
    this.attempts.delete(identifier);
  }
}

// Task Validation
export const validateTask = (task: { title: string; description?: string }): { 
  isValid: boolean; 
  errors: string[] 
} => {
  const errors: string[] = [];
  
  if (!task.title?.trim()) {
    errors.push("Task title is required");
  } else if (task.title.length > 200) {
    errors.push("Task title is too long (max 200 characters)");
  }
  
  if (task.description && task.description.length > 1000) {
    errors.push("Task description is too long (max 1000 characters)");
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Question Validation
export const validateQuestion = (question: { 
  question: string; 
  answer: string; 
  category?: string 
}): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!question.question?.trim()) {
    errors.push("Question is required");
  } else if (question.question.length > 500) {
    errors.push("Question is too long (max 500 characters)");
  }
  
  if (!question.answer?.trim()) {
    errors.push("Answer is required");
  } else if (question.answer.length > 2000) {
    errors.push("Answer is too long (max 2000 characters)");
  }
  
  if (question.category && question.category.length > 50) {
    errors.push("Category is too long (max 50 characters)");
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Content Security Policy helpers
export const createSecureHeaders = () => ({
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://apis.google.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https:",
    "connect-src 'self' https://firestore.googleapis.com https://firebase.googleapis.com"
  ].join('; '),
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
});

// Input sanitization for forms
export const sanitizeFormData = (data: Record<string, any>): Record<string, any> => {
  const sanitized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeText(value);
    } else if (typeof value === 'number' && isFinite(value)) {
      sanitized[key] = value;
    } else if (typeof value === 'boolean') {
      sanitized[key] = value;
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? sanitizeText(item) : item
      );
    } else {
      // Skip invalid/unsafe data types
      continue;
    }
  }
  
  return sanitized;
}; 