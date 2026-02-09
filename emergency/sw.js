const CACHE_NAME = 'emergency-trainer-v2.0';
const urlsToCache = [
  './',
  './index.html',
  // Add paths to your actual audio files here
  // Example: './301.mp3', './asthma attack.mp3', etc.
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  // Handle audio files specially
  if (event.request.url.match(/\.(mp3|m4a|wav|ogg)$/)) {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          if (response) {
            return response;
          }
          
          // If not in cache, fetch and cache it
          return fetch(event.request)
            .then(response => {
              // Don't cache if not successful
              if (!response || response.status !== 200) {
                return response;
              }
              
              // Clone the response
              const responseToCache = response.clone();
              
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
              
              return response;
            })
            .catch(() => {
              // Return a fallback audio if fetch fails
              return caches.match('not okay.mp3');
            });
        })
    );
  } else {
    // For non-audio files
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          return response || fetch(event.request);
        })
    );
  }
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      })
  );
});