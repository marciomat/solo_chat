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
import { ChatRoomState } from "@/lib/jazz/hooks";
import { MoreVertical, Trash2, LogOut, Bell, Share2, User, BellOff, BellRing } from "lucide-react";
import { getUsername, setUsername } from "@/lib/utils/username";
import { getNotificationPermission, enableLocalNotifications } from "@/lib/notifications/push";
import { areNotificationsEnabled, setNotificationsEnabled } from "@/lib/utils/notificationSettings";

interface SettingsMenuProps {
  room: ChatRoomState;
}

export function SettingsMenu({ room }: SettingsMenuProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [notificationStatus, setNotificationStatus] = useState<string>("default");
  const [notificationsOn, setNotificationsOn] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);

  // Check notification permission and user preference on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      setNotificationStatus(getNotificationPermission());
      setNotificationsOn(areNotificationsEnabled());
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
    // If permission not yet granted, request it first
    if (notificationStatus !== "granted") {
      setNotificationLoading(true);
      try {
        const result = await enableLocalNotifications();
        const newStatus = getNotificationPermission();
        setNotificationStatus(newStatus);
        if (result.success) {
          setNotificationsEnabled(true);
          setNotificationsOn(true);
        } else if (result.reason) {
          alert(result.reason);
        }
      } finally {
        setNotificationLoading(false);
      }
    } else {
      // Toggle notifications on/off
      const newState = !notificationsOn;
      setNotificationsEnabled(newState);
      setNotificationsOn(newState);
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
    // Just navigate back to home
    router.push("/");
  };

  const handleShareLink = async () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      await navigator.share({
        title: "Join my Solo Chat",
        text: "Join my encrypted chat!",
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
            ) : notificationsOn ? (
              <BellRing className="mr-2 h-4 w-4 text-green-500" />
            ) : (
              <BellOff className="mr-2 h-4 w-4" />
            )}
            {notificationLoading ? "Enabling..." : 
             notificationStatus === "denied" ? "Notifications Blocked" :
             notificationsOn ? "Notifications On" :
             notificationStatus === "granted" ? "Notifications Off" :
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
              You can rejoin this chat anytime using the share link.
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
