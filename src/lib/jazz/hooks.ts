"use client";

import { useCoState } from "jazz-tools/react";
import { useCallback } from "react";
import { ID, co } from "jazz-tools";
import {
  ChatRoom,
  Message,
  ReadByList,
  PushSubscriptionKeys,
} from "@/schema";
import { getOrCreateDeviceId } from "@/lib/utils/device-id";
import { getUsername } from "@/lib/utils/username";
import { triggerPushNotifications } from "@/lib/notifications/triggerPush";

// Simplified type - use any for complex Jazz state to avoid deep type issues
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ChatRoomState = any;

/**
 * Hook to get or create a chat room
 */
export function useChatRoom(roomId: string | undefined): ChatRoomState {
  // Cast to any to avoid complex Jazz type issues
  return useCoState(ChatRoom as any, roomId as ID<co.loaded<typeof ChatRoom>> | undefined, {
    resolve: {
      messages: {
        $each: {
          image: true,
          readBy: true,
        },
      },
      participants: true,
      pushSubscriptions: {
        $each: {
          keys: true,
        },
      },
    },
  });
}

/**
 * Hook to send a message to a chat room
 */
export function useSendMessage(room: ChatRoomState) {
  const sendMessage = useCallback(
    async (text: string, image?: unknown) => {
      console.log("useSendMessage called", { room, text });

      if (!room) {
        console.error("Room not available");
        return null;
      }

      if (!room.messages) {
        console.error("Room messages not available");
        return null;
      }

      if (!room.messages.$jazz) {
        console.error("Room messages $jazz not available - list may not be loaded");
        return null;
      }

      const deviceId = getOrCreateDeviceId();
      const displayName = getUsername() || undefined;

      console.log("Pushing message to list");

      // Push message data directly to the list - Jazz will create the Message CoValue
      room.messages.$jazz.push({
        text,
        image: image as any,
        senderId: deviceId,
        senderName: displayName,
        timestamp: Date.now(),
        status: "sent",
        readBy: undefined,
      });

      room.$jazz.set("lastActivity", Date.now());

      console.log("Message pushed successfully");

      // Trigger push notifications to other devices (fire and forget)
      const timestamp = new Date().toISOString();
      const attemptPushNotification = (retryCount = 0) => {
        console.log(`[Push ${timestamp}] Attempt ${retryCount + 1}: Checking subscriptions:`, {
          isLoaded: room.pushSubscriptions?.$isLoaded,
          length: room.pushSubscriptions?.length,
          currentDeviceId: deviceId
        });

        if (room.pushSubscriptions?.$isLoaded) {
          const subscriptions = extractPushSubscriptions(room.pushSubscriptions);
          console.log(`[Push ${timestamp}] Extracted subscriptions:`, subscriptions.map(s => ({
            endpoint: s.endpoint.substring(0, 50) + "...",
            deviceId: s.deviceId,
            isCurrentDevice: s.deviceId === deviceId
          })));

          if (subscriptions.length > 0) {
            const messagePreview = text.length > 100 ? text.substring(0, 100) + "..." : text;
            const roomId = room.$jazz?.id || room.id;
            triggerPushNotifications(
              subscriptions,
              {
                title: displayName || "New Message",
                body: messagePreview || "Sent an image",
                tag: `solo-${roomId}`,
                url: `/chat?room=${roomId}`,
              },
              deviceId
            ).then(result => {
              console.log(`[Push ${timestamp}] Result:`, result);
            }).catch((err) => console.error(`[Push ${timestamp}] Background trigger failed:`, err));
          } else {
            console.log(`[Push ${timestamp}] No other devices in subscriptions after extraction`);
            // If we have subscriptions in the list but none extracted and haven't retried yet, try again
            if (retryCount === 0 && room.pushSubscriptions.length > 0) {
              console.log(`[Push ${timestamp}] Retrying in 500ms (subscriptions exist but not loaded)`);
              setTimeout(() => attemptPushNotification(1), 500);
            }
          }
        } else {
          console.log(`[Push ${timestamp}] pushSubscriptions not loaded`);
          // Retry once if subscriptions aren't loaded yet
          if (retryCount === 0) {
            console.log(`[Push ${timestamp}] Retrying in 500ms`);
            setTimeout(() => attemptPushNotification(1), 500);
          }
        }
      };

      attemptPushNotification();

      return true;
    },
    [room]
  );

  return sendMessage;
}

/**
 * Extract push subscription data from Jazz list
 */
function extractPushSubscriptions(pushSubscriptions: any): Array<{
  endpoint: string;
  keys: { p256dh: string; auth: string };
  deviceId: string;
}> {
  const result: Array<{
    endpoint: string;
    keys: { p256dh: string; auth: string };
    deviceId: string;
  }> = [];

  try {
    let skippedCount = 0;
    let index = 0;
    for (const sub of pushSubscriptions) {
      const subLoaded = sub?.$isLoaded;
      const hasEndpoint = !!sub?.endpoint;
      const keysLoaded = sub?.keys?.$isLoaded;
      const hasKeys = keysLoaded && !!sub?.keys?.p256dh && !!sub?.keys?.auth;

      if (!subLoaded || !hasEndpoint || !keysLoaded || !hasKeys) {
        console.log(`[Push] Skipping subscription ${index}:`, {
          subLoaded,
          hasEndpoint,
          keysLoaded,
          hasKeys,
          deviceId: sub?.deviceId
        });
        skippedCount++;
      } else {
        result.push({
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.keys.p256dh,
            auth: sub.keys.auth,
          },
          deviceId: sub.deviceId,
        });
      }
      index++;
    }

    if (skippedCount > 0) {
      console.log(`[Push] Skipped ${skippedCount} subscriptions (not fully loaded)`);
    }
  } catch (err) {
    console.error("[Push] Error extracting subscriptions:", err);
  }

  return result;
}

