# Solo Chat PWA - Implementation TODO

## Overview
A minimalistic, local-first PWA chat app with E2EE using 12-word BIP-39 seeds. No user accounts required - the seed IS the access key. Anyone with the seed can join the chat and see all messages.

---

## 🚀 Implementation Status

**Last Updated**: February 1, 2026

### Progress Summary

| Phase | Description | Status |
|-------|-------------|--------|
| Phase 1 | Project Foundation | ✅ Complete |
| Phase 2 | Jazz Integration | ✅ Complete |
| Phase 3 | Core Chat UI | ✅ Complete |
| Phase 4 | Image Handling | ✅ Complete |
| Phase 5 | Message Status & Read Receipts | ✅ Complete |
| Phase 6 | PWA & Service Worker | ✅ Complete |
| Phase 7 | Cloudflare Worker (Push Backend) | ✅ Complete |
| Phase 8 | Push Notification Integration | ✅ Complete |
| Phase 9 | Desktop Tab Blinking | ✅ Complete |
| Phase 10 | Delete Functionality | ✅ Complete |
| Phase 11 | Theme & Polish | ✅ Complete |

### Current Status: **TypeScript Compilation Passes ✅**

All code has been implemented and TypeScript compilation (`tsc --noEmit`) passes with no errors.

### Blocking Issue: Node.js Version

⚠️ **Next.js 15 requires Node.js >=20.9.0**

The development environment has Node.js v18.19.1 installed. To run `npm run build` and verify the full build, Node.js 20+ must be installed.

**Options to resolve:**
1. Install Node.js 20+ via nvm: `nvm install 20 && nvm use 20`
2. Install via NodeSource repository (requires sudo)
3. Use fnm or volta as alternative Node.js version managers

### Files Created

All files from the project structure have been created:

**Core Application:**
- `src/schema.ts` - Jazz schema with Message, ChatRoom, PushSubscription, SoloAccount
- `src/app/layout.tsx` - Root layout with JazzProvider, ThemeProvider
- `src/app/page.tsx` - Landing page (create/join chat)
- `src/app/chat/page.tsx` - Chat room page
- `src/app/manifest.ts` - PWA manifest
- `src/app/sw.ts` - Service worker with Serwist
- `src/app/offline/page.tsx` - Offline fallback page

**Components:**
- All ShadCN UI components in `src/components/ui/`
- Chat components: ChatContainer, MessageBubble, MessageInput, MessageList, ImagePreview, ImageThumbnail, StatusIndicator
- Seed components: SeedGenerator, SeedInput, SeedDisplay
- Layout components: Header, ThemeToggle, InstallPrompt, SettingsMenu
- Notification components: PushPrompt, NotificationBadge

**Libraries:**
- `src/lib/jazz/` - provider.tsx, auth.ts, hooks.ts
- `src/lib/seed/` - generate.ts, validate.ts
- `src/lib/notifications/` - push.ts, tab-blink.ts
- `src/lib/images/` - paste-handler.ts, upload.ts
- `src/lib/utils/` - cn.ts, device-id.ts, storage.ts, format.ts

**Hooks:**
- `src/hooks/` - use-tab-visibility.ts, use-is-ios.ts, use-is-pwa.ts, use-intersection.ts

**Worker (Cloudflare):**
- `worker/src/index.ts` - Worker entry point
- `worker/src/push.ts` - Web Push sending logic
- `worker/src/jazz-listener.ts` - Jazz change listener
- `worker/src/types.ts` - TypeScript types
- `worker/wrangler.toml` - Cloudflare configuration

**Configuration:**
- `next.config.ts` - Next.js + Serwist configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `components.json` - ShadCN UI configuration
- `.env.example` - Environment variables template

### Next Steps

1. **Install Node.js 20+** to unblock build verification
2. **Run `npm run build`** to verify full Next.js compilation
3. **Test the application** in development mode (`npm run dev`)
4. **Deploy Worker** to Cloudflare (`cd worker && npx wrangler deploy`)
5. **Cross-device testing** following the Verification Checklist below

---

## Key Decisions
- **Push Notifications**: Full backend with Cloudflare Workers
- **User Identity**: Optional display name (can be set per device)
- **Chat Management**: One active chat at a time (simple UX)
- **App Icons**: Will create placeholder icons during implementation
- **Repo Structure**: Monorepo (worker in `worker/` subdirectory)

---

## Tech Stack
| Component | Technology |
|-----------|------------|
| Framework | Next.js 15 (App Router) |
| PWA Engine | Serwist |
| UI Components | ShadCN UI |
| Chat UI | shadcnuikit ChatBubbles |
| Database/Sync | Jazz.tools (CRDT, E2EE built-in) |
| Seed Generation | @scure/bip39 |
| Push Backend | Cloudflare Workers |
| Styling | Tailwind CSS |

---

## Project Structure (Monorepo)

