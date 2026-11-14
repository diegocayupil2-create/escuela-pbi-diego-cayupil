// Trabajador sin conexión (service worker) de la escuela. Plantilla: al compilar, astro.config.mjs
// escribe sw.js con la versión y la lista de archivos esenciales.
// - Páginas: primero internet (para ver lo último); sin conexión, lo guardado.
// - Archivos con huella (_astro/), íconos y páginas precargadas: primero lo guardado.
const VERSION = '__VERSION__';
const ESENCIALES = [] /* __GUARDAR__ */;
const CACHE = `escuela-${VERSION}`;
const alcance = (ruta) => new URL(ruta, self.registration.scope).href;

self.addEventListener('install', (evento) => {
  evento.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(ESENCIALES.map(alcance)))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    caches
      .keys()
      .then((claves) => Promise.all(claves.filter((k) => k.startsWith('escuela-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

async function primeroInternet(peticion) {
  const cache = await caches.open(CACHE);
  try {
    const respuesta = await fetch(peticion);
    if (respuesta.ok) cache.put(peticion, respuesta.clone());
    return respuesta;
  } catch {
    return (
      (await cache.match(peticion, { ignoreSearch: true })) ||
      (await cache.match(alcance('es/'))) ||
      Response.error()
    );
  }
}

async function primeroGuardado(peticion) {
  const cache = await caches.open(CACHE);
  const guardado = await cache.match(peticion);
  if (guardado) return guardado;
  const respuesta = await fetch(peticion);
  if (respuesta.ok) cache.put(peticion, respuesta.clone());
  return respuesta;
}

self.addEventListener('fetch', (evento) => {
  const peticion = evento.request;
  if (peticion.method !== 'GET' || !peticion.url.startsWith(self.registration.scope)) return;
  evento.respondWith(peticion.mode === 'navigate' ? primeroInternet(peticion) : primeroGuardado(peticion));
});
