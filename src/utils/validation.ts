/**
 * Validation utilities for forms and user input
 */

export interface PasswordValidationResult {
  isValid: boolean
  errors: string[]
  strength: 'weak' | 'medium' | 'strong'
}

/**
 * Validates email format using RFC-compliant regex
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false
  
  // More strict email validation
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
  const email_trimmed = email.trim().toLowerCase()
  
  // Additional validation
  if (email_trimmed.length > 254) return false
  if (email_trimmed.includes('..')) return false
  if (email_trimmed.startsWith('.') || email_trimmed.endsWith('.')) return false
  if (email_trimmed.includes('@.') || email_trimmed.includes('.@')) return false
  
  return emailRegex.test(email_trimmed)
}

/**
 * Validates password strength and returns detailed feedback
 */
export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = []
  
  if (!password || typeof password !== 'string') {
    return { isValid: false, errors: ['Password is required'], strength: 'weak' }
  }
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }
  
  if (password.length > 128) {
    errors.push('Password must be less than 128 characters')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }
  
  // Determine strength
  let strength: 'weak' | 'medium' | 'strong' = 'weak'
  if (errors.length === 0) {
    if (password.length >= 12 && /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
      strength = 'strong'
    } else {
      strength = 'medium'
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    strength
  }
}

/**
 * Normalises free-text input: trims it, caps its length, and strips control
 * characters that corrupt stored records.
 *
 * This is NOT an XSS filter and must never be relied on as one. The previous
 * implementation was a regex denylist that claimed to "prevent XSS attacks"
 * while letting `<img src=x onerror=alert(1)>` through untouched -- its
 * attribute pattern required the handler value to be quoted, and its element
 * list omitted svg, img, style and math.
 *
 * XSS is prevented here by rendering all user content as JSX text, which React
 * escapes. If HTML rendering is ever introduced, sanitise with DOMPurify at
 * the point of render; a denylist applied at the point of input cannot do it,
 * because data also reaches the database by paths that never run this code.
 */
export function normalizeText(input: string, maxLength: number = 5000): string {
  if (!input || typeof input !== 'string') return ''
  return input
    // Strip C0/C1 control characters, keeping tab and newline. The control
    // characters are the whole point of this expression, so the rule that
    // forbids them is disabled deliberately rather than worked around.
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '')
    .trim()
    .slice(0, maxLength)
}


/**
 * Validates display name
 */
export function validateDisplayName(name: string): { isValid: boolean; error?: string } {
  if (!name || typeof name !== 'string') {
    return { isValid: false, error: 'Display name is required' }
  }
  
  const trimmed = name.trim()
  
  if (trimmed.length < 2) {
    return { isValid: false, error: 'Display name must be at least 2 characters' }
  }
  
  if (trimmed.length > 50) {
    return { isValid: false, error: 'Display name must be less than 50 characters' }
  }
  
  // Allow letters, numbers, spaces, and common punctuation
  if (!/^[a-zA-Z0-9\s\-_.]+$/.test(trimmed)) {
    return { isValid: false, error: 'Display name contains invalid characters' }
  }
  
  return { isValid: true }
}

/**
 * Validates task title
 */
export function validateTaskTitle(title: string): { isValid: boolean; error?: string } {
  if (!title || typeof title !== 'string') {
    return { isValid: false, error: 'Task title is required' }
  }
  
  const trimmed = title.trim()
  
  if (trimmed.length < 1) {
    return { isValid: false, error: 'Task title cannot be empty' }
  }
  
  if (trimmed.length > 200) {
    return { isValid: false, error: 'Task title must be less than 200 characters' }
  }
  
  return { isValid: true }
}

/**
 * Validates subject name
 */
export function validateSubjectName(name: string): { isValid: boolean; error?: string } {
  if (!name || typeof name !== 'string') {
    return { isValid: false, error: 'Subject name is required' }
  }
  
  const trimmed = name.trim()
  
  if (trimmed.length < 1) {
    return { isValid: false, error: 'Subject name cannot be empty' }
  }
  
  if (trimmed.length > 100) {
    return { isValid: false, error: 'Subject name must be less than 100 characters' }
  }
  
  return { isValid: true }
}

/**
 * Validates goal title and description
 */
export function validateGoal(title: string, description?: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    errors.push('Goal title is required')
  } else if (title.trim().length > 200) {
    errors.push('Goal title must be less than 200 characters')
  }
  
  if (description && typeof description === 'string' && description.trim().length > 1000) {
    errors.push('Goal description must be less than 1000 characters')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}
