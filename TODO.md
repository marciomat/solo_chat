# Solo Chat PWA - Implementation TODO

## Overview
A minimalistic, local-first PWA chat app with E2EE using 12-word BIP-39 seeds. No user accounts required - the seed IS the access key. Anyone with the seed can join the chat and see all messages.

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

### Phase 1: Project Foundation
**Goal**: Set up development environment with all core dependencies

**Tasks**:
- [ ] Initialize Next.js 15 project with App Router
  ```bash
  npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
  ```
- [ ] Install core dependencies
  ```bash
  npm install jazz-tools jazz-react @scure/bip39
  npm install serwist @serwist/next
  npm install lucide-react
  npm install clsx tailwind-merge class-variance-authority
  npm install next-themes
  ```
- [ ] Initialize ShadCN UI
  ```bash
  npx shadcn@latest init
  # Select: New York style, Slate color, CSS variables: yes
  ```
- [ ] Add ShadCN components
  ```bash
  npx shadcn@latest add button card input textarea dialog alert-dialog scroll-area avatar dropdown-menu toast skeleton separator
  ```
- [ ] Configure dark mode as default in `tailwind.config.ts`
- [ ] Create PWA manifest in `src/app/manifest.ts`
- [ ] Configure Serwist in `next.config.ts`
- [ ] Create placeholder app icons (all sizes)
- [ ] Set up `worker/` folder structure
- [ ] Create `.env.example` with required variables
- [ ] Update `.gitignore` for Next.js + Worker

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

### Phase 2: Jazz Integration
**Goal**: Implement Jazz.tools with passphrase (BIP-39) authentication

**Tasks**:
- [ ] Create Jazz schema (`src/schema.ts`)
- [ ] Create JazzProvider wrapper component
  - Configure with passphrase authentication
  - Connect to `wss://cloud.jazz.tools`
  - Wrap app in `src/app/layout.tsx`
- [ ] Implement BIP-39 seed utilities
  - `generate.ts`: Generate 12-word mnemonic using @scure/bip39
  - `validate.ts`: Validate mnemonic is valid BIP-39
- [ ] Implement device ID utility
  - Generate UUID on first visit
  - Store in localStorage
  - Retrieve on subsequent visits
- [ ] Create custom Jazz hooks
  - `useChat`: Get chat room by ID
  - `useMessages`: Subscribe to messages with real-time updates

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

### Phase 3: Core Chat UI
**Goal**: Build the main chat interface

**Tasks**:
- [ ] Create landing page (`src/app/page.tsx`)
  - App title and brief description
  - "Create New Chat" button
  - "Join Existing Chat" section with seed input
  - Optional display name input
  - iOS PWA install instructions (if not installed)
- [ ] Create SeedGenerator component
  - Generate new 12-word seed
  - Display seed clearly (word by word or as text)
  - Copy to clipboard button
  - Warning about saving seed securely
- [ ] Create SeedInput component
  - Textarea for pasting seed
  - Real-time validation
  - Clear error messages for invalid seeds
- [ ] Create SeedDisplay component
  - Show seed with word numbering
  - Copy button with confirmation
- [ ] Create chat page (`src/app/chat/[roomId]/page.tsx`)
  - Get roomId from URL params
  - Initialize/join chat room with seed
  - Show ChatContainer
- [ ] Create ChatContainer component
  - Header with room info and settings
  - MessageList in scrollable area
  - MessageInput fixed at bottom
- [ ] Create MessageList component
  - Subscribe to messages via Jazz useCoState
  - Render MessageBubble for each message
  - Auto-scroll to bottom on new messages
  - Load previous messages (Jazz handles this)
- [ ] Create MessageBubble component
  - Different style for own vs others' messages
  - Show sender name (if set)
  - Show timestamp
  - Show status indicator (for own messages)
  - Show image thumbnail if present
- [ ] Create MessageInput component
  - Textarea for message text
  - Send button
  - Support Enter to send, Shift+Enter for newline
  - Paste detection for images
  - Image preview before sending

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

### Phase 4: Image Handling
**Goal**: Implement copy/paste images with Jazz media

**Tasks**:
- [ ] Create paste handler utility
  - Listen for paste events on document
  - Detect image types in clipboard
  - Extract image blob
- [ ] Create image upload utility
  - Use `createImage()` from `jazz-tools/media`
  - Configure max size (1920px)
  - Enable blur placeholder
- [ ] Create ImageThumbnail component
  - Show image in message bubble
  - Fixed max width/height
  - Click handler to open full size
- [ ] Create ImagePreview modal
  - Full-screen overlay
  - Show full-resolution image
  - Close on click outside or X button
  - Support pinch-to-zoom on mobile
- [ ] Integrate paste handler in MessageInput
  - Show image preview when pasted
  - Allow removing pasted image before send
  - Include image in message when sending
- [ ] Handle loading states
  - Show skeleton/blur while image loads
  - Progressive enhancement (low-res first)

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

### Phase 5: Message Status & Read Receipts
**Goal**: Track delivery and read status for messages

**Tasks**:
- [ ] Implement status update flow
  - **sent**: Set when message created locally
  - **delivered**: Set when Jazz confirms sync (use Jazz callbacks)
  - **read**: Set when another device views the message
- [ ] Create intersection observer hook
  - Detect when message enters viewport
  - Mark as read after visible for X ms
- [ ] Implement read receipt logic
  - On message visible, add deviceId to `readBy` array
  - Update status to "read" if not sender
  - Filter out own device from read indicators
