import { describe, it, expect, beforeEach, vi } from 'vitest'
import { isValidEmail, validatePassword, normalizeText } from '@/utils/validation'

describe('Validation Utils', () => {
  describe('isValidEmail', () => {
    it('should validate correct email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
        'user_name@sub.domain.com',
        'a@b.co'
      ]

      validEmails.forEach(email => {
        expect(isValidEmail(email)).toBeTruthy()
      })
    })

    it('should reject invalid email addresses', () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'test@',
        'test..test@example.com',
        '.test@example.com',
        'test@example.',
        'test@.example.com',
        'test@example..com',
        '',
        'a'.repeat(250) + '@example.com' // too long
      ]

      invalidEmails.forEach(email => {
        expect(isValidEmail(email)).toBeFalsy()
      })
    })
  })

  describe('validatePassword', () => {
    it('should validate strong passwords', () => {
      const strongPasswords = [
        'Password123!',
        'MyStr0ngP@ssw0rd',
        'Complex1ty!',
        'Secure123@'
      ]

      strongPasswords.forEach(password => {
        const result = validatePassword(password)
        expect(result.isValid).toBeTruthy()
        expect(result.errors).toHaveLength(0)
      })
    })

    it('should reject weak passwords', () => {
      const weakPasswords = [
        { password: 'short', expectedErrors: ['8 characters'] },
        { password: 'nouppercase123!', expectedErrors: ['uppercase'] },
        { password: 'NOLOWERCASE123!', expectedErrors: ['lowercase'] },
        { password: 'NoNumbers!', expectedErrors: ['number'] },
        { password: 'NoSpecialChars123', expectedErrors: ['special'] }
      ]

      weakPasswords.forEach(({ password, expectedErrors }) => {
        const result = validatePassword(password)
        expect(result.isValid).toBeFalsy()
        expectedErrors.forEach(error => {
          expect(result.errors.some(e => e.toLowerCase().includes(error.toLowerCase()))).toBeTruthy()
        })
      })
    })

    it('should return empty errors for valid passwords', () => {
      const result = validatePassword('ValidPassword123!')
      expect(result.isValid).toBeTruthy()
      expect(result.errors).toHaveLength(0)
    })
  })

  describe('normalizeText', () => {
    it('should trim surrounding whitespace', () => {
      expect(normalizeText('  hello  ')).toBe('hello')
    })

    it('should strip control characters but keep tabs and newlines', () => {
      expect(normalizeText('a\u0000b\u001Fc')).toBe('abc')
      expect(normalizeText('line1\nline2\tend')).toBe('line1\nline2\tend')
    })

    it('should preserve safe content unchanged', () => {
      const input = 'Hello World! This is safe content with numbers 123.'
      expect(normalizeText(input)).toBe(input)
    })

    it('should handle empty input', () => {
      expect(normalizeText('')).toBe('')
      expect(normalizeText(null as any)).toBe('')
      expect(normalizeText(undefined as any)).toBe('')
    })

    it('should limit input length', () => {
      expect(normalizeText('a'.repeat(10000)).length).toBeLessThanOrEqual(5000)
      expect(normalizeText('a'.repeat(100), 10)).toHaveLength(10)
    })

    it('does not attempt to strip HTML, by design', () => {
      // Documents the contract deliberately: this is not an XSS filter. The
      // previous implementation advertised itself as one while letting exactly
      // this payload through. XSS is prevented by React escaping JSX text, and
      // input-time filtering cannot help because data also reaches the
      // database through paths that never call this function.
      const payload = '<img src=x onerror=alert(1)>'
      expect(normalizeText(payload)).toBe(payload)
    })
  })
})
