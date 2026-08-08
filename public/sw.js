// Service Worker for MotivaMate PWA.
//
// Caching strategy, and why each part is the way it is:
//
//   SHELL (/, /index.html, /manifest.json, icons) — network-first.
//     Online, the user always gets the current build. The cached copy exists
//     only so a cold start with no connection still renders something.
//
//   BUILD ASSETS (/assets/*) — cache-first, and this is the part that was
//     missing. Vite emits content-hashed filenames, so a given URL's bytes
//     never change and caching it forever is safe. Previously nothing under
//     /assets was ever cached, which meant "offline support" delivered an
//     index.html whose script tags all 404'd: a blank page. Caching the shell
//     without the code it loads is not offline support.
//
//   EVERYTHING ELSE (Supabase REST, auth, realtime, cross-origin) — untouched.
//     No respondWith at all, so the request goes straight to the network. API
//     responses must never be served from a cache: stale study data that looks
//     live is worse than an honest failure, and auth tokens must not be stored.
//
// Old asset entries accumulate across deploys because a hashed URL that is no
// longer referenced is indistinguishable from one that is. The cache is trimmed
// to a bounded size on activation rather than guessing.

const SHELL_CACHE = 'motivamate-shell-v2';
const ASSET_CACHE = 'motivamate-assets-v2';
const CURRENT_CACHES = [SHELL_CACHE, ASSET_CACHE];

// Bounded so a long-lived install cannot grow without limit. Roughly a few
// builds' worth of chunks and fonts.
const MAX_ASSET_ENTRIES = 120;

const SHELL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/favicon.ico'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL_CACHE);
      // Individually, not addAll: addAll is atomic, so one missing icon would
      // discard the whole precache and leave the app with no offline shell.
      await Promise.all(
        SHELL_ASSETS.map(async (path) => {
          try {
            await cache.add(new Request(path, { cache: 'reload' }));
          } catch (error) {
            console.warn('[SW] Could not precache', path);
          }
        })
      );
    })()
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((key) => !CURRENT_CACHES.includes(key)).map((key) => caches.delete(key))
      );
      await trimAssetCache();
      await self.clients.claim();
    })()
  );
});

/** Drops the oldest entries once the asset cache exceeds its cap. */
async function trimAssetCache() {
  try {
    const cache = await caches.open(ASSET_CACHE);
    const keys = await cache.keys();
    if (keys.length <= MAX_ASSET_ENTRIES) return;
    // Cache.keys() returns insertion order, so the front is the oldest.
    await Promise.all(keys.slice(0, keys.length - MAX_ASSET_ENTRIES).map((key) => cache.delete(key)));
  } catch (error) {
    console.warn('[SW] Asset cache trim failed');
  }
}

const isBuildAsset = (url) =>
  url.pathname.startsWith('/assets/') || url.pathname.startsWith('/icons/');

const isShellAsset = (url) =>
  SHELL_ASSETS.includes(url.pathname) || url.pathname.endsWith('manifest.json');

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only GET is cacheable, and only our own origin is ours to cache.
  if (request.method !== 'GET') return;

  let url;
  try {
    url = new URL(request.url);
  } catch (error) {
    return;
  }
  if (url.origin !== self.location.origin) return;

  // Navigations: network-first so a deploy is picked up immediately, with the
  // cached shell as the offline fallback.
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(request);
          if (response && response.ok) {
            const cache = await caches.open(SHELL_CACHE);
            cache.put('/index.html', response.clone());
          }
          return response;
        } catch (error) {
          const cached = await caches.match('/index.html', { cacheName: SHELL_CACHE });
          return (
            cached ||
            new Response('<h1>Offline</h1><p>Reconnect to load MotivaMate.</p>', {
              status: 503,
              headers: { 'Content-Type': 'text/html; charset=utf-8' }
            })
          );
        }
      })()
    );
    return;
  }

  // Content-hashed build output: cache-first, since the bytes behind a given
  // URL can never change.
  if (isBuildAsset(url)) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(ASSET_CACHE);
        const cached = await cache.match(request);
        if (cached) return cached;
        try {
          const response = await fetch(request);
          // Opaque responses (status 0) carry no usable body; caching one
          // pins a permanent failure at that URL.
          if (response && response.ok) {
            await cache.put(request, response.clone());
          }
          return response;
        } catch (error) {
          return cached || Response.error();
        }
      })()
    );
    return;
  }

  // The shell itself: network-first, refreshing the cached copy as it goes.
  if (isShellAsset(url)) {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(request);
          if (response && response.ok) {
            const cache = await caches.open(SHELL_CACHE);
            cache.put(request, response.clone());
          }
          return response;
        } catch (error) {
          const cached = await caches.match(request, { cacheName: SHELL_CACHE });
          return cached || Response.error();
        }
      })()
    );
    return;
  }

  // Anything else — including every Supabase call — is left alone.
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

/**
 * Resolve a notification-supplied URL against this origin and reject anything
 * that escapes it.
 *
 * Notification payloads arrive from push messages and from postMessage, neither
 * of which is fully trusted. Handing an arbitrary string to client.navigate() or
 * clients.openWindow() would let a crafted payload redirect the user to an
 * attacker-controlled page from what looks like a first-party notification.
 * Anything that does not resolve to the app's own origin falls back to '/'.
 *
 * @param {unknown} candidate
 * @returns {string} A same-origin absolute URL.
 */
