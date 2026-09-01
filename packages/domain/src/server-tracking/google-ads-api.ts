const GOOGLE_ADS_API_VERSION = "v17";

/**
 * Exchanges a long-lived OAuth refresh token for a short-lived access
 * token. The refresh token itself is generated once, manually, via
 * Google's OAuth Playground during setup (see the deployment guide) — this
 * function is what lets the server mint a fresh access token on every
 * request without that manual step ever repeating.
 */
async function getGoogleAdsAccessToken(params: {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
}): Promise<string | null> {
  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: params.clientId,
        client_secret: params.clientSecret,
        refresh_token: params.refreshToken,
        grant_type: "refresh_token",
      }),
    });

    if (!response.ok) {
      console.error("[google-ads-api] Failed to refresh access token:", await response.text());
      return null;
    }

    const data = (await response.json()) as { access_token?: string };
    return data.access_token ?? null;
  } catch (error) {
    console.error("[google-ads-api] Unexpected error refreshing access token:", error);
    return null;
  }
}

/**
 * Uploads one click conversion to Google Ads, server-side, attributed by
 * GCLID (Google Click ID — captured client-side from the `?gclid=` URL
 * parameter when a visitor arrives from a Google Ads click; see
 * apps/web/lib/analytics/gclid.ts).
 *
 * This is the "Enhanced Conversions" / offline-conversion-import pattern
 * Google recommends for lead-gen sites: the actual conversion (a form
 * submission) happens after the ad click, often minutes or days later, so
 * it can't be captured by a client-side pixel alone — it has to be
 * uploaded afterward, tied back to the original click via GCLID.
 *
 * No-ops (and logs a warning) if `gclid` is missing — most real-world
 * traffic won't have one (organic, direct, or non-Google-Ads sources), so
 * this is an expected, non-error outcome, not a failure.
 *
 * Never throws — a tracking failure must never break the user-facing
 * request that triggered it.
 */
export async function uploadGoogleAdsClickConversion(params: {
  gclid: string | null;
  customerId: string; // digits only, no dashes
  loginCustomerId: string | null; // digits only; omit if same as customerId (no MCC involved)
  conversionActionId: string;
  developerToken: string;
  oauthClientId: string;
  oauthClientSecret: string;
  oauthRefreshToken: string;
}): Promise<void> {
  const { gclid, customerId, loginCustomerId, conversionActionId, developerToken, oauthClientId, oauthClientSecret, oauthRefreshToken } = params;

  if (!gclid) {
    console.warn("[google-ads-api] No GCLID present — skipping server-side conversion upload (expected for non-Google-Ads traffic).");
    return;
  }

  const accessToken = await getGoogleAdsAccessToken({
    clientId: oauthClientId,
    clientSecret: oauthClientSecret,
    refreshToken: oauthRefreshToken,
  });

  if (!accessToken) return; // already logged in getGoogleAdsAccessToken

  try {
    const conversionDateTime = formatGoogleAdsDateTime(new Date());

    const response = await fetch(
      `https://googleads.googleapis.com/${GOOGLE_ADS_API_VERSION}/customers/${customerId}:uploadClickConversions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          "developer-token": developerToken,
          ...(loginCustomerId ? { "login-customer-id": loginCustomerId } : {}),
        },
        body: JSON.stringify({
          conversions: [
            {
              gclid,
              conversionAction: `customers/${customerId}/conversionActions/${conversionActionId}`,
              conversionDateTime,
            },
          ],
          partialFailure: true,
        }),
      }
    );

    if (!response.ok) {
      console.error(`[google-ads-api] Upload failed (${response.status}):`, await response.text());
      return;
    }

    const result = await response.json();
    if (result.partialFailureError) {
      console.error("[google-ads-api] Partial failure:", JSON.stringify(result.partialFailureError));
    }
  } catch (error) {
    console.error("[google-ads-api] Unexpected error uploading conversion:", error);
  }
}

/** Google Ads API expects "YYYY-MM-DD HH:MM:SS+00:00" (UTC). */
function formatGoogleAdsDateTime(date: Date): string {
  const iso = date.toISOString(); // e.g. 2026-08-03T14:22:01.000Z
  const [datePart, timePart] = iso.split("T");
  const time = timePart.split(".")[0];
  return `${datePart} ${time}+00:00`;
}
