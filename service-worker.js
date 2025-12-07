const CACHE_NAME = "gratitude-cache-v2";
const BASE = "/gratitude/";

const ASSETS = [
  `${BASE}`,
  `${BASE}index.html`,
  `${BASE}about.html`,
  `${BASE}entries.html`,
  `${BASE}print.html`,
  `${BASE}printout.html`,
  `${BASE}settings.html`,
  `${BASE}manifest.json`,
  `${BASE}css/styles.css`,
  `${BASE}js/brython.js`,
  `${BASE}js/brython_stdlib.js`,
  `${BASE}js/load_brython.js`,
  `${BASE}js/gratitude_journal_page_1.bry`,
  `${BASE}js/gratitude_journal_page_2.bry`,
  `${BASE}js/gratitude_journal_page_3.bry`,
  `${BASE}js/gratitude_journal_page_4.bry`,
  `${BASE}js/gratitude_journal_page_5.bry`,
  `${BASE}js/gratitude_journal_page_6.bry`,
  `${BASE}img/gratitude_journal.png`,
  `${BASE}img/gratitude_journal_192.png`,
  `${BASE}img/gratitude_journal_512.png`,
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(ASSETS).catch((err) =>
        console.warn("Some assets failed to cache:", err)
      )
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) =>
        key !== CACHE_NAME ? caches.delete(key) : null
      ))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (!event.request.url.includes(BASE)) return;

  event.respondWith(
    caches.match(event.request).then((cached) =>
      cached ||
      fetch(event.request).then((res) => {
        if (res.ok) {
          caches.open(CACHE_NAME).then((cache) =>
            cache.put(event.request, res.clone())
          );
        }
        return res;
      }).catch(() =>
        caches.match(`${BASE}index.html`)
      )
    )
  );
});
