/* OpenStudy service worker.

   The cache name carries a build stamp that make-artifact.js rewrites from the
   contents of index.html. That matters: the first version of this file used a
   fixed name, so the shell cached on someone's first visit was never replaced
   and fourteen deploys never reached them. A changed app now means a changed
   cache name, and the old one is deleted on activation.

   The page itself is always fetched from the network, falling back to cache
   only when genuinely offline, so an update is never withheld. Everything else
   is cache-first for speed. */
const VERSION = '72b64095e1c1';
const CACHE = 'openstudy-' + VERSION;
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  // Take over as soon as this version is ready rather than waiting for every
  // other tab to close.
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(SHELL))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', e => {
  if (e.data === 'skip-waiting') self.skipWaiting();
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req, { cache: 'no-store' })
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put('./index.html', copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match('./index.html').then(hit => hit || Response.error()))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then(hit => {
      if (hit) return hit;
      return fetch(req).then(res => {
        // Opaque CDN responses are cached too, so fonts and the PDF engine
        // survive going offline.
        if (res && (res.ok || res.type === 'opaque')) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
        }
        return res;
      }).catch(() => hit || Response.error());
    })
  );
});