function toSameOriginUrl(candidate) {
  const fallback = new URL('/', self.location.origin).href;

  if (typeof candidate !== 'string' || candidate.length === 0 || candidate.length > 2048) {
    return fallback;
  }

  try {
    // A second argument makes relative paths resolve against this origin, while
    // absolute URLs in the string keep their own origin and get caught below.
    const resolved = new URL(candidate, self.location.origin);
    if (resolved.origin !== self.location.origin) {
      console.warn('[SW] Rejected cross-origin notification URL:', resolved.origin);
      return fallback;
    }
    // Blocks javascript:, data:, blob: and similar, which can carry a matching
    // or opaque origin depending on the browser.
    if (resolved.protocol !== self.location.protocol) {
      console.warn('[SW] Rejected notification URL with unexpected scheme:', resolved.protocol);
      return fallback;
    }
    return resolved.href;
  } catch (error) {
    console.warn('[SW] Rejected unparseable notification URL');
    return fallback;
  }
}

// Notification click event - handle user interaction
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const data = event.notification.data || {};
  const action = event.action;
  const targetUrl = toSameOriginUrl(data.url);

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url.includes(self.registration.scope) && 'focus' in client) {
            // Focus existing window and navigate if needed
            if (data.url) {
              client.navigate(targetUrl);
            }
            return client.focus();
          }
        }

        // Open new window if app is not open
        return clients.openWindow(targetUrl);
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
      // Re-validate on replay: entries cached by an older service worker
      // version were never checked when they were written.
      const safe = sanitizeNotificationPayload(notification);
      if (!safe) continue;
      await self.registration.showNotification(safe.title, safe.options);
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
      const parsed = await response.json();
      // A corrupted or hand-tampered cache entry must not break the caller.
      if (Array.isArray(parsed)) return parsed;
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

// --- Message handling -------------------------------------------------------

const MAX_TITLE_LENGTH = 120;
const MAX_BODY_LENGTH = 500;
const MAX_TAG_LENGTH = 64;
const MAX_PENDING_NOTIFICATIONS = 50;

/**
 * A service worker receives messages from any client in its scope. Confirm the
 * sender is this origin before acting on anything it says.
 *
 * `event.origin` is not populated consistently across browsers, so an empty or
 * absent value is not treated as a failure; only a value that positively
 * disagrees with this origin is. `event.source.url` is checked as a second
 * signal when the sender is a window client.
 *
 * @param {ExtendableMessageEvent} event
 * @returns {boolean}
 */
function isSameOriginMessage(event) {
  if (
    typeof event.origin === 'string' &&
    event.origin !== '' &&
    event.origin !== self.location.origin
  ) {
    return false;
  }

  const sourceUrl = event.source && event.source.url;
  if (typeof sourceUrl === 'string' && sourceUrl !== '') {
    try {
      if (new URL(sourceUrl).origin !== self.location.origin) {
        return false;
      }
    } catch (error) {
      return false;
    }
  }

  return true;
}

/**
 * Normalise an untrusted SCHEDULE_NOTIFICATION payload into the
 * { title, options } shape performBackgroundSync() replays, or return null if
 * it cannot be trusted.
 *
 * Accepts `body` either at the top level or nested under `options`, since both
 * shapes have been used by callers. Strings are trimmed and truncated so a
 * caller cannot push megabytes into the notifications cache or render an
 * oversized notification.
 *
 * @param {unknown} raw
 * @returns {{ title: string, options: object } | null}
 */
function sanitizeNotificationPayload(raw) {
  if (!raw || typeof raw !== 'object') return null;

  const rawOptions = raw.options && typeof raw.options === 'object' ? raw.options : {};
  const title = raw.title;
  const body = typeof raw.body === 'string' ? raw.body : rawOptions.body;

  if (typeof title !== 'string' || typeof body !== 'string') return null;

  const safeTitle = title.trim().slice(0, MAX_TITLE_LENGTH);
  if (safeTitle === '') return null;

  const rawTag = typeof rawOptions.tag === 'string' ? rawOptions.tag : raw.tag;
  const rawData = rawOptions.data && typeof rawOptions.data === 'object' ? rawOptions.data : {};

  return {
    title: safeTitle,
    options: {
      body: body.trim().slice(0, MAX_BODY_LENGTH),
      icon: '/icons/favicon-32x32.png',
      badge: '/icons/favicon-16x16.png',
      tag: typeof rawTag === 'string' && rawTag.trim() !== ''
        ? rawTag.trim().slice(0, MAX_TAG_LENGTH)
        : 'motivamate-notification',
      // Only a same-origin URL survives; everything else collapses to '/'.
      data: { url: toSameOriginUrl(rawData.url !== undefined ? rawData.url : raw.url) }
    }
  };
}

// Handle notification permission requests
self.addEventListener('message', (event) => {
  if (!event.data || event.data.type !== 'SCHEDULE_NOTIFICATION') return;

  if (!isSameOriginMessage(event)) {
    console.warn('[SW] Ignored SCHEDULE_NOTIFICATION from foreign origin:', event.origin);
    return;
  }

  const notification = sanitizeNotificationPayload(event.data.notification);
  if (!notification) {
    console.warn('[SW] Ignored SCHEDULE_NOTIFICATION with invalid payload');
    return;
  }

  // waitUntil keeps the worker alive until the cache write settles.
  event.waitUntil(scheduleNotification(notification));
});

async function scheduleNotification(notificationData) {
  try {
    // Store notification for later if needed
    const cache = await caches.open('notifications-cache');
    const pendingNotifications = await getStoredNotifications();
    pendingNotifications.push(notificationData);

    // Bound the queue so repeated messages cannot grow the cache without limit.
    const trimmed = pendingNotifications.slice(-MAX_PENDING_NOTIFICATIONS);

    await cache.put('pending-notifications',
      new Response(JSON.stringify(trimmed), {
        headers: { 'Content-Type': 'application/json' }
      })
    );
  } catch (error) {
    console.error('Error scheduling notification:', error);
  }
}