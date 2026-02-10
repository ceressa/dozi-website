// Firebase Cloud Messaging Service Worker
// This file redirects to the main service worker (sw.js) which handles both
// PWA caching and FCM background messages.
// FCM requires this file to exist at the messaging scope.

// Import the main service worker which already includes Firebase messaging
importScripts('sw.js');
