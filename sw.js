/* Lesson Planner service worker.
   Deliberately NETWORK-FIRST for the page itself, so a fresh deploy always wins
   and you never get served a stale copy of index.html. The cache is only a
   fallback for when the device is offline. */

const CACHE = "lesson-planner-v1";
const SHELL = [
  "./",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png"
];

self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => Promise.all(SHELL.map((u) => c.add(u).catch(() => {}))))
      .catch(() => {})
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
      .catch(() => {})
  );
});

function cacheable(url) {
  if (url.origin === self.location.origin) return true;
  return url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com";
}

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;

  let url;
  try { url = new URL(req.url); } catch (_) { return; }

  // Never touch API traffic: AI providers, Google sign-in / Drive / Classroom,
  // Bolls verse lookups, the PPT and PDF CDNs. These must always go to the network.
  if (!cacheable(url)) return;

  // The page itself: network first, cache only as an offline fallback.
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put("./", copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => caches.match("./").then((r) => r || caches.match(req)))
    );
    return;
  }

  // Icons, manifest, fonts: cache first, refresh in the background.
  e.respondWith(
    caches.match(req).then((hit) => {
      const net = fetch(req)
        .then((res) => {
          if (res && (res.ok || res.type === "opaque")) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => hit);
      return hit || net;
    })
  );
});

// Lets the page ask a waiting worker to take over straight away.
self.addEventListener("message", (e) => {
  if (e.data === "skipWaiting") self.skipWaiting();
});
