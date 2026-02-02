/// <reference lib="webworker" />
import { Serwist } from "serwist";

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  // For static export, we don't have build-time manifest injection
  // So we use runtime caching instead
  precacheEntries: [
    { url: "/", revision: "2" },
    { url: "/offline", revision: "2" },
    { url: "/chat", revision: "2" },
  ],
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: false, // Disabled for static export
  runtimeCaching: [
    {
      // Cache page navigations - always try network first
      matcher: ({ request }) => request.mode === "navigate",
      handler: "NetworkFirst" as const,
      options: {
        cacheName: "pages-cache",
        networkTimeoutSeconds: 3,
      },
    },
    {
      // Next.js chunks with hash in filename - use StaleWhileRevalidate
      // These have unique names per build, so we need to fetch new ones
      matcher: ({ url }) => 
        url.pathname.startsWith("/_next/static/chunks/"),
      handler: "StaleWhileRevalidate" as const,
      options: {
        cacheName: "js-chunks-cache",
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
        },
      },
    },
    {
      // Other static assets (images, fonts, etc)
      matcher: ({ request }) =>
        request.destination === "image" ||
        request.destination === "font",
      handler: "CacheFirst" as const,
      options: {
        cacheName: "assets-cache",
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
        },
      },
    },
    {
      // CSS and other scripts - network first to get latest
      matcher: ({ request }) =>
        request.destination === "style" ||
        request.destination === "script",
      handler: "NetworkFirst" as const,
      options: {
        cacheName: "static-cache",
        networkTimeoutSeconds: 3,
      },
    },
    {
      // Cache API requests (Jazz sync) - network only, no caching
      matcher: ({ url }) => url.hostname.includes("jazz"),
      handler: "NetworkOnly" as const,
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
self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {};
  const title = data.title ?? "Solo Chat";
  const options: NotificationOptions = {
    body: data.body ?? "You have a new message",
    icon: "/icons/icon-192x192.svg",
    badge: "/icons/icon-72x72.svg",
    tag: data.tag ?? "solo-notification",
    data: {
      url: data.url ?? "/",
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url ?? "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clientList) => {
      // Check if a window is already open
      for (const client of clientList) {
        if (client.url.includes(urlToOpen) && "focus" in client) {
          return (client as WindowClient).focus();
        }
      }
      // Open new window if none found
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});

serwist.addEventListeners();
