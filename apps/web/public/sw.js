const CACHE_NAME = 'hastytasty-cache-v1';
const ASSETS = [
  '/',
  '/manifest.json',
  '/images/logo.png',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Only handle http/https requests (e.g. skip chrome-extension://)
  if (!event.request.url.startsWith('http')) {
    return;
  }

  const url = new URL(event.request.url);

  // Skip Next.js development/HMR/build files, API routes, and admin pages
  if (url.pathname.startsWith('/_next/') || url.pathname.startsWith('/api/') || url.pathname.startsWith('/admin/')) {
    return;
  }

  event.respondWith(
    fetch(event.request).catch((err) => {
      return caches.match(event.request).then((response) => {
        if (response) {
          return response;
        }
        throw err;
      });
    })
  );
});
