// Enhanced Service Worker for MotivaMate PWA
// Provides lightweight app-shell caching for offline startup plus push + notification handling.
// Keeps dynamic requests network-first to avoid stale data while enabling install reliability.

const CACHE_VERSION = 'motivamate-v1';
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg'
  // NOTE: Vite will hash bundle filenames; we rely on runtime network for those.
];

console.log('Service Worker: Starting...');

// Install event
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(CACHE_VERSION).then(cache => cache.addAll(CORE_ASSETS).catch(()=>{}))
  );
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  event.waitUntil(
    (async () => {
      // Clean old caches
      const keys = await caches.keys();
      await Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

// Fetch event - minimal intervention
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // App shell: try cache, fall back to network
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const network = await fetch(request);
          return network;
        } catch (e) {
          const cache = await caches.open(CACHE_VERSION);
          const cached = await cache.match('/index.html');
          return cached || Response.error();
        }
      })()
    );
    return;
  }

  // Static core assets
  if (CORE_ASSETS.includes(url.pathname)) {
    event.respondWith(
      caches.match(request).then(cached => cached || fetch(request).catch(() => cached))
    );
    return;
  }

  // Icons / manifest fallback
  if (url.pathname.includes('favicon') || url.pathname.endsWith('manifest.json')) {
    event.respondWith(
      fetch(request).catch(() => caches.match(request))
    );
    return;
  }
  // Otherwise: network first, silent failure fallback to cache (if ever cached indirectly)
});

// Push event - handle push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icons/favicon-32x32.png',
      badge: '/icons/favicon-16x16.png',
      tag: data.tag || 'motivamate-notification',
      data: data.data || {},
      actions: data.actions || [],
      vibrate: data.vibrate || [200, 100, 200],
      requireInteraction: data.requireInteraction || false,
      silent: false,
      timestamp: Date.now()
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  } catch (error) {
    console.error('Error showing notification:', error);
    // Fallback notification
    event.waitUntil(
      self.registration.showNotification('MotivaMate Update', {
        body: 'You have a new achievement or update!',
        icon: '/icons/favicon-32x32.png',
        tag: 'motivamate-fallback'
      })
    );
  }
});

// Notification click event - handle user interaction
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const data = event.notification.data || {};
  const action = event.action;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url.includes(self.registration.scope) && 'focus' in client) {
            // Focus existing window and navigate if needed
            if (data.url) {
              client.navigate(data.url);
            }
            return client.focus();
          }
        }
        
        // Open new window if app is not open
        const url = data.url || '/';
        return clients.openWindow(url);
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Perform background sync operations
      performBackgroundSync()
    );
  }
});

async function performBackgroundSync() {
  try {
    // Get pending notifications from storage
    const pendingNotifications = await getStoredNotifications();
    
    for (const notification of pendingNotifications) {
      await self.registration.showNotification(notification.title, notification.options);
    }
    
    // Clear processed notifications
    await clearStoredNotifications();
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

async function getStoredNotifications() {
  try {
    const cache = await caches.open('notifications-cache');
    const response = await cache.match('pending-notifications');
    if (response) {
      return await response.json();
    }
  } catch (error) {
    console.error('Error getting stored notifications:', error);
  }
  return [];
}

async function clearStoredNotifications() {
  try {
    const cache = await caches.open('notifications-cache');
    await cache.delete('pending-notifications');
  } catch (error) {
    console.error('Error clearing stored notifications:', error);
  }
}

// Handle notification permission requests
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SCHEDULE_NOTIFICATION') {
    scheduleNotification(event.data.notification);
  }
});

async function scheduleNotification(notificationData) {
  try {
    // Store notification for later if needed
    const cache = await caches.open('notifications-cache');
    const pendingNotifications = await getStoredNotifications();
    pendingNotifications.push(notificationData);
    
    await cache.put('pending-notifications', 
      new Response(JSON.stringify(pendingNotifications))
    );
  } catch (error) {
    console.error('Error scheduling notification:', error);
  }
}