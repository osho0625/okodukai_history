const CACHE_NAME = 'okozukai-v287';
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
  './pages/family-notes.html',
  './pages/math-olympiad.html',
  './pages/math-battle.html',
  './pages/puyo-battle.html',
  './css/puyo-escape.css',
  './pages/trpg-cthulhu.html',
  './pages/recipe.html',
  './pages/settlement.html',
  './js/recipe-router.js',
  './js/recipe-api.js',
  './js/recipe-ui.js',
  './js/recipe-search.js',
  './js/recipe-shopping.js',
  './js/recipe-meal-plan.js',
  './js/recipe-utils.js',
  './js/settlement-utils.js',
  './js/settlement-app.js',
  './data/math-olympiad-grade5.json',
  './data/math-olympiad-grade1.json',
  './data/math-olympiad-grade2.json',
  './data/math-olympiad-grade3.json',
  './data/math-olympiad-grade4.json',
  './data/math-olympiad-grade6.json',
  './js/common.js',
  './js/olimar-scenario.js',
  './js/trpg-poisoned-soup-scenario.js',
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

// Push通知受信
self.addEventListener('push', e => {
  let data = {};
  if (e.data) {
    try {
      data = e.data.json();
      // 二重エンコード対策: もし文字列が返ってきたら再パース
      if (typeof data === 'string') data = JSON.parse(data);
    } catch (err) {
      // JSONパース失敗時はテキストとして扱う
      data = { title: '🔔 通知', body: e.data.text() };
    }
  }
  const title = data.title || '🔔 リマインダー';
  const options = {
    body: data.body || '',
    icon: './images/2728.png',
    badge: './images/2728.png',
    tag: data.tag || 'reminder-' + Date.now(),
    data: { url: data.url || './index.html' }
  };
  e.waitUntil(self.registration.showNotification(title, options));
});

// 通知クリック時
self.addEventListener('notificationclick', e => {
  e.notification.close();
  let url = e.notification.data && e.notification.data.url ? e.notification.data.url : './index.html';
  // 電話通知の場合はナースコール画面を開く
  const title = e.notification.title || '';
  if (title.includes('でんわ') || title.includes('ナースコール')) {
    url = './pages/nurse-call.html';
  }
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const client of list) {
        if (client.url.includes('nurse-call')) {
          return client.focus();
        }
      }
      for (const client of list) {
        if (client.url.includes('okodukai_history') && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
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
