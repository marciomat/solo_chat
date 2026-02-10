"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChatRoomState } from "@/lib/jazz/hooks";
import { ThemeToggle } from "./ThemeToggle";
import { SettingsMenu } from "./SettingsMenu";
import { MessageCircle, Share2, Check } from "lucide-react";

interface HeaderProps {
  room: ChatRoomState;
}

export function Header({ room }: HeaderProps) {
  const [copied, setCopied] = useState(false);
  
  // Count unique participants (deduplicate in case of sync issues)
  const participantCount = (room?.$isLoaded && room?.participants?.$isLoaded)
    ? new Set([...room.participants]).size
    : 0;
  const roomName = (room?.$isLoaded && room?.name) || "Solo Chat";

  const handleShareLink = async () => {
    try {
      // Get current URL which includes the room ID
      const shareUrl = window.location.href;

      // Try native share first (mobile)
      if (navigator.share) {
        await navigator.share({
          url: shareUrl,
        });
      } else {
        // Fall back to clipboard
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (error) {
      // User cancelled share or clipboard failed
      console.error("Failed to share:", error);
    }
  };

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-40 safe-top">
      <div className="flex items-center justify-between h-14 px-4">
        {/* Left: App icon and name */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <MessageCircle className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-semibold text-sm">{roomName}</h1>
            <p className="text-xs text-muted-foreground">
              {participantCount} participant{participantCount !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <Button
            onClick={handleShareLink}
            variant="ghost"
            size="sm"
            className="text-xs"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 mr-1" />
                Copied!
              </>
            ) : (
              <>
                <Share2 className="w-3 h-3 mr-1" />
                Share
              </>
            )}
          </Button>
          
          <ThemeToggle />
          
          <SettingsMenu room={room} />
        </div>
      </div>
    </header>
  );
}