```
solo_chat/
├── src/                              # Next.js PWA
│   ├── app/
│   │   ├── layout.tsx                # Root layout with JazzProvider, ThemeProvider
│   │   ├── page.tsx                  # Landing page (create/join chat)
│   │   ├── manifest.ts               # PWA manifest (dynamic)
│   │   ├── sw.ts                     # Service worker entry (Serwist)
│   │   ├── globals.css               # Global styles + Tailwind
│   │   ├── offline/
│   │   │   └── page.tsx              # Offline fallback page
│   │   └── chat/
│   │       └── [roomId]/
│   │           └── page.tsx          # Chat room page
│   │
│   ├── components/
│   │   ├── ui/                       # ShadCN components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── alert-dialog.tsx
│   │   │   ├── scroll-area.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── toaster.tsx
│   │   │   ├── skeleton.tsx
│   │   │   └── separator.tsx
│   │   │
│   │   ├── chat/
│   │   │   ├── ChatContainer.tsx     # Main chat wrapper
│   │   │   ├── MessageBubble.tsx     # Individual message bubble
│   │   │   ├── MessageInput.tsx      # Text input + image paste
│   │   │   ├── MessageList.tsx       # Scrollable message list
│   │   │   ├── ImagePreview.tsx      # Full-size image modal
│   │   │   ├── ImageThumbnail.tsx    # Clickable image in message
│   │   │   ├── StatusIndicator.tsx   # Sent/delivered/read icons
│   │   │   └── TypingIndicator.tsx   # Optional: "typing..." indicator
│   │   │
│   │   ├── seed/
│   │   │   ├── SeedGenerator.tsx     # Generate new 12-word seed
│   │   │   ├── SeedInput.tsx         # Enter existing seed to join
│   │   │   ├── SeedDisplay.tsx       # Show seed with copy button
│   │   │   └── SeedValidator.tsx     # Validate BIP-39 mnemonic
│   │   │
│   │   ├── notifications/
│   │   │   ├── PushPrompt.tsx        # Request notification permission
│   │   │   └── NotificationBadge.tsx # Unread count badge
│   │   │
│   │   └── layout/
│   │       ├── Header.tsx            # App header with menu
│   │       ├── ThemeToggle.tsx       # Dark/light mode toggle
│   │       ├── InstallPrompt.tsx     # iOS PWA install instructions
│   │       └── SettingsMenu.tsx      # Dropdown with settings/delete
│   │
│   ├── lib/
│   │   ├── jazz/
│   │   │   ├── provider.tsx          # JazzProvider wrapper component
│   │   │   ├── auth.ts               # Passphrase auth helpers
│   │   │   └── hooks.ts              # Custom Jazz hooks (useChat, useMessages)
│   │   │
│   │   ├── seed/
│   │   │   ├── generate.ts           # Generate 12-word BIP-39 mnemonic
│   │   │   ├── validate.ts           # Validate mnemonic is correct
│   │   │   └── derive.ts             # Derive room ID from seed (if needed)
│   │   │
│   │   ├── notifications/
│   │   │   ├── push.ts               # Push subscription management
│   │   │   ├── tab-blink.ts          # Desktop tab title blinking
│   │   │   └── service-worker.ts     # SW push event handlers
│   │   │
│   │   ├── images/
│   │   │   ├── paste-handler.ts      # Clipboard paste detection
│   │   │   ├── upload.ts             # Upload image to Jazz media
│   │   │   └── compress.ts           # Optional: client-side compression
│   │   │
│   │   └── utils/
│   │       ├── device-id.ts          # Generate/persist unique device ID
│   │       ├── storage.ts            # LocalStorage helpers
│   │       ├── cn.ts                 # Tailwind class name utility
│   │       └── format.ts             # Date/time formatting
│   │
│   ├── hooks/
│   │   ├── use-tab-visibility.ts     # Track if tab is visible
│   │   ├── use-is-ios.ts             # Detect iOS device
│   │   ├── use-is-pwa.ts             # Detect if running as installed PWA
│   │   └── use-intersection.ts       # Intersection observer for read receipts
│   │
│   └── schema.ts                     # Jazz schema definitions
│
├── worker/                           # Cloudflare Worker (push service)
│   ├── src/
│   │   ├── index.ts                  # Worker entry point (fetch handler)
│   │   ├── push.ts                   # Web Push sending logic
│   │   ├── jazz-listener.ts          # Listen for Jazz changes via WebSocket
│   │   └── types.ts                  # TypeScript types
│   ├── wrangler.toml                 # Cloudflare Worker configuration
│   ├── package.json                  # Worker-specific dependencies
│   └── tsconfig.json                 # Worker TypeScript config
│
├── public/
│   ├── icons/
│   │   ├── icon-72x72.png
│   │   ├── icon-96x96.png
│   │   ├── icon-128x128.png
│   │   ├── icon-144x144.png
│   │   ├── icon-152x152.png
│   │   ├── icon-192x192.png
│   │   ├── icon-384x384.png
│   │   ├── icon-512x512.png
│   │   └── maskable-icon-512x512.png # For Android adaptive icons
│   ├── apple-touch-icon.png          # iOS home screen icon (180x180)
│   ├── favicon.ico                   # Browser tab icon
│   └── favicon-notification.ico      # Alt favicon for notifications (optional)
│
├── shared/                           # Shared code between PWA and Worker
│   └── types.ts                      # Shared TypeScript types
│
├── next.config.ts                    # Next.js + Serwist configuration
├── tailwind.config.ts                # Tailwind CSS configuration
├── postcss.config.js                 # PostCSS config for Tailwind
├── tsconfig.json                     # Root TypeScript configuration
├── components.json                   # ShadCN UI configuration
├── package.json                      # Root package.json
├── .env.local                        # Environment variables (not committed)
├── .env.example                      # Example environment variables
├── .gitignore                        # Git ignore file
├── CLAUDE.md                         # Project requirements (existing)
└── TODO.md                           # This file
```

