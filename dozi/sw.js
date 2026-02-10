// Dozi PWA Service Worker (with FCM support)
// Version: 1.0.0

// Import Firebase for push notification support
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Initialize Firebase in Service Worker
firebase.initializeApp({
  apiKey: "AIzaSyBqxped2ZQS7uJHCX-MmCq0Nnj5Vtudloo",
  authDomain: "dozi-cd7cc.firebaseapp.com",
  projectId: "dozi-cd7cc",
  storageBucket: "dozi-cd7cc.firebasestorage.app",
  messagingSenderId: "393677078355",
  appId: "1:393677078355:web:415e8d15c58ec4d48ceba6"
});

const messaging = firebase.messaging();

// Handle background FCM messages
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Background FCM message:', payload);
  
  const notificationTitle = payload.notification?.title || 'Dozi - Ilac Hatirlatmasi';
  const notificationOptions = {
    body: payload.notification?.body || 'Ilac alma zamanin geldi!',
    icon: '/dozi_brand.png',
    badge: '/dozi_brand.png',
    tag: payload.data?.medicineId || 'dozi-reminder',
    renotify: true,
    requireInteraction: true,
    vibrate: [200, 100, 200, 100, 200],
    data: payload.data || {},
    actions: [
      { action: 'take', title: 'Aldim' },
      { action: 'postpone', title: 'Ertele (15dk)' }
    ]
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

const CACHE_NAME = 'dozi-pwa-v2';
const OFFLINE_URL = '/dozi/offline.html';

// Files to cache immediately on install
const PRECACHE_URLS = [
  '/dozi/',
  '/dozi/index.html',
  '/dozi/dashboard.html',
  '/dozi/dashboard.css',
  '/dozi/dashboard.js',
  '/dozi/offline.html',
  '/dozi_brand.png',
  '/dozi/images/dozi_brand.webp',
  '/dozi/images/dozi_happy.webp',
  '/dozi/images/dozi_logo.webp',
  '/images/dozi_happy.webp',
  '/images/dozi_happy5.webp',
  '/images/dozi_waiting.webp',
  '/images/dozi_family.webp',
  '/images/dozi_hosgeldin_anim.gif',
  '/images/dozi_bravo.webp',
  '/images/dozi_morning.webp',
  '/images/dozi_sleepy.webp',
  // CDN resources
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap',
  'https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css'
];

// Install: Pre-cache essential resources
self.addEventListener('install', (event) => {
  console.log('[SW] Install event');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Pre-caching resources');
        // Use addAll with error handling per item
        return Promise.allSettled(
          PRECACHE_URLS.map((url) => 
            cache.add(url).catch((err) => {
              console.warn(`[SW] Failed to cache: ${url}`, err);
            })
          )
        );
      })
      .then(() => self.skipWaiting())
  );
});

// Activate: Clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate event');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch: Network-first for API calls, Cache-first for static assets
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip Firebase/Google API requests (auth, firestore, functions)
  if (
    url.hostname.includes('firebaseio.com') ||
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('firestore.googleapis.com') ||
    url.hostname.includes('cloudfunctions.net') ||
    url.hostname.includes('firebaseapp.com') ||
    url.hostname.includes('identitytoolkit.googleapis.com') ||
    url.hostname.includes('securetoken.googleapis.com') ||
    url.hostname.includes('gstatic.com/firebasejs')
  ) {
    return;
  }

  // For navigation requests (HTML pages)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache the response
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // Try cache first, then offline page
          return caches.match(event.request)
            .then((cachedResponse) => {
              return cachedResponse || caches.match(OFFLINE_URL);
            });
        })
    );
    return;
  }

  // For JS files: Network-first (so code updates are picked up immediately)
  if (url.pathname.endsWith('.js')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
    return;
  }

  // For other static assets (CSS, images, fonts): Cache-first with background update
  if (
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.webp') ||
    url.pathname.endsWith('.gif') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.woff')
  ) {
    event.respondWith(
      caches.match(event.request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            // Return cached version but also update cache in background
            fetch(event.request)
              .then((response) => {
                if (response.ok) {
                  caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, response);
                  });
                }
              })
              .catch(() => {});
            return cachedResponse;
          }
          
          // Not in cache, fetch from network
          return fetch(event.request)
            .then((response) => {
              if (response.ok) {
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(event.request, responseClone);
                });
              }
              return response;
            });
        })
    );
    return;
  }

  // For CDN resources (fonts, icons): Cache-first
  if (
    url.hostname.includes('cdn.jsdelivr.net') ||
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com')
  ) {
    event.respondWith(
      caches.match(event.request)
        .then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          
          return fetch(event.request)
            .then((response) => {
              if (response.ok) {
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(event.request, responseClone);
                });
              }
              return response;
            });
        })
    );
    return;
  }
});

// Handle push notifications from FCM
self.addEventListener('push', (event) => {
  console.log('[SW] Push received:', event);
  
  let data = {};
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = {
        title: 'Dozi',
        body: event.data.text()
      };
    }
  }
  
  const title = data.notification?.title || data.title || 'Dozi - Ilac Hatirlatmasi';
  const options = {
    body: data.notification?.body || data.body || 'Ilac alma zamanin geldi!',
    icon: '/dozi_brand.png',
    badge: '/dozi_brand.png',
    tag: data.data?.medicineId || 'dozi-reminder',
    renotify: true,
    requireInteraction: true,
    vibrate: [200, 100, 200, 100, 200],
    data: data.data || {},
    actions: [
      {
        action: 'take',
        title: 'Aldim'
      },
      {
        action: 'postpone',
        title: 'Ertele (15dk)'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification click:', event.action);
  
  event.notification.close();
  
  if (event.action === 'take') {
    // Open dashboard to mark as taken
    event.waitUntil(
      clients.openWindow('/dozi/dashboard.html?action=take&medicineId=' + (event.notification.data.medicineId || ''))
    );
  } else if (event.action === 'postpone') {
    // Could trigger a postpone via fetch API
    event.waitUntil(
      clients.openWindow('/dozi/dashboard.html?action=postpone&medicineId=' + (event.notification.data.medicineId || ''))
    );
  } else {
    // Default: open dashboard
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((windowClients) => {
          // Check if there is already a window open
          for (const client of windowClients) {
            if (client.url.includes('/dozi/') && 'focus' in client) {
              return client.focus();
            }
          }
          // Open new window
          return clients.openWindow('/dozi/dashboard.html');
        })
    );
  }
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed');
});

// Background sync for offline medication marking
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-medication-logs') {
    console.log('[SW] Syncing medication logs');
    // This would sync offline medication marks when connection is restored
    // Implementation depends on IndexedDB storage of pending actions
  }
});
