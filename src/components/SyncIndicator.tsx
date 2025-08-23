import { useState, useEffect } from 'react'
import { CloudCheck, CloudX, CloudArrowUp, LinkSimple, LinkSimpleBreak } from '@phosphor-icons/react'
import { useDataSync } from '@/lib/sync'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'

export const SyncIndicator = () => {
  const { user, isConnectedToStudyPartner, checkConnection } = useAuth()
  const { syncStatus, forceSync } = useDataSync()

  const getIcon = () => {
    if (!isConnectedToStudyPartner) {
      return <LinkSimpleBreak size={16} className="text-yellow-400" />
    }
    
    if (syncStatus.isSyncing) {
      return <CloudArrowUp size={16} className="text-blue-400 animate-pulse" />
    }
    
    if (syncStatus.error) {
      return <CloudX size={16} className="text-red-400" />
    }
    
    if (!syncStatus.isOnline) {
      return <CloudX size={16} className="text-gray-400" />
    }
    
    return <CloudCheck size={16} className="text-green-400" />
  }

  const getStatusText = () => {
    if (!isConnectedToStudyPartner) {
      return 'StudyPartner disconnected'
    }
    
    if (syncStatus.isSyncing) {
      return 'Syncing...'
    }
    
    if (syncStatus.error) {
      return 'Sync failed'
    }
    
    if (!syncStatus.isOnline) {
      return 'Offline'
    }
    
    if (syncStatus.pendingChanges > 0) {
      return `${syncStatus.pendingChanges} pending`
    }
    
    if (syncStatus.lastSyncAt) {
      return `Synced ${formatTimeAgo(syncStatus.lastSyncAt)}`
    }
    
    return 'Ready to sync'
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    
    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d ago`
  }

  const handleSyncClick = async () => {
    if (!isConnectedToStudyPartner) {
      await checkConnection()
    } else {
      await forceSync()
    }
  }

  if (!user) return null

  return (
    <div className="fixed top-4 right-4 z-50 bg-black/40 backdrop-blur-sm rounded-lg border border-white/10">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleSyncClick}
        disabled={syncStatus.isSyncing}
        className="flex items-center gap-2 px-3 py-2 h-auto text-white/80 hover:text-white hover:bg-white/10"
      >
        {getIcon()}
        <span className="text-xs">{getStatusText()}</span>
      </Button>
    </div>
  )
}