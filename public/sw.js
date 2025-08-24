// Minimal Service Worker for MotivaMate PWA
// This service worker provides basic PWA functionality without aggressive caching
// that could cause white screen issues

console.log('Service Worker: Starting...');

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  // Activate immediately without waiting
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  // Take control of all pages immediately
  event.waitUntil(self.clients.claim());
});

// Fetch event - minimal intervention
self.addEventListener('fetch', (event) => {
  // Let all requests pass through to the network
  // This ensures the app loads normally and prevents white screen issues
  
  // Only handle specific cases where we want to intervene
  if (event.request.url.includes('manifest.json') || 
      event.request.url.includes('favicon')) {
    // For manifest and favicon, try network first, no caching for now
    event.respondWith(fetch(event.request));
  }
  
  // For all other requests, let them pass through normally
  // This prevents service worker from interfering with app loading
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