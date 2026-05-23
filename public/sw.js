const CACHE = "matbakhi-v1"

const PRECACHE = [
  "/",
  "/inventory",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/apple-touch-icon.png",
]

// --- Install: cache the app shell ---
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      cache.addAll(PRECACHE).catch(() => {
        // Individual failures are ok during install — don't block
      })
    )
  )
  self.skipWaiting()
})

// --- Activate: purge old caches ---
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
  )
  self.clients.claim()
})

// --- Fetch strategy ---
self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Only handle same-origin GET requests
  if (request.method !== "GET" || url.origin !== self.location.origin) return

  // Static assets (JS/CSS chunks, fonts, images): cache-first
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    request.destination === "font"
  ) {
    event.respondWith(
      caches.open(CACHE).then((cache) =>
        cache.match(request).then((hit) => {
          if (hit) return hit
          return fetch(request).then((res) => {
            if (res.ok) cache.put(request, res.clone())
            return res
          })
        })
      )
    )
    return
  }

  // Next.js image optimisation route: network-first, stale fallback
  if (url.pathname.startsWith("/_next/image")) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (res.ok) {
            const clone = res.clone()
            caches.open(CACHE).then((c) => c.put(request, clone))
          }
          return res
        })
        .catch(() => caches.match(request))
    )
    return
  }

  // HTML navigation: network-first, fall back to cached page or root
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (res.ok) {
            const clone = res.clone()
            caches.open(CACHE).then((c) => c.put(request, clone))
          }
          return res
        })
        .catch(() =>
          caches
            .match(request)
            .then((hit) => hit || caches.match("/"))
        )
    )
    return
  }

  // Everything else: network with stale cache fallback
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  )
})
