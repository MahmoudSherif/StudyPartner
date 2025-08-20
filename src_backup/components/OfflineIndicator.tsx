import { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowNotification(true);
      // Auto-hide success notification
      setTimeout(() => setShowNotification(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowNotification(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Show initial notification if offline
    if (!navigator.onLine) {
      setShowNotification(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showNotification) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
      showNotification ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
    }`}>
      <div className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg backdrop-blur-md border ${
        isOnline 
          ? 'bg-green-900/80 border-green-500/30 text-green-100' 
          : 'bg-red-900/80 border-red-500/30 text-red-100'
      }`}>
        {isOnline ? (
          <>
            <Wifi className="w-5 h-5" />
            <div>
              <div className="font-semibold">Back online!</div>
              <div className="text-sm opacity-90">Data will sync automatically</div>
            </div>
          </>
        ) : (
          <>
            <WifiOff className="w-5 h-5" />
            <div>
              <div className="font-semibold">You're offline</div>
              <div className="text-sm opacity-90">Changes will sync when reconnected</div>
            </div>
          </>
        )}
        
        <button
          onClick={() => setShowNotification(false)}
          className="text-current opacity-70 hover:opacity-100 ml-2"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default OfflineIndicator; 