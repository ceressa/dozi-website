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

const CACHE_NAME = 'dozi-pwa-v5';
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
  
  const title = data.notification?.title || data.title || 'Dozi';
  const body = data.notification?.body || data.body || '';
  const notifType = data.data?.type || '';
  
  // Build notification options based on type
  const options = {
    body: body,
    icon: '/dozi_brand.png',
    badge: '/dozi_brand.png',
    renotify: true,
    data: data.data || {},
  };
  
  switch (notifType) {
    case 'badi_request':
      // Badi istegi - Onayla / Reddet butonlari
      options.tag = 'badi-request-' + (data.data?.requestId || Date.now());
      options.requireInteraction = true;
      options.actions = [
        { action: 'accept_badi', title: 'Onayla' },
        { action: 'reject_badi', title: 'Reddet' }
      ];
      break;
      
    case 'badi_nudge':
      // Durtme bildirimi - Badilerim sayfasina git
      options.tag = 'badi-nudge-' + Date.now();
      options.vibrate = [200, 100, 200];
      options.actions = [
        { action: 'open_badis', title: 'Goruntule' }
      ];
      break;
      
    case 'badi_thank_you':
      // Tesekkur mesaji
      options.tag = 'badi-thanks-' + Date.now();
      options.actions = [
        { action: 'open_badis', title: 'Goruntule' }
      ];
      break;
      
    case 'medication_taken':
    case 'medication_missed':
    case 'medication_skipped':
      // Badi ilac durumu
      options.tag = 'badi-med-' + Date.now();
      options.actions = [
        { action: 'open_badis', title: 'Goruntule' }
      ];
      break;
      
    default:
      // Ilac hatirlatmasi veya genel bildirim
      options.tag = data.data?.medicineId || 'dozi-' + Date.now();
      options.requireInteraction = true;
      options.vibrate = [200, 100, 200, 100, 200];
      options.actions = [
        { action: 'take', title: 'Aldim' },
        { action: 'postpone', title: 'Ertele (15dk)' }
      ];
      break;
  }
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  const action = event.action;
  const notifData = event.notification.data || {};
  const notifType = notifData.type || '';
  
  console.log('[SW] Notification click:', action, 'type:', notifType);
  event.notification.close();
  
  // Determine target URL based on action and notification type
  let targetUrl = '/dozi/dashboard.html';
  
  if (action === 'accept_badi' && notifData.requestId) {
    targetUrl = '/dozi/dashboard.html?tab=badis&action=accept&requestId=' + notifData.requestId;
  } else if (action === 'reject_badi' && notifData.requestId) {
    targetUrl = '/dozi/dashboard.html?tab=badis&action=reject&requestId=' + notifData.requestId;
  } else if (action === 'open_badis' || notifType === 'badi_request' || notifType === 'badi_nudge' || notifType === 'badi_thank_you') {
    targetUrl = '/dozi/dashboard.html?tab=badis';
  } else if (action === 'take') {
    targetUrl = '/dozi/dashboard.html?action=take&medicineId=' + (notifData.medicineId || '');
  } else if (action === 'postpone') {
    targetUrl = '/dozi/dashboard.html?action=postpone&medicineId=' + (notifData.medicineId || '');
  } else if (notifType.includes('medication') || notifType.includes('med')) {
    targetUrl = '/dozi/dashboard.html?tab=badis';
  }
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // Focus existing window if possible
        for (const client of windowClients) {
          if (client.url.includes('/dozi/') && 'focus' in client) {
            client.postMessage({ type: 'notification_action', action, data: notifData, url: targetUrl });
            return client.focus();
          }
        }
        return clients.openWindow(targetUrl);
      })
  );
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
