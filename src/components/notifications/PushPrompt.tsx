"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bell, X } from "lucide-react";
import {
  isPushSupported,
  getNotificationPermission,
  subscribeToPush,
} from "@/lib/notifications/push";
import { getItem, setItem } from "@/lib/utils/storage";
import { useRegisterPushSubscription, ChatRoomState } from "@/lib/jazz/hooks";

const DISMISSED_KEY = "push-prompt-dismissed";

interface PushPromptProps {
  room?: ChatRoomState;
}

export function PushPrompt({ room }: PushPromptProps) {
  const [dismissed, setDismissed] = useState(true);
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");
  const [loading, setLoading] = useState(false);
  const registerPushSubscription = useRegisterPushSubscription(room);

  useEffect(() => {
    setIsSupported(isPushSupported());
    setPermission(getNotificationPermission());

    const wasDismissed = getItem<boolean>(DISMISSED_KEY);
    setDismissed(wasDismissed === true || getNotificationPermission() === "granted");
  }, []);

  // Auto-register subscription when room is loaded and permission is granted
  useEffect(() => {
    console.log("[Push] Auto-register effect triggered:", {
      roomLoaded: room?.$isLoaded,
      pushSubscriptionsLoaded: room?.pushSubscriptions?.$isLoaded,
      permission
    });
    if (!room?.$isLoaded) return;
    if (!room?.pushSubscriptions?.$isLoaded) return; // Wait for subscriptions to be fully loaded
    if (permission !== "granted") return;

    let registered = false;

    // Try to get existing subscription and register it
    const registerExisting = async () => {
      if (registered) return; // Prevent re-registration during same effect

      try {
        console.log("[Push] Checking for existing subscription...");
        if (!("serviceWorker" in navigator)) {
          console.warn("[Push] Service worker not supported");
          return;
        }
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        console.log("[Push] Existing subscription:", subscription);
        if (subscription && !registered) {
          registered = true;
          console.log("[Push] Auto-registering existing subscription to room");
          const result = await registerPushSubscription(subscription);
          console.log("[Push] Auto-registration result:", result);
        } else {
          console.log("[Push] No existing subscription found");
        }
      } catch (err) {
        console.error("[Push] Error auto-registering:", err);
      }
    };

    registerExisting();
  }, [room?.$isLoaded, room?.pushSubscriptions?.$isLoaded, permission]);

  // Don't show if not supported, already granted, or dismissed
  if (!isSupported || permission === "granted" || permission === "denied" || dismissed) {
    return null;
  }

  const handleEnable = async () => {
    setLoading(true);
    console.log("[Push] handleEnable called");
    try {
      const result = await subscribeToPush();
      console.log("[Push] subscribeToPush result:", result);
      if (result.success) {
        // Register subscription with Jazz room
        console.log("[Push] Subscription successful, registering to room:", room?.$isLoaded);
        if (room?.$isLoaded) {
          const registered = await registerPushSubscription(result.subscription);
          console.log("[Push] Registration result:", registered);
        } else {
          console.warn("[Push] Room not loaded, cannot register subscription");
        }
        setDismissed(true);
      } else {
        // Still dismiss if permission was granted (local notifications work)
        if (getNotificationPermission() === "granted") {
          setDismissed(true);
        }
        console.warn("Push subscription result:", result.reason);
      }
    } catch (error) {
      console.error("Failed to enable notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    setItem(DISMISSED_KEY, true);
    setDismissed(true);
  };

  return (
    <Card className="fixed bottom-4 left-4 right-4 z-50 shadow-lg border-primary/20">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            <CardTitle className="text-base">Enable Notifications</CardTitle>
          </div>
          <Button
            onClick={handleDismiss}
            variant="ghost"
            size="icon"
            className="h-6 w-6"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <CardDescription>
          Get notified when you receive new messages, even when the app is closed.
        </CardDescription>
        <div className="flex gap-2">
          <Button
            onClick={handleEnable}
            className="flex-1"
            disabled={loading}
          >
            {loading ? "Enabling..." : "Enable Notifications"}
          </Button>
          <Button
            onClick={handleDismiss}
            variant="outline"
          >
            Not Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
