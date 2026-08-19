// Heavy Duty — service worker.
//
// Upload this file ONCE. It never needs to change again: the app itself lives
// entirely inside index.html, which is fetched network-first, so publishing a
// new index.html is all it takes to ship an update.
//
//   index.html  -> network first (3s timeout), falls back to the cached copy
//   CDN libs    -> cache first (they are version-pinned and never change)
const CACHE = 'heavyduty';
const NET_TIMEOUT = 3000;

const CDN = [
  'https://unpkg.com/react@18.3.1/umd/react.production.min.js',
  'https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js',
  'https://unpkg.com/prop-types@15.8.1/prop-types.min.js',
  'https://unpkg.com/recharts@2.12.7/umd/Recharts.js',
  'https://unpkg.com/@babel/standalone@7.24.7/babel.min.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then(async (cache) => {
      await cache.add('./index.html').catch(() => {});
      // Best effort: one failed CDN file must not abort the install.
      await Promise.all(
        CDN.map((url) =>
          fetch(url, { mode: 'cors' })
            .then((res) => (res.ok ? cache.put(url, res) : null))
            .catch(() => null)
        )
      );
      self.skipWaiting();
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Race the network against a timer so a dead connection can't stall startup.
function networkFirst(request) {
  return new Promise((resolve) => {
    let settled = false;
    const fallback = () => {
      if (settled) return;
      settled = true;
      caches.match(request).then((cached) => resolve(cached || fetch(request)));
    };
    const timer = setTimeout(fallback, NET_TIMEOUT);

    fetch(request)
      .then((res) => {
        clearTimeout(timer);
        if (settled) return;
        settled = true;
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(request, copy)).catch(() => {});
        }
        resolve(res);
      })
      .catch(() => {
        clearTimeout(timer);
        fallback();
      });
  });
}

function cacheFirst(request) {
  return caches.match(request).then((cached) => {
    if (cached) return cached;
    return fetch(request).then((res) => {
      if (res && (res.ok || res.type === 'opaque')) {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(request, copy)).catch(() => {});
      }
      return res;
    });
  });
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  // The page itself (and any same-origin navigation) must always try the network,
  // otherwise a new index.html would never reach the phone.
  if (req.mode === 'navigate' || new URL(req.url).origin === self.location.origin) {
    event.respondWith(networkFirst(req));
    return;
  }
  event.respondWith(cacheFirst(req));
});
