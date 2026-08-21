// NOORMEXA Global Marketplace - World-Class Progressive Web App Service Worker
const CACHE_NAME = "noormexa-pwa-v1";
const OFFLINE_FALLBACK_PAGE = "/";

const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/favicon.svg",
  "/favicon.png",
  "/favicon-32.png",
  "/icon-192.png",
  "/icon-512.png",
  "/apple-touch-icon.png",
];

// Install Event: Precaches essential app assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(STATIC_ASSETS).catch((err) => {
          console.warn("[NOORMEXA SW] Pre-cache warning:", err);
        });
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

// Fetch Event: Network-first strategy with cache fallback for best live shopping experience
self.addEventListener("fetch", (event) => {
  // Only handle GET requests and http/https schemes
  if (event.request.method !== "GET") return;
  if (!event.request.url.startsWith("http")) return;

  // Ignore Next.js hot reload / dev endpoints
  if (event.request.url.includes("/_next/webpack-hmr")) return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // If response is valid, clone and cache static assets
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          (event.request.url.includes("/public/") ||
            event.request.url.endsWith(".png") ||
            event.request.url.endsWith(".jpg") ||
            event.request.url.endsWith(".svg") ||
            event.request.url.endsWith(".ico") ||
            event.request.url.endsWith(".woff2"))
        ) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(async () => {
        // Offline recovery
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }

        // Return offline page for navigational requests
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
