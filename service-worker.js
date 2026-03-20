const CACHE_NAME = 'contexto-shell-v7';
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Never cache API calls
  if (url.pathname.startsWith('/.netlify/functions/')) {
    return;
  }

  if (url.origin !== self.location.origin) return;

  // HTML/navigation: network-first (always get fresh version, cache as fallback)
  if (event.request.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname === '/') {
    event.respondWith(
      fetch(event.request).then(response => {
        if (response.status === 200 && response.type === 'basic') {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        }
        return response;
      }).catch(() => {
        return caches.match(event.request).then(cached => cached || caches.match('/index.html'));
      })
    );
    return;
  }

  // Static assets (icons, manifest): cache-first
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (response.status === 200 && response.type === 'basic') {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        }
        return response;
      }).catch(() => {
        return new Response('', { status: 504, statusText: 'Offline' });
      });
    })
  );
});

// Push notifications
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'CONTEXTO';
  const options = {
    body: data.body || 'Tu lección del día te espera. No pierdas tu racha 🔥',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'contexto-daily',
    renotify: true,
    data: { url: '/' }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification click → open app
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) return client.focus();
      }
      return clients.openWindow(event.notification.data?.url || '/');
    })
  );
});

// Message from main thread (reminder setup)
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SET_REMINDER') {
    // Store reminder time; actual scheduling relies on the app being opened
    // since true server push requires VAPID + backend
  }
});