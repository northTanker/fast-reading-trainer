self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open('speed-reading-v1').then((cache) => cache.addAll([
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
          if (key !== 'speed-reading-v1') {
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

  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request))
  );
});
