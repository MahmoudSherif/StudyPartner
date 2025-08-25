// Local fallback storage for challenges when Firestore is not available
import { Challenge } from '@/lib/types'

const CHALLENGES_STORAGE_KEY = 'motivamate_local_challenges'
const CHALLENGE_INDEX_KEY = 'motivamate_challenge_index'

export class LocalChallengeStorage {
  // Get single challenge by id
  static getChallenge(challengeId: string): Challenge | null {
    const all = this.getAllChallenges()
    return all.find(c => c.id === challengeId) || null
  }
  
  // Save challenge locally
  static saveChallenge(challenge: Challenge): { error: string | null } {
    try {
      // Get existing challenges
      const existing = this.getAllChallenges()
      
      // Ensure code is normalized to uppercase for consistency
      const normalizedChallenge = {
        ...challenge,
        code: challenge.code.trim().toUpperCase()
      }
      
      // Add or update challenge
      const updated = existing.filter(c => c.id !== normalizedChallenge.id)
      updated.push(normalizedChallenge)
      
      // Save back to localStorage
      localStorage.setItem(CHALLENGES_STORAGE_KEY, JSON.stringify(updated))
      
      // Update index for quick code lookup (use uppercase for consistency)
      const index = this.getIndex()
      index[normalizedChallenge.code] = normalizedChallenge.id
      localStorage.setItem(CHALLENGE_INDEX_KEY, JSON.stringify(index))
      
      console.log('✅ Challenge saved locally with normalized code:', normalizedChallenge.code)
      return { error: null }
    } catch (error) {
      console.error('❌ Failed to save challenge locally:', error)
      return { error: 'Failed to save locally' }
    }
  }
  
  // Find challenge by code
  static findChallengeByCode(code: string): { data: Challenge | null, error: string | null } {
    try {
      // Normalize search code to uppercase for consistency
      const normalizedCode = code.trim().toUpperCase()
      
      const index = this.getIndex()
      const challengeId = index[normalizedCode]
      
      if (!challengeId) {
        console.log('🔍 Local search: No challenge found for normalized code:', normalizedCode)
        return { data: null, error: 'Challenge not found' }
      }
      
      const challenges = this.getAllChallenges()
      const challenge = challenges.find(c => c.id === challengeId)
      
      if (!challenge) {
        console.log('🔍 Local search: Challenge ID found but data missing:', challengeId)
        return { data: null, error: 'Challenge data not found' }
      }
      
      console.log('✅ Found challenge locally:', challenge.title)
      return { data: challenge, error: null }
    } catch (error) {
      console.error('❌ Failed to find challenge locally:', error)
      return { data: null, error: 'Failed to search locally' }
    }
  }
  
  // Get all challenges
  static getAllChallenges(): Challenge[] {
    try {
      const stored = localStorage.getItem(CHALLENGES_STORAGE_KEY)
      if (!stored) return []
      
      const challenges = JSON.parse(stored)
      // Convert date strings back to Date objects
      return challenges.map((c: any) => ({
        ...c,
        createdAt: new Date(c.createdAt),
        endDate: c.endDate ? new Date(c.endDate) : undefined
      }))
    } catch (error) {
      console.error('❌ Failed to get local challenges:', error)
      return []
    }
  }
  
  // Update challenge
  static updateChallenge(challengeId: string, updates: Partial<Challenge>): { error: string | null } {
    try {
      const challenges = this.getAllChallenges()
      const index = challenges.findIndex(c => c.id === challengeId)
      
      if (index === -1) {
        return { error: 'Challenge not found' }
      }
      
      challenges[index] = { ...challenges[index], ...updates }
      localStorage.setItem(CHALLENGES_STORAGE_KEY, JSON.stringify(challenges))
      
      console.log('✅ Challenge updated locally:', challengeId)
      return { error: null }
    } catch (error) {
      console.error('❌ Failed to update challenge locally:', error)
      return { error: 'Failed to update locally' }
    }
  }
  
  // Get index for quick lookups
  private static getIndex(): Record<string, string> {
    try {
      const stored = localStorage.getItem(CHALLENGE_INDEX_KEY)
      return stored ? JSON.parse(stored) : {}
    } catch (error) {
      console.error('❌ Failed to get challenge index:', error)
      return {}
    }
  }
  
  // Clear all local data (for testing)
  static clearAll(): void {
    localStorage.removeItem(CHALLENGES_STORAGE_KEY)
    localStorage.removeItem(CHALLENGE_INDEX_KEY)
    console.log('🗑️ All local challenge data cleared')
  }
}
