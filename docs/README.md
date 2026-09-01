# AR Qudrix Platform — Monorepo

Production-grade corporate web application + client portal + admin control panel for AR Qudrix, architected as an ARQ OS–integrated system.

## Structure

```
apps/
  web/      → Single Next.js 15 app serving everything (see "Single-app deployment" below):
              - Public corporate site, locale-prefixed  /en/*  /ar/*
              - Client portal                            /en/portal/*  /ar/portal/*
              - Admin control panel                       /admin/*  (not locale-prefixed)
packages/
  db/       → Prisma schema + client (PostgreSQL)
  auth/     → Auth.js config (edge + full) + RBAC permission matrix
  domain/   → DDD application/service layer (Business, Lead, Content, User, Settings, Inquiry, Audit domains)
  ui/       → Shared shadcn/ui component library (49 components)
```

## Single-app deployment

Originally this was two separate Next.js apps (`apps/web` for the public site, `apps/admin` on its own subdomain) — the cleaner architecture, giving cookie isolation between the public site and the admin panel. It was merged into one app because the target Hostinger plan only provisions **one** Node.js Web App slot.

**What changed in the merge:**
- Admin pages moved from a separate app into `apps/web/app/admin/**`, with their own root layout (`app/admin/layout.tsx`) since `/admin` sits outside the locale-prefixed `[locale]` tree.
- Admin API routes moved into `apps/web/app/api/v1/**`, merged with the public API where paths overlapped (e.g. `POST /api/v1/leads` is the public contact-form submit; `GET /api/v1/leads` on the *same file* is the admin listing — Next.js Route Handlers can export multiple HTTP methods per file with independent auth per method).
- `middleware.ts` now branches on `/admin` vs locale-prefixed paths in one file.
- **Trade-off accepted:** the admin panel and public/portal site now share one cookie domain. Every mutation is still enforced by RBAC at the domain-service layer (`assertPermission()` in `packages/auth/src/rbac.ts`), and `app/admin/(dashboard)/layout.tsx` adds an explicit role gate (`ADMIN_SURFACE_ROLES`) so a non-staff session is redirected before it ever reaches an admin page. `/admin` is also `noindex`'d and sends `X-Frame-Options: DENY`.

**If you later get a second app slot** (or move to a VPS/Cloud plan), splitting `app/admin` back into its own Next.js app + subdomain is straightforward: move `app/admin/**` and the matching `api/v1/**` handlers into a new `apps/admin`, point it at `admin.arqudrix.com`, and remove the `/admin` branch from `apps/web/middleware.ts`. Nothing in `packages/*` needs to change — that's the whole point of keeping the domain/auth/db logic in shared packages instead of inside the app.

## What's implemented so far

- **Business Registry** — admin-managed "products as cards" (`/businesses` grid → `/businesses/[slug]` landing page), full CRUD + status workflow (ACTIVE/IN_DEVELOPMENT/PLANNED/ARCHIVED), audit-logged.
- **Blog / Content** — admin-managed posts (`/blog` listing → `/blog/[slug]`), Article JSON-LD, EN/AR per-post translations, DRAFT→PUBLISHED workflow.
- **Lead capture** — public contact form → `Lead` table, honeypot + IP-hash rate limiting; admin `/admin/leads` manages the full pipeline (NEW → CONTACTED → QUALIFIED → CONVERTED / ARCHIVED / SPAM), ready for future ARQ OS CRM sync.
- **Audit Logs** — `/admin/audit-logs`, filterable by entity type and action, read-only and immutable by design.
- **RBAC** — 10-role matrix, admin panel gated to EMPLOYEE and above (see "Single-app deployment" for how this is enforced without a separate cookie domain).
- **User management** — SUPER_ADMIN can change any user's role or suspend/reactivate their account (`/admin/users`); self-lockout is blocked at the service layer.
- **Client Portal** (`/[locale]/portal/*`) — self-registration (always CUSTOMER role; elevation to CLIENT/PARTNER/SUPPLIER/INVESTOR is admin-only), login, dashboard, inquiries, profile with self-service password change.
- **Static/company pages** — `/about`, `/careers`, `/partners`, `/investors`, `/privacy`, `/terms`, all EN/AR, linked from the footer.
- **Meta Pixel + Google Ads** — configured live from `/admin/integrations`, consent-gated, fires Lead / CompleteRegistration conversion events automatically.
- **i18n** — locale-prefixed routing (`/en`, `/ar`), RTL layout switching, Navbar language toggle.
- **SEO** — dynamic `sitemap.xml` (businesses + blog posts, both locales), `robots.txt` (disallows `/admin/`), Organization/Article/Product JSON-LD.