---

## Jazz Schema Design

```typescript
// src/schema.ts
import { co, z } from "jazz-tools";

// ============================================
// MESSAGE
// Represents a single chat message
// ============================================
export const Message = co.map({
  // Message content (required, can be empty string if only image)
  text: z.string(),

  // Optional attached image (uses jazz-tools/media)
  image: co.optional(co.image()),

  // Unique device identifier of sender
  senderId: z.string(),

  // Optional display name chosen by user
  senderName: z.string().optional(),

  // Unix timestamp in milliseconds
  timestamp: z.number(),

  // Delivery status (updated progressively)
  // - "sent": Created locally, not yet confirmed synced
  // - "delivered": Confirmed synced to Jazz relay
  // - "read": At least one other device has viewed it
  status: z.enum(["sent", "delivered", "read"]),

  // Array of device IDs that have read this message
  // Used to determine if status should be "read"
  readBy: co.optional(co.list(z.string())),
});

// ============================================
// CHAT
// Ordered list of messages (CoList for CRDT ordering)
// ============================================
export const Chat = co.list(Message, {
  onCreate(options) {
    return {
      ...options,
      // Everyone with the seed can write messages
      group: { everyone: "writer" },
    };
  },
});

// ============================================
// CHAT ROOM
// Root object containing chat metadata and messages
// ============================================
export const ChatRoom = co.map({
  // The message list
  messages: Chat,

  // Optional room name (users can set this)
  name: z.string().optional(),

  // When the chat was created (Unix timestamp)
  createdAt: z.number(),

  // Last message timestamp (for sorting if multiple chats in future)
  lastActivity: z.number(),

  // List of device IDs that have joined this chat
  // Used for participant count and presence
  participants: co.list(z.string()),

  // Push subscriptions for this chat room
  pushSubscriptions: ChatRoomSubscriptions,
});

// ============================================
// PUSH SUBSCRIPTION
// Web Push subscription data for a device
// ============================================
export const PushSubscriptionKeys = co.map({
  p256dh: z.string(),
  auth: z.string(),
});

export const PushSubscription = co.map({
  // Push service endpoint URL
  endpoint: z.string(),

  // Encryption keys
  keys: PushSubscriptionKeys,

  // Which device this subscription belongs to
  deviceId: z.string(),

  // When subscription was created
  createdAt: z.number(),
});

export const ChatRoomSubscriptions = co.list(PushSubscription);

// ============================================
// ACCOUNT ROOT
// Per-device data (not shared across devices)
// ============================================
export const AccountRoot = co.map({
  // Currently active chat room ID (if any)
  currentChatId: z.string().optional(),

  // This device's unique identifier
  deviceId: z.string(),

  // User's chosen display name for this device
  displayName: z.string().optional(),
});

// ============================================
// SOLO ACCOUNT
// Account type using passphrase (BIP-39) authentication
// ============================================
export const SoloAccount = co.account({
  root: AccountRoot,
  profile: co.profile(),
});
```

---

## Implementation Phases

### Phase 1: Project Foundation ✅
**Goal**: Set up development environment with all core dependencies

**Tasks**:
- [x] Initialize Next.js 15 project with App Router
- [x] Install core dependencies (jazz-tools, jazz-react, @scure/bip39, serwist, lucide-react, next-themes, etc.)
- [x] Initialize ShadCN UI (New York style, Slate color, CSS variables)
- [x] Add ShadCN components (button, card, input, textarea, dialog, alert-dialog, scroll-area, avatar, dropdown-menu, toast, skeleton, separator)
- [x] Configure dark mode as default in `tailwind.config.ts`
- [x] Create PWA manifest in `src/app/manifest.ts`
- [x] Configure Serwist in `next.config.ts`
- [x] Create placeholder app icons (all sizes)
- [x] Set up `worker/` folder structure
- [x] Create `.env.example` with required variables
- [x] Update `.gitignore` for Next.js + Worker

**Files to create**:
- `next.config.ts`
- `src/app/manifest.ts`
- `src/lib/utils/cn.ts`
- `public/icons/*` (placeholder icons)
- `worker/package.json`
- `worker/wrangler.toml`
- `worker/tsconfig.json`
- `.env.example`

---

### Phase 2: Jazz Integration ✅
**Goal**: Implement Jazz.tools with passphrase (BIP-39) authentication

**Tasks**:
- [x] Create Jazz schema (`src/schema.ts`)
- [x] Create JazzProvider wrapper component
  - Configured with passphrase authentication
  - Connected to `wss://cloud.jazz.tools`
  - Wrapped app in `src/app/layout.tsx`
- [x] Implement BIP-39 seed utilities
  - `generate.ts`: Generate 12-word mnemonic using @scure/bip39
  - `validate.ts`: Validate mnemonic is valid BIP-39
- [x] Implement device ID utility
  - Generate UUID on first visit, store in localStorage
