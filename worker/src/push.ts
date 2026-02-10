import type { PushSubscriptionData, PushPayload } from "./types";
import {
  generateVapidHeaders,
  encryptPayload,
  buildEncryptedBody,
} from "./crypto";

export interface PushResult {
  success: boolean;
  endpoint: string;
  statusCode?: number;
  error?: string;
  shouldRemove?: boolean; // True if subscription is expired/invalid
}

/**
 * Send a push notification to a single subscription
 */
export async function sendPushNotification(
  subscription: PushSubscriptionData,
  payload: PushPayload,
  vapidPublicKey: string,
  vapidPrivateKey: string
): Promise<PushResult> {
  console.log("[Worker Push] Sending to:", subscription.endpoint.substring(0, 50) + "...");
  try {
    // Generate VAPID headers
    console.log("[Worker Push] Generating VAPID headers...");
    const vapidHeaders = await generateVapidHeaders(
      subscription.endpoint,
      vapidPublicKey,
      vapidPrivateKey
    );
    console.log("[Worker Push] VAPID headers generated");

    // Encrypt the payload
    const payloadString = JSON.stringify(payload);
    console.log("[Worker Push] Encrypting payload...");
    const { ciphertext, salt, localPublicKey } = await encryptPayload(
      payloadString,
      subscription.keys.p256dh,
      subscription.keys.auth
    );

    // Build the encrypted body
    const body = buildEncryptedBody(ciphertext, salt, localPublicKey);
    console.log("[Worker Push] Encrypted body size:", body.byteLength);

    // Send the push notification
    console.log("[Worker Push] Sending HTTP request...");
    const response = await fetch(subscription.endpoint, {
      method: "POST",
      headers: {
        "Authorization": vapidHeaders.authorization,
        "Content-Type": "application/octet-stream",
        "Content-Encoding": "aes128gcm",
        "Content-Length": body.byteLength.toString(),
        "TTL": "86400", // 24 hours - message waits if device offline
        "Urgency": "high", // CRITICAL - wakes up killed iOS apps
        "Topic": "solo-chat-messages", // Groups messages, prevents iOS from blocking for "spam"
      },
      body: body,
    });

    console.log("[Worker Push] Response status:", response.status);

    if (response.ok || response.status === 201) {
      console.log("[Worker Push] Push successful!");
      // Consume the response body to prevent deadlock warnings
      // Cancel the body since we don't need to read it for successful responses
      await response.body?.cancel();
      return {
        success: true,
        endpoint: subscription.endpoint,
        statusCode: response.status,
      };
    }

    // Handle specific error codes
    const errorText = await response.text().catch(() => "");
    console.error("[Worker Push] Push failed:", response.status, errorText);

    // 404 or 410 means subscription is no longer valid
    if (response.status === 404 || response.status === 410) {
      return {
        success: false,
        endpoint: subscription.endpoint,
        statusCode: response.status,
        error: "Subscription expired or invalid",
        shouldRemove: true,
      };
    }

    // 429 means rate limited
    if (response.status === 429) {
      return {
        success: false,
        endpoint: subscription.endpoint,
        statusCode: response.status,
        error: "Rate limited",
        shouldRemove: false,
      };
    }

    return {
      success: false,
      endpoint: subscription.endpoint,
      statusCode: response.status,
      error: errorText || `HTTP ${response.status}`,
      shouldRemove: false,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[Worker Push] Exception:", errorMessage, error);

    return {
      success: false,
      endpoint: subscription.endpoint,
      error: errorMessage,
      shouldRemove: false,
    };
  }
}

/**
 * Send push notifications to multiple subscriptions
 */
export async function sendPushToAll(
  subscriptions: PushSubscriptionData[],
  payload: PushPayload,
  vapidPublicKey: string,
  vapidPrivateKey: string
): Promise<{
  results: PushResult[];
  successCount: number;
  failureCount: number;
  expiredSubscriptions: string[];
}> {
  const results = await Promise.all(
    subscriptions.map((sub) =>
      sendPushNotification(sub, payload, vapidPublicKey, vapidPrivateKey)
    )
  );

  const successCount = results.filter((r) => r.success).length;
  const failureCount = results.filter((r) => !r.success).length;
  const expiredSubscriptions = results
    .filter((r) => r.shouldRemove)
    .map((r) => r.endpoint);

  return {
    results,
    successCount,
    failureCount,
    expiredSubscriptions,
  };
}
