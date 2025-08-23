// Service Worker for MotivaMate PWA
// Handles push notifications, background sync, and caching

const CACHE_NAME = 'motivamate-v1';
const urlsToCache = [
  '/',
  '/src/main.css',
  '/src/main.tsx',
  '/manifest.json'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
  // Skip waiting to activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Claim all clients immediately
  return self.clients.claim();
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      }
    )
  );
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