- [ ] Create StatusIndicator component
  - Single check (✓): sent
  - Double check (✓✓): delivered
  - Blue double check (✓✓ blue): read by at least one other
- [ ] Update MessageBubble to show status
  - Only show on own messages
  - Position: bottom-right of bubble

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

### Phase 6: PWA & Service Worker
**Goal**: Complete PWA setup with offline support

**Tasks**:
- [ ] Create service worker (`src/app/sw.ts`)
  - Use Serwist for precaching
  - Configure runtime caching strategies
  - Add push event handler (for later)
  - Add notification click handler
- [ ] Create offline fallback page
  - Simple page showing offline status
  - Retry button
- [ ] Configure caching strategies
  - **App shell**: Precache (HTML, CSS, JS bundles)
  - **Static assets**: Cache-first
  - **Images**: Cache-first with network fallback
  - **API/Jazz**: Network-first (Jazz handles offline)
- [ ] Add PWA meta tags to layout
  - `apple-mobile-web-app-capable`
  - `apple-mobile-web-app-status-bar-style`
  - Theme color meta tag
  - Viewport configuration for mobile
- [ ] Create iOS install prompt component
  - Detect iOS Safari (not PWA)
  - Show instructions: "Tap Share → Add to Home Screen"
  - Dismissable, remember preference
- [ ] Test PWA installation
  - Chrome DevTools → Application → Manifest
  - Lighthouse PWA audit

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

### Phase 7: Cloudflare Worker (Push Backend)
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
- [ ] Initialize Cloudflare Worker project
  ```bash
  cd worker
  npm init -y
  npm install jazz-tools web-push
  npm install -D wrangler @cloudflare/workers-types typescript
  ```
- [ ] Generate VAPID keys
  ```bash
  npx web-push generate-vapid-keys
  ```
- [ ] Create wrangler.toml configuration
- [ ] Implement worker entry point
  - HTTP endpoint for health checks
  - WebSocket connection to Jazz
- [ ] Implement Jazz listener
  - Subscribe to all ChatRoom changes
  - Detect new messages
  - Get sender device ID
- [ ] Implement push notification sender
  - Read push subscriptions from ChatRoom
  - Filter out sender's subscription
  - Send Web Push to each remaining subscription
  - Handle expired/invalid subscriptions
- [ ] Configure secrets in Cloudflare
  ```bash
  npx wrangler secret put VAPID_PRIVATE_KEY
  npx wrangler secret put JAZZ_AUTH_SECRET
  ```
- [ ] Deploy worker
  ```bash
  npx wrangler deploy
  ```

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

### Phase 8: Push Notification Integration (PWA Side)
**Goal**: Connect PWA to Cloudflare Worker for push notifications

**Tasks**:
- [ ] Create push subscription utility
  - Request notification permission
  - Get push subscription from service worker
  - Send subscription to Jazz (store in ChatRoom)
- [ ] Create PushPrompt component
  - Show after first message received
  - Explain benefits of notifications
  - Handle iOS-specific messaging
  - Remember if user dismissed
- [ ] Detect iOS PWA status
  - Check if `navigator.standalone` is true
  - Show install instructions if not PWA
- [ ] Handle subscription in MessageInput
  - Prompt for push permission after first send
  - Or prompt in settings
- [ ] Store subscription in Jazz
  - Add to ChatRoom.pushSubscriptions
  - Include deviceId to filter self
- [ ] Update service worker for push
  - Handle push event (already in Phase 6)
  - Show notification with message preview
  - Open chat on click

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

### Phase 9: Desktop Tab Blinking
**Goal**: Alert users of new messages when tab is hidden

**Tasks**:
- [ ] Create tab visibility hook
  - Track document.visibilityState
  - Return isVisible boolean
- [ ] Create tab blink utility
  - Alternate title between original and "New message"
  - Include unread count: "(3) New message - Solo"
  - Stop when tab becomes visible
- [ ] Optional: favicon change
  - Swap to notification favicon when unread
  - Revert when read
- [ ] Integrate in ChatContainer
  - Track unread count
  - Start blinking when hidden + new message
  - Stop when visible

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

### Phase 10: Delete Functionality
**Goal**: Allow users to delete all messages

**Tasks**:
- [ ] Create SettingsMenu component
  - Dropdown in header
  - "Delete All Messages" option
  - Theme toggle (from Phase 11)
  - "Leave Chat" option
- [ ] Create delete confirmation dialog
  - AlertDialog from ShadCN
  - Clear warning about permanent deletion
  - Confirm/Cancel buttons
- [ ] Implement delete logic
  - Clear all items from Chat CoList
  - Jazz automatically syncs deletion
  - Update lastActivity timestamp
- [ ] Handle UI after delete
  - Show empty state
  - Allow sending new messages

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

### Phase 11: Theme & Polish
**Goal**: Final UI polish and theming

**Tasks**:
- [ ] Implement theme toggle
  - Use next-themes
  - Dark mode as default
  - Options: Light, Dark, System
  - Persist preference
- [ ] Add loading states
  - Skeleton for message list
  - Loading indicator for images
  - Connecting state for Jazz
- [ ] Implement smooth animations
  - Message send animation
  - Scroll to bottom smooth
  - Theme transition
- [ ] Add haptic feedback (iOS)
  - On message send (if supported)
- [ ] Cross-device testing
  - Test on iOS Safari
  - Test on Android Chrome
  - Test on Desktop browsers
  - Test PWA installation flow
- [ ] Performance optimization
  - Lazy load images
  - Virtual scrolling for long message lists (if needed)
  - Optimize re-renders

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
