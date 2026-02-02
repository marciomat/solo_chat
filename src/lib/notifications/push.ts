/**
 * Request notification permission
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!("Notification" in window)) {
    console.warn("Notifications not supported");
    return "denied";
  }

  return await Notification.requestPermission();
}

/**
 * Subscribe to push notifications
 * Returns: { success: true, subscription } or { success: false, reason: string }
 */
export async function subscribeToPush(): Promise<{ success: true; subscription: PushSubscription } | { success: false; reason: string }> {
  // Check if notifications are supported
  if (!("Notification" in window)) {
    return { success: false, reason: "Notifications not supported in this browser" };
  }

  // Check if service worker is supported
  if (!("serviceWorker" in navigator)) {
    return { success: false, reason: "Service Worker not supported" };
  }

  // Check if PushManager is supported
  if (!("PushManager" in window)) {
    return { success: false, reason: "Push notifications not supported" };
  }

  // Request permission
  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    return { success: false, reason: permission === "denied" ? "Notification permission denied. Please enable in browser settings." : "Notification permission not granted" };
  }

  try {
    // Wait for service worker with timeout
    const registration = await Promise.race([
      navigator.serviceWorker.ready,
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error("Service worker timeout")), 5000)
      )
    ]);

    // Get VAPID public key from environment
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidPublicKey) {
      // If no VAPID key, just grant permission for local notifications
      return { success: false, reason: "Push notifications not configured. Local notifications enabled." };
    }

    // Subscribe to push
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey).buffer as ArrayBuffer,
    });

    return { success: true, subscription };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Failed to subscribe to push:", error);
    
    // If service worker timeout, still allow local notifications
    if (message.includes("timeout")) {
      return { success: false, reason: "Push service unavailable. Local notifications enabled." };
    }
    
    return { success: false, reason: `Failed: ${message}` };
  }
}

/**
 * Simple permission request for local notifications only
 */
export async function enableLocalNotifications(): Promise<{ success: boolean; reason?: string }> {
  if (!("Notification" in window)) {
    return { success: false, reason: "Notifications not supported" };
  }

  const permission = await Notification.requestPermission();
  if (permission === "granted") {
    return { success: true };
  }
  
  return { success: false, reason: permission === "denied" ? "Permission denied. Enable in browser settings." : "Permission not granted" };
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPush(): Promise<boolean> {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await subscription.unsubscribe();
      return true;
    }

    return false;
  } catch (error) {
    console.error("Failed to unsubscribe from push:", error);
    return false;
  }
}

/**
 * Get current push subscription
 */
export async function getPushSubscription(): Promise<PushSubscription | null> {
  try {
    const registration = await navigator.serviceWorker.ready;
    return await registration.pushManager.getSubscription();
  } catch (error) {
    console.error("Failed to get push subscription:", error);
    return null;
  }
}

/**
 * Check if push notifications are available
 */
export function isPushSupported(): boolean {
  return (
    "Notification" in window &&
    "serviceWorker" in navigator &&
    "PushManager" in window
  );
}

/**
 * Check current notification permission status
 */
export function getNotificationPermission(): NotificationPermission | "unsupported" {
  if (!("Notification" in window)) {
    return "unsupported";
  }
  return Notification.permission;
}

/**
 * Convert VAPID key from base64 to Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

import { areNotificationsEnabled } from "@/lib/utils/notificationSettings";

/**
 * Send a local notification using Service Worker (recommended approach)
 * Falls back to new Notification() if service worker is not available
 */
export async function showLocalNotification(
  title: string,
  options?: NotificationOptions
): Promise<void> {
  // Check both browser permission AND user preference
  if (!("Notification" in window)) {
    console.log("[Notification] Notifications not supported");
    return;
  }
  
  const permission = Notification.permission;
  const enabled = areNotificationsEnabled();
  
  console.log("[Notification] Attempting to show:", { title, permission, enabled });
  
  if (permission !== "granted") {
    console.log("[Notification] Skipped - permission not granted:", permission);
    return;
  }
  
  if (!enabled) {
    console.log("[Notification] Skipped - disabled in settings");
    return;
  }

  try {
    // Prefer service worker notification (works better in PWAs)
    if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
      // Use timeout to avoid hanging if SW isn't active
      const registration = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 2000))
      ]);
      
      if (registration) {
        await registration.showNotification(title, {
          icon: "/icons/icon-192x192.svg",
          badge: "/icons/icon-72x72.svg",
          ...options,
        });
        console.log("[Notification] Shown via Service Worker");
        return;
      }
    }
    
    // Fallback to regular notification
    new Notification(title, {
      icon: "/icons/icon-192x192.svg",
      badge: "/icons/icon-72x72.svg",
      ...options,
    });
    console.log("[Notification] Shown via Notification API");
  } catch (error) {
    console.error("[Notification] Failed to show:", error);
    
    // Final fallback: try regular notification
    try {
      new Notification(title, {
        icon: "/icons/icon-192x192.svg",
        ...options,
      });
      console.log("[Notification] Fallback notification shown");
    } catch (fallbackError) {
      console.error("[Notification] Fallback also failed:", fallbackError);
    }
  }
}

/**
 * Show notification for a new message
 */
export function notifyNewMessage(senderName: string, messageText: string, roomUrl?: string): void {
  showLocalNotification(senderName || "New Message", {
    body: messageText.length > 100 ? messageText.substring(0, 100) + "..." : messageText,
    tag: "solo-new-message",
    data: { url: roomUrl },
  });
}
