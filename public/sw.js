// NOORMEXA Global Marketplace - World-Class Progressive Web App Service Worker
const CACHE_NAME = "noormexa-pwa-v2";
const OFFLINE_FALLBACK_PAGE = "/";

const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/favicon.svg",
  "/favicon.png",
  "/icon-192.png",
  "/icon-512.png",
  "/icon-maskable-192.png",
  "/icon-maskable-512.png",
];

// Install Event: Precaches essential app assets safely
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(async (cache) => {
        for (const url of STATIC_ASSETS) {
          try {
            await cache.add(url);
          } catch {
            // Ignore individual asset failure
          }
        }
      })
      .then(() => self.skipWaiting())
  );
});

// Activate Event: Cleans up old cache stores
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cache) => {
            if (cache !== CACHE_NAME) {
              return caches.delete(cache);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch Event: Network-first strategy with cache fallback
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  if (!event.request.url.startsWith("http")) return;
  if (event.request.url.includes("/_next/webpack-hmr")) return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          (event.request.url.endsWith(".png") ||
            event.request.url.endsWith(".jpg") ||
            event.request.url.endsWith(".svg") ||
            event.request.url.endsWith(".ico") ||
            event.request.url.endsWith(".woff2"))
        ) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache).catch(() => {});
          });
        }
        return networkResponse;
      })
      .catch(async () => {
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }

        if (event.request.mode === "navigate") {
          const fallback = await caches.match(OFFLINE_FALLBACK_PAGE);
          if (fallback) return fallback;
        }

        return new Response("NOORMEXA Offline - Please check your connection", {
          status: 503,
          statusText: "Service Unavailable",
          headers: new Headers({ "Content-Type": "text/plain" }),
        });
      })
  );
});
