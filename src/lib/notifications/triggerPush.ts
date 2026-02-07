/**
 * Trigger push notifications to other devices via the worker
 */

interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  deviceId: string;
}

interface PushMessage {
  title: string;
  body: string;
  tag?: string;
  url?: string;
}

interface TriggerPushResponse {
  success: boolean;
  sent?: number;
  failed?: number;
  expiredEndpoints?: string[];
  error?: string;
}

// Worker URL - should be set in environment
const PUSH_WORKER_URL = process.env.NEXT_PUBLIC_PUSH_WORKER_URL;

/**
 * Trigger push notifications to all other devices in the room
 */
export async function triggerPushNotifications(
  subscriptions: PushSubscriptionData[],
  message: PushMessage,
  currentDeviceId: string
): Promise<TriggerPushResponse> {
  if (!PUSH_WORKER_URL) {
    console.log("[Push] Worker URL not configured, skipping push");
    return { success: false, error: "Push worker not configured" };
  }

  // Filter out current device's subscription
  const otherDevices = subscriptions.filter(
    (sub) => sub.deviceId !== currentDeviceId
  );

  if (otherDevices.length === 0) {
    console.log("[Push] No other devices to notify");
    return { success: true, sent: 0 };
  }

  try {
    console.log(`[Push] Triggering push to ${otherDevices.length} devices`);

    const response = await fetch(`${PUSH_WORKER_URL}/trigger-push`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subscriptions: otherDevices,
        message,
      }),
    });

    const result = await response.json() as TriggerPushResponse;

    if (!response.ok) {
      console.error("[Push] Worker error:", result.error);
      return { success: false, error: result.error };
    }

    console.log(`[Push] Sent: ${result.sent}, Failed: ${result.failed}`);

    // Log expired subscriptions (these should be cleaned up by devices on next registration)
    if (result.expiredEndpoints && result.expiredEndpoints.length > 0) {
      console.log(`[Push] ${result.expiredEndpoints.length} expired subscriptions reported by worker`);
    }

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[Push] Failed to trigger:", errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Convert browser PushSubscription to our format
 */
export function convertBrowserSubscription(
  subscription: PushSubscription,
  deviceId: string
): PushSubscriptionData | null {
  const keys = subscription.toJSON().keys;
  if (!keys?.p256dh || !keys?.auth) {
    console.error("[Push] Subscription missing keys");
    return null;
  }

  return {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: keys.p256dh,
      auth: keys.auth,
    },
    deviceId,
  };
}
