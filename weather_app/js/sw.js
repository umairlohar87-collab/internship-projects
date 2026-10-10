const CACHE = "weather-v1";
const ASSETS = [
  "/", "/index.html", "/css/style.css",
  "/js/utils.js", "/js/api.js", "/js/storage.js", "/js/ui.js", "/js/app.js"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});