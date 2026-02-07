/**
 * Attempt to register periodic background sync to keep service worker alive
 * NOTE: Limited support on iOS - this is a best-effort approach
 */

export async function registerPeriodicSync() {
  if (!("serviceWorker" in navigator)) {
    console.warn("[Background Sync] Service Worker not supported");
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;

    // Check if Periodic Background Sync is supported
    if ("periodicSync" in registration) {
      // @ts-ignore - PeriodicSync is not in all TypeScript definitions
      await registration.periodicSync.register("check-subscription", {
        minInterval: 24 * 60 * 60 * 1000, // Once per day
      });
      console.log("[Background Sync] Periodic sync registered");
      return true;
    } else {
      console.warn("[Background Sync] Periodic sync not supported on this device");
      return false;
    }
  } catch (error) {
    console.error("[Background Sync] Failed to register:", error);
    return false;
  }
}

export async function unregisterPeriodicSync() {
  if (!("serviceWorker" in navigator)) return;

  try {
    const registration = await navigator.serviceWorker.ready;
    if ("periodicSync" in registration) {
      // @ts-ignore
      await registration.periodicSync.unregister("check-subscription");
      console.log("[Background Sync] Periodic sync unregistered");
    }
  } catch (error) {
    console.error("[Background Sync] Failed to unregister:", error);
  }
}
