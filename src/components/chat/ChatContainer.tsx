"use client";

import { Header } from "@/components/layout/Header";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { ChatRoomState } from "@/lib/jazz/hooks";
import { UnreadProvider } from "@/contexts/UnreadContext";

interface ChatContainerProps {
  room: ChatRoomState;
}

export function ChatContainer({ room }: ChatContainerProps) {
  return (
    <UnreadProvider>
      <div className="flex flex-col h-[100dvh]">
        <Header room={room} />
        <MessageList room={room} />
        <MessageInput room={room} />
      </div>
    </UnreadProvider>
  );
}