/**
 * Hook to mark a message as read
 */
export function useMarkAsRead(room: ChatRoomState) {
  const markAsRead = useCallback(
    (message: any) => {
      if (!message?.$isLoaded || !room?.$isLoaded) return;

      const deviceId = getOrCreateDeviceId();
      const owner = room.$jazz.owner;

      // Don't mark own messages as read
      if (message.senderId === deviceId) return;

      // Initialize readBy if needed
      if (!message.readBy) {
        message.$jazz.set("readBy", ReadByList.create([], { owner }));
      }

      // Check if already read by this device
      if (message.readBy?.$isLoaded) {
        const readByArray = [...message.readBy];
        if (readByArray.includes(deviceId)) return;

        // Add this device to readBy
        message.readBy.$jazz.push(deviceId);
      }

      // Update status to read
      message.$jazz.set("status", "read");
    },
    [room]
  );

  return markAsRead;
}

/**
 * Hook to get unread message count
 */
export function useUnreadCount(room: ChatRoomState): number {
  if (!room?.$isLoaded) return 0;
  if (!room.messages?.$isLoaded) return 0;

  const deviceId = getOrCreateDeviceId();
  let count = 0;

  const messages = room.messages;
  if (!messages) return 0;

  try {
    for (const message of messages) {
      if (!message?.$isLoaded) continue;
      // Message is unread if it's from someone else and not in our readBy list
      if (message.senderId !== deviceId) {
        const readBy = message.readBy?.$isLoaded ? [...message.readBy] : [];
        if (!readBy.includes(deviceId)) {
          count++;
        }
      }
    }
  } catch {
    // If iteration fails, return 0
    return 0;
  }

  return count;
}

/**
 * Hook to register/update push subscription for this device
 * @param room - The chat room state
 * @returns Function that accepts a browser PushSubscription and registers it
 */
export function useRegisterPushSubscription(room: ChatRoomState) {
  const registerSubscription = useCallback(
    async (browserSubscription: globalThis.PushSubscription) => {
      if (!room?.$isLoaded) {
        console.error("[Push] Room not loaded");
        return false;
      }

      if (!room.pushSubscriptions) {
        console.error("[Push] pushSubscriptions not available");
        return false;
      }

      const deviceId = getOrCreateDeviceId();
      const owner = room.$jazz.owner;

      // Get subscription keys
      const subJson = browserSubscription.toJSON();
      if (!subJson.keys?.p256dh || !subJson.keys?.auth) {
        console.error("[Push] Subscription missing keys");
        return false;
      }

      // Remove ALL existing subscriptions for this device (in case of duplicates)
      const indicesToRemove: number[] = [];
      try {
        const subs = room.pushSubscriptions;
        for (let i = 0; i < subs.length; i++) {
          const sub = subs[i];
          if (sub?.$isLoaded && sub.deviceId === deviceId) {
            indicesToRemove.push(i);
          }
        }
      } catch {
        // Iteration may fail if list is in a weird state
      }

      // Remove old subscriptions (in reverse order to maintain indices)
      for (let i = indicesToRemove.length - 1; i >= 0; i--) {
        const idx = indicesToRemove[i];
        console.log("[Push] Removing old subscription at index:", idx);
        room.pushSubscriptions.$jazz.splice(idx, 1);
      }

      // Create the keys object
      const keys = PushSubscriptionKeys.create(
        {
          p256dh: subJson.keys.p256dh,
          auth: subJson.keys.auth,
        },
        { owner }
      );

      // Create new subscription (old ones were removed above)
      const subscriptionData = {
        endpoint: browserSubscription.endpoint,
        keys,
        deviceId,
        createdAt: Date.now(),
      };

      const timestamp = new Date().toISOString();
      console.log(`[Push ${timestamp}] Registering new subscription for device:`, deviceId, {
        endpoint: browserSubscription.endpoint.substring(0, 50) + "..."
      });
      room.pushSubscriptions.$jazz.push(subscriptionData);

      return true;
    },
    [room]
  );

  return registerSubscription;
}

/**
 * Hook to remove push subscription for this device
 */
export function useUnregisterPushSubscription(room: ChatRoomState) {
  const unregisterSubscription = useCallback(() => {
    if (!room?.$isLoaded || !room.pushSubscriptions?.$isLoaded) {
      return false;
    }

    const deviceId = getOrCreateDeviceId();

    try {
      const subs = room.pushSubscriptions;
      for (let i = 0; i < subs.length; i++) {
        const sub = subs[i];
        if (sub?.$isLoaded && sub.deviceId === deviceId) {
          // Remove this subscription
          room.pushSubscriptions.$jazz.splice(i, 1);
          console.log("[Push] Removed subscription for device:", deviceId);
          return true;
        }
      }
    } catch (err) {
      console.error("[Push] Error removing subscription:", err);
    }

    return false;
  }, [room]);

  return unregisterSubscription;
}
