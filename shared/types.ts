// Shared types between PWA and Worker

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  deviceId: string;
  createdAt: number;
}

export interface PushPayload {
  title: string;
  body: string;
  tag?: string;
  url?: string;
}

export interface MessageData {
  id: string;
  text: string;
  senderId: string;
  senderName?: string;
  timestamp: number;
  hasImage: boolean;
}
