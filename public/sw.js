const CACHE_NAME = 'smartcampus-ar-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/src/main.jsx',
  '/src/App.jsx',
  '/src/index.css',
  '/src/data/poiData.js',
  '/src/hooks/useHaptics.js',
  '/src/hooks/useMultimodalVoice.js',
  '/src/hooks/useMotionSensors.js',
  '/src/components/StatusHeader.jsx',
  '/src/components/ARCameraView.jsx',
  '/src/components/AdaptiveCardView.jsx',
  '/src/components/ThumbZoneControls.jsx',
  '/src/components/SensorSimulatorDrawer.jsx'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
