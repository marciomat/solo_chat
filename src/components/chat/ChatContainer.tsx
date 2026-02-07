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

  // Update PWA app icon badge with unread count
  useAppBadge(unreadCount);

  return (
    <div className="flex flex-col h-[100dvh]">
      <Header room={room} />
      <MessageList room={room} />
      <MessageInput room={room} />
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
