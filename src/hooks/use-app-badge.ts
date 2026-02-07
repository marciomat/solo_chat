"use client";

import { useEffect } from "react";

/**
 * Hook to manage the PWA app icon badge
 * Uses the Badge API to show unread count on the app icon
 * https://developer.mozilla.org/en-US/docs/Web/API/Badge_API
 */
export function useAppBadge(count: number) {
  useEffect(() => {
    // Check if Badge API is supported
    if ("setAppBadge" in navigator) {
      if (count > 0) {
        // Set badge with count
        navigator.setAppBadge(count).catch((error) => {
          console.warn("Failed to set app badge:", error);
        });
      } else {
        // Clear badge
        navigator.clearAppBadge().catch((error) => {
          console.warn("Failed to clear app badge:", error);
        });
      }
    }
  }, [count]);
}
