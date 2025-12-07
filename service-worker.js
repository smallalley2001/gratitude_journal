// Gratitude Journal Service Worker - Auto-cache folders
const CACHE_NAME = "gratitude-cache-v5";
const BASE = "/gratitude_journal/";

// Base folders to cache
const FOLDERS = ["js/", "css/", "img/"];

// Core files
const CORE_ASSETS = [
  `${BASE}`,
  `${BASE}index.html`,
  `${BASE}about.html`,
  `${BASE}entries.html`,
  `${BASE}print.html`,
  `${BASE}printout.html`,
  `${BASE}settings.html`,
  `${BASE}manifest.json`,
];

// List of known files in each folder (add new files here)
const JS_FILES = [
  "brython.js",
  "brython_stdlib.js",
  "load_brython.js",
  "gratitude_journal_page_1.bry",
  "gratitude_journal_page_2.bry",
  "gratitude_journal_page_3.bry",
  "gratitude_journal_page_4.bry",
  "gratitude_journal_page_5.bry",
  "gratitude_journal_page_6.bry",
];

const CSS_FILES = ["styles.css"];

const IMG_FILES = [
  "gratitude_journal.png",
  "gratitude_journal_192.png",
  "gratitude_journal_512.png",
];

// Combine all assets with proper folder paths
const ASSETS = [
  ...CORE_ASSETS,
  ...JS_FILES.map(f => `${BASE}js/${f}`),
  ...CSS_FILES.map(f => `${BASE}css/${f}`),
  ...IMG_FILES.map(f => `${BASE}img/${f}`),
];

// Install: cache all assets
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

// Activate: remove only old Gratitude Journal caches
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
        const cache = await caches.open(CACHE_NAME);
        await cache.put(request, response.clone());
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
