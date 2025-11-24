const BASE = '/gratitude_journal/';
const CACHE_NAME = 'gratitude-cache-v10';

const urlsToCache = [
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

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      Promise.all(urlsToCache.map(url =>
        cache.add(url).catch(err =>
          console.warn('Failed to cache', url, err)
        )
      ))
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const req = event.request;

  if (req.mode === 'navigate') {
    event.respondWith(caches.match(BASE + 'index.html'));
    return;
  }

  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then(cached => {
      if (cached) return cached;
      return fetch(req).then(res => {
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(req, res.clone());
          return res;
        });
      });
    })
  );
});
