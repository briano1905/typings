var cacheStorageName = 'typings.gg-pwa-cache';

var filesToCache = [
  'index.html',
  'main.js',
  'style.css',
  '/texts/random.json',
  '/themes/aurora.css',
  '/themes/burgundy.css',
  '/themes/carbon.css',
  '/themes/dark.css',
  '/themes/denim.css',
  '/themes/dracula.css',
  '/themes/eclipse.css',
  '/themes/hyperfuse.css',
  '/themes/light.css',
  '/themes/mizu.css',
  '/themes/moderndolch.css',
  '/themes/mrsleeves.css',
  '/themes/nautilus.css',
  '/themes/nord.css',
  '/themes/oblivion.css',
  '/themes/olivia.css',
  '/themes/phantom.css',
  '/themes/rama.css',
  '/themes/serika.css',
  '/themes/solarizeddark.css',
  '/themes/solarizedlight.css',
  '/themes/vilebloom.css',
  '/themes/yuri.css',
];

// Install event for service worker
self.addEventListener('install', function (e) {
  console.log('[Service Worker] Service Worker installed');
  e.waitUntil(
    caches.open(cacheStorageName).then(function (cache) {
      console.log('[Service Worker] Cached necessary files for offline use');
      return cache.addAll(filesToCache);
    })
  );
});

// Fetch event for retrieving cached data
self.addEventListener('fetch', function (e) {
  e.respondWith(
    caches.match(e.request).then(function (r) {
      console.debug('[Service Worker] Fetching resource: ' + e.request.url);
      return r || fetch(e.request).then(function (response) {
        return caches.open(cacheStorageName).then(function (cache) {
          console.log('[Service Worker] Caching new resource: ' + e.request.url);
          cache.put(e.request, response.clone());
          return response;
        });
      });
    })
  );
});