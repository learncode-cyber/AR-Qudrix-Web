/**
 * The admin panel's base path, driven entirely by ADMIN_PATH_SEGMENT.
 *
 * Why this exists: hardcoding "/admin" everywhere makes the admin panel's
 * location guessable by anyone (bots constantly probe /admin, /wp-admin,
 * etc.). Setting NEXT_PUBLIC_ADMIN_PATH_SEGMENT to a private value you
 * choose (e.g. "control-x9k2") moves the entire panel to that path
 * instead — and middleware.ts rejects any direct request to the literal
 * "/admin" path when a custom segment is configured, so the real word
 * "admin" simply doesn't work as a URL at all.
 *
 * This value is intentionally NEXT_PUBLIC_-prefixed (inlined into the
 * client bundle at build time) because client components — the business
 * table, the login form, etc. — need to build the same links a Server
 * Component would. It is not a secret in the cryptographic sense (anyone
 * who loads the admin panel can see it in the URL bar and page source
 * anyway); it is obscurity, not authentication — every admin route is
 * still fully protected by session + role checks regardless of its path.
 *
 * IMPORTANT: because this is a NEXT_PUBLIC_ variable, changing it requires
 * a rebuild + redeploy (Next.js inlines these at build time, not runtime)
 * — see the deployment guide for how to change it "any time" in practice.
 */

const rawSegment = process.env.NEXT_PUBLIC_ADMIN_PATH_SEGMENT?.trim();

// Strip any leading/trailing slashes the operator might have accidentally
// included when setting the env var, so "/admin/" and "admin" and "/admin"
// all normalize to the same thing.
const normalizedSegment = rawSegment ? rawSegment.replace(/^\/+|\/+$/g, "") : "admin";

/** e.g. "/admin" or "/control-x9k2" — never has a trailing slash. */
export const ADMIN_BASE_PATH = `/${normalizedSegment}`;

/** True only when no custom segment has been configured — used by middleware to decide whether to block the literal /admin path. */
export const IS_USING_DEFAULT_ADMIN_PATH = normalizedSegment === "admin";

/**
 * Builds a full admin URL path. `subpath` should start with "/" (or be
 * omitted for the admin root), e.g. adminPath("/businesses") -> "/admin/businesses".
 */
export function adminPath(subpath: string = ""): string {
  if (!subpath) return ADMIN_BASE_PATH;
  const cleaned = subpath.startsWith("/") ? subpath : `/${subpath}`;
  return `${ADMIN_BASE_PATH}${cleaned}`;
}
