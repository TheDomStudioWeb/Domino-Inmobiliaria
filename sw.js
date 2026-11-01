/* DOMino Inmobiliaria · service worker: la app abre sin conexión. Subir VERSION al publicar cambios. */
var VERSION = 'domino-inmo-v12';
var ARCHIVOS = [
  './', 'index.html', 'dashboard.html', 'captura.html', 'equipo.html', 'config.html', 'personas.html', 'alquiler.js', 'seguimiento.js', 'fotos.js', 'herramientas.html', 'respaldo.js', 'pdfunif.js', 'app.css', 'app.js', 'fb.js', 'datos.js', 'manifest.json',
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

// Con conexión, siempre la versión más nueva (así las pantallas y sus módulos nunca quedan de versiones distintas).
// Sin conexión, la copia guardada. Lo ajeno (tipografías, WhatsApp) va directo a la red.
self.addEventListener('fetch', function (e) {
  var r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  e.respondWith(
    fetch(r.url, { cache: 'no-cache', credentials: 'same-origin' }).then(function (res) {
      if (res && res.ok) { var copia = res.clone(); caches.open(VERSION).then(function (c) { c.put(r, copia); }); }
      return res;
    }).catch(function () { return caches.match(r).then(function (hit) { return hit || caches.match('index.html'); }); })
  );
});
