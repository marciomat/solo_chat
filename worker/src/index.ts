import type { Env, PushSubscriptionData, PushPayload } from "./types";
import { sendPushToAll } from "./push";

interface TriggerPushRequest {
  subscriptions: PushSubscriptionData[];
  message: PushPayload;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // CORS headers for all responses
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // Health check endpoint
    if (url.pathname === "/health") {
      return new Response(JSON.stringify({ status: "ok", version: "1.0.0" }), {
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // VAPID public key endpoint (for PWA to fetch)
    if (url.pathname === "/vapid-public-key") {
      if (!env.VAPID_PUBLIC_KEY) {
        return new Response(
          JSON.stringify({ error: "VAPID not configured" }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
      return new Response(JSON.stringify({ key: env.VAPID_PUBLIC_KEY }), {
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Push notification trigger endpoint
    if (url.pathname === "/trigger-push" && request.method === "POST") {
      // Validate VAPID keys are configured
      if (!env.VAPID_PUBLIC_KEY || !env.VAPID_PRIVATE_KEY) {
        return new Response(
          JSON.stringify({ error: "VAPID keys not configured" }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      try {
        const body = await request.json() as TriggerPushRequest;

        // Validate request
        if (!body.subscriptions || !Array.isArray(body.subscriptions)) {
          return new Response(
            JSON.stringify({ error: "subscriptions array required" }),
            { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }

        if (!body.message || !body.message.title) {
          return new Response(
            JSON.stringify({ error: "message with title required" }),
            { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }

        // Filter out invalid subscriptions
        const validSubscriptions = body.subscriptions.filter(
          (sub) => sub.endpoint && sub.keys?.p256dh && sub.keys?.auth
        );

        if (validSubscriptions.length === 0) {
          return new Response(
            JSON.stringify({ success: true, message: "No valid subscriptions to notify" }),
            { headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }

        // Send push notifications
        const result = await sendPushToAll(
          validSubscriptions,
          body.message,
          env.VAPID_PUBLIC_KEY,
          env.VAPID_PRIVATE_KEY
        );

        return new Response(
          JSON.stringify({
            success: true,
            sent: result.successCount,
            failed: result.failureCount,
            expiredEndpoints: result.expiredSubscriptions,
          }),
          { headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error("Trigger push error:", errorMessage);

        return new Response(
          JSON.stringify({ error: errorMessage }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    // Default response
    return new Response("Solo Push Worker", {
      headers: { "Content-Type": "text/plain", ...corsHeaders },
    });
  },
};
