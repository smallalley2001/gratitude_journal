const BASE = "/gratitude_journal/";
const CACHE_NAME = "gratitude-journal-v3";

const urlsToCache = [
  BASE,
  BASE + "index.html",
  BASE + "about.html",
  BASE + "entries.html",
  BASE + "print.html",
  BASE + "printout.html",
  BASE + "settings.html",

  // CSS
  BASE + "css/styles.css",

  // Images
  BASE + "img/gratitude_journal.png",
  BASE + "img/gratitude_journal_192.png",
  BASE + "img/gratitude_journal_512.png",

  // JS & Brython
  BASE + "js/brython.js",
  BASE + "js/brython_stdlib.js",
  BASE + "js/load_brython.js",

  // Brython scripts
  BASE + "js/gratitude_journal_page_1.bry",
  BASE + "js/gratitude_journal_page_2.bry",
  BASE + "js/gratitude_journal_page_3.bry",
  BASE + "js/gratitude_journal_page_4.bry",
  BASE + "js/gratitude_journal_page_5.bry",
  BASE + "js/gratitude_journal_page_6.bry"
];

self.addEventListener("install", event => {
  console.log("🧩 Service Worker: Installed");

  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return Promise.all(
        urlsToCache.map(url =>
          cache.add(url).catch(err => {
            console.warn("⚠️ Failed to cache:", url, err);
          })
        )
      );
    })
  );

  self.skipWaiting();
});

self.addEventListener("activate", event => {
  console.log("🧩 Service Worker: Activated");

  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );

  self.clients.claim();
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true })
      .then(cached => {
        return cached || fetch(event.request);
      })
  );
});
