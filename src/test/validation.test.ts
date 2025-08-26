import { describe, it, expect, beforeEach, vi } from 'vitest'
import { isValidEmail, validatePassword, sanitizeInput } from '@/utils/validation'

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

  describe('sanitizeInput', () => {
    it('should remove script tags', () => {
      const input = 'Hello <script>alert("xss")</script> World'
      const sanitized = sanitizeInput(input)
      expect(sanitized).not.toContain('<script>')
      expect(sanitized).not.toContain('alert')
    })

    it('should remove dangerous HTML attributes', () => {
      const input = '<div onclick="malicious()">Content</div>'
      const sanitized = sanitizeInput(input)
      expect(sanitized).not.toContain('onclick')
      expect(sanitized).not.toContain('malicious()')
    })

    it('should preserve safe content', () => {
      const input = 'Hello World! This is safe content with numbers 123.'
      const sanitized = sanitizeInput(input)
      expect(sanitized).toBe(input)
    })

    it('should handle empty input', () => {
      expect(sanitizeInput('')).toBe('')
      expect(sanitizeInput(null as any)).toBe('')
      expect(sanitizeInput(undefined as any)).toBe('')
    })

    it('should limit input length', () => {
      const longInput = 'a'.repeat(10000)
      const sanitized = sanitizeInput(longInput)
      expect(sanitized.length).toBeLessThanOrEqual(5000) // Assuming max length is 5000
    })
  })
})
