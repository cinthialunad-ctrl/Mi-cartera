// Permite que la app abra sin internet. Si cambiás algún archivo, subí el número de versión.
const VERSION = "mi-cartera-v2";
const ARCHIVOS = ["./", "index.html", "styles.css", "app.js", "glosario.js", "manifest.webmanifest",
  "icon-192.png", "icon-512.png", "icon-maskable.png", "apple-touch-icon.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  // El dólar siempre desde internet
  if (url.hostname === "dolarapi.com") return;
  // Archivos de la app: primero internet (para tener la última versión), si no hay conexión, la copia guardada
  if (url.origin === location.origin) {
    e.respondWith(
      fetch(e.request).then(r => {
        const copia = r.clone();
        caches.open(VERSION).then(c => c.put(e.request, copia));
        return r;
      }).catch(() => caches.match(e.request).then(r => r || caches.match("index.html")))
    );
    return;
  }
  // Tipografía: la copia guardada si existe
  if (url.hostname.endsWith("fonts.googleapis.com") || url.hostname.endsWith("fonts.gstatic.com")) {
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(res => {
      const copia = res.clone(); caches.open(VERSION).then(c => c.put(e.request, copia)); return res;
    })));
  }
});
