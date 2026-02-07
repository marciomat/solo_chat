"use client";

import { useEffect } from "react";

/**
 * Hook to manage the PWA app icon badge using the Badge API
 * Shows unread message count on the app icon (iOS 16.4+, Chrome, Edge)
 * https://developer.mozilla.org/en-US/docs/Web/API/Badge_API
 */
export function useAppBadge(count: number) {
  useEffect(() => {
    // Check if Badge API is supported
    if ("setAppBadge" in navigator) {
      if (count > 0) {
        // Set badge with count
        navigator.setAppBadge(count).catch((error) => {
          console.warn("[Badge] Failed to set app badge:", error);
        });
      } else {
        // Clear badge when no unread messages
        navigator.clearAppBadge().catch((error) => {
          console.warn("[Badge] Failed to clear app badge:", error);
        });
      }
    } else {
      console.log("[Badge] Badge API not supported on this device");
    }
  }, [count]);
}
