"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTabVisibility } from "./use-tab-visibility";

const STORAGE_KEY = "solo-chat-unread-messages";

// Store unread message IDs in localStorage so they persist
function getStoredUnreadIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return new Set(JSON.parse(stored));
    }
  } catch {
    // Ignore parse errors
  }
  return new Set();
}

function saveUnreadIds(ids: Set<string>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  } catch {
    // Ignore storage errors
  }
}

export interface UseUnreadMessagesReturn {
  unreadCount: number;
  unreadMessageIds: Set<string>;
  markAsUnread: (messageId: string) => void;
  markAsRead: (messageId: string) => void;
  markAllAsRead: () => void;
  addNewUnread: (messageId: string) => void;
  isUnread: (messageId: string) => boolean;
}

export function useUnreadMessages(): UseUnreadMessagesReturn {
  // Manual unreads are stored in localStorage and persist
  const [manualUnreadIds, setManualUnreadIds] = useState<Set<string>>(() => getStoredUnreadIds());
  // Auto unreads are temporary and clear on tab focus
  const [autoUnreadIds, setAutoUnreadIds] = useState<Set<string>>(new Set());
  const isVisible = useTabVisibility();

  // Combined set for display
  const allUnreadIds = new Set([...manualUnreadIds, ...autoUnreadIds]);

  // Sync manual unreads to localStorage
  useEffect(() => {
    saveUnreadIds(manualUnreadIds);
  }, [manualUnreadIds]);

  // Update document title with unread count
  useEffect(() => {
    const count = allUnreadIds.size;
    const baseTitle = "Solo Chat";
    
    if (count > 0) {
      document.title = `(${count}) ${baseTitle}`;
    } else {
      document.title = baseTitle;
    }
  }, [allUnreadIds.size]);

  // Clear auto-added unreads when tab becomes visible
  useEffect(() => {
    if (isVisible && autoUnreadIds.size > 0) {
      setAutoUnreadIds(new Set());
    }
  }, [isVisible, autoUnreadIds.size]);

  const markAsUnread = useCallback((messageId: string) => {
    setManualUnreadIds((prev) => {
      const next = new Set(prev);
      next.add(messageId);
      return next;
    });
  }, []);

  const markAsRead = useCallback((messageId: string) => {
    setManualUnreadIds((prev) => {
      const next = new Set(prev);
      next.delete(messageId);
      return next;
    });
    setAutoUnreadIds((prev) => {
      const next = new Set(prev);
      next.delete(messageId);
      return next;
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    setManualUnreadIds(new Set());
    setAutoUnreadIds(new Set());
  }, []);

  const addNewUnread = useCallback((messageId: string) => {
    setAutoUnreadIds((prev) => {
      const next = new Set(prev);
      next.add(messageId);
      return next;
    });
  }, []);

  const isUnread = useCallback((messageId: string) => {
    return manualUnreadIds.has(messageId) || autoUnreadIds.has(messageId);
  }, [manualUnreadIds, autoUnreadIds]);

  return {
    unreadCount: allUnreadIds.size,
    unreadMessageIds: allUnreadIds,
    markAsUnread,
    markAsRead,
    markAllAsRead,
    addNewUnread,
    isUnread,
  };
}
