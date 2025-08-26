/**
 * Data synchronization service for keeping data in sync between MotivaMate and StudyPartner
 */

import { useEffect, useState, useCallback } from 'react'
// Deprecated: GitHub Spark KV replaced by Firebase
// import { useKV } from '@github/spark/hooks'
import { studyPartnerAPI, SyncData, APIResponse } from './api'
import { toast } from 'sonner'

export interface SyncStatus {
  isOnline: boolean
  isSyncing: boolean
  lastSyncAt: Date | null
  pendingChanges: number
  error: string | null
}

export interface SyncQueueItem {
  id: string
  type: 'subjects' | 'sessions' | 'tasks' | 'achievements' | 'challenges' | 'focusSessions' | 'goals' | 'notes'
  action: 'create' | 'update' | 'delete'
  data: any
  timestamp: Date
  retryCount: number
}

class DataSyncService {
  private syncQueue: SyncQueueItem[] = []
  private isSyncing = false
  private syncInterval: NodeJS.Timeout | null = null
  private onlineStatusCallbacks: ((status: SyncStatus) => void)[] = []

  constructor() {
    this.loadSyncQueue()
    this.startPeriodicSync()
    this.setupOnlineListeners()
  }

  // Load sync queue from storage - now in memory only
  private loadSyncQueue() {
    // No longer persist sync queue to localStorage
    // Queue exists only in memory during session
    this.syncQueue = []
  }

  // Save sync queue to storage - now no-op
  private saveSyncQueue() {
    // No longer persist sync queue to localStorage
    // This reduces privacy concerns and storage usage
  }

  // Setup online/offline listeners
  private setupOnlineListeners() {
    window.addEventListener('online', this.handleOnlineStatus)
    window.addEventListener('offline', this.handleOnlineStatus)
  }

  private handleOnlineStatus = () => {
    if (navigator.onLine && !this.isSyncing) {
      this.performSync()
    }
    this.notifyStatusChange()
  }

  // Start periodic sync (every 5 minutes when online)
  private startPeriodicSync() {
    this.syncInterval = setInterval(() => {
      if (navigator.onLine && studyPartnerAPI.isAuthenticated() && !this.isSyncing) {
        this.performSync()
      }
    }, 5 * 60 * 1000) // 5 minutes
  }

