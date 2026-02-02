import { co, z, Group } from "jazz-tools";

// ============================================
// MESSAGE
// Represents a single chat message
// ============================================

// List of device IDs that have read a message
export const ReadByList = co.list(z.string());
export type ReadByList = co.loaded<typeof ReadByList>;

export const Message = co.map({
  // Message content (required, can be empty string if only image)
  text: z.string(),

  // Optional attached image (uses jazz-tools/media)
  image: co.image().optional(),

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
  readBy: ReadByList.optional(),
});
export type Message = co.loaded<typeof Message>;

// ============================================
// CHAT
// Ordered list of messages (CoList for CRDT ordering)
// ============================================
export const Chat = co.list(Message);
export type Chat = co.loaded<typeof Chat>;

// Alias for clarity
export const MessageList = Chat;
export type MessageList = Chat;

// ============================================
// PUSH SUBSCRIPTION
// Web Push subscription data for a device
// ============================================
export const PushSubscriptionKeys = co.map({
  p256dh: z.string(),
  auth: z.string(),
});
export type PushSubscriptionKeys = co.loaded<typeof PushSubscriptionKeys>;

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
export type PushSubscription = co.loaded<typeof PushSubscription>;

export const ChatRoomSubscriptions = co.list(PushSubscription);
export type ChatRoomSubscriptions = co.loaded<typeof ChatRoomSubscriptions>;

// List of participant device IDs
export const ParticipantsList = co.list(z.string());
export type ParticipantsList = co.loaded<typeof ParticipantsList>;

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
  participants: ParticipantsList,

  // Push subscriptions for this chat room
  pushSubscriptions: ChatRoomSubscriptions,
});
export type ChatRoom = co.loaded<typeof ChatRoom>;

// Note: We use the default Jazz Account instead of a custom account schema
// because our seed-based room sharing doesn't require same-account-across-devices.
// Instead, we derive a deterministic room ID from the seed phrase and store it locally.
// All devices with the same seed can access the same public room.
