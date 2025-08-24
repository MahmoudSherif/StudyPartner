// Simple challenge sharing system that works without complex Firestore rules
import { Challenge } from '@/lib/types'

export interface SharedChallengeData {
  challenge: Challenge
  timestamp: number
  sharedBy: string
}

export class SimpleChallengeSharing {
  private static readonly STORAGE_KEY = 'motivamate_shared_challenges'
  private static readonly CLEANUP_INTERVAL = 24 * 60 * 60 * 1000 // 24 hours

  // Generate a simple 6-character sharing code
  static generateCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
  }

  // Clean the challenge data to remove undefined fields that cause Firestore errors
  static cleanChallengeData(challenge: Challenge): Challenge {
    const cleaned: any = { ...challenge }
    
    // Remove or set default values for undefined fields
    Object.keys(cleaned).forEach(key => {
      if (cleaned[key] === undefined) {
        // Set appropriate defaults based on field name
        if (key === 'endDate') cleaned[key] = null
        else if (key === 'participants') cleaned[key] = []
        else if (key === 'tasks') cleaned[key] = []
        else if (key === 'description') cleaned[key] = ''
        else delete cleaned[key]
      }
    })

    // Ensure required fields exist
    cleaned.id = cleaned.id || `challenge_${Date.now()}`
    cleaned.title = cleaned.title || 'Untitled Challenge'
    cleaned.createdBy = cleaned.createdBy || 'anonymous'
    cleaned.createdAt = cleaned.createdAt || new Date()
    cleaned.isActive = cleaned.isActive !== false // Default to true
    cleaned.participants = cleaned.participants || []
    cleaned.tasks = cleaned.tasks || []

    return cleaned as Challenge
  }

  // Share a challenge locally with a code
  static shareChallenge(challenge: Challenge): { code: string; error: string | null } {
    try {
      const code = this.generateCode()
      const cleanChallenge = this.cleanChallengeData(challenge)
      
      const sharedData: SharedChallengeData = {
        challenge: {
          ...cleanChallenge,
          code: code,
          isActive: true
        },
        timestamp: Date.now(),
        sharedBy: challenge.createdBy || 'anonymous'
      }

      // Get existing shared challenges
      const existing = this.getSharedChallenges()
      existing[code] = sharedData
      
      // Clean up old challenges (older than 24 hours)
      this.cleanupOldChallenges(existing)
      
      // Save to localStorage
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existing))
      
      console.log('✅ Challenge shared locally with code:', code)
      return { code, error: null }
    } catch (error) {
      console.error('❌ Failed to share challenge:', error)
      return { code: '', error: 'Failed to share challenge locally' }
    }
  }

  // Find a shared challenge by code
  static findSharedChallenge(code: string): { challenge: Challenge | null; error: string | null } {
    try {
      const normalizedCode = code.trim().toUpperCase()
      const shared = this.getSharedChallenges()
      
      const challengeData = shared[normalizedCode]
      if (!challengeData) {
        return { challenge: null, error: 'Challenge not found with code: ' + normalizedCode }
      }

      // Check if challenge is still valid (not too old)
      const isExpired = Date.now() - challengeData.timestamp > this.CLEANUP_INTERVAL
      if (isExpired) {
        delete shared[normalizedCode]
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(shared))
        return { challenge: null, error: 'Challenge has expired' }
      }

      console.log('✅ Found shared challenge:', challengeData.challenge.title)
      return { challenge: challengeData.challenge, error: null }
    } catch (error) {
      console.error('❌ Failed to find shared challenge:', error)
      return { challenge: null, error: 'Failed to find challenge' }
    }
  }

  // Join a shared challenge (add current user as participant)
  static joinChallenge(code: string, userId: string): { success: boolean; error: string | null } {
    try {
      const normalizedCode = code.trim().toUpperCase()
      const shared = this.getSharedChallenges()
      
      const challengeData = shared[normalizedCode]
      if (!challengeData) {
        return { success: false, error: 'Challenge not found' }
      }

      // Add user to participants if not already there
      const participants = challengeData.challenge.participants || []
      if (!participants.includes(userId)) {
        participants.push(userId)
        challengeData.challenge.participants = participants
        
        // Save updated data
        shared[normalizedCode] = challengeData
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(shared))
        
        console.log('✅ User joined challenge:', userId, 'Total participants:', participants.length)
      } else {
        console.log('ℹ️ User already in challenge:', userId)
      }

      return { success: true, error: null }
    } catch (error) {
      console.error('❌ Failed to join challenge:', error)
      return { success: false, error: 'Failed to join challenge' }
    }
  }

  // End a challenge (mark as inactive)
  static endChallenge(code: string): { success: boolean; error: string | null } {
    try {
      const normalizedCode = code.trim().toUpperCase()
      const shared = this.getSharedChallenges()
      
      const challengeData = shared[normalizedCode]
      if (!challengeData) {
        return { success: false, error: 'Challenge not found' }
      }

      challengeData.challenge.isActive = false
      shared[normalizedCode] = challengeData
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(shared))
      
      console.log('✅ Challenge ended:', normalizedCode)
      return { success: true, error: null }
    } catch (error) {
      console.error('❌ Failed to end challenge:', error)
      return { success: false, error: 'Failed to end challenge' }
    }
  }

  // Get all shared challenges from localStorage
  private static getSharedChallenges(): Record<string, SharedChallengeData> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      return stored ? JSON.parse(stored) : {}
    } catch (error) {
      console.error('❌ Failed to load shared challenges:', error)
      return {}
    }
  }

  // Clean up challenges older than the specified interval
  private static cleanupOldChallenges(challenges: Record<string, SharedChallengeData>) {
    const now = Date.now()
    let cleaned = 0
    
    Object.keys(challenges).forEach(code => {
      if (now - challenges[code].timestamp > this.CLEANUP_INTERVAL) {
        delete challenges[code]
        cleaned++
      }
    })
    
    if (cleaned > 0) {
      console.log(`🧹 Cleaned up ${cleaned} expired challenges`)
    }
  }

  // Get sharing statistics
  static getStats(): { total: number; active: number; expired: number } {
    const shared = this.getSharedChallenges()
    const codes = Object.keys(shared)
    const now = Date.now()
    
    let active = 0
    let expired = 0
    
    codes.forEach(code => {
      const data = shared[code]
      if (now - data.timestamp > this.CLEANUP_INTERVAL) {
        expired++
      } else if (data.challenge.isActive) {
        active++
      }
    })
    
    return {
      total: codes.length,
      active,
      expired
    }
  }

  // Export challenge as shareable URL parameter
  static exportChallengeAsURL(challenge: Challenge): string {
    try {
      const cleanChallenge = this.cleanChallengeData(challenge)
      const encoded = btoa(JSON.stringify(cleanChallenge))
      const baseUrl = window.location.origin + window.location.pathname
      return `${baseUrl}?challenge=${encoded}`
    } catch (error) {
      console.error('❌ Failed to export challenge as URL:', error)
      return ''
    }
  }

  // Import challenge from URL parameter
  static importChallengeFromURL(): { challenge: Challenge | null; error: string | null } {
    try {
      const params = new URLSearchParams(window.location.search)
      const encoded = params.get('challenge')
      
      if (!encoded) {
        return { challenge: null, error: null } // No challenge in URL
      }

      const decoded = atob(encoded)
      const challenge = JSON.parse(decoded) as Challenge
      const cleanChallenge = this.cleanChallengeData(challenge)
      
      console.log('✅ Imported challenge from URL:', cleanChallenge.title)
      return { challenge: cleanChallenge, error: null }
    } catch (error) {
      console.error('❌ Failed to import challenge from URL:', error)
      return { challenge: null, error: 'Invalid challenge URL' }
    }
  }

  // Migrate Firestore challenges to local storage
  static migrateFirestoreChallenges(firestoreChallenges: any[]): { migrated: number; errors: number } {
    let migrated = 0
    let errors = 0

    console.log('🔄 Migrating Firestore challenges to local storage...')

    firestoreChallenges.forEach(fsChallenge => {
      try {
        // Convert Firestore challenge to local format
        const challenge: Challenge = {
          id: fsChallenge.id || `migrated_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
          title: fsChallenge.title || 'Migrated Challenge',
          description: fsChallenge.description || '',
          code: fsChallenge.code || this.generateCode(),
          createdBy: fsChallenge.createdBy || 'unknown',
          participants: fsChallenge.participants || [],
          tasks: fsChallenge.tasks || [],
          isActive: fsChallenge.isActive !== false, // Default to true unless explicitly false
          createdAt: fsChallenge.createdAt?.toDate ? fsChallenge.createdAt.toDate() : new Date(fsChallenge.createdAt || Date.now()),
          endDate: fsChallenge.endDate?.toDate ? fsChallenge.endDate.toDate() : (fsChallenge.endDate ? new Date(fsChallenge.endDate) : undefined)
        }

        // Clean and share the challenge
        const shareResult = this.shareChallenge(challenge)
        if (shareResult.error) {
          console.error('❌ Failed to migrate challenge:', challenge.title, shareResult.error)
          errors++
        } else {
          console.log('✅ Migrated challenge:', challenge.title, 'with code:', shareResult.code)
          migrated++
        }
      } catch (error) {
        console.error('❌ Error processing challenge for migration:', error)
        errors++
      }
    })

    console.log(`📊 Migration complete: ${migrated} migrated, ${errors} errors`)
    return { migrated, errors }
  }

  // Auto-discover and migrate challenges from Firestore debug data
  static autoMigrateFromFirestore(): { migrated: number; errors: number } {
    try {
      // Check if there's any Firestore challenge data in the console/memory
      // This is a fallback method for when Firestore is accessible but sharing fails
      
      // For now, return zero counts - this can be enhanced to work with actual Firestore data
      console.log('🔍 Auto-migration from Firestore not yet implemented')
      return { migrated: 0, errors: 0 }
    } catch (error) {
      console.error('❌ Auto-migration failed:', error)
      return { migrated: 0, errors: 1 }
    }
  }

  // Get all available challenge codes for discovery
  static getAllAvailableCodes(): { codes: string[]; details: Array<{code: string, title: string, timestamp: number}> } {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (!stored) {
        return { codes: [], details: [] }
      }

      const data = JSON.parse(stored) as Record<string, SharedChallengeData>
      const codes: string[] = []
      const details: Array<{code: string, title: string, timestamp: number}> = []

      Object.entries(data).forEach(([code, challengeData]) => {
        if (challengeData && challengeData.challenge) {
          codes.push(code)
          details.push({
            code,
            title: challengeData.challenge.title || 'Untitled',
            timestamp: challengeData.timestamp
          })
        }
      })

      console.log('📋 Found simple sharing codes:', codes.join(', '))
      return { codes, details }
    } catch (error) {
      console.error('❌ Error getting available codes:', error)
      return { codes: [], details: [] }
    }
  }

  // Search for challenges by title/description pattern
  static searchChallenges(searchTerm: string): Array<{code: string, challenge: Challenge}> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (!stored) {
        return []
      }

      const data = JSON.parse(stored) as Record<string, SharedChallengeData>
      const results: Array<{code: string, challenge: Challenge}> = []
      const lowerSearchTerm = searchTerm.toLowerCase()

      Object.entries(data).forEach(([code, challengeData]) => {
        if (challengeData && challengeData.challenge) {
          const challenge = challengeData.challenge
          const titleMatch = challenge.title?.toLowerCase().includes(lowerSearchTerm)
          const descMatch = challenge.description?.toLowerCase().includes(lowerSearchTerm)
          const codeMatch = code.toLowerCase().includes(lowerSearchTerm)

          if (titleMatch || descMatch || codeMatch) {
            results.push({ code, challenge })
          }
        }
      })

      console.log(`🔍 Search for "${searchTerm}" found ${results.length} matches`)
      return results
    } catch (error) {
      console.error('❌ Error searching challenges:', error)
      return []
    }
  }
}
