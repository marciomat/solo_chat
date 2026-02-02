import type { Env } from "./types";

// Jazz listener for watching chat room changes
// This would connect to Jazz cloud and watch for new messages

export class JazzListener {
  private env: Env;
  private ws: WebSocket | null = null;

  constructor(env: Env) {
    this.env = env;
  }

  async connect(): Promise<void> {
    // In a full implementation, this would:
    // 1. Authenticate with Jazz using bot credentials
    // 2. Subscribe to chat room changes
    // 3. Trigger push notifications when new messages arrive
    
    console.log("Jazz listener would connect to:", this.env.JAZZ_PEER);
  }

  async disconnect(): Promise<void> {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export function startJazzListener(env: Env): JazzListener {
  const listener = new JazzListener(env);
  listener.connect();
  return listener;
}
