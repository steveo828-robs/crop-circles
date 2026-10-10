/* Crop Circles — service worker (relative paths; works under any GitHub Pages subpath) */
"use strict";

const VERSION = "v6-claims-steps";
const SHELL_CACHE = "crop-circles-shell-" + VERSION;
const IMAGE_CACHE = "crop-circles-images-v1"; // photos unchanged; keep this cache across shell updates

const SHELL = [
  "./",
  "index.html",
  "styles.css",
  "app.js",
  "hotspots.js",
  "claims.js",
  "vendor/leaflet/leaflet.js",
  "vendor/leaflet/leaflet.css",
  "vendor/leaflet/images/layers.png",
  "vendor/leaflet/images/layers-2x.png",
  "vendor/leaflet/images/marker-icon.png",
  "vendor/leaflet/images/marker-icon-2x.png",
  "vendor/leaflet/images/marker-shadow.png",
  "crop-circles.json",
  "manifest.webmanifest",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/apple-touch-icon.png",
  "icons/favicon-32.png",
  "img/anomalies/blt_node_length.jpg",
  "img/anomalies/blt_plantab1.jpg",
  "img/anomalies/blt_plantab2.jpg",
  "img/anomalies/blt_node_italy.jpg"
];

const scopeURL = (p) => new URL(p, self.registration.scope).href;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL.map((p) => new Request(scopeURL(p), { cache: "reload" }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((k) => k.startsWith("crop-circles-") && k !== SHELL_CACHE && k !== IMAGE_CACHE)
          .map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

function isImageRequest(request, url) {
  return request.destination === "image" || /\.(?:jpe?g|png|gif|webp|avif|svg)$/i.test(url.pathname);
}

// Cache-first for images: serve from cache, otherwise fetch and store.
async function imageCacheFirst(request) {
  const cache = await caches.open(IMAGE_CACHE);
  const cached = (await cache.match(request, { ignoreVary: true })) ||
                 (await caches.match(request, { ignoreVary: true }));
  if (cached) return cached;
  const response = await fetch(request);
  if (response && response.ok) cache.put(request, response.clone());
  return response;
}

// Stale-while-revalidate for the app shell + JSON: instant from cache, refreshed in background.
async function shellStaleWhileRevalidate(request, event) {
  const cache = await caches.open(SHELL_CACHE);
  const cached = await cache.match(request, { ignoreSearch: true });
  const network = fetch(request)
    .then((response) => {
      if (response && response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => undefined);
  if (cached) {
    event.waitUntil(network);
    return cached;
  }
  const response = await network;
  return response || Response.error();
}

// Network-first for page navigations so new deploys show up; offline falls back to the cached shell.
async function navigationNetworkFirst(request) {
  const cache = await caches.open(SHELL_CACHE);
  try {
    const response = await fetch(request);
    if (response && response.ok) cache.put(scopeURL("index.html"), response.clone());
    return response;
  } catch (err) {
    return (await cache.match(request, { ignoreSearch: true })) ||
           (await cache.match(scopeURL("index.html"))) ||
           (await cache.match(scopeURL("./"))) ||
           Response.error();
  }
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // external links are left to the network

  if (request.mode === "navigate") {
    event.respondWith(navigationNetworkFirst(request));
  } else if (isImageRequest(request, url)) {
    event.respondWith(imageCacheFirst(request));
  } else {
    event.respondWith(shellStaleWhileRevalidate(request, event));
  }
});

// Optional background warm-up sent by the page: caches gallery photos a few at a time.
self.addEventListener("message", (event) => {
  const data = event.data || {};
  if (data.type !== "warm-images" || !Array.isArray(data.urls)) return;
  const urls = [...new Set(data.urls)]
    .map((u) => { try { return new URL(u, self.registration.scope); } catch (e) { return null; } })
    .filter((u) => u && u.origin === self.location.origin)
    .map((u) => u.href);
  event.waitUntil((async () => {
    const cache = await caches.open(IMAGE_CACHE);
    const queue = urls.slice();
    const worker = async () => {
      while (queue.length) {
        const href = queue.shift();
        try {
          if (await cache.match(href)) continue;
          const response = await fetch(href);
          if (response && response.ok) await cache.put(href, response);
        } catch (e) { /* offline or flaky: skip, retried on next visit */ }
      }
    };
    await Promise.all([worker(), worker(), worker(), worker()]);
  })());
});
