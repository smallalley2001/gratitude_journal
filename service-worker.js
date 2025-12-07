// Gratitude Journal Service Worker
const CACHE_NAME = "gratitude-cache-v4";
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

// Activate: remove only old Gratitude caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith("gratitude-cache-") && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch: offline-first strategy with fallback
self.addEventListener("fetch", (event) => {
  const request = event.request;

  // Only handle requests within Gratitude Journal scope
  if (!request.url.includes(BASE)) return;

  event.respondWith((async () => {
    const cached = await caches.match(request);
    if (cached) return cached;

    try {
      const response = await fetch(request);
      if (response.ok && request.method === "GET") {
        const responseClone = response.clone();
        const cache = await caches.open(CACHE_NAME);
        await cache.put(request, responseClone);
      }
      return response;
    } catch (err) {
      // Offline fallback for navigation (HTML)
      if (request.destination === "document") {
        return caches.match(`${BASE}index.html`);
      }
      // Offline fallback for other assets
      return new Response("Offline resource not available", {
        status: 404,
        statusText: "Offline",
        headers: { "Content-Type": "text/plain" },
      });
    }
  })());
});
