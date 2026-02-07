"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAccount } from "jazz-tools/react";
import { Group, ID, Account } from "jazz-tools";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { PushPrompt } from "@/components/notifications/PushPrompt";
import { 
  ChatRoom, 
  MessageList, 
  ParticipantsList, 
  ChatRoomSubscriptions,
} from "@/schema";
import { useChatRoom } from "@/lib/jazz/hooks";
import { getOrCreateDeviceId } from "@/lib/utils/device-id";
import { useTabVisibility } from "@/hooks/use-tab-visibility";
import { stopTitleBlink } from "@/lib/notifications/tab-blink";
import { Skeleton } from "@/components/ui/skeleton";
import { setItem } from "@/lib/utils/storage";

const LAST_ROOM_KEY = "last-room-id";

function ChatPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  // Use default Jazz account (anonymous)
  const me = useAccount(Account);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(true);
  const isVisible = useTabVisibility();
  const roomInitialized = useRef(false);
  const participantAdded = useRef(false);

  // Get params from URL
  const roomParam = searchParams.get("room"); // Room ID from URL (for joining)
  const isNew = searchParams.get("new") === "1"; // Creating new chat

  // Redirect if no room and not creating new
  useEffect(() => {
    if (!roomParam && !isNew) {
      router.push("/");
    }
  }, [roomParam, isNew, router]);

  // Helper to update URL with room ID (for sharing)
  const updateUrlWithRoom = (newRoomId: string) => {
    const url = new URL(window.location.href);
    url.searchParams.delete("new"); // Remove new flag
    url.searchParams.set("room", newRoomId);
    // Use replaceState to update URL without navigation
    window.history.replaceState({}, "", url.toString());
  };

  // Create or join chat room
  useEffect(() => {
    if (!me) return;
    if (roomInitialized.current) return; // Prevent double initialization
    if (!roomParam && !isNew) return; // Need either room ID or new flag

    const initRoom = async () => {
      try {
        setIsSyncing(true);
        
        // If we have a room ID in URL, try to load it
        if (roomParam) {
          console.log("Joining room from URL:", roomParam);
          try {
            const existingRoom = await ChatRoom.load(roomParam as ID<ChatRoom>, {
              resolve: { messages: true, participants: true },
            });
            if (existingRoom) {
              console.log("Room loaded successfully");
              setRoomId(roomParam);
              roomInitialized.current = true;
              setIsSyncing(false);
              return;
            }
          } catch (e) {
            console.log("Could not load room from URL:", e);
            // Room not found - redirect to home
            router.push("/");
            return;
          }
        }
        
        // Creating a new room
        console.log("Creating new chat room...");
        setIsSyncing(false);
        
        // Create a public group so all devices can access
        const publicGroup = Group.create();
        publicGroup.addMember("everyone", "writer");

        // Create room components - owned by the public group
        const messages = MessageList.create([], publicGroup);
        const participants = ParticipantsList.create([getOrCreateDeviceId()], publicGroup);
        const subscriptions = ChatRoomSubscriptions.create([], publicGroup);
        
        // Create the room
        const room = ChatRoom.create(
          {
            messages,
            name: undefined,
            createdAt: Date.now(),
            lastActivity: Date.now(),
            participants,
            pushSubscriptions: subscriptions,
          },
          publicGroup
        );
        
        const newRoomId = room.$jazz.id;
        console.log("Created room:", newRoomId);
        
        // Update URL so user can share it
        updateUrlWithRoom(newRoomId);
        
        setRoomId(newRoomId);
        roomInitialized.current = true;
      } catch (error) {
        console.error("Failed to create/load room:", error);
        setIsSyncing(false);
      }
    };

    initRoom();
  }, [me, roomParam, isNew, router]);

  // Get the chat room
  const room = useChatRoom(roomId ?? undefined);

  // Save the current room ID for auto-resume after app close
  useEffect(() => {
    if (roomId) {
      console.log("[Chat] Saving room ID for auto-resume:", roomId);
      setItem(LAST_ROOM_KEY, roomId);
    }
  }, [roomId]);

  // Add current device as participant if not already, and clean up duplicates
  useEffect(() => {
    if (!room?.$isLoaded) return;
    if (!room.participants?.$isLoaded) return;
    if (participantAdded.current) return; // Already processed

    const deviceId = getOrCreateDeviceId();
    const participantList = [...room.participants];

    // Find all duplicates
    const seen = new Set<string>();
    const duplicateIndices: number[] = [];
    participantList.forEach((id, index) => {
      if (seen.has(id)) {
        duplicateIndices.push(index);
      } else {
        seen.add(id);
      }
    });

    // Remove duplicates (in reverse order to maintain indices)
    if (duplicateIndices.length > 0) {
      console.log(`[Participants] Removing ${duplicateIndices.length} duplicate entries`);
      for (let i = duplicateIndices.length - 1; i >= 0; i--) {
        room.participants.$jazz.splice(duplicateIndices[i], 1);
      }
    }

    // Add current device if not already present
    if (!seen.has(deviceId)) {
      console.log("[Participants] Adding device to participants list:", deviceId);
      room.participants.$jazz.push(deviceId);
    } else {
      console.log("[Participants] Device already in participants list:", deviceId);
    }

    participantAdded.current = true;
  }, [room]);

  // Handle tab visibility for title blinking
  useEffect(() => {
    if (isVisible) {
      stopTitleBlink();
    }
  }, [isVisible]);

  // Loading state - need room param or new flag
  if (!roomParam && !isNew) {
    return (
      <div className="flex items-center justify-center h-[100dvh]">
        <div className="text-center space-y-4">
          <Skeleton className="h-8 w-32 mx-auto" />
          <p className="text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    );
  }

  // Wait for room to be ready
  if (!room) {
    return (
      <div className="flex items-center justify-center h-[100dvh]">
        <div className="text-center space-y-4">
          <Skeleton className="h-8 w-48 mx-auto" />
          <p className="text-muted-foreground">
            {isSyncing ? "Connecting to chat..." : "Setting up chat room..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ChatContainer room={room} />
      <PushPrompt room={room} />
    </>
  );
}

export default function ChatPage() {
  return (
    <Suspense 
      fallback={
        <div className="flex items-center justify-center h-[100dvh]">
          <div className="text-center space-y-4">
            <Skeleton className="h-8 w-32 mx-auto" />
            <p className="text-muted-foreground">Loading chat...</p>
          </div>
        </div>
      }
    >
      <ChatPageContent />
    </Suspense>
  );
}
