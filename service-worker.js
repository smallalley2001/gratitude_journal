// -------------------------------------
// GRATITUDE JOURNAL PWA SERVICE WORKER
// -------------------------------------
const BASE = '/gratitude_journal/';
const CACHE_NAME = 'gratitude-journal-v1';

const CORE_ASSETS = [
  BASE,
  BASE + 'index.html',
  BASE + 'about.html',
  BASE + 'entries.html',
  BASE + 'print.html',
  BASE + 'printout.html',
  BASE + 'settings.html',
  BASE + 'css/styles.css',
  BASE + 'js/brython.js',
  BASE + 'js/brython_stdlib.js',
  BASE + 'js/load_brython.js',
  BASE + 'js/gratitude_journal_page_1.bry',
  BASE + 'js/gratitude_journal_page_2.bry',
  BASE + 'js/gratitude_journal_page_3.bry',
  BASE + 'js/gratitude_journal_page_4.bry',
  BASE + 'js/gratitude_journal_page_5.bry',
  BASE + 'js/gratitude_journal_page_6.bry',
  BASE + 'img/gratitude_journal.png',
  BASE + 'img/gratitude_journal_192.png',
  BASE + 'img/gratitude_journal_512.png',
  BASE + 'manifest.json'
];

// Install
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      for (const url of CORE_ASSETS) {
        try {
          await cache.add(url);
        } catch (err) {
          console.warn('Skipping (not critical):', url, err);
        }
      }
    })
  );
  self.skipWaiting();
});

// Activate
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch
self.addEventListener('fetch', event => {
  const req = event.request;

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => caches.match(BASE + 'index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;

      return fetch(req)
        .then(res => {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, resClone));
          return res;
        })
        .catch(() => cached);
    })
  );
});
