// Clean, Minimal Service Worker for WebRTC Architecture
// This replaces the old database-heavy service worker and clears its queues.

const CACHE_NAME = 'inkhaven-chat-v3.0.0'

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Clearing old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Clear the old IndexedDB queues that were causing 500/405 errors
      indexedDB.deleteDatabase('InkhavenOfflineDB');
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Pass through all requests directly to the network in the WebRTC era
  // No more caching API routes or queued database syncs.
  event.respondWith(fetch(event.request));
});