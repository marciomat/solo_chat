"use client";

import { createContext, useContext, ReactNode } from "react";
import { useUnreadMessages, UseUnreadMessagesReturn } from "@/hooks/use-unread-messages";

const UnreadContext = createContext<UseUnreadMessagesReturn | null>(null);

export function UnreadProvider({ children }: { children: ReactNode }) {
  const unread = useUnreadMessages();
  return (
    <UnreadContext.Provider value={unread}>
      {children}
    </UnreadContext.Provider>
  );
}

export function useUnread(): UseUnreadMessagesReturn {
  const context = useContext(UnreadContext);
  if (!context) {
    throw new Error("useUnread must be used within an UnreadProvider");
  }
  return context;
}
