"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "./MessageBubble";
import { ImagePreview } from "./ImagePreview";
import { ChatRoomState, useMarkAsRead } from "@/lib/jazz/hooks";
import { Skeleton } from "@/components/ui/skeleton";

interface MessageListProps {
  room: ChatRoomState;
}

export function MessageList({ room }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const markAsRead = useMarkAsRead(room);
  const lastMessageCountRef = useRef(0);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (!room?.$isLoaded) return;
    if (!room.messages?.$isLoaded) return;
    
    const messageCount = room.messages.length ?? 0;
    if (messageCount > lastMessageCountRef.current) {
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
      lastMessageCountRef.current = messageCount;
    }
  }, [room]);

  // Mark visible messages as read
  useEffect(() => {
    if (!room?.$isLoaded) return;
    if (!room.messages?.$isLoaded) return;

    // Mark all messages as read when viewing
    for (const message of room.messages) {
      if (message?.$isLoaded) {
        markAsRead(message);
      }
    }
  }, [room, markAsRead]);

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
