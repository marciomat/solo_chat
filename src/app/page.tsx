"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, Plus, Link as LinkIcon, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InstallPrompt } from "@/components/layout/InstallPrompt";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { getUsername, setUsername } from "@/lib/utils/username";
import { getItem } from "@/lib/utils/storage";

const LAST_ROOM_KEY = "last-room-id";

export default function Home() {
  const router = useRouter();
  const [joinLink, setJoinLink] = useState("");
  const [linkError, setLinkError] = useState("");
  const [displayName, setDisplayName] = useState("");

  // Load saved username and auto-redirect to last room on mount
  useEffect(() => {
    const saved = getUsername();
    if (saved) {
      setDisplayName(saved);
    }

    // Auto-redirect to last visited room (if exists)
    const lastRoomId = getItem<string>(LAST_ROOM_KEY);
    if (lastRoomId) {
      console.log("[Home] Auto-redirecting to last room:", lastRoomId);
      router.push(`/chat?room=${encodeURIComponent(lastRoomId)}`);
    }
  }, [router]);

  // Save username when it changes
  const handleNameChange = useCallback((value: string) => {
    setDisplayName(value);
    setUsername(value);
  }, []);

  const handleCreateChat = useCallback(() => {
    // Navigate to chat - room will be created automatically
    router.push("/chat?new=1");
  }, [router]);

  const handleJoinChat = useCallback(() => {
    setLinkError("");
    
    // Try to parse the link
    try {
      const url = new URL(joinLink.trim());
      const roomId = url.searchParams.get("room");
      
      if (!roomId) {
        setLinkError("Invalid link - no room ID found");
        return;
      }
      
      // Navigate with room ID
      router.push(`/chat?room=${encodeURIComponent(roomId)}`);
    } catch {
      // Maybe it's just the room ID directly
      const trimmed = joinLink.trim();
      if (trimmed.startsWith("co_z")) {
        router.push(`/chat?room=${encodeURIComponent(trimmed)}`);
      } else {
        setLinkError("Please paste a valid chat link or room ID");
      }
    }
  }, [joinLink, router]);

  return (
    <div className="min-h-[100dvh] flex flex-col">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-40">
        <div className="flex items-center justify-between h-14 px-4 max-w-md mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">Solo Chat</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          {/* Hero */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Solo Chat</h1>
            <p className="text-muted-foreground">
              Secure, local-first chat with end-to-end encryption.
              <br />
              No account needed.
            </p>
          </div>

          {/* Username (optional) */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Your name (optional)</span>
            </div>
            <Input
              placeholder="Anonymous"
              value={displayName}
              onChange={(e) => handleNameChange(e.target.value)}
              maxLength={30}
            />
          </div>

          {/* Create New Chat */}
          <div className="space-y-4">
            <Button 
              onClick={handleCreateChat} 
              className="w-full h-12 text-base"
              size="lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create New Chat
            </Button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  or join existing
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Paste chat link here..."
                  value={joinLink}
                  onChange={(e) => {
                    setJoinLink(e.target.value);
                    setLinkError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && joinLink && handleJoinChat()}
                />
                <Button 
                  onClick={handleJoinChat}
                  disabled={!joinLink.trim()}
                  variant="secondary"
                >
                  <LinkIcon className="w-4 h-4" />
                </Button>
              </div>
              {linkError && (
                <p className="text-sm text-destructive">{linkError}</p>
              )}
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 text-center text-sm text-muted-foreground">
            <div className="space-y-1">
              <div className="text-2xl">🔐</div>
              <div>E2E Encrypted</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl">📱</div>
              <div>Multi-Device</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl">🔄</div>
              <div>Auto-Sync</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-4 text-center text-sm text-muted-foreground">
        <p>Your messages are encrypted and synced across devices.</p>
      </footer>

      {/* iOS Install Prompt */}
      <InstallPrompt />
    </div>
  );
}
