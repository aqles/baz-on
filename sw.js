const CACHE_NAME = 'bazon-cache-v4';
const CORE_ASSETS = [
    './',
    './index.html',
    './offline.html',
    './about.html',
    './contact.html',
    './terms.html',
    './install.html',
    './404.html',
    './style.css',
    './script.js',
    './data.js',
    './translations.js',
    './logo.svg',
    './manifest.json'
];

// CDN cuma pelengkap: kegagalannya tidak boleh menggagalkan install SW
const CDN_ASSETS = [
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(CORE_ASSETS)
                .then(() => cache.addAll(CDN_ASSETS).catch(() => {})))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                    return undefined;
                })
            ))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    // Navigasi: network-first, jatuh ke cache, terakhir halaman offline
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    const copy = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
                    return response;
                })
                .catch(() => caches.match(event.request)
                    .then((cached) => cached || caches.match('./offline.html')))
        );
        return;
    }

    // Aset lain: cache-first, isi cache sambil jalan
    event.respondWith(
        caches.match(event.request).then((cached) => {
            if (cached) return cached;
            return fetch(event.request).then((response) => {
                if (response && response.status === 200 && event.request.url.startsWith(self.location.origin)) {
                    const copy = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
                }
                return response;
            });
        })
    );
});
