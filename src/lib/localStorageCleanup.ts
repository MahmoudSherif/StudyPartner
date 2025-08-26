// Utility to clean up deprecated localStorage data
import { SimpleChallengeSharing } from './simpleChallengeSharing'
import { LocalChallengeStorage } from './localChallengeStorage'

export interface CleanupResult {
  removed: string[]
  errors: string[]
}

export class LocalStorageCleanup {
  // List of deprecated localStorage keys that should be cleaned up
  private static readonly DEPRECATED_KEYS = [
    'motivamate_shared_challenges',
    'motivamate_local_challenges', 
    'motivamate_challenge_index',
    'motivamate-sync-queue',
    'motivamate-last-sync',
    'studypartner-api-url',
    'motivamate-auto-sync',
    'cached-user-stats'
  ]

  // Clean up all deprecated localStorage data
  static cleanupAll(): CleanupResult {
    const removed: string[] = []
    const errors: string[] = []

    console.log('🧹 Starting cleanup of deprecated localStorage data...')

    // Clean up specific deprecated systems
    try {
      SimpleChallengeSharing.clearAllLocalData()
      removed.push('SimpleChallengeSharing data')
    } catch (error) {
      errors.push(`SimpleChallengeSharing cleanup failed: ${error}`)
    }

    try {
      LocalChallengeStorage.clearAll()
      removed.push('LocalChallengeStorage data')
    } catch (error) {
      errors.push(`LocalChallengeStorage cleanup failed: ${error}`)
    }

    // Clean up any remaining deprecated keys
    this.DEPRECATED_KEYS.forEach(key => {
      try {
        if (typeof localStorage !== 'undefined' && localStorage.getItem(key) !== null) {
          localStorage.removeItem(key)
          removed.push(key)
        }
      } catch (error) {
        errors.push(`Failed to remove ${key}: ${error}`)
      }
    })

    // Clean up any keys starting with our prefixes
    const prefixes = ['motivamate', 'studypartner', 'feedback_']
    if (typeof localStorage !== 'undefined') {
      try {
        const keysToRemove: string[] = []
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && prefixes.some(prefix => key.startsWith(prefix))) {
            keysToRemove.push(key)
          }
        }
        
        keysToRemove.forEach(key => {
          try {
            localStorage.removeItem(key)
            removed.push(key)
          } catch (error) {
            errors.push(`Failed to remove ${key}: ${error}`)
          }
        })
      } catch (error) {
        errors.push(`Failed to scan localStorage: ${error}`)
      }
    }

    const result = { removed, errors }
    
    if (removed.length > 0) {
      console.log(`✅ Cleanup completed. Removed ${removed.length} items:`, removed)
    } else {
      console.log('✅ Cleanup completed. No deprecated data found.')
    }
    
    if (errors.length > 0) {
      console.warn(`⚠️ Cleanup had ${errors.length} errors:`, errors)
    }

    return result
  }

  // Check what deprecated data exists without removing it
  static scan(): { found: string[]; total: number } {
    const found: string[] = []

    if (typeof localStorage === 'undefined') {
      return { found, total: 0 }
    }

    // Check specific deprecated keys
    this.DEPRECATED_KEYS.forEach(key => {
      try {
        if (localStorage.getItem(key) !== null) {
          found.push(key)
        }
      } catch (error) {
        // Ignore scan errors
      }
    })

    // Check for any keys with deprecated prefixes
    const prefixes = ['motivamate', 'studypartner', 'feedback_']
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && prefixes.some(prefix => key.startsWith(prefix)) && !found.includes(key)) {
          found.push(key)
        }
      }
    } catch (error) {
      // Ignore scan errors
    }

    return { found, total: found.length }
  }
}
