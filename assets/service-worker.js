const cacheName = 'static';

self.addEventListener('install', event => {
  console.log('[install] Installing Service Worker ...', event);
  event.waitUntil(
    caches.open(cacheName).then(cache => {
      return cache.addAll([
        '/public/stylesheets/application.css',
        '/public/images/hmpps_logo_small.png',
        '/public/images/moj-logotype.png',
        '/public/images/moj-logotype-2x.png',
        '/public/images/moj-logotype-3x.png',
        '/public/images/govuk-crest.png',
        '/public/images/govuk-crest-2x.png',
        '/public/offline.html'
      ]);
    }).then(() => {
      console.log('[install] All required resources have been cached, we\'re good!');
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', event => {
  console.log('[activate] Activating Service Worker ....', event);
  console.log('[activate] Claiming this ServiceWorker!');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
    const req = event.request;

    if (/.*(json)$/.test(req.url)) {
      event.respondWith(networkFirst(req));
    } else {
      event.respondWith(cacheFirst(req));
    }
  }
);

async function networkFirst(req) {
  const cache = await caches.open(cacheName);
  try {
    const fresh = await fetch(req).catch(error => {
      console.error('[onfetch] Failed. Serving cached offline fallback', error);
      return caches.open(cacheName).then(function(cache) {
        return cache.match('/public/offline.html');
      });
    });

    cache.put(req, fresh.clone());
    return fresh;
  } catch (e) {
    return await cache.match(req);
  }
}

async function cacheFirst(req) {
  const cache = await caches.open(cacheName),
    cachedResponse = await cache.match(req);
  return cachedResponse || networkFirst(req);
}