## Advertising & analytics (Meta Pixel + Google Ads)

Both are **configured entirely from `/admin/integrations`** (SUPER_ADMIN to edit) — not from `.env`. Marketing can turn a pixel on/off or rotate an ID with zero code changes and zero redeploy. Settings live in the `IntegrationSettings` table (`packages/domain/src/settings`) and are fetched server-side on every page load.

They are also **off by default and consent-gated**: even with a pixel ID configured and enabled, nothing loads in the browser until the visitor clicks "Accept" on the cookie banner (`components/cookie-consent-banner.tsx`) — required for GDPR/consent-mode compliance and what the Privacy Policy page promises.

**Client-side + server-side tracking, both supported:**
- Client-side (browser Pixel / gtag) needs only the Pixel ID and Google Ads Tag ID + conversion labels — this is enough for most setups.
- Server-side (Meta Conversions API + Google Ads click-conversion upload via GCLID) is additionally available for better accuracy against ad blockers and multi-day conversion delays. This needs a few more credentials with a real setup process — **see [`SERVER_SIDE_TRACKING.md`](./SERVER_SIDE_TRACKING.md) for the full step-by-step**, including how to generate a Meta Conversions API token and how to complete Google's OAuth flow for the Ads API (Developer Token application, OAuth Client, Refresh Token via OAuth Playground, and where to find Conversion Action IDs).

**Setup:**
1. Sign in at `/admin/login` as a SUPER_ADMIN and go to **Integrations**.
2. Paste in your Meta Pixel ID and Google Ads Tag ID + conversion labels, enable both, save — this alone gives you full client-side tracking.
3. Optionally follow `SERVER_SIDE_TRACKING.md` to also fill in the server-side fields.

**How it works:**
- `packages/domain/src/settings/service.ts` — `getPublicSettings()` (no secrets, safe for the browser) vs. `getServerTrackingCredentials()` (secrets, server-only — used by route handlers, never sent to the client).
- `packages/domain/src/server-tracking/` — `meta-conversions-api.ts` and `google-ads-api.ts` do the actual HTTP calls; `service.ts` is the single facade (`trackServerLeadConversion`, `trackServerRegistrationConversion`) wired into `POST /api/v1/leads` and `POST /api/v1/register`. Every call is wrapped so a tracking-platform outage never turns into a failed lead/registration.
- `apps/web/lib/analytics/gclid.ts` captures `?gclid=` from the landing URL into a first-party cookie (90-day window) so it's still available when the visitor converts, possibly days later and on a different page.
- `apps/web/app/[locale]/layout.tsx` fetches public settings server-side and passes them into `<AnalyticsScripts>` as props.
- `lib/analytics/consent.ts` is the single source of truth for consent state (localStorage-backed).
- `lib/analytics/state.ts` holds the current public settings for client-side code (contact form, registration form) to read without prop-drilling.
- `lib/analytics/track.ts` exposes the client-side `trackLeadConversion()` / `trackRegistrationConversion()` — already wired in.
- `next.config.js` CSP headers explicitly allowlist `connect.facebook.net`, `googletagmanager.com`, etc. — extend that list if you add another platform later.

## Architecture note: client/server import boundaries in the shared packages

`packages/domain` and `packages/db` each have TWO entry points, and mixing them up breaks the build. This bit us once already (a `"use client"` form importing a Zod schema from the main `@arqudrix/domain` entry pulled in `node:crypto` via a sibling service file and crashed the browser bundle) — the fix is structural, not a one-off patch, so it's documented here to prevent it happening again as new domains are added:

| Import from... | Contains | Safe in `"use client"` components? |
|---|---|---|
| `@arqudrix/domain` | Everything — DTOs, repositories, `*Service` classes (Prisma, `node:crypto`, etc.) | ❌ No — server-only (Route Handlers, Server Components) |
| `@arqudrix/domain/schemas` | ONLY the pure Zod DTOs (`create*Schema`, `update*Schema`, their inferred types) | ✅ Yes |
| `@arqudrix/db` | Everything — the live Prisma Client singleton, generated types/enums | ❌ No for **value** imports (e.g. `Object.values(SomeEnum)`) — ✅ yes for **type-only** imports (`import type { Business }`), which the compiler fully erases regardless of the module's contents |
| `@arqudrix/db/client-enums` | Hand-mirrored, dependency-free copies of the Prisma enums | ✅ Yes — use this for any enum needed as a runtime **value** (dropdown options, `z.nativeEnum(...)`, etc.) in client code |
| `@arqudrix/auth` | Everything, including `authConfig` (Prisma adapter + bcrypt) | ❌ No in `middleware.ts` (Edge runtime) |
| `@arqudrix/auth/edge-config` | ONLY `edgeAuthConfig` — no providers, no bcrypt, no Prisma adapter | ✅ Yes — this is what `middleware.ts` must use |