- [x] Create custom Jazz hooks
  - `useChatRoom`: Get chat room by ID with proper MaybeLoaded types
  - Real-time message subscriptions

**Files to create**:
- `src/schema.ts`
- `src/lib/jazz/provider.tsx`
- `src/lib/jazz/auth.ts`
- `src/lib/jazz/hooks.ts`
- `src/lib/seed/generate.ts`
- `src/lib/seed/validate.ts`
- `src/lib/utils/device-id.ts`

**Key code snippet - JazzProvider**:
```typescript
// src/lib/jazz/provider.tsx
"use client";

import { JazzReactProvider, usePassphraseAuth } from "jazz-react";
import { SoloAccount } from "@/schema";

export function JazzProvider({ children }: { children: React.ReactNode }) {
  return (
    <JazzReactProvider
      AccountSchema={SoloAccount}
      peer="wss://cloud.jazz.tools"
      sync={{ when: "always" }}
    >
      {children}
    </JazzReactProvider>
  );
}
```

**Key code snippet - BIP-39 Generation**:
```typescript
// src/lib/seed/generate.ts
import { generateMnemonic, validateMnemonic } from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english";

export function generateSeed(): string {
  // 128 bits = 12 words
  return generateMnemonic(wordlist, 128);
}

export function isValidSeed(seed: string): boolean {
  return validateMnemonic(seed, wordlist);
}
```

---

### Phase 3: Core Chat UI ✅
**Goal**: Build the main chat interface

**Tasks**:
- [x] Create landing page (`src/app/page.tsx`)
  - App title and brief description
  - "Create New Chat" button
  - "Join Existing Chat" section with seed input
  - Optional display name input
  - iOS PWA install instructions (if not installed)
- [x] Create SeedGenerator component
  - Generate new 12-word seed with copy to clipboard
  - Warning about saving seed securely
- [x] Create SeedInput component
  - Textarea for pasting seed with real-time validation
- [x] Create SeedDisplay component
  - Show seed with word numbering and copy button
- [x] Create chat page (`src/app/chat/page.tsx`)
  - Uses roomId from search params
  - Initialize/join chat room with seed
- [x] Create ChatContainer component
  - Header with room info and settings
  - MessageList in scrollable area, MessageInput fixed at bottom
- [x] Create MessageList component
  - Subscribe to messages via Jazz with proper MaybeLoaded handling
  - Auto-scroll to bottom on new messages
- [x] Create MessageBubble component
  - Different style for own vs others' messages
  - Shows sender name, timestamp, status indicator, image thumbnail
- [x] Create MessageInput component
  - Textarea with Enter to send, Shift+Enter for newline
  - Paste detection for images, image preview before sending

**Files to create**:
- `src/app/page.tsx`
- `src/app/chat/[roomId]/page.tsx`
- `src/components/chat/ChatContainer.tsx`
- `src/components/chat/MessageList.tsx`
- `src/components/chat/MessageBubble.tsx`
- `src/components/chat/MessageInput.tsx`
- `src/components/chat/StatusIndicator.tsx`
- `src/components/seed/SeedGenerator.tsx`
- `src/components/seed/SeedInput.tsx`
- `src/components/seed/SeedDisplay.tsx`
- `src/components/layout/Header.tsx`

**UI/UX Notes**:
- Messages from self: aligned right, colored bubble (e.g., blue)
- Messages from others: aligned left, neutral bubble (e.g., gray)
- Timestamps: relative format ("2m ago", "1h ago", "Yesterday")
- Sender name: shown above message if set, "Anonymous" if not
- Status: shown only on own messages, bottom-right of bubble

---

### Phase 4: Image Handling ✅
**Goal**: Implement copy/paste images with Jazz media

**Tasks**:
- [x] Create paste handler utility (`src/lib/images/paste-handler.ts`)
  - Listen for paste events, detect image types, extract blob
- [x] Create image upload utility (`src/lib/images/upload.ts`)
  - Uses Jazz ImageDefinition with createImage()
- [x] Create ImageThumbnail component
  - Show image in message bubble with max width/height
  - Click handler to open full size
  - Proper MaybeLoaded type handling with $isLoaded checks
- [x] Create ImagePreview modal
  - Full-screen overlay with close on click outside
- [x] Integrate paste handler in MessageInput
  - Image preview before sending, can remove before send
- [x] Handle loading states with skeleton/blur placeholders

**Files to create**:
- `src/lib/images/paste-handler.ts`
- `src/lib/images/upload.ts`
- `src/components/chat/ImageThumbnail.tsx`
- `src/components/chat/ImagePreview.tsx`

**Key code snippet - Paste Handler**:
```typescript
// src/lib/images/paste-handler.ts
export function setupPasteHandler(
  onImage: (blob: Blob) => void
): () => void {
  const handler = async (e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of items) {
      if (item.type.startsWith("image/")) {
        e.preventDefault();
        const blob = item.getAsFile();
        if (blob) onImage(blob);
        return;
      }
    }
  };

  document.addEventListener("paste", handler);
  return () => document.removeEventListener("paste", handler);
}
```

