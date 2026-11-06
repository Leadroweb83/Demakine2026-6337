/* Service worker: o cardápio abre mesmo com sinal fraco ou sem internet.
   - Página, dados (menu.json/en.json), CSS e JS: rede primeiro (preço sempre atualizado);
     sem rede, usa a última cópia salva.
   - Fontes, logo e fotos: cache primeiro (não mudam).
   Ao publicar mudanças de CSS/JS, aumente VERSAO para renovar o cache. */
var VERSAO = "cardapio-v1";
var ESSENCIAIS = [
  "./",
  "index.html",
  "css/style.css",
  "js/app.js",
  "data/menu.json",
  "data/en.json",
  "assets/logo-claro.webp",
  "assets/fonts/inter.woff2",
  "assets/fonts/fraunces.woff2",
  "assets/icons/favicon.png",
  "assets/images/parmegiana.webp"
];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(VERSAO).then(function (c) { return c.addAll(ESSENCIAIS); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (nomes) {
      return Promise.all(nomes.filter(function (n) { return n !== VERSAO; }).map(function (n) { return caches.delete(n); }));
    }).then(function () { return self.clients.claim(); })
  );
});

function redePrimeiro(req) {
  return fetch(req).then(function (res) {
    if (res && res.ok) {
      var copia = res.clone();
      caches.open(VERSAO).then(function (c) { c.put(req, copia); });
    }
    return res;
  }).catch(function () {
    return caches.match(req, { ignoreSearch: true }).then(function (r) { return r || caches.match("index.html"); });
  });
}

function cachePrimeiro(req) {
  return caches.match(req).then(function (r) {
    return r || fetch(req).then(function (res) {
      if (res && res.ok) {
        var copia = res.clone();
        caches.open(VERSAO).then(function (c) { c.put(req, copia); });
      }
      return res;
    });
  });
}

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;
  var url = new URL(req.url);
  if (url.origin !== location.origin) return;
  if (/\.(webp|png|jpg|woff2|svg)$/.test(url.pathname)) e.respondWith(cachePrimeiro(req));
  else e.respondWith(redePrimeiro(req));
});
