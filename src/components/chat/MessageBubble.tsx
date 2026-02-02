"use client";

import { cn } from "@/lib/utils";
import { Message } from "@/schema";
import { formatMessageTime } from "@/lib/utils/format";
import { StatusIndicator } from "./StatusIndicator";
import { ImageThumbnail } from "./ImageThumbnail";
import { getOrCreateDeviceId } from "@/lib/utils/device-id";
import { MaybeLoaded } from "jazz-tools";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useUnread } from "@/contexts/UnreadContext";
import { MailOpen, Mail } from "lucide-react";

interface MessageBubbleProps {
  message: MaybeLoaded<Message>;
  onImageClick?: (imageUrl: string) => void;
}

export function MessageBubble({ message, onImageClick }: MessageBubbleProps) {
  const { isUnread, markAsUnread, markAsRead } = useUnread();
  
  if (!message?.$isLoaded) return null;
  
  const deviceId = getOrCreateDeviceId();
  const isOwn = message.senderId === deviceId;
  const senderName = message.senderName || "Anonymous";
  const messageId = message.$jazz?.id;
  const messageIsUnread = messageId ? isUnread(messageId) : false;

  const handleMarkAsUnread = () => {
    if (messageId) {
      markAsUnread(messageId);
    }
  };

  const handleMarkAsRead = () => {
    if (messageId) {
      markAsRead(messageId);
    }
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          className={cn(
            "flex flex-col max-w-[80%] gap-1",
            isOwn ? "self-end items-end" : "self-start items-start"
          )}
        >
          {/* Sender name (only for others' messages) */}
          {!isOwn && (
            <span className="text-xs text-muted-foreground px-2">
              {senderName}
            </span>
          )}

          {/* Message bubble */}
          <div
            className={cn(
              "rounded-2xl px-4 py-2 break-words relative",
              isOwn
                ? "bg-primary text-primary-foreground rounded-br-md"
                : "bg-muted text-foreground rounded-bl-md",
              messageIsUnread && "ring-2 ring-yellow-400 ring-offset-1"
            )}
          >
            {/* Unread indicator */}
            {messageIsUnread && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full" />
            )}

            {/* Image (if present) */}
            {message.image && (
              <div className="mb-2">
                <ImageThumbnail
                  image={message.image}
                  onClick={onImageClick}
                />
              </div>
            )}

            {/* Text content */}
            {message.text && (
              <p className="whitespace-pre-wrap">{message.text}</p>
            )}

            {/* Timestamp and status */}
            <div
              className={cn(
                "flex items-center gap-1 mt-1 text-xs",
                isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
              )}
            >
              <span>{formatMessageTime(message.timestamp)}</span>
              {isOwn && <StatusIndicator status={message.status} />}
            </div>
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        {messageIsUnread ? (
          <ContextMenuItem onClick={handleMarkAsRead}>
            <MailOpen className="mr-2 h-4 w-4" />
            Mark as read
          </ContextMenuItem>
        ) : (
          <ContextMenuItem onClick={handleMarkAsUnread}>
            <Mail className="mr-2 h-4 w-4" />
            Mark as unread
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}
