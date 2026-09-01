import { NextResponse } from "next/server";
import { auth } from "@/lib/auth-edge";
import { ADMIN_BASE_PATH, IS_USING_DEFAULT_ADMIN_PATH } from "@/lib/admin-path";

const SUPPORTED_LOCALES = ["en", "ar"] as const;
const DEFAULT_LOCALE = "en";
const PUBLIC_PORTAL_PATHS = ["/portal/login", "/portal/register"];
const ADMIN_LOGIN_PATH = `${ADMIN_BASE_PATH}/login`;

function detectPreferredLocale(acceptLanguage: string): string {
  const preferred = acceptLanguage.split(",")[0]?.split("-")[0];
  return SUPPORTED_LOCALES.includes(preferred as never) ? preferred! : DEFAULT_LOCALE;
}

export default auth((request) => {
  const { pathname } = request.nextUrl;

  // The actual admin pages live in the app/admin/ folder on disk (Next.js
  // requires a literal folder name — it can't be driven by an env var).
  // When a custom ADMIN_PATH_SEGMENT is configured, the literal "/admin"
  // path must NOT work at all — otherwise anyone could bypass the custom
  // path just by guessing "/admin", defeating the entire point.
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (!IS_USING_DEFAULT_ADMIN_PATH) {
      // Route to a path with no matching page anywhere in the app, so
      // Next.js renders its normal not-found page — indistinguishable
      // from any other invalid URL on the site. Never reveal that an
      // admin panel exists at all via this literal path.
      return NextResponse.rewrite(new URL("/__no_such_route__", request.url));
    }
    // No custom segment configured — "/admin" IS the real path, handled
    // exactly like any other configured segment below.
  }

  if (pathname === ADMIN_BASE_PATH || pathname.startsWith(`${ADMIN_BASE_PATH}/`)) {
    const isPublicAdminPath = pathname === ADMIN_LOGIN_PATH || pathname.startsWith(`${ADMIN_LOGIN_PATH}/`);

    if (!isPublicAdminPath && !request.auth) {
      const loginUrl = new URL(ADMIN_LOGIN_PATH, request.nextUrl.origin);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Role-level gating (only EMPLOYEE+ may proceed past login) happens in
    // app/admin/(dashboard)/layout.tsx, which has access to the full
    // session including `role` — middleware here only checks "is there any
    // valid session at all" using the Edge-safe JWT check.

    const response = IS_USING_DEFAULT_ADMIN_PATH
      ? NextResponse.next()
      : // Internally rewrite the custom path to the real "/admin" folder
        // Next.js actually renders from. The browser's address bar keeps
        // showing the custom path — this is invisible to the visitor.
        NextResponse.rewrite(new URL("/admin" + pathname.slice(ADMIN_BASE_PATH.length), request.url));

    // Set explicitly here rather than relying solely on next.config.js's
    // headers() matching against the post-rewrite path — this guarantees
    // the admin panel is never indexed or frame-embeddable regardless of
    // which path it's currently configured to live at.
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    response.headers.set("X-Frame-Options", "DENY");
    return response;
  }

  const pathnameHasLocale = SUPPORTED_LOCALES.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (!pathnameHasLocale) {
    const locale = detectPreferredLocale(request.headers.get("accept-language") ?? "");
    return NextResponse.redirect(new URL(`/${locale}${pathname}`, request.url));
  }

  // Strip the locale prefix to check the underlying route.
  const pathWithoutLocale = "/" + pathname.split("/").slice(2).join("/");
  const isPortalRoute = pathWithoutLocale.startsWith("/portal");
  const isPublicPortalPath = PUBLIC_PORTAL_PATHS.some((path) => pathWithoutLocale.startsWith(path));

  if (isPortalRoute && !isPublicPortalPath && !request.auth) {
    const locale = pathname.split("/")[1];
    const loginUrl = new URL(`/${locale}/portal/login`, request.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next|api|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)"],
};
