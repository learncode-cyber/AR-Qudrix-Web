import { z } from "zod";

/**
 * A blank text input submits as "" (empty string), not `undefined` — plain
 * `.optional()` only skips validation for `undefined`, so a regex-validated
 * optional field would otherwise reject an intentionally-blank value. This
 * helper treats "" the same as "not provided" before the regex ever runs.
 */
function optionalPattern(pattern: RegExp, message: string) {
  return z.preprocess(
    (value) => (value === "" ? null : value),
    z.string().regex(pattern, message).nullable().optional()
  );
}

export const updateIntegrationSettingsSchema = z.object({
  metaPixelEnabled: z.boolean(),
  metaPixelId: optionalPattern(/^\d+$/, "Meta Pixel ID should be numeric, e.g. 1234567890123456"),
  // Server-side Meta Conversions API token — a secret. Optional even when
  // the pixel is enabled: without it, only client-side (browser) events
  // fire; with it, a matching server-side event is also sent for every
  // lead/registration, which is what recovers conversions lost to ad
  // blockers or iOS tracking restrictions.
  metaConversionsApiAccessToken: z.string().max(1000).optional().nullable(),

  googleAdsEnabled: z.boolean(),
  googleAdsId: optionalPattern(/^AW-\d+$/, "Google Ads ID should look like AW-1234567890"),
  googleAdsLeadConversionLabel: z.string().max(100).optional().nullable(),
  googleAdsRegistrationConversionLabel: z.string().max(100).optional().nullable(),
  // Google Ads API credentials for server-side click-conversion upload.
  // All optional: without them, only the client-side gtag conversion fires.
  googleAdsDeveloperToken: z.string().max(200).optional().nullable(),
  googleAdsOAuthClientId: z.string().max(300).optional().nullable(),
  googleAdsOAuthClientSecret: z.string().max(300).optional().nullable(),
  googleAdsOAuthRefreshToken: z.string().max(500).optional().nullable(),
  googleAdsLoginCustomerId: optionalPattern(
    /^\d{10}$/,
    "Customer ID should be exactly 10 digits, no dashes, e.g. 1234567890"
  ),
  googleAdsLeadConversionActionId: optionalPattern(/^\d+$/, "Numeric ID only"),
  googleAdsRegistrationConversionActionId: optionalPattern(/^\d+$/, "Numeric ID only"),
});

export type UpdateIntegrationSettingsInput = z.infer<typeof updateIntegrationSettingsSchema>;

/** Safe to send to the browser — no secrets, just IDs a page's own network tab would reveal anyway. */
export interface PublicIntegrationSettings {
  metaPixelId: string | null;
  googleAdsId: string | null;
  googleAdsLeadConversionLabel: string | null;
  googleAdsRegistrationConversionLabel: string | null;
}

/**
 * Full settings including secrets — used ONLY server-side (API route
 * handlers that call the Meta Conversions API / Google Ads API), and by
 * the admin form's initial data load (a Server Component). Never pass this
 * to a client component's props in a way that ends up serialized where it
 * shouldn't, or return it from a public-facing endpoint.
 */
export interface ServerTrackingCredentials {
  metaPixelId: string | null;
  metaConversionsApiAccessToken: string | null;
  googleAdsId: string | null;
  googleAdsLeadConversionLabel: string | null;
  googleAdsRegistrationConversionLabel: string | null;
  googleAdsDeveloperToken: string | null;
  googleAdsOAuthClientId: string | null;
  googleAdsOAuthClientSecret: string | null;
  googleAdsOAuthRefreshToken: string | null;
  googleAdsLoginCustomerId: string | null;
  googleAdsLeadConversionActionId: string | null;
  googleAdsRegistrationConversionActionId: string | null;
}
