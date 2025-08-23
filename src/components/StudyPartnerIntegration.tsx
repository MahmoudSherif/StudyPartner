import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/contexts/AuthContext'
import { useDataSync } from '@/lib/sync'
import { studyPartnerAPI } from '@/lib/api'
import { 
  LinkSimple, 
  LinkSimpleBreak, 
  CloudArrowUp, 
  Info, 
  CheckCircle, 
  XCircle,
  User,
  Globe
} from '@phosphor-icons/react'
import { toast } from 'sonner'

export const StudyPartnerIntegration = () => {
  const { user, isConnectedToStudyPartner, checkConnection } = useAuth()
  const { syncStatus, forceSync, clearQueue } = useDataSync()
  const [isLoading, setIsLoading] = useState(false)
  const [apiUrl, setApiUrl] = useState(
    localStorage.getItem('studypartner-api-url') || 'https://api.studypartner.app/v1'
  )
  const [autoSync, setAutoSync] = useState(
    localStorage.getItem('motivamate-auto-sync') === 'true'
  )

  const handleTestConnection = async () => {
    setIsLoading(true)
    try {
      // Update API URL if changed
      studyPartnerAPI.updateConfig({ baseURL: apiUrl })
      localStorage.setItem('studypartner-api-url', apiUrl)
      
      const connected = await checkConnection?.()
      if (connected) {
        toast.success('Successfully connected to StudyPartner!')
      } else {
        toast.error('Unable to connect to StudyPartner. Please check the URL and your internet connection.')
      }
    } catch (error) {
      toast.error('Connection test failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleForceSync = async () => {
    setIsLoading(true)
    try {
      const success = await forceSync()
      if (success) {
        toast.success('Data synchronized successfully!')
      } else {
        toast.error('Sync failed. Please try again.')
      }
    } catch (error) {
      toast.error('Sync error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAutoSyncToggle = (enabled: boolean) => {
    setAutoSync(enabled)
    localStorage.setItem('motivamate-auto-sync', enabled.toString())
    toast.info(`Auto-sync ${enabled ? 'enabled' : 'disabled'}`)
  }

  const handleClearQueue = () => {
    clearQueue()
    toast.success('Sync queue cleared')
  }

  const getConnectionStatus = () => {
    if (!isConnectedToStudyPartner) {
      return {
        icon: <LinkSimpleBreak className="text-red-500" size={20} />,
        text: 'Disconnected',
        description: 'Not connected to StudyPartner',
        color: 'bg-red-100 text-red-800 border-red-200'
      }
    }

    if (syncStatus.error) {
      return {
        icon: <XCircle className="text-yellow-500" size={20} />,
        text: 'Connected (Error)',
        description: syncStatus.error,
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
      }
    }

    return {
      icon: <CheckCircle className="text-green-500" size={20} />,
      text: 'Connected',
      description: 'Successfully connected to StudyPartner',
      color: 'bg-green-100 text-green-800 border-green-200'
    }
  }

  const connectionStatus = getConnectionStatus()

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Globe size={20} />
            StudyPartner Integration
          </CardTitle>
          <CardDescription className="text-white/70">
            Sync your data across MotivaMate and StudyPartner apps
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {connectionStatus.icon}
              <div>
                <p className="text-sm font-medium text-white">{connectionStatus.text}</p>
                <p className="text-xs text-white/60">{connectionStatus.description}</p>
              </div>
            </div>
            <Badge variant="outline" className={connectionStatus.color}>
              {isConnectedToStudyPartner ? 'Online' : 'Offline'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* API Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-white">API Configuration</CardTitle>
          <CardDescription className="text-white/70">
            Configure connection to StudyPartner backend
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-url" className="text-white">StudyPartner API URL</Label>
            <Input
              id="api-url"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="https://api.studypartner.app/v1"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
            />
            <p className="text-xs text-white/60">
              Enter the base URL for your StudyPartner API instance
            </p>
          </div>

          <Button
            onClick={handleTestConnection}
            disabled={isLoading}
            className="w-full"
            variant="outline"
          >
            {isLoading ? (
              <>
                <CloudArrowUp className="animate-spin mr-2" size={16} />
                Testing Connection...
              </>
            ) : (
              <>
                <LinkSimple className="mr-2" size={16} />
                Test Connection
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Sync Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-white">Sync Settings</CardTitle>
          <CardDescription className="text-white/70">
            Manage how your data is synchronized
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Auto-sync</Label>
              <p className="text-xs text-white/60">
                Automatically sync data every 5 minutes
              </p>
            </div>
            <Switch
              checked={autoSync}
              onCheckedChange={handleAutoSyncToggle}
            />
          </div>

          <Separator className="bg-white/20" />

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-white">Last sync</span>
              <span className="text-xs text-white/60">
                {syncStatus.lastSyncAt 
                  ? syncStatus.lastSyncAt.toLocaleString()
                  : 'Never'
                }
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-white">Pending changes</span>
              <Badge variant="outline" className="text-white border-white/20">
                {syncStatus.pendingChanges}
              </Badge>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-white">Sync status</span>
              <Badge 
                variant="outline" 
                className={syncStatus.isSyncing ? 'text-blue-400 border-blue-400' : 'text-white border-white/20'}
              >
                {syncStatus.isSyncing ? 'Syncing...' : 'Ready'}
              </Badge>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleForceSync}
              disabled={isLoading || !isConnectedToStudyPartner}
              className="flex-1"
              variant="outline"
            >
              {syncStatus.isSyncing ? (
                <>
                  <CloudArrowUp className="animate-spin mr-2" size={16} />
                  Syncing...
                </>
              ) : (
                <>
                  <CloudArrowUp className="mr-2" size={16} />
                  Force Sync
                </>
              )}
            </Button>

            <Button
              onClick={handleClearQueue}
              disabled={syncStatus.pendingChanges === 0}
              variant="outline"
              size="sm"
            >
              Clear Queue
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Account Information */}
      {user && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <User size={20} />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-white">Account type</span>
              <Badge variant="outline" className="text-white border-white/20">
                {user.isFromStudyPartner ? 'StudyPartner' : 'Local'}
              </Badge>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-white">User ID</span>
              <span className="text-xs text-white/60 font-mono">
                {user.uid.slice(-8)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-white">Email</span>
              <span className="text-xs text-white/60">
                {user.email}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Info size={20} />
            How it Works
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-white/70">
            <p>
              • Create an account on either MotivaMate or StudyPartner
            </p>
            <p>
              • Use the same email and password to sign in on both apps
            </p>
            <p>
              • Your study data will automatically sync between both platforms
            </p>
            <p>
              • Work offline and sync when you're back online
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}