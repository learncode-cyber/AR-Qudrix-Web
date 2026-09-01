import { settingsService } from "../settings/service";
import { sendMetaServerEvent } from "./meta-conversions-api";
import { uploadGoogleAdsClickConversion } from "./google-ads-api";

interface ConversionContext {
  email: string;
  phone?: string;
  eventSourceUrl: string;
  clientIpAddress?: string;
  clientUserAgent?: string;
  gclid?: string | null;
}

/**
 * Fires server-side conversion events on both Meta and Google Ads, for
 * whichever platforms are enabled and fully configured for server-side
 * tracking. Safe to call unconditionally from a route handler after a
 * successful lead/registration write — every credential is checked before
 * use, and nothing here ever throws, so a tracking outage can never turn
 * into a 500 for the actual user-facing request.
 *
 * Call this AFTER responding to the client is not required — awaiting it
 * inline is fine on Hostinger's persistent Node.js process (unlike
 * serverless platforms, the process won't be frozen/killed the instant the
 * HTTP response is sent).
 */
async function trackServerSideConversion(
  kind: "lead" | "registration",
  context: ConversionContext
): Promise<void> {
  const credentials = await settingsService.getServerTrackingCredentials();

  const tasks: Promise<void>[] = [];

  if (credentials.metaPixelId && credentials.metaConversionsApiAccessToken) {
    tasks.push(
      sendMetaServerEvent({
        pixelId: credentials.metaPixelId,
        accessToken: credentials.metaConversionsApiAccessToken,
        eventName: kind === "lead" ? "Lead" : "CompleteRegistration",
        eventSourceUrl: context.eventSourceUrl,
        userData: {
          email: context.email,
          phone: context.phone,
          clientIpAddress: context.clientIpAddress,
          clientUserAgent: context.clientUserAgent,
        },
      })
    );
  }

  const conversionActionId =
    kind === "lead" ? credentials.googleAdsLeadConversionActionId : credentials.googleAdsRegistrationConversionActionId;

  if (
    credentials.googleAdsId &&
    credentials.googleAdsDeveloperToken &&
    credentials.googleAdsOAuthClientId &&
    credentials.googleAdsOAuthClientSecret &&
    credentials.googleAdsOAuthRefreshToken &&
    conversionActionId &&
    context.gclid
  ) {
    // googleAdsId is "AW-1234567890" — the Ads API needs the bare customer
    // ID (digits only) instead.
    const customerId = credentials.googleAdsId.replace(/^AW-/, "");

    tasks.push(
      uploadGoogleAdsClickConversion({
        gclid: context.gclid,
        customerId,
        loginCustomerId: credentials.googleAdsLoginCustomerId,
        conversionActionId,
        developerToken: credentials.googleAdsDeveloperToken,
        oauthClientId: credentials.googleAdsOAuthClientId,
        oauthClientSecret: credentials.googleAdsOAuthClientSecret,
        oauthRefreshToken: credentials.googleAdsOAuthRefreshToken,
      })
    );
  }

  await Promise.allSettled(tasks);
}

export async function trackServerLeadConversion(context: ConversionContext): Promise<void> {
  return trackServerSideConversion("lead", context);
}

export async function trackServerRegistrationConversion(context: ConversionContext): Promise<void> {
  return trackServerSideConversion("registration", context);
}