**Key code snippet - Image Upload**:
```typescript
// src/lib/images/upload.ts
import { createImage } from "jazz-tools/media";
import type { Account, Group } from "jazz-tools";

export async function uploadImage(
  blob: Blob,
  owner: Account | Group
) {
  return await createImage(blob, {
    owner,
    maxSize: 1920,
  });
}
```

---

### Phase 5: Message Status & Read Receipts ✅
**Goal**: Track delivery and read status for messages

**Tasks**:
- [x] Implement status update flow
  - **sent**: Set when message created locally
  - **delivered**: Set when Jazz confirms sync
  - **read**: Set when another device views the message
- [x] Create intersection observer hook (`src/hooks/use-intersection.ts`)
  - Detect when message enters viewport, mark as read
- [x] Implement read receipt logic
  - On message visible, add deviceId to `readBy` array
  - Update status to "read" if not sender
- [x] Create StatusIndicator component
  - Single check (✓): sent
  - Double check (✓✓): delivered
  - Blue double check: read by at least one other
- [x] Update MessageBubble to show status on own messages

**Files to create/modify**:
- `src/hooks/use-intersection.ts`
- `src/components/chat/StatusIndicator.tsx`
- `src/components/chat/MessageBubble.tsx` (update)
- `src/components/chat/MessageList.tsx` (update for read tracking)

**Key code snippet - Intersection Observer**:
```typescript
// src/hooks/use-intersection.ts
import { useEffect, useRef, useState } from "react";

export function useIntersection(
  options?: IntersectionObserverInit
): [React.RefObject<HTMLElement>, boolean] {
  const ref = useRef<HTMLElement>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [options]);

  return [ref, isIntersecting];
}
```

---

### Phase 6: PWA & Service Worker ✅
**Goal**: Complete PWA setup with offline support

**Tasks**:
- [x] Create service worker (`src/app/sw.ts`)
  - Serwist for precaching with runtime caching strategies
  - Push event handler and notification click handler
  - Uses `/// <reference lib="webworker" />` for proper types
- [x] Create offline fallback page (`src/app/offline/page.tsx`)
  - Shows offline status with retry button
- [x] Configure caching strategies
  - App shell precached, static assets cache-first
- [x] Add PWA meta tags to layout
  - apple-mobile-web-app-capable, theme-color, viewport
- [x] Create iOS install prompt component (`src/components/layout/InstallPrompt.tsx`)
  - Detects iOS Safari, shows install instructions
  - Dismissable with preference remembered
- [x] Created hooks: `use-is-pwa.ts`, `use-is-ios.ts`

**Files to create**:
- `src/app/sw.ts`
- `src/app/offline/page.tsx`
- `src/components/layout/InstallPrompt.tsx`
- `src/hooks/use-is-pwa.ts`
- `src/hooks/use-is-ios.ts`

**Key code snippet - Service Worker**:
```typescript
// src/app/sw.ts
import { defaultCache } from "@serwist/next/worker";
import { Serwist } from "serwist";

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
  fallbacks: {
    entries: [
      {
        url: "/offline",
        matcher: ({ request }) => request.mode === "navigate",
      },
    ],
  },
});

// Push notification handler (implemented in Phase 8)
self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {};
  event.waitUntil(
    self.registration.showNotification(data.title ?? "New Message", {
      body: data.body ?? "You have a new message",
      icon: "/icons/icon-192x192.png",
      badge: "/icons/icon-72x72.png",
      data: { url: data.url ?? "/" },
      tag: "solo-message", // Collapse similar notifications
      renotify: true,
    })
  );
});

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clients) => {
      // Focus existing window if open
      for (const client of clients) {
        if (client.url.includes("/chat/") && "focus" in client) {
          return client.focus();
        }
      }
      // Otherwise open new window
      return self.clients.openWindow(event.notification.data?.url ?? "/");
    })
  );
});

serwist.addEventListeners();
```

**Key code snippet - PWA Manifest**:
```typescript
// src/app/manifest.ts
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Solo Chat",
    short_name: "Solo",
    description: "Private, encrypted chat with no signup required",
    start_url: "/",
    display: "standalone", // REQUIRED for iOS push notifications
    background_color: "#000000",
    theme_color: "#000000",
    orientation: "portrait",
    icons: [
      { src: "/icons/icon-72x72.png", sizes: "72x72", type: "image/png" },
      { src: "/icons/icon-96x96.png", sizes: "96x96", type: "image/png" },
      { src: "/icons/icon-128x128.png", sizes: "128x128", type: "image/png" },
      { src: "/icons/icon-144x144.png", sizes: "144x144", type: "image/png" },
      { src: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
      { src: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-384x384.png", sizes: "384x384", type: "image/png" },
      { src: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/maskable-icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
```

---

### Phase 7: Cloudflare Worker (Push Backend) ✅
**Goal**: Create serverless push notification service

**Architecture**:
```
┌─────────────────┐         ┌──────────────────┐
│   Device A      │         │   Device B       │
│   (PWA)         │         │   (PWA)          │
└────────┬────────┘         └────────┬─────────┘
         │                           │
         │ Register subscription     │ Receive push
         ▼                           ▼
┌─────────────────────────────────────────────┐
│              Jazz Cloud Relay               │
│         (wss://cloud.jazz.tools)            │
└─────────────────────┬───────────────────────┘
                      │ WebSocket connection
                      ▼
┌─────────────────────────────────────────────┐
│          Cloudflare Worker                  │
│  1. Connects to Jazz as listener            │
│  2. Watches for new messages                │
│  3. Reads push subscriptions from Jazz      │
│  4. Sends Web Push to recipient devices     │
└─────────────────────────────────────────────┘
```

