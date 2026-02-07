"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "./MessageBubble";
import { ImagePreview } from "./ImagePreview";
import { ChatRoomState, useMarkAsRead } from "@/lib/jazz/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { notifyNewMessage, getNotificationPermission } from "@/lib/notifications/push";
import { getOrCreateDeviceId } from "@/lib/utils/device-id";
import { useUnread } from "@/contexts/UnreadContext";
import { useTabVisibility } from "@/hooks/use-tab-visibility";

interface MessageListProps {
  room: ChatRoomState;
}

export function MessageList({ room }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const markAsRead = useMarkAsRead(room);
  const lastMessageCountRef = useRef(0);
  const isInitialLoadRef = useRef(true);
  const markedMessagesRef = useRef<Set<string>>(new Set());
  const myDeviceId = getOrCreateDeviceId();
  const { addNewUnread } = useUnread();
  const isVisible = useTabVisibility();

  // Auto-scroll to bottom and notify on new messages
  useEffect(() => {
    if (!room?.$isLoaded) return;
    if (!room.messages?.$isLoaded) return;
    
    const messageCount = room.messages.length ?? 0;
    
    if (messageCount > lastMessageCountRef.current) {
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
      
      // Notify only if not the initial load and tab is not focused
      console.log("[Notification] New message check:", {
        isInitialLoad: isInitialLoadRef.current,
        isHidden: document.hidden,
        messageCount
      });

      if (!isInitialLoadRef.current && document.hidden) {
        const latestMessage = room.messages[messageCount - 1];
        console.log("[Notification] Latest message loaded:", latestMessage?.$isLoaded);

        // Check if push notifications are enabled
        const pushEnabled = getNotificationPermission() === "granted";
        console.log("[Notification] Push enabled:", pushEnabled);

        if (latestMessage?.$isLoaded) {
          const senderName = latestMessage.senderName;
          const senderId = latestMessage.senderId;
          const messageId = latestMessage.$jazz?.id;

          console.log("[Notification] Message details:", {
            senderId,
            myDeviceId,
            isMyMessage: senderId === myDeviceId
          });

          // Don't notify for our own messages (compare device IDs)
          if (senderId !== myDeviceId) {
            // Add to unread count (updates tab title)
            if (messageId) {
              addNewUnread(messageId);
            }

            // Only show local notification if push is NOT enabled
            // (if push is enabled, service worker handles notifications)
            if (!pushEnabled) {
              console.log("[Notification] Showing local notification (push disabled)");
              notifyNewMessage(
                senderName || "Someone",
                latestMessage.text || (latestMessage.imageUrl ? "Sent an image" : "New message"),
                window.location.href
              );
            } else {
              console.log("[Notification] Skipping local notification - service worker will handle it");
            }
          } else {
            console.log("[Notification] Skipping - message is from this device");
          }
        } else {
          // Message not loaded yet
          console.log("[Notification] Message not fully loaded yet");
          const messageId = latestMessage?.$jazz?.id;
          if (messageId) {
            addNewUnread(messageId);
          }
          // Only show local notification if push is NOT enabled
          if (!pushEnabled) {
            console.log("[Notification] Showing basic local notification (push disabled)");
            notifyNewMessage(
              "New Message",
              "You have a new message",
              window.location.href
            );
          }
        }
      }
      
      lastMessageCountRef.current = messageCount;
    }
    
    // After first render with messages, mark initial load complete
    if (isInitialLoadRef.current && messageCount > 0) {
      isInitialLoadRef.current = false;
    }
  }, [room, myDeviceId, addNewUnread]);

  // Mark visible messages as read (only when tab is visible)
  useEffect(() => {
    if (!isVisible) return; // Don't mark as read when tab is hidden
    if (!room?.$isLoaded) return;
    if (!room.messages?.$isLoaded) return;

    // Mark all messages as read when viewing
    for (const message of room.messages) {
      if (message?.$isLoaded && message.$jazz?.id) {
        const messageId = message.$jazz.id;
        // Skip if already marked by this component instance
        if (markedMessagesRef.current.has(messageId)) continue;
        markedMessagesRef.current.add(messageId);
        markAsRead(message);
      }
    }
  }, [room, markAsRead, isVisible]);

  const handleImageClick = useCallback((imageUrl: string) => {
    setPreviewImage(imageUrl);
  }, []);

  const handleClosePreview = useCallback(() => {
    setPreviewImage(null);
  }, []);

  if (!room?.$isLoaded) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md p-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}
            >
              <Skeleton className="h-16 w-48 rounded-2xl" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const messages = room.messages?.$isLoaded ? [...room.messages] : [];

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <p className="text-lg mb-2">No messages yet</p>
          <p className="text-sm">Send a message to start the conversation!</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-2 p-4">
          {messages.map((message, index) => {
            if (!message?.$isLoaded) return null;
            return (
              <MessageBubble
                key={message.$jazz.id || index}
                message={message}
                onImageClick={handleImageClick}
              />
            );
          })}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>
      
      <ImagePreview
        imageUrl={previewImage}
        onClose={handleClosePreview}
      />
    </>
  );
}
