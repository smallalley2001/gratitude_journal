// Gratitude Journal Service Worker (patched)

const CACHE_NAME = "gratitude-cache-v2";
const BASE = "/gratitude_journal/";  // ✅ Correct scope

// List of assets to cache
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

// Install: cache all assets safely
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.all(
        ASSETS.map((url) =>
          cache.add(url).catch((err) =>
            console.warn("Failed to cache:", url, err)
          )
        )
      )
    )
  );
  self.skipWaiting();
});

// Activate: remove old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) =>
          key !== CACHE_NAME ? caches.delete(key) : null
        )
      )
    )
  );
  self.clients.claim();
});

// Fetch: offline-first strategy
self.addEventListener("fetch", (event) => {
  const request = event.request;

  // Only handle requests within the PWA scope
  if (!request.url.includes(BASE)) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request)
        .then((res) => {
          if (res.ok && request.method === "GET") {
            // Cache the response for future offline use
            caches.open(CACHE_NAME).then((cache) =>
              cache.put(request, res.clone())
            );
          }
          return res;
        })
        .catch(() => {
          // Offline fallback: serve index.html for navigation
          if (request.destination === "document") {
            return caches.match(`${BASE}index.html`);
          }
          // Otherwise, return a simple offline response
          return new Response("Offline resource not available", {
            status: 404,
            statusText: "Offline",
            headers: { "Content-Type": "text/plain" },
          });
        });
    })
  );
});
