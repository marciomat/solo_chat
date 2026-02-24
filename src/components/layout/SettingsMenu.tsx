"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChatRoomState, useRegisterPushSubscription } from "@/lib/jazz/hooks";
import { MoreVertical, Trash2, LogOut, Bell, Share2, User, BellOff, BellRing } from "lucide-react";
import { getUsername, setUsername } from "@/lib/utils/username";
import { getNotificationPermission, subscribeToPush, unsubscribeFromPush } from "@/lib/notifications/push";
import { areNotificationsEnabled, setNotificationsEnabled } from "@/lib/utils/notificationSettings";
import { removeItem } from "@/lib/utils/storage";

const LAST_ROOM_KEY = "last-room-id";

interface SettingsMenuProps {
  room: ChatRoomState;
}

export function SettingsMenu({ room }: SettingsMenuProps) {
  const router = useRouter();
  const registerPushSubscription = useRegisterPushSubscription(room);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [notificationStatus, setNotificationStatus] = useState<string>("default");
  const [notificationsOn, setNotificationsOn] = useState(false);
  const [hasBrowserSubscription, setHasBrowserSubscription] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);

  // Check notification permission, user preference, and actual browser subscription
  useEffect(() => {
    if (typeof window !== "undefined") {
      const checkStatus = async () => {
        setNotificationStatus(getNotificationPermission());
        setNotificationsOn(areNotificationsEnabled());
        // Also check if an actual push subscription exists in the browser
        if ("serviceWorker" in navigator && "PushManager" in window) {
          try {
            // Use getRegistration() instead of ready to avoid hanging if SW is
            // in "waiting" or "installing" state (common on iOS after SW update)
            const reg = await navigator.serviceWorker.getRegistration();
            if (reg) {
              const sub = await reg.pushManager.getSubscription();
              setHasBrowserSubscription(!!sub);
            }
            // If no registration found, leave hasBrowserSubscription unchanged
          } catch {
            // On error, leave hasBrowserSubscription unchanged to avoid false "Re-enable"
          }
        }
      };
      checkStatus();

      // Re-check when app regains visibility (covers both focus and iOS PWA foreground)
      const handleVisibilityChange = () => {
        if (document.visibilityState === "visible") checkStatus();
      };
      window.addEventListener("focus", checkStatus);
      document.addEventListener("visibilitychange", handleVisibilityChange);
      return () => {
        window.removeEventListener("focus", checkStatus);
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      };
    }
  }, []);

  // Load current username when dialog opens
  useEffect(() => {
    if (showNameDialog) {
      setDisplayName(getUsername() || "");
    }
  }, [showNameDialog]);

  const handleSaveName = () => {
    setUsername(displayName);
    setShowNameDialog(false);
  };

  const handleEnableNotifications = async () => {
    // If turning off (and a real subscription exists), disable and unsubscribe
    if (notificationsOn && hasBrowserSubscription) {
      console.log("[Notifications] Disabling notifications...");
      setNotificationsEnabled(false);
      setNotificationsOn(false);
      setHasBrowserSubscription(false);
      await unsubscribeFromPush();
      console.log("[Notifications] Unsubscribed from push");
      return;
    }

    // If "on" but no real browser subscription exists (e.g. after reinstall/data clear),
    // OR if explicitly turning on — always create a fresh subscription from this user gesture.
    setNotificationLoading(true);
    console.log("[Push] Requesting push subscription from settings...");
    try {
      const result = await subscribeToPush();
      console.log("[Push] Subscribe result:", result);
      const newStatus = getNotificationPermission();
      setNotificationStatus(newStatus);
      if (result.success) {
        setHasBrowserSubscription(true);
        if (room?.$isLoaded) {
          console.log("[Push] Registering subscription with Jazz room");
          const registered = await registerPushSubscription(result.subscription);
          console.log("[Push] Registration result:", registered);
        } else {
          console.warn("[Push] Room not loaded, cannot register subscription");
        }
        setNotificationsEnabled(true);
        setNotificationsOn(true);
      } else {
        console.warn("[Push] Push subscription failed:", result.reason);
        if (newStatus === "granted") {
          setNotificationsEnabled(true);
          setNotificationsOn(true);
        } else if (result.reason) {
          alert(result.reason);
        }
      }
    } catch (error) {
      console.error("[Push] Error in handleEnableNotifications:", error);
    } finally {
      setNotificationLoading(false);
    }
  };

  const handleDeleteAllMessages = async () => {
    if (!room?.$isLoaded) return;
    if (!room.messages?.$isLoaded) return;

    // Clear all messages by removing each one
    const messageCount = room.messages.length;
    for (let i = messageCount - 1; i >= 0; i--) {
      room.messages.$jazz.splice(i, 1);
    }

    // Update last activity
    room.$jazz.set("lastActivity", Date.now());
    
    setShowDeleteDialog(false);
  };

  const handleLeaveChat = () => {
    // Clear saved room so it doesn't auto-redirect back
    console.log("[Settings] Leaving chat - clearing saved room ID");
    removeItem(LAST_ROOM_KEY);
    // Navigate back to home
    router.push("/");
  };

  const handleShareLink = async () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      await navigator.share({
        url: shareUrl,
      });
    } else {
      await navigator.clipboard.writeText(shareUrl);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Settings</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setShowNameDialog(true)}>
            <User className="mr-2 h-4 w-4" />
            Change Name
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleShareLink}>
            <Share2 className="mr-2 h-4 w-4" />
            Share Link
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleEnableNotifications}
            disabled={notificationLoading || notificationStatus === "denied"}
          >
            {notificationStatus === "denied" ? (
              <BellOff className="mr-2 h-4 w-4 text-red-500" />
            ) : notificationsOn && hasBrowserSubscription ? (
              <BellRing className="mr-2 h-4 w-4 text-green-500" />
            ) : (
              <BellOff className="mr-2 h-4 w-4 text-yellow-500" />
            )}
            {notificationLoading ? "Enabling..." :
             notificationStatus === "denied" ? "Notifications Blocked" :
             notificationsOn && hasBrowserSubscription ? "Notifications On" :
             notificationsOn && !hasBrowserSubscription ? "Re-enable Notifications" :
             "Enable Notifications"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete All Messages
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setShowLeaveDialog(true)}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Leave Chat
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete all messages?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all messages in this chat. This action
              cannot be undone and will sync across all devices.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAllMessages}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Leave confirmation dialog */}
      <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave chat?</AlertDialogTitle>
            <AlertDialogDescription>
              This will return you to the home screen and the app won't automatically open this chat on next launch. You can rejoin anytime using the share link.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLeaveChat}>
              Leave
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Change name dialog */}
      <Dialog open={showNameDialog} onOpenChange={setShowNameDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Display Name</DialogTitle>
            <DialogDescription>
              Set a name to identify yourself in this chat.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name (optional)"
              maxLength={50}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNameDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveName}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