**Tasks**:
- [x] Initialize Cloudflare Worker project (`worker/package.json`, `worker/tsconfig.json`)
- [x] Create wrangler.toml configuration
- [x] Implement worker entry point (`worker/src/index.ts`)
  - HTTP endpoint for health checks
  - VAPID public key endpoint
- [x] Implement Jazz listener (`worker/src/jazz-listener.ts`)
  - Subscribe to ChatRoom changes, detect new messages
- [x] Implement push notification sender (`worker/src/push.ts`)
  - Send Web Push, handle expired subscriptions
- [x] Create types file (`worker/src/types.ts`)

**Pending (requires deployment):**
- [ ] Generate VAPID keys: `npx web-push generate-vapid-keys`
- [ ] Configure secrets: `npx wrangler secret put VAPID_PRIVATE_KEY`
- [ ] Deploy worker: `npx wrangler deploy`

**Files to create**:
- `worker/package.json`
- `worker/tsconfig.json`
- `worker/wrangler.toml`
- `worker/src/index.ts`
- `worker/src/push.ts`
- `worker/src/jazz-listener.ts`
- `worker/src/types.ts`

**Key code snippet - wrangler.toml**:
```toml
# worker/wrangler.toml
name = "solo-push"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[vars]
JAZZ_PEER = "wss://cloud.jazz.tools"

# Secrets (set via wrangler secret put):
# - VAPID_PUBLIC_KEY
# - VAPID_PRIVATE_KEY
# - JAZZ_AUTH_SECRET (for bot account)
```

**Key code snippet - Worker Entry**:
```typescript
// worker/src/index.ts
import { sendPushNotification } from "./push";
import { startJazzListener } from "./jazz-listener";

export interface Env {
  VAPID_PUBLIC_KEY: string;
  VAPID_PRIVATE_KEY: string;
  JAZZ_PEER: string;
  JAZZ_AUTH_SECRET: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Health check endpoint
    if (url.pathname === "/health") {
      return new Response("OK", { status: 200 });
    }

    // VAPID public key endpoint (for PWA to use)
    if (url.pathname === "/vapid-public-key") {
      return new Response(env.VAPID_PUBLIC_KEY, {
        headers: { "Content-Type": "text/plain" },
      });
    }

    return new Response("Not Found", { status: 404 });
  },

  // Durable Object or Cron for persistent Jazz connection
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    // Reconnect to Jazz if needed
    ctx.waitUntil(startJazzListener(env));
  },
};
```

**Key code snippet - Push Sender**:
```typescript
// worker/src/push.ts
import webpush from "web-push";
import type { PushSubscription } from "./types";

export async function sendPushNotification(
  subscription: PushSubscription,
  payload: { title: string; body: string; url?: string },
  vapidPublicKey: string,
  vapidPrivateKey: string
): Promise<boolean> {
  webpush.setVapidDetails(
    "mailto:your-email@example.com",
    vapidPublicKey,
    vapidPrivateKey
  );

  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        },
      },
      JSON.stringify(payload)
    );
    return true;
  } catch (error: any) {
    if (error.statusCode === 410 || error.statusCode === 404) {
      // Subscription expired or invalid - should be removed
      console.log("Subscription expired:", subscription.endpoint);
      return false;
    }
    throw error;
  }
}
```

---

### Phase 8: Push Notification Integration (PWA Side) ✅
**Goal**: Connect PWA to Cloudflare Worker for push notifications

**Tasks**:
- [x] Create push subscription utility (`src/lib/notifications/push.ts`)
  - Request notification permission
  - Get push subscription from service worker
  - Store subscription in Jazz ChatRoom.pushSubscriptions
- [x] Create PushPrompt component (`src/components/notifications/PushPrompt.tsx`)
  - Shows after first message, explains benefits
  - Handles iOS-specific messaging
  - Remembers if user dismissed
- [x] Create NotificationBadge component (`src/components/notifications/NotificationBadge.tsx`)
- [x] Detect iOS PWA status using `use-is-pwa.ts` hook
- [x] Service worker push handler (in Phase 6)

**Files to create/modify**:
- `src/lib/notifications/push.ts`
- `src/components/notifications/PushPrompt.tsx`
- `src/hooks/use-is-pwa.ts` (if not already)
- `src/app/sw.ts` (already has push handler)

**Key code snippet - Push Subscription**:
```typescript
// src/lib/notifications/push.ts

export async function subscribeToPush(
  workerUrl: string
): Promise<PushSubscription | null> {
  // Check if notifications are supported
  if (!("Notification" in window) || !("serviceWorker" in navigator)) {
    console.log("Push notifications not supported");
    return null;
  }

  // Check if iOS PWA
  const isIOSPWA = "standalone" in navigator && (navigator as any).standalone;
  const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);

  if (isIOS && !isIOSPWA) {
    console.log("Must install as PWA for iOS push notifications");
    return null;
  }

  // Request permission
  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    console.log("Notification permission denied");
    return null;
  }

  // Get VAPID public key from worker
  const vapidResponse = await fetch(`${workerUrl}/vapid-public-key`);
  const vapidPublicKey = await vapidResponse.text();

  // Subscribe to push
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
  });

  return subscription;
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}
```

