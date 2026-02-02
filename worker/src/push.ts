import type { PushSubscriptionData, PushPayload } from "./types";

// Web Push implementation for Cloudflare Workers
// Note: web-push npm package doesn't work directly in Workers
// This is a simplified implementation using the Web Push protocol

export async function sendPushNotification(
  subscription: PushSubscriptionData,
  payload: PushPayload,
  vapidPublicKey: string,
  vapidPrivateKey: string
): Promise<boolean> {
  try {
    // In a production environment, you would implement the full Web Push protocol
    // or use a service like Cloudflare's native push support
    
    const response = await fetch(subscription.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "TTL": "86400",
        // Note: Full VAPID implementation requires crypto operations
        // that need to be adapted for Workers environment
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error("Push failed:", response.status, await response.text());
      
      // Handle expired subscriptions (410 Gone)
      if (response.status === 410) {
        return false; // Indicate subscription should be removed
      }
    }

    return response.ok;
  } catch (error) {
    console.error("Push error:", error);
    return false;
  }
}