**When adding a new domain** (its own `dto.ts` + `service.ts` under `packages/domain/src/<name>/`): keep `dto.ts` free of any import that isn't `zod` or `@arqudrix/db/client-enums`, then add `export * from "./<name>/dto"` to both `packages/domain/src/index.ts` (server barrel) and `packages/domain/src/schemas.ts` (client barrel) — never add it only to the server barrel if a client form will need that schema too.

## Architecture note: Edge vs. Node.js Auth.js config

Next.js middleware runs on the Edge runtime by default, which cannot execute Node.js-only code (bcrypt's native bindings, Prisma's TCP driver). `packages/auth` is therefore split in two:

- `edge-config.ts` — session/JWT callbacks only, no providers. Used by `apps/web/lib/auth-edge.ts`, which `middleware.ts` imports.
- `config.ts` — extends the edge config with the Prisma adapter and Credentials provider (bcrypt included). Used by `apps/web/lib/auth.ts`, which every Route Handler, Server Component, and the admin dashboard layout imports.

**Do not import `@/lib/auth` (full config) inside `middleware.ts`** — it will fail on the Edge runtime. Always use `@/lib/auth-edge` there.

## Prerequisites

- Node.js ≥ 20
- A PostgreSQL database (Neon recommended — see "Database" below)

## Local Setup

```bash
npm install
cp .env.example .env   # fill in DATABASE_URL, AUTH_SECRET, etc.
npm run db:generate
npm run db:migrate
npm run dev             # runs the single app on :3000 — public site, portal, and /admin all together
```

## Database — why Neon (external) instead of a local/Hostinger DB

Hostinger's Business and Cloud hosting plans do **not** offer native PostgreSQL — only MySQL. PostgreSQL requires a VPS plan there. To keep Row-Level Security–ready multi-tenant isolation and avoid a MySQL rewrite, this project uses an **external managed Postgres provider (Neon)**, reached over a normal outbound network connection from the Hostinger-hosted Node.js app.

1. Create a free project at https://neon.tech
2. Copy the connection string into `DATABASE_URL` in `.env`
3. Run `npm run db:migrate` to apply the schema

## Creating your first SUPER_ADMIN user

There is no public registration for admin roles (by design — see RBAC policy in `packages/auth/src/rbac.ts`). Seed one manually after your first migration:

```sql
-- Run against your Neon database (e.g. via Neon's SQL editor)
-- Password hash below is a placeholder — generate your own with bcrypt (cost 12).
INSERT INTO users (id, email, "fullName", role, status, "passwordHash", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  'you@arqudrix.com',
  'Your Name',
  'SUPER_ADMIN',
  'ACTIVE',
  '$2a$12$REPLACE_WITH_A_REAL_BCRYPT_HASH',
  now(),
  now()
);
```

