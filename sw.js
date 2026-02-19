// Naya Patro Service Worker v1.0
const CACHE_NAME = 'naya-patro-v1';
const URLS_TO_CACHE = [
  './',
  './index.html',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(URLS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).catch(() => caches.match('./index.html')))
  );
});

self.addEventListener('push', e => {
  const data = e.data?.json() || {};
  e.waitUntil(
    self.registration.showNotification(data.title || 'नया पात्रो 🇳🇵', {
      body: data.body || 'Holiday reminder!',
      icon: './icon-192.png',
      badge: './icon-192.png',
      vibrate: [200, 100, 200],
      data: { url: data.url || './' },
      actions: [
        { action: 'open', title: 'Open Naya Patro' },
        { action: 'dismiss', title: 'Dismiss' }
      ]
    })
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  if (e.action !== 'dismiss') {
    e.waitUntil(clients.openWindow(e.notification.data?.url || './'));
  }
});

// Daily alarm check
self.addEventListener('periodicsync', e => {
  if (e.tag === 'daily-check') {
    e.waitUntil(checkDailyHolidays());
  }
});

async function checkDailyHolidays() {
  // This would check tomorrow's holidays and push notification
  await self.registration.showNotification('नया पात्रो – सुप्रभात 🌅', {
    body: 'Check today\'s panchang and upcoming holidays!',
    icon: './icon-192.png',
  });
}
