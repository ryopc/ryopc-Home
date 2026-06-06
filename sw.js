const CACHE_NAME = 'ryopc-pwa-cache-v1';
const ASSETS_TO_CACHE = [
  './pwa.html',
  './manifest.json',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdn.jsdelivr.net/gh/ryopc/ryopc-Home@main/favicon.png'
];

// Service Worker のインストール（アセットのプリキャッシュ）
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching app shell and assets');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// 不要な古いキャッシュをクリーンアップ
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Clearing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// リクエストのフェッチ（キャッシュ優先、フォールバックネットワーク）
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then((networkResponse) => {
          // 有効なレスポンスのみキャッシュに複製
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            // セキュリティや外部APIなどの影響を考慮し、スキームが http/https のもののみキャッシュする
            if (event.request.url.startsWith('http')) {
              cache.put(event.request, responseToCache);
            }
          });
          return networkResponse;
        });
      }).catch(() => {
        // オフライン時のフォールバック処理（必要に応じて記述）
      })
  );
});
