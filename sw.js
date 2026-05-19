const CACHE_NAME = 'okozukai-v68';
const ASSETS = [
  './',
  './index.html',
  './pages/child.html',
  './pages/settings.html',
  './pages/admin.html',
  './pages/allowance.html',
  './pages/game.html',
  './pages/ranking.html',
  './pages/release-notes.html',
  './pages/olimar.html',
  './pages/ticket.html',
  './pages/math-olympiad.html',
  './data/math-olympiad-problems.json',
  './data/math-olympiad-grade1.json',
  './data/math-olympiad-grade3.json',
  './js/common.js',
  './js/olimar-scenario.js',
  './manifest.json',
  './images/2728.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

// SKIP_WAITINGメッセージで即アクティベート
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ネットワーク優先、失敗時にキャッシュ（GETのみキャッシュ）
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
