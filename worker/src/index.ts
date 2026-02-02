import type { Env } from "./types";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Health check endpoint
    if (url.pathname === "/health") {
      return new Response(JSON.stringify({ status: "ok" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // VAPID public key endpoint (for PWA to fetch)
    if (url.pathname === "/vapid-public-key") {
      return new Response(JSON.stringify({ key: env.VAPID_PUBLIC_KEY }), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    // Push notification trigger endpoint (for testing)
    if (url.pathname === "/trigger-push" && request.method === "POST") {
      // This would be called by Jazz webhook or internal trigger
      const body = await request.json() as {
        subscriptions: Array<{ endpoint: string; keys: { p256dh: string; auth: string } }>;
        message: { title: string; body: string; url?: string };
      };
      
      // In production, you would:
      // 1. Validate the request
      // 2. Send push to all subscriptions
      // 3. Return success/failure counts
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: "Push notifications queued" 
      }), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    return new Response("Solo Push Worker", {
      headers: { "Content-Type": "text/plain" },
    });
  },
};