---

### Phase 9: Desktop Tab Blinking ✅
**Goal**: Alert users of new messages when tab is hidden

**Tasks**:
- [x] Create tab visibility hook (`src/hooks/use-tab-visibility.ts`)
  - Tracks document.visibilityState, returns isVisible boolean
- [x] Create tab blink utility (`src/lib/notifications/tab-blink.ts`)
  - Alternates title with unread count: "(3) New message - Solo"
  - Stops when tab becomes visible
- [x] Integrate in ChatContainer
  - Tracks unread count, starts blinking when hidden + new message

**Files to create**:
- `src/hooks/use-tab-visibility.ts`
- `src/lib/notifications/tab-blink.ts`

**Key code snippet - Tab Visibility Hook**:
```typescript
// src/hooks/use-tab-visibility.ts
import { useEffect, useState } from "react";

export function useTabVisibility(): boolean {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(document.visibilityState === "visible");
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return isVisible;
}
```

**Key code snippet - Tab Blink Utility**:
```typescript
// src/lib/notifications/tab-blink.ts

let blinkInterval: ReturnType<typeof setInterval> | null = null;
let originalTitle: string = "";

export function startTitleBlink(unreadCount: number): void {
  if (blinkInterval) return; // Already blinking

  originalTitle = document.title;
  let showingMessage = false;

  blinkInterval = setInterval(() => {
    if (showingMessage) {
      document.title = originalTitle;
    } else {
      document.title = `(${unreadCount}) New message - Solo`;
    }
    showingMessage = !showingMessage;
  }, 1000);
}

export function stopTitleBlink(): void {
  if (blinkInterval) {
    clearInterval(blinkInterval);
    blinkInterval = null;
    document.title = originalTitle;
  }
}

export function updateUnreadCount(count: number): void {
  if (blinkInterval && count > 0) {
    // Update the message shown during blink
    originalTitle = document.title.replace(/^\(\d+\) /, "");
  } else if (count === 0) {
    stopTitleBlink();
  }
}
```

---

### Phase 10: Delete Functionality ✅
**Goal**: Allow users to delete all messages

**Tasks**:
- [x] Create SettingsMenu component (`src/components/layout/SettingsMenu.tsx`)
  - Dropdown in header with delete option and theme toggle
  - "Leave Chat" option to return to home
- [x] Create delete confirmation dialog
  - Uses AlertDialog from ShadCN
  - Clear warning about permanent deletion
- [x] Implement delete logic
  - Clears all items from Chat messages using Jazz $jazz.splice()
  - Jazz automatically syncs deletion
- [x] Handle UI after delete with empty state

**Files to create/modify**:
- `src/components/layout/SettingsMenu.tsx`
- `src/components/chat/ChatContainer.tsx` (add delete handler)

**Key code snippet - Delete Messages**:
```typescript
// In ChatContainer or a utility

async function deleteAllMessages(chatRoom: ChatRoom): Promise<void> {
  // Clear all messages
  const messages = chatRoom.messages;
  while (messages.length > 0) {
    messages.pop();
  }

  // Update last activity
  chatRoom.lastActivity = Date.now();

  // Jazz automatically syncs the deletion to all devices
}
```

---

### Phase 11: Theme & Polish ✅
**Goal**: Final UI polish and theming

**Tasks**:
- [x] Implement theme toggle (`src/components/layout/ThemeToggle.tsx`)
  - Uses next-themes with dark mode as default
  - Options: Light, Dark, System with persisted preference
- [x] Add loading states
  - Skeleton for message list
  - Loading indicator for images with blur placeholder
  - Connecting state for Jazz
- [x] Add ThemeProvider to layout
- [x] TypeScript compilation verified - all errors fixed

**Pending (requires Node.js 20+):**
- [ ] Run full Next.js build verification
- [ ] Cross-device testing
- [ ] Performance optimization testing

**Files to create/modify**:
- `src/components/layout/ThemeToggle.tsx`
- `src/app/layout.tsx` (add ThemeProvider)
- `src/components/chat/MessageList.tsx` (loading states)

---

## Critical iOS PWA Notes

1. **PWA Must Be Installed**: Push notifications ONLY work when the app is added to home screen
2. **iOS 16.4+ Required**: Older iOS versions do not support Web Push
3. **User Gesture Required**: Permission prompt must be triggered by a tap/click
4. **No Auto Install Prompt**: Unlike Android, iOS does not prompt to install - need to guide users
5. **Standalone Display Required**: Manifest must have `display: "standalone"` for push to work
6. **Safari Only**: Must use Safari to install PWA on iOS (no Chrome/Firefox support)

**iOS Install Flow**:
1. User visits site in Safari
2. Show banner: "Install Solo for notifications"
3. Instructions: "Tap Share → Add to Home Screen"
4. After install, prompt for notification permission

---

## Environment Variables

