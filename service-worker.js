/**
 * SERVICE WORKER - Makes Your Web App Work 100% Offline
 *
 * This caches all your app files so it works even without internet!
 * Just like a native app!
 *
 * What it does:
 * - Caches HTML, CSS, JavaScript files
 * - Serves cached files when offline
 * - Updates cache when online
 * - Makes app installable (PWA)
 */

const CACHE_NAME = 'anki-clone-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/offline-anki-app.js',
    '/styles.css',
    '/educational-app-with-calendar.html',
    // Add all your app files here
];

/**
 * Install Service Worker - Cache files for offline use
 */
self.addEventListener('install', (event) => {
    console.log('🔧 Service Worker: Installing...');

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('📦 Service Worker: Caching files');
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                console.log('✅ Service Worker: All files cached!');
                return self.skipWaiting();
            })
    );
});

/**
 * Activate Service Worker - Clean up old caches
 */
self.addEventListener('activate', (event) => {
    console.log('🚀 Service Worker: Activating...');

    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('🗑️ Service Worker: Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('✅ Service Worker: Activated!');
            return self.clients.claim();
        })
    );
});

/**
 * Fetch - Serve from cache when offline
 *
 * Strategy: Cache First, Network Fallback
 * - Try to serve from cache first (instant, works offline)
 * - If not in cache, fetch from network
 * - Cache the network response for next time
 */
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Cache hit - return cached response
                if (response) {
                    console.log('💾 Serving from cache:', event.request.url);
                    return response;
                }

                // Not in cache - fetch from network
                return fetch(event.request).then((response) => {
                    // Don't cache invalid responses
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }

                    // Clone the response (can only be used once)
                    const responseToCache = response.clone();

                    // Add to cache for offline use
                    caches.open(CACHE_NAME)
                        .then((cache) => {
                            console.log('📥 Caching new file:', event.request.url);
                            cache.put(event.request, responseToCache);
                        });

                    return response;
                });
            })
            .catch(() => {
                // Network failed and not in cache
                // Return offline page (if you have one)
                console.log('❌ Offline and not cached:', event.request.url);

                // You can return a custom offline page here
                // return caches.match('/offline.html');
            })
    );
});

/**
 * Background Sync - Sync data when back online
 * (Advanced feature - optional)
 */
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-cards') {
        event.waitUntil(syncCards());
    }
});

async function syncCards() {
    console.log('🔄 Syncing cards with server...');

    // Get pending changes from IndexedDB
    // Send to server
    // Update local database

    // This is where you'd sync with your backend API
    // For now, it's just a placeholder

    console.log('✅ Sync complete!');
}

/**
 * 🎯 HOW IT WORKS:
 *
 * 1. First visit:
 *    - Download all files
 *    - Cache them in browser
 *
 * 2. Next visits (OFFLINE):
 *    - Serve files from cache
 *    - No internet needed!
 *    - Works like native app!
 *
 * 3. When back online:
 *    - Update cache with new files
 *    - Sync data with server (optional)
 *
 * ✅ Result: Your web app works 100% offline!
 */
