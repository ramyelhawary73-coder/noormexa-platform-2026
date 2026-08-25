// NOORMEXA Global Marketplace - World-Class Production Service Worker
// Install: activate immediately without waiting
self.addEventListener("install", () => {
  self.skipWaiting();
});

// Activate: purge ALL old caches completely and take control of all clients
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

// Fetch: Pure pass-through. NEVER intercept Next.js, API, Manifest, or PWA Icons
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // 1. Never intercept non-GET or non-http requests
  if (event.request.method !== "GET" || !url.protocol.startsWith("http")) {
    return;
  }

  // 2. Pass-through for Next.js internal calls, APIs, manifests, and icons
  if (
    url.pathname.startsWith("/_next/") ||
    url.pathname.startsWith("/api/") ||
    url.pathname.includes("manifest") ||
    url.pathname.includes("icon-") ||
    url.pathname.includes("favicon") ||
    url.pathname.includes("apple-touch-icon") ||
    url.searchParams.has("_rsc")
  ) {
    return;
  }

  // 3. Fallback only for full offline HTML navigation failures
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match("/").then((cached) => {
          if (cached) return cached;
          return new Response(
            `<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="utf-8"><title>NOORMEXA</title></head><body style="font-family:sans-serif;text-align:center;padding:50px;background:#0b1322;color:#fff;"><h2>أنت غير متصل بالإنترنت</h2><p>يرجى التحقق من اتصالك بالإنترنت والضغط على إعادة المحاولة.</p><button onclick="window.location.reload()" style="padding:10px 20px;background:#d97706;color:#fff;border:none;border-radius:8px;cursor:pointer;">إعادة المحاولة</button></body></html>`,
            {
              status: 200,
              headers: { "Content-Type": "text/html; charset=utf-8" },
            }
          );
        });
      })
    );
  }
});
