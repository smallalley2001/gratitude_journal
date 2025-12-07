const CACHE_NAME = "gratitude-cache-v1";
const BASE = "/gratitude/";  // 🔥 Scope isolated!

const ASSETS = [
  `${BASE}`,
  `${BASE}index.html`,
  `${BASE}manifest.json`,
  `${BASE}style.css`,
  `${BASE}gratitude.js`,
  `${BASE}icons/icon-192.png`,
  `${BASE}icons/icon-512.png`,
  // Add all files used by this app…
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.url.includes(BASE)) {
    event.respondWith(
      caches.match(event.request).then((response) =>
        response || fetch(event.request)
      )
    );
  }
});