Then sign in at `https://arqudrix.com/admin/login` (or your custom path if you've configured one — see "Admin panel path" below; not a separate subdomain — see "Single-app deployment").

## Deploying to Hostinger (1 Node.js app slot)

### Why earlier upload attempts were likely failing

This is a monorepo (npm workspaces: `apps/web` depends on `packages/db`, `packages/auth`, `packages/domain`, `packages/ui` via the `"*"` workspace protocol). Hostinger's Node.js app hosting has no concept of npm workspaces — if you zip and upload `apps/web` alone (or the raw repo) and Hostinger tries to run `npm install` against it directly, it cannot resolve `@arqudrix/db`, `@arqudrix/auth`, etc. at all, and the install/build fails immediately. This is the most common cause of repeated "upload keeps failing" symptoms with this project. Two things fix it:

1. **`outputFileTracingRoot`** is now set in `apps/web/next.config.js` — without it, even a from-source build can silently omit the `@arqudrix/*` packages from the standalone bundle, causing a build that "succeeds" but crashes at runtime with `Cannot find module '@arqudrix/db'`.
2. **A `deploy:prepare` script** (see below) that builds the whole monorepo once, then flattens the result into a single self-contained folder with no workspace references left at all — that flattened folder is what you upload, not the source repo.

### The deploy process

1. **Locally**, from the monorepo root:
   ```bash
   npm install
   npm run build
   npm run deploy:prepare
   ```
   This produces a `deploy-ready/` folder containing `server.js`, a fully resolved `node_modules/`, `.next/` (with static assets included), and `public/` — completely self-contained, no monorepo/workspace awareness needed to run it.
2. **Test it locally before uploading** (catches problems early):
   ```bash
   cd deploy-ready && PORT=3000 node server.js
   ```
   Visit `http://localhost:3000` — if this doesn't work locally, it won't work on Hostinger either, and it's much faster to debug here.
3. **Zip the *contents* of `deploy-ready/`** — not the folder itself as a subfolder (i.e. `server.js` should be at the root of the zip, not `deploy-ready/server.js`).
4. In **hPanel → Websites → Node.js**, create one Node.js Web App and upload that zip.
5. Set the **startup file** to `server.js`.
6. Add every variable from `.env.example` as an environment variable in hPanel (see the "Set environment variables" screen — this is exactly where `DATABASE_URL`, `AUTH_SECRET`, `NEXT_PUBLIC_ADMIN_PATH_SEGMENT`, etc. go).
7. Point `arqudrix.com` at this app. Start it.

**Whenever you make code changes:** repeat steps 1–4 (rebuild, re-prepare, re-zip, re-upload) — there's no auto-deploy in this flow since it's a manual zip upload rather than a Git connection. If you'd prefer Hostinger to build from a connected GitHub repo instead (auto-deploy on every push), that also now works correctly thanks to `outputFileTracingRoot`, provided you configure the Node.js app's **Application root to the monorepo root** (not `apps/web`) and its **Startup file to `apps/web/.next/standalone/apps/web/server.js`** — but the manual `deploy:prepare` flow above is simpler to reason about and troubleshoot if anything goes wrong.

### If you get a second app slot later

See "Single-app deployment" above for how to split the admin panel back out onto `admin.arqudrix.com` for cookie isolation — the shared `packages/*` logic doesn't need to change, only the app-level routing.

## Admin panel path (hide the word "admin" from every URL)

The admin panel does not have to live at `/admin`. Set `NEXT_PUBLIC_ADMIN_PATH_SEGMENT` in `.env` to any private path you choose:

```
NEXT_PUBLIC_ADMIN_PATH_SEGMENT="panel-b9cd8251"
```

Your admin panel is then reachable at `https://arqudrix.com/panel-b9cd8251` — and the literal `/admin` path stops working at all (returns an ordinary 404, indistinguishable from any other invalid URL), so it can't be found by guessing.

**How it works:** the actual page files still live in `apps/web/app/admin/**` on disk — Next.js requires a real folder name, it can't be driven by an env var. `middleware.ts` transparently rewrites requests from your configured path to that internal folder (invisible to the visitor — the browser's address bar keeps showing your custom path), and separately blocks any direct request to the literal `/admin` path once a custom segment is set. `robots.txt` deliberately never lists the custom path (listing it would announce it to anyone who reads that public file).

**This is obscurity, not authentication** — every admin route is still fully protected by session + role checks (`ADMIN_SURFACE_ROLES` in `packages/auth/src/rbac.ts`) regardless of its path. Treat a custom path as raising the bar against automated bot scanning and casual snooping, not as a replacement for login security.

**To change it "any time":** update `NEXT_PUBLIC_ADMIN_PATH_SEGMENT` in `.env` (and in Hostinger's environment variables panel for production) to a new value, then rebuild and redeploy (`npm run build && npm run deploy:prepare`, re-zip, re-upload). Because this is a `NEXT_PUBLIC_` variable, Next.js inlines it into the built JavaScript at build time — a server restart alone will NOT pick up a new value, only a full rebuild will. The moment the new build is live, the old path stops working and the new one starts working, with no overlap window.

## Roles (RBAC)

`PUBLIC_USER · CUSTOMER · CLIENT · PARTNER · SUPPLIER · INVESTOR · EMPLOYEE · MANAGER · ADMIN · SUPER_ADMIN`

Only `EMPLOYEE` and above can use the admin panel at all — enforced both in `middleware.ts` (session exists) and `app/admin/(dashboard)/layout.tsx` (role check), with every mutation additionally gated at the domain-service layer. Full permission matrix lives in `packages/auth/src/rbac.ts` — the single file to review for any access-control audit.
