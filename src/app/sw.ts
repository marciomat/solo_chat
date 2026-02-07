/// <reference lib="webworker" />
import {
  Serwist,
  NetworkFirst,
  StaleWhileRevalidate,
  CacheFirst,
  NetworkOnly,
  ExpirationPlugin
} from "serwist";

declare const self: ServiceWorkerGlobalScope;

// Initialize Serwist with runtime caching and lifecycle options
const serwist = new Serwist({
  // For static export, we don't have build-time manifest injection
  // So we use runtime caching instead
  precacheEntries: [
    { url: "/", revision: "3" },
    { url: "/offline", revision: "3" },
    { url: "/chat", revision: "3" },
  ],
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: false, // Disabled for static export
  runtimeCaching: [
    {
      // Cache page navigations - always try network first
      matcher: ({ request }) => request.mode === "navigate",
      handler: new NetworkFirst({
        cacheName: "pages-cache",
        networkTimeoutSeconds: 3,
      }),
    },
    {
      // Next.js chunks with hash in filename - use StaleWhileRevalidate
      // These have unique names per build, so we need to fetch new ones
      matcher: ({ url }) => 
        url.pathname.startsWith("/_next/static/chunks/"),
      handler: new StaleWhileRevalidate({
        cacheName: "js-chunks-cache",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 50,
            maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
          }),
        ],
      }),
    },
    {
      // Other static assets (images, fonts, etc)
      matcher: ({ request }) =>
        request.destination === "image" ||
        request.destination === "font",
      handler: new CacheFirst({
        cacheName: "assets-cache",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 100,
            maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
          }),
        ],
      }),
    },
    {
      // CSS and other scripts - network first to get latest
      matcher: ({ request }) =>
        request.destination === "style" ||
        request.destination === "script",
      handler: new NetworkFirst({
        cacheName: "static-cache",
        networkTimeoutSeconds: 3,
      }),
    },
    {
      // Cache API requests (Jazz sync) - network only, no caching
      matcher: ({ url }) => url.hostname.includes("jazz"),
      handler: new NetworkOnly(),
    },
  ],
  fallbacks: {
    entries: [
      {
        url: "/offline",
        matcher: ({ request }) => request.destination === "document",
      },
    ],
  },
});

// Push notification handler
// IMPORTANT: event.waitUntil is crucial for iOS - Apple terminates subscriptions
// after 3 "failed" (silent) attempts. Always show a notification!
self.addEventListener("push", (event) => {
  console.log("[SW] Push event received");

  if (!event.data) {
    console.warn("[SW] Push event has no data");
    // Still show a notification to prevent Apple from marking this as "failed"
    event.waitUntil(
      self.registration.showNotification("Solo Chat", {
        body: "New message",
        icon: "/icons/icon-192x192.svg",
        badge: "/icons/icon-72x72.svg",
        tag: "solo-notification",
      })
    );
    return;
  }

  const data = event.data.json();
  console.log("[SW] Push notification data:", data);

  const title = data.title ?? "Solo Chat";
  const options: NotificationOptions = {
    body: data.body ?? "You have a new message",
    icon: "/icons/icon-192x192.svg",
    badge: "/icons/icon-72x72.svg",
    tag: data.tag ?? "solo-notification", // Replaces old notifications instead of stacking
    data: {
      url: data.url ?? "/",
    },
    // iOS-specific: ensure notification is visible
    requireInteraction: false, // Don't require user action to dismiss
  };

  // event.waitUntil is the "Keep-Alive" signal for iOS
  // This tells iOS the Service Worker is actively processing the push
  event.waitUntil(
    self.registration.showNotification(title, options)
      .then(() => {
        console.log("[SW] Notification shown successfully");
      })
      .catch((error) => {
        console.error("[SW] Failed to show notification:", error);
      })
  );
});

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification clicked");
  event.notification.close();

  const urlToOpen = event.notification.data?.url ?? "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      console.log("[SW] Found clients:", clientList.length);

      // Check if a window is already open
      for (const client of clientList) {
        if (client.url.includes(urlToOpen) && "focus" in client) {
          console.log("[SW] Focusing existing window");
          return (client as WindowClient).focus();
        }
      }

      // Open new window if none found
      if (self.clients.openWindow) {
        console.log("[SW] Opening new window");
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});
serwist.addEventListeners();
