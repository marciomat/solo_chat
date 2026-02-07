"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) {
      console.log("[SW] Service workers not supported");
      return;
    }

    // Register service worker
    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((registration) => {
        console.log("[SW] Service worker registered:", registration.scope);

        // Wait for service worker to become active
        if (registration.installing) {
          console.log("[SW] Service worker installing...");
          registration.installing.addEventListener("statechange", (e) => {
            const sw = e.target as ServiceWorker;
            console.log("[SW] State changed to:", sw.state);
          });
        } else if (registration.waiting) {
          console.log("[SW] Service worker waiting...");
        } else if (registration.active) {
          console.log("[SW] Service worker active");
        }

        // Check for updates periodically
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (newWorker) {
            console.log("[SW] Update found, installing new worker...");
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                console.log("[SW] New service worker available");
              }
            });
          }
        });
      })
      .catch((error) => {
        console.error("[SW] Service worker registration failed:", error);
      });
  }, []);

  return null;
}
