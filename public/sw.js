// NOORMEXA Global Marketplace - Resilient Progressive Web App Service Worker
const CACHE_NAME = "noormexa-pwa-v3";

const PRECACHE_ASSETS = [
  "/",
  "/manifest.json",
  "/favicon.svg",
  "/favicon.png",
  "/icon-192.png",
  "/icon-512.png",
  "/icon-maskable-192.png",
  "/icon-maskable-512.png",
];

// Install: Pre-cache core static assets safely
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(
        PRECACHE_ASSETS.map((url) =>
          cache.add(new Request(url, { cache: "reload" })).catch(() => {})
        )
      );
    })
  );
});

// Activate: Clean up old stale caches immediately
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => {
        return Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              return caches.delete(key);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch: Pure pass-through for Next.js internal calls, Cache-First for static icons/images
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // 1. Only handle GET requests with http/https schemes
  if (event.request.method !== "GET" || !url.protocol.startsWith("http")) {
    return;
  }

  // 2. NEVER intercept Next.js data routes, API routes, or React Server Components
  if (
    url.pathname.startsWith("/_next/") ||
    url.pathname.startsWith("/api/") ||
    url.searchParams.has("_rsc")
  ) {
    return;
  }

  // 3. For PWA icons and static images: Cache-first with Network Fallback
  const isStaticImage =
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".jpg") ||
    url.pathname.endsWith(".jpeg") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".webp") ||
    url.pathname.endsWith(".ico");

  if (isStaticImage) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseClone).catch(() => {});
              });
            }
            return networkResponse;
          })
          .catch(() => {
            // Return empty 404 image response instead of 503 text to prevent PWA manifest break
            return new Response(null, { status: 404, statusText: "Not Found" });
          });
      })
    );
    return;
  }

  // 4. For page navigations: Network-first with graceful cache fallback (No synthetic 503s)
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(async () => {
        const cachedPage = await caches.match(event.request);
        if (cachedPage) return cachedPage;

        const homeFallback = await caches.match("/");
        if (homeFallback) return homeFallback;

        return new Response("NOORMEXA is offline. Please check your internet connection.", {
          status: 200,
          headers: { "Content-Type": "text/html; charset=utf-8" },
        });
      })
    );
  }
});
