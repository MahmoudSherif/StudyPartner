import { useCallback, useState, useSyncExternalStore } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Warning, ArrowClockwise } from '@phosphor-icons/react'
import {
  getSyncFailures,
  retryAllCollections,
  subscribeToSyncFailures
} from '@/hooks/useSyncedCollection'

/**
 * Surfaces collections that failed to load or save.
 *
 * This used to listen for a `firebase-error` window event that nothing has
 * dispatched since the backend changed, so it rendered nothing under any
 * circumstances. Meanwhile a rejected write only reached the console: the
 * optimistic update stayed on screen and the user believed their edit was
 * saved. The banner now reflects the actual state of the sync layer.
 */
export function NetworkStatus() {
  const failures = useSyncExternalStore(subscribeToSyncFailures, getSyncFailures, getSyncFailures)
  const [dismissed, setDismissed] = useState(false)
  const [retrying, setRetrying] = useState(false)

  const retry = useCallback(async () => {
    setRetrying(true)
    try {
      await retryAllCollections()
    } finally {
      setRetrying(false)
    }
  }, [])

  if (!failures.length || dismissed) return null

  const offline = typeof navigator !== 'undefined' && !navigator.onLine

  return (
    <Card className="border-yellow-500/30 bg-yellow-500/10 mb-4">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Warning size={24} className="text-yellow-400 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-yellow-400 mb-1">
              {offline ? 'Working offline' : 'Some changes have not been saved'}
            </h4>
            <p className="text-xs text-yellow-400/70 mb-2">
              {offline
                ? 'Your data is shown from this device. Edits will be sent when the connection returns.'
                : `Could not sync: ${failures.map(f => f.table.replace(/_/g, ' ')).join(', ')}.`}
            </p>
            <div className="flex gap-2">
              <Button
                onClick={retry}
                disabled={retrying}
                variant="outline"
                size="sm"
                className="bg-yellow-500/20 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/30"
              >
                <ArrowClockwise size={14} className={retrying ? 'animate-spin' : undefined} />
                {retrying ? 'Retrying…' : 'Retry'}
              </Button>
              <Button
                onClick={() => setDismissed(true)}
                variant="ghost"
                size="sm"
                className="text-yellow-400/70 hover:text-yellow-400 hover:bg-yellow-500/10"
              >
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