  // Add item to sync queue
  addToSyncQueue(
    type: SyncQueueItem['type'], 
    action: SyncQueueItem['action'], 
    data: any
  ) {
    const item: SyncQueueItem = {
      id: `${type}_${action}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      action,
      data,
      timestamp: new Date(),
      retryCount: 0
    }

    this.syncQueue.push(item)
    this.saveSyncQueue()
    this.notifyStatusChange()

    // Try immediate sync if online
    if (navigator.onLine && studyPartnerAPI.isAuthenticated() && !this.isSyncing) {
      setTimeout(() => this.performSync(), 1000) // Small delay to batch operations
    }
  }

  // Perform full data synchronization
  async performSync(): Promise<boolean> {
    if (this.isSyncing || !navigator.onLine || !studyPartnerAPI.isAuthenticated()) {
      return false
    }

    this.isSyncing = true
    this.notifyStatusChange()

    try {
      // 1. Process pending queue items
      await this.processSyncQueue()

      // 2. Get last sync timestamp - no longer stored locally
      const lastSyncAt = null // Always do full sync since we don't store timestamps

      // 3. Download updates from server
      const downloadResponse = await studyPartnerAPI.syncDataFromServer(lastSyncAt || undefined)
      if (downloadResponse.success && downloadResponse.data) {
        await this.mergeServerData(downloadResponse.data)
      }

      // 4. Upload current data state
      const currentData = await this.getCurrentUserData()
      const uploadResponse = await studyPartnerAPI.syncDataToServer(currentData)

      if (uploadResponse.success) {
        // No longer store last sync time in localStorage
        this.isSyncing = false
        this.notifyStatusChange()
        return true
      } else {
        throw new Error(uploadResponse.error || 'Upload failed')
      }
    } catch (error: any) {
      console.error('Sync failed:', error)
      this.isSyncing = false
      this.notifyStatusChange(error.message)
      return false
    }
  }

  // Process items in sync queue
  private async processSyncQueue() {
    const maxRetries = 3
    const itemsToRemove: string[] = []

    for (const item of this.syncQueue) {
      try {
        await this.processSyncItem(item)
        itemsToRemove.push(item.id)
      } catch (error: any) {
        item.retryCount++
        if (item.retryCount >= maxRetries) {
          console.error(`Failed to sync item after ${maxRetries} retries:`, item, error)
          itemsToRemove.push(item.id) // Remove failed items
        }
      }
    }

    // Remove processed/failed items
    this.syncQueue = this.syncQueue.filter(item => !itemsToRemove.includes(item.id))
    this.saveSyncQueue()
  }

  // Process individual sync item
  private async processSyncItem(item: SyncQueueItem) {
    // This would map to specific API endpoints based on type and action
    const endpoint = this.getSyncEndpoint(item.type, item.action)
    const method = item.action === 'create' ? 'POST' : 
                  item.action === 'update' ? 'PUT' : 'DELETE'

    // Make API call (simplified - real implementation would be more complex)
    const response = await studyPartnerAPI['makeRequest'](endpoint, {
      method,
      body: JSON.stringify(item.data)
    })

    if (!response.success) {
      throw new Error(response.error || 'Sync item failed')
    }
  }

  // Get API endpoint for sync item
  private getSyncEndpoint(type: string, action: string): string {
    const endpoints: Record<string, string> = {
      'subjects': '/data/subjects',
      'sessions': '/data/sessions',
      'tasks': '/data/tasks',
      'achievements': '/data/achievements',
      'challenges': '/data/challenges',
      'focusSessions': '/data/focus-sessions',
      'goals': '/data/goals',
      'notes': '/data/notes'
    }
    return endpoints[type] || '/data/generic'
  }

  // Get current user data for upload
  private async getCurrentUserData(): Promise<Partial<SyncData>> {
    // This would need to access the actual data from useKV hooks
    // For now, return empty object - this needs to be integrated with the app's data layer
    return {
      lastSyncAt: new Date().toISOString()
    }
  }

  // Merge data received from server
  private async mergeServerData(serverData: SyncData) {
    // This would need to intelligently merge server data with local data
    // Handling conflicts, timestamps, etc.
    // For now, this is a placeholder
    console.log('Merging server data:', serverData)
  }

  // Register callback for status changes
  onStatusChange(callback: (status: SyncStatus) => void) {
    this.onlineStatusCallbacks.push(callback)
    // Immediately call with current status
    callback(this.getCurrentStatus())
  }

  // Remove status change callback
  offStatusChange(callback: (status: SyncStatus) => void) {
    this.onlineStatusCallbacks = this.onlineStatusCallbacks.filter(cb => cb !== callback)
  }

  // Get current sync status
  getCurrentStatus(): SyncStatus {
    // No longer store last sync time locally
    return {
      isOnline: navigator.onLine && studyPartnerAPI.isAuthenticated(),
      isSyncing: this.isSyncing,
      lastSyncAt: null, // Not tracked locally anymore
      pendingChanges: this.syncQueue.length,
      error: null // Would be set from last sync attempt
    }
  }

  // Notify all callbacks of status change
  private notifyStatusChange(error?: string) {
    const status = this.getCurrentStatus()
    if (error) {
      status.error = error
    }
    this.onlineStatusCallbacks.forEach(callback => callback(status))
  }

  // Force immediate sync
  async forcSync(): Promise<boolean> {
    return this.performSync()
  }

  // Clear sync queue (for debugging)
  clearSyncQueue() {
    this.syncQueue = []
    this.saveSyncQueue()
    this.notifyStatusChange()
  }

  // Cleanup
  destroy() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
    }
    window.removeEventListener('online', this.handleOnlineStatus)
    window.removeEventListener('offline', this.handleOnlineStatus)
    this.onlineStatusCallbacks = []
  }
}

// Create singleton instance
export const dataSyncService = new DataSyncService()

// React hook for using sync service
export const useDataSync = () => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(dataSyncService.getCurrentStatus())

  useEffect(() => {
    const handleStatusChange = (status: SyncStatus) => {
      setSyncStatus(status)
    }

    dataSyncService.onStatusChange(handleStatusChange)

    return () => {
      dataSyncService.offStatusChange(handleStatusChange)
    }
  }, [])

  const forceSync = useCallback(async () => {
    const success = await dataSyncService.forcSync()
    if (success) {
      toast.success('Data synced successfully')
    } else {
      toast.error('Failed to sync data')
    }
    return success
  }, [])

  const addToQueue = useCallback((
    type: SyncQueueItem['type'], 
    action: SyncQueueItem['action'], 
    data: any
  ) => {
    dataSyncService.addToSyncQueue(type, action, data)
  }, [])

  return {
    syncStatus,
    forceSync,
    addToQueue,
    clearQueue: dataSyncService.clearSyncQueue.bind(dataSyncService)
  }
}

// Hook for syncing specific data types
export const useSyncedData = <T>(
  key: string,
  defaultValue: T,
  dataType: SyncQueueItem['type']
) => {
  // Temporarily disabled GitHub Spark KV
  const [data, setData, deleteData] = [defaultValue, (_: T | ((current: T) => T)) => {}, () => {}] as const
  // const [data, setData, deleteData] = useKV<T>(key, defaultValue)
  const { addToQueue } = useDataSync()

  const setSyncedData = useCallback((newData: T | ((current: T) => T)) => {
    if (typeof newData === 'function') {
      setData((current: T) => {
        const result = (newData as (current: T) => T)(current)
        addToQueue(dataType, 'update', result)
        return result
      })
    } else {
      setData(newData)
      addToQueue(dataType, 'update', newData)
    }
  }, [setData, addToQueue, dataType])

  const deleteSyncedData = useCallback(() => {
    deleteData()
    addToQueue(dataType, 'delete', { key })
  }, [deleteData, addToQueue, dataType, key])

  return [data, setSyncedData, deleteSyncedData] as const
}