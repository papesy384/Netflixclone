/* Minimal service worker so The Social Sofa can be installed as a PWA.
   Only precaches shell assets — never caches dynamic app routes. */
const CACHE = "social-sofa-v1";
const PRECACHE = ["/icons/icon-192.png", "/icons/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  const isIcon = url.pathname.startsWith("/icons/");
  if (!isIcon) return; // network only for app pages/API

  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request))
  );
});
