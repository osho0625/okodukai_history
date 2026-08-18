const CACHE_NAME = 'laundry-v1';

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll([
    './',
    './index.html',
    './js/app.js',
    './manifest.json'
  ])));
  self.skipWaiting();
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
      if (typeof data === 'string') data = JSON.parse(data);
    } catch (err) {
      data = { title: '🧺 洗濯通知', body: e.data.text() };
    }
  }
  if (!data.body || !data.body.trim()) return;
  const title = data.title || '🧺 洗濯通知';
  const options = {
    body: data.body,
    icon: './images/laundry-192.png',
    badge: './images/laundry-192.png',
    tag: data.tag || 'laundry-' + Date.now(),
    data: { url: data.url || './index.html' }
  };
  e.waitUntil(self.registration.showNotification(title, options));
});

// 通知クリック時
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || './index.html';
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const client of list) {
        if (client.url.includes('laundry_notification') && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});

// ネットワーク優先フォールバック
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = e.request.url;
  if (!url.startsWith(self.location.origin)) return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
