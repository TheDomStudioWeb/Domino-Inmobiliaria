/* DOMino Inmobiliaria · service worker: la app abre sin conexión. Subir VERSION al publicar cambios. */
var VERSION = 'domino-inmo-v1';
var ARCHIVOS = [
  './', 'index.html', 'dashboard.html', 'captura.html', 'app.css', 'app.js', 'manifest.json',
  'imagenes/logo-domino.png', 'imagenes/icon-192.png', 'imagenes/icon-512.png', 'imagenes/favicon-64.png',
  'imagenes/house-1.webp', 'imagenes/house-2.webp', 'imagenes/house-3.webp', 'imagenes/house-4.webp', 'imagenes/lote.webp'
];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) { return c.addAll(ARCHIVOS); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== VERSION; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

// Archivos propios: primero la copia guardada, y se actualiza en segundo plano. Lo demás (tipografías, WhatsApp) va directo a la red.
self.addEventListener('fetch', function (e) {
  var r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  e.respondWith(caches.match(r).then(function (hit) {
    var red = fetch(r).then(function (res) {
      if (res && res.ok) { var copia = res.clone(); caches.open(VERSION).then(function (c) { c.put(r, copia); }); }
      return res;
    }).catch(function () { return hit; });
    return hit || red;
  }));
});
