const CACHE_NAME = "focusboard-cache-v1";
const ASSETS = [
    "./",
    "./index.html",
    "./css/style.css",
    "./js/app.js",
    "./js/router.js",
    "./js/store.js",
    "./js/pomodoro.js",
    "./js/components/task-card.js",
    "./assets/ding.mp3",
    "./manifest.json",
    "./js/settings.js",
    "./assets/icons/icon-192.png",
    "./assets/icons/icon-512.png",
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    );
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.map((k) => (k === CACHE_NAME ? null : caches.delete(k))))
        )
    );
    self.clients.claim();
});

self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((cached) => cached || fetch(event.request))
    );
});