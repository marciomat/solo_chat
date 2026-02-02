"use client";

import { useCoState } from "jazz-tools/react";
import { useCallback } from "react";
import { ID, co } from "jazz-tools";
import { 
  ChatRoom, 
  Message, 
  ReadByList 
} from "@/schema";
import { getOrCreateDeviceId } from "@/lib/utils/device-id";
import { getUsername } from "@/lib/utils/username";

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
      pushSubscriptions: true,
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
      return true;
    },
    [room]
  );

  return sendMessage;
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
