// Simple data sync service for production without external dependencies

export interface UserData {
  subjects: any[]
  sessions: any[]
  achievements: any[]
  tasks: any[]
  challenges: any[]
  focusSessions: any[]
  goals: any[]
  notes: any[]
  events: any[]
  dismissedNotifications: string[]
  lastSyncAt: Date
}

export class DataSyncService {
  private userId: string | null = null

  constructor(userId: string | null) {
    this.userId = userId
  }

  // Initialize sync for a user
  async initializeSync(userId: string) {
    this.userId = userId
    
    try {
      // Emit sync success event
      window.dispatchEvent(new CustomEvent('dataSync'))
    } catch (error) {
      console.error('Failed to initialize sync:', error)
    }
  }

  // Clean up sync when user logs out
  cleanup() {
    this.userId = null
  }

  // Sync user data (for now just emit events, can be extended for cloud sync)
  async syncToCloud(userData: Partial<UserData>) {
    if (!this.userId) return
    
    try {
      // Emit sync start event
      window.dispatchEvent(new CustomEvent('syncStart'))
      
      // In a real implementation, this would sync to a backend
      // For now, just emit sync complete event
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('dataSync'))
      }, 100)
    } catch (error) {
      console.error('Failed to sync data:', error)
      // Emit sync error event
      window.dispatchEvent(new CustomEvent('syncError'))
    }
  }

  // Load user data (for now just return null, local storage is handled by useKV)
  async loadFromCloud(): Promise<UserData | null> {
    if (!this.userId) return null
    
    try {
      // In a real implementation, this would load from a backend
      // For now, data is stored locally via useKV
      return null
    } catch (error) {
      console.error('Failed to load data:', error)
      return null
    }
  }

  // Manual sync method
  async manualSync(userData: Partial<UserData>) {
    await this.syncToCloud(userData)
  }
}

// Global instance
export let dataSyncService: DataSyncService | null = null

// Initialize sync service
export const initializeDataSync = (userId: string | null) => {
  if (dataSyncService) {
    dataSyncService.cleanup()
  }
  
  if (userId) {
    dataSyncService = new DataSyncService(userId)
    dataSyncService.initializeSync(userId)
  } else {
    dataSyncService = null
  }
}

// Clean up sync service
export const cleanupDataSync = () => {
  if (dataSyncService) {
    dataSyncService.cleanup()
    dataSyncService = null
  }
}