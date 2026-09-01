const GCLID_COOKIE_NAME = "arqudrix_gclid";
const GCLID_COOKIE_MAX_AGE_DAYS = 90; // Google's own attribution window default

/**
 * Captures `?gclid=` from the current URL (present when a visitor arrives
 * via a Google Ads click) and stores it in a first-party cookie. Call this
 * once per page load — see components/analytics-scripts.tsx.
 *
 * The conversion (a form submission) usually happens on a different page,
 * possibly a different visit, from the ad click — so the GCLID has to be
 * captured on arrival and carried forward until the visitor actually
 * converts. This is exactly what Google's own gtag.js does internally for
 * client-side conversions; this cookie makes the same value available to
 * our server-side upload path (apps/web/lib/analytics does not have
 * access to Google's internal cookie).
 */
export function captureGclidFromUrl(): void {
  if (typeof window === "undefined") return;

  const params = new URLSearchParams(window.location.search);
  const gclid = params.get("gclid");
  if (!gclid) return;

  const maxAgeSeconds = GCLID_COOKIE_MAX_AGE_DAYS * 24 * 60 * 60;
  document.cookie = `${GCLID_COOKIE_NAME}=${encodeURIComponent(gclid)}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`;
}

export function getStoredGclid(): string | null {
  if (typeof document === "undefined") return null;

  const match = document.cookie.match(new RegExp(`(?:^|; )${GCLID_COOKIE_NAME}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}
