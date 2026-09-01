/** @type {import('next').NextConfig} */
const path = require("path");

const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  transpilePackages: ["@arqudrix/ui", "@arqudrix/domain", "@arqudrix/db", "@arqudrix/auth"],

  // CRITICAL for this monorepo: without this, Next.js's file tracer (which
  // powers `output: "standalone"`) can mis-detect the workspace root and
  // silently fail to bundle the @arqudrix/* packages (db, auth, domain,
  // ui) into .next/standalone — they exist as symlinks in local
  // node_modules (npm workspaces), and the tracer needs to know the true
  // monorepo root to resolve and copy their real files into the
  // self-contained standalone build. Omitting this is the single most
  // common cause of a standalone build that installs/builds "successfully"
  // but crashes immediately at runtime with
  // "Error: Cannot find module '@arqudrix/db'" (or similar) once deployed.
  outputFileTracingRoot: path.join(__dirname, "../../"),

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.arqudrix.com" },
      { protocol: "https", hostname: "**.r2.dev" },
    ],
  },

  async headers() {
    const isDevelopment = process.env.NODE_ENV === "development";

    // In development, allow 'unsafe-eval' so Next.js Fast Refresh (HMR) can
    // inject and evaluate code without CSP violations. In production, this
    // directive is omitted for security.
    const scriptSrc = isDevelopment
      ? "'self' 'unsafe-inline' 'unsafe-eval' https://connect.facebook.net https://www.googletagmanager.com https://www.google-analytics.com https://googleads.g.doubleclick.net"
      : "'self' 'unsafe-inline' https://connect.facebook.net https://www.googletagmanager.com https://www.google-analytics.com https://googleads.g.doubleclick.net";

    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "img-src 'self' https: data:",
              `script-src ${scriptSrc}`,
              "connect-src 'self' https://www.facebook.com https://connect.facebook.net https://www.google-analytics.com https://analytics.google.com https://googleads.g.doubleclick.net https://www.googletagmanager.com",
              "frame-src https://www.googletagmanager.com https://td.doubleclick.net",
              "style-src 'self' 'unsafe-inline'",
            ].join("; "),
          },
        ],
      },
      {
        // The admin panel is a single Node.js app deployment sharing this
        // same Next.js project (see README "Single-app deployment") — it
        // must never be indexed and should not be frame-embeddable, even
        // though it doesn't live on its own subdomain.
        source: "/admin/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
    ];
  },

  async redirects() {
    return [{ source: "/", destination: "/en", permanent: false }];
  },
};

module.exports = nextConfig;
