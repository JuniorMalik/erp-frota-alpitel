const CACHE_NAME = 'alpitel-v2';
const ASSETS = [
  './',
  './index.html',
  './dashboard.html',
  './frota.html',
  './mecanico.html',
  './oficina.html',
  './usuarios.html',
  './checklist.html',
  './almoxarifado.html',
  './cadastro_veiculos.html',
  './style_portal.css',
  './style_frota.css',
  './auth.js',
  './script.js',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
