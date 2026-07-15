/**
 * ADR-0011 (offline read-first) / specs/SYNC_AND_OFFLINE.md.
 * Service worker versionado explicitamente — o versionamento do nome do
 * cache é o que evita prender o usuário em um asset incompatível: uma nova
 * versão sempre cria um cache novo e descarta o antigo na ativação.
 */
const CACHE_VERSION = "desk-os-v1.1.0";
const SHELL_CACHE = `${CACHE_VERSION}-shell`;
const API_CACHE = `${CACHE_VERSION}-api`;

const SHELL_ASSETS = ["/", "/index.html", "/manifest.webmanifest", "/icons/icon-192.svg", "/icons/icon-512.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_ASSETS)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("desk-os-") && key !== SHELL_CACHE && key !== API_CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

function isApiGet(request) {
  return request.method === "GET" && new URL(request.url).pathname.startsWith("/api/");
}

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Mutações (POST/PUT/...) nunca são cacheadas nem servidas offline — o
  // MVP não faz fila de escrita offline (ADR-0011): a UI informa que
  // precisa de conexão.
  if (request.method !== "GET") return;

  if (isApiGet(request)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(API_CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request)),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(SHELL_CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match("/index.html"));
    }),
  );
});
