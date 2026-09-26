/*
 * Service Worker für CARVE LINE (Quartex-Pascal-Port): macht das Spiel offline spielbar.
 * - Cache pro Installationsordner (Version1/, Version2/ … liegen auf derselben Origin und teilen sich sonst den Cache-Speicher)
 * - Seite (HTML): online zuerst, damit neue Versionen sofort ankommen; offline aus dem Cache
 * - eigene Dateien (JS, Icons, Manifest): aus dem Cache, im Hintergrund aktualisiert
 * - three.js vom CDN: versionierte URLs, einmal laden und dauerhaft aus dem Cache
 */
const CACHE = 'carveline:' + new URL(self.registration.scope).pathname;
const CORE = ['./', './index.html', './index.js', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => { e.waitUntil(self.clients.claim()); });

const put = (req, res) => { if (res && (res.ok || res.type === 'opaque')) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); } return res; };

self.addEventListener('fetch', (e) => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === self.location.origin) {
    if (!url.pathname.startsWith(new URL(self.registration.scope).pathname)) return;           // fremder Versionsordner
    if (req.mode === 'navigate') {                                                              // Seite: online zuerst
      e.respondWith(fetch(req).then((r) => put(req, r)).catch(() => caches.match(req).then((r) => r || caches.match('./index.html'))));
      return;
    }
    e.respondWith(caches.match(req).then((hit) => {                                             // Rest: Cache + Hintergrund-Update
      const net = fetch(req).then((r) => put(req, r)).catch(() => hit);
      return hit || net;
    }));
  } else if (url.hostname === 'cdn.jsdelivr.net') {                                              // three.js: Cache zuerst
    e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((r) => put(req, r))));
  }
});
