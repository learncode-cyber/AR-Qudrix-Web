import { createHash } from "node:crypto";

const META_GRAPH_API_VERSION = "v21.0";

export interface MetaUserData {
  email?: string;
  phone?: string;
  clientIpAddress?: string;
  clientUserAgent?: string;
}

function sha256Lowercase(value: string): string {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

/**
 * Sends one event to the Meta Conversions API (server-side). This runs
 * alongside the browser-side Pixel event (fired from
 * apps/web/lib/analytics/meta-pixel.ts) — Meta deduplicates the two by
 * event name + time window, so sending both is the recommended pattern,
 * not redundant: the server-side copy survives ad blockers, Safari ITP,
 * and browser extensions that kill the client-side pixel.
 *
 * Never throws — a tracking failure must never break the user-facing
 * request (lead submission, registration) that triggered it. Errors are
 * logged and swallowed.
 */
export async function sendMetaServerEvent(params: {
  pixelId: string;
  accessToken: string;
  eventName: "Lead" | "CompleteRegistration";
  eventSourceUrl: string;
  userData: MetaUserData;
}): Promise<void> {
  const { pixelId, accessToken, eventName, eventSourceUrl, userData } = params;

  try {
    const body = {
      data: [
        {
          event_name: eventName,
          event_time: Math.floor(Date.now() / 1000),
          action_source: "website",
          event_source_url: eventSourceUrl,
          user_data: {
            ...(userData.email ? { em: [sha256Lowercase(userData.email)] } : {}),
            ...(userData.phone ? { ph: [sha256Lowercase(userData.phone.replace(/\D/g, ""))] } : {}),
            ...(userData.clientIpAddress ? { client_ip_address: userData.clientIpAddress } : {}),
            ...(userData.clientUserAgent ? { client_user_agent: userData.clientUserAgent } : {}),
          },
        },
      ],
    };

    const response = await fetch(
      `https://graph.facebook.com/${META_GRAPH_API_VERSION}/${pixelId}/events?access_token=${encodeURIComponent(accessToken)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[meta-conversions-api] Request failed (${response.status}):`, errorBody);
    }
  } catch (error) {
    console.error("[meta-conversions-api] Unexpected error:", error);
  }
}
