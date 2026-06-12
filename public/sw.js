const CACHE_NAME = 'speed-reading-v2';

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll([
      '/',
      '/manifest.json'
    ]))
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  // Ignore Next.js dev server requests, websockets, and API routes
  if (
    e.request.url.includes('/_next/') ||
    e.request.url.includes('/api/') ||
    e.request.url.includes('webpack') ||
    e.request.url.includes('hot-update') ||
    e.request.url.startsWith('ws:') ||
    e.request.url.startsWith('wss:') ||
    new URL(e.request.url).hostname === 'localhost' ||
    new URL(e.request.url).hostname === '127.0.0.1'
  ) {
    return;
  }

  // Network-first strategy
  e.respondWith(
    fetch(e.request)
      .then((networkResponse) => {
        // Update cache
        if (e.request.method === 'GET' && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(e.request);
      })
  );
});
