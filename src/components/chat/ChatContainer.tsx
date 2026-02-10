"use client";

import { Header } from "@/components/layout/Header";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { ChatRoomState } from "@/lib/jazz/hooks";
import { UnreadProvider, useUnread } from "@/contexts/UnreadContext";
import { useAppBadge } from "@/hooks/use-app-badge";

interface ChatContainerProps {
  room: ChatRoomState;
}

function ChatContainerInner({ room }: ChatContainerProps) {
  const { unreadCount } = useUnread();

  // Update PWA app icon badge with unread count (iOS, Chrome, Edge)
  useAppBadge(unreadCount);

  return (
    <div className="flex flex-col h-[100dvh] overflow-hidden">
      <div className="shrink-0">
        <Header room={room} />
      </div>
      <div className="flex-1 overflow-hidden">
        <MessageList room={room} />
      </div>
      <div className="shrink-0">
        <MessageInput room={room} />
      </div>
    </div>
  );
}

export function ChatContainer({ room }: ChatContainerProps) {
  return (
    <UnreadProvider>
      <ChatContainerInner room={room} />
    </UnreadProvider>
  );
}