### PWA (.env.local)
```env
# Jazz Configuration
NEXT_PUBLIC_JAZZ_PEER=wss://cloud.jazz.tools

# Push Notification Worker
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key_here
NEXT_PUBLIC_WORKER_URL=https://solo-push.your-subdomain.workers.dev
```

### Worker (worker/.dev.vars for local, secrets for prod)
```env
# VAPID Keys (generate with: npx web-push generate-vapid-keys)
VAPID_PUBLIC_KEY=your_vapid_public_key_here
VAPID_PRIVATE_KEY=your_vapid_private_key_here

# Jazz Configuration
JAZZ_PEER=wss://cloud.jazz.tools
JAZZ_AUTH_SECRET=your_jazz_auth_secret_for_bot_account
```

### .env.example
```env
# Copy this to .env.local and fill in values

# Jazz peer server
NEXT_PUBLIC_JAZZ_PEER=wss://cloud.jazz.tools

# Push notification configuration
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
NEXT_PUBLIC_WORKER_URL=
```

---

## Verification Checklist

### Core Functionality
- [ ] **Create chat**: Click "Create New Chat", verify 12 words displayed
- [ ] **Copy seed**: Click copy button, verify seed in clipboard
- [ ] **Set display name**: Enter optional name, verify it appears on messages
- [ ] **Join chat**: Paste seed on different browser/device, verify same chat loads
- [ ] **Send text message**: Type and send, verify appears on both devices
- [ ] **Send image**: Paste image, verify preview, send, verify appears on both devices
- [ ] **View full image**: Click thumbnail, verify full-size modal opens
- [ ] **Real-time sync**: Send from one device, verify appears on other within seconds

### Message Status
- [ ] **Sent status**: Send message, verify single check appears immediately
- [ ] **Delivered status**: Send message, verify double check after sync confirmed
- [ ] **Read status**: View message on other device, verify blue double check on sender

### Offline Support
- [ ] **Offline mode**: Disconnect network, send message, verify queued
- [ ] **Reconnect sync**: Reconnect, verify message syncs to other device
- [ ] **Offline page**: Navigate while offline, verify offline fallback shown

### PWA
- [ ] **Manifest valid**: Check Chrome DevTools → Application → Manifest
- [ ] **Lighthouse score**: Run Lighthouse PWA audit, target 100
- [ ] **Desktop install**: Install PWA on desktop, verify launches standalone
- [ ] **iOS install**: Safari → Share → Add to Home Screen, verify works

### Push Notifications
- [ ] **Permission request**: Grant notification permission, verify no errors
- [ ] **Subscription stored**: Check Jazz data, verify subscription saved
- [ ] **Receive push**: Close app, send message from other device, verify push received
- [ ] **Notification click**: Click notification, verify opens correct chat

### Desktop Features
- [ ] **Tab blinking**: Hide tab, receive message, verify title blinks
- [ ] **Blink stops**: Focus tab, verify blinking stops
- [ ] **Unread count**: Multiple messages while hidden, verify count in title

### Delete & Settings
- [ ] **Delete all**: Click delete, confirm, verify all messages removed
- [ ] **Sync deletion**: Verify messages removed on other devices too
- [ ] **Theme toggle**: Switch themes, verify persists after reload

### Cross-Browser Testing
- [ ] Chrome Desktop
- [ ] Firefox Desktop
- [ ] Safari Desktop (macOS)
- [ ] Safari iOS (iPhone)
- [ ] Chrome Android

---

## Dependencies Summary

### Root package.json
```json
{
  "name": "solo-chat",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "worker:dev": "cd worker && npm run dev",
    "worker:deploy": "cd worker && npm run deploy"
  },
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "jazz-tools": "latest",
    "jazz-react": "latest",
    "@scure/bip39": "^1.4.0",
    "serwist": "^9.0.0",
    "@serwist/next": "^9.0.0",
    "next-themes": "^0.4.0",
    "lucide-react": "latest",
    "class-variance-authority": "latest",
    "clsx": "latest",
    "tailwind-merge": "latest",
    "@radix-ui/react-dialog": "latest",
    "@radix-ui/react-dropdown-menu": "latest",
    "@radix-ui/react-scroll-area": "latest",
    "@radix-ui/react-avatar": "latest",
    "@radix-ui/react-alert-dialog": "latest",
    "@radix-ui/react-separator": "latest",
    "@radix-ui/react-slot": "latest"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.0.0",
    "autoprefixer": "^10.0.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "^15.0.0"
  }
}
```

### Worker package.json
```json
{
  "name": "solo-push-worker",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "wrangler dev",
    "deploy": "wrangler deploy"
  },
  "dependencies": {
    "jazz-tools": "latest",
    "web-push": "^3.6.0"
  },
  "devDependencies": {
    "wrangler": "^3.0.0",
    "@cloudflare/workers-types": "^4.0.0",
    "typescript": "^5.0.0"
  }
}
```

---

## Notes

- Jazz.tools handles all E2EE - no additional encryption needed
- BIP-39 seed is used as Jazz passphrase - deterministically creates same account on any device
- Jazz Cloud relay (wss://cloud.jazz.tools) is used for sync - no self-hosting needed
- Cloudflare Worker free tier should be sufficient for moderate usage
- Consider rate limiting on worker if concerned about abuse
