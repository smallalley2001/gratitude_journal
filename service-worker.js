const CACHE_NAME = 'gratitude-journal-v1';
const urlsToCache = [
  './',
  './index.html',
  './about.html',
  './entries.html',
  './print.html',
  './printout.html',
  './settings.html',

  // CSS
  'css/styles.css',

  // Images
  'img/gratitude_journal.png',

  // JS & Brython
  'js/brython.js',
  'js/brython_stdlib.js',
  'js/load_brython.js',

  // Brython scripts
  'js/gratitude_journal_page_1.bry',
  'js/gratitude_journal_page_2.bry',
  'js/gratitude_journal_page_3.bry',
  'js/gratitude_journal_page_4.bry',
  'js/gratitude_journal_page_5.bry',
  'js/gratitude_journal_page_6.bry'
];

self.addEventListener('install', event => {
  console.log('🧩 Service Worker: Installed');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      Promise.allSettled(
        urlsToCache.map(url =>
          cache.add(url).catch(err => {
            console.warn(`⚠️ Failed to cache ${url}:`, err);
          })
        )
      )
    )
  );
  self.skipWaiting(); // ensures immediate activation on first load
});

self.addEventListener('activate', event => {
  console.log('🧩 Service Worker: Activated');
  event.waitUntil(
    caches.keys().then(names =>
      Promise.all(
        names.filter(name => name !== CACHE_NAME).map(n => caches.delete(n))
      )
    )
  );
  self.clients.claim(); // ensures SW controls open tabs right away
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});

