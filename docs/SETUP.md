# 🚀 AR Qudrix Platform — Fresh Clone Setup & Local Development Guide

This guide walks you through cloning the repository and getting local development running on your machine.

---

## 📋 Prerequisites

Before starting, ensure you have:

- **Node.js >= 20.0.0** (check with `node --version`)
- **npm >= 10.9.0** (check with `npm --version`)
- **Git** (for cloning the repo)
- **PostgreSQL** (local instance) OR a **Neon PostgreSQL** database URL

If you don't have PostgreSQL installed locally, you can:
- Use **Neon** (free managed PostgreSQL at https://neon.tech)
- Use **Docker**: `docker run -d --name postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:16`

---

## 🎯 Quick Start (< 5 minutes)

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-org/arqudrix-platform.git
cd arqudrix-platform
```

### Step 2: Install Dependencies & Generate Prisma Client

```bash
npm run setup
```

This single command does:
- `npm install` — installs all workspace packages
- `npm run db:generate` — auto-generates Prisma client in `packages/db/src/generated/prisma`

### Step 3: Configure Local Environment

Copy the root `.env` file and update the database connection:

```bash
# The root .env already exists with safe defaults. Just verify/update these two:
# 
# DATABASE_URL = your PostgreSQL connection string
# AUTH_SECRET = already pre-filled with a dev key
```

**For local PostgreSQL:**
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/arqudrix_dev?sslmode=disable"
```

**For Neon (managed):**
```env
DATABASE_URL="postgresql://[user]:[password]@[host].neon.tech/[dbname]?sslmode=require"
```

### Step 4: Set Up the Web App Environment

The `apps/web` app needs its own local environment file:

```bash
# This file is already created at apps/web/.env.local
# It inherits from root .env and provides localhost URLs
# No action needed — it's pre-configured for local dev
```

If you need to customize admin URLs or storage settings, edit `apps/web/.env.local`.

### Step 5: Run the Development Server

```bash
npm run dev
```

You should see:
- `apps/web` starting on `http://localhost:3000`
- Turbo orchestrating both the app and database package

**Public site:** http://localhost:3000/en/businesses  
**Admin panel:** http://localhost:3000/panel-b9cd8251  
**Blog:** http://localhost:3000/en/blog

---

## 🔧 Troubleshooting

### ❌ "Module not found: ./generated/prisma"

**Cause:** Prisma client hasn't been generated.

**Fix:**
```bash
npm run db:generate
```

Or ensure `npm run setup` completed without errors.

---

### ❌ "Environment variable not found: DATABASE_URL"

**Cause:** `.env` file not set up or the root `.env` isn't being read by the app.

**Fix:**
```bash
# 1. Verify root .env exists
ls -la .env

# 2. Ensure DATABASE_URL is set (not blank)
grep DATABASE_URL .env

# 3. If missing, ask your team lead for a .env snapshot or use a Neon free tier
```

---

### ❌ "[auth][error] MissingSecret"

**Cause:** `AUTH_SECRET` is not set in the environment.

**Fix:**
```bash
# Check that AUTH_SECRET is in root .env
grep AUTH_SECRET .env

# If blank, it's already pre-filled in the repo .env
# If still failing, kill the dev server and restart:
npm run dev
```

---

### ❌ Blank white screen on http://localhost:3000

**Cause:** CSP (Content Security Policy) error in browser console, typically `unsafe-eval` violation.

**Fix:**
The `next.config.js` is pre-configured to allow `unsafe-eval` in development mode. If you still see the error:

1. **Check browser DevTools Console** for the exact CSP error
2. **Restart the dev server:**
   ```bash
   # Kill the dev server (Ctrl+C)
   npm run dev
   ```
3. **Hard refresh the browser:** Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows/Linux)

---

### ❌ "Cannot find module '@arqudrix/db'" at runtime

**Cause:** The monorepo workspace package isn't installed.

**Fix:**
```bash
# Reinstall everything from scratch
rm -rf node_modules
npm run setup
```

---

### ❌ Turbo cache issues or stale build artifacts

**Fix:**
```bash
# Clear all caches and rebuild
npm run clean  # (if this script exists)
rm -rf .turbo
rm -rf apps/web/.next
rm -rf packages/*/dist
npm run setup
npm run dev
```

---

## 📚 Directory Structure

```
arqudrix-platform/
├── apps/
│   └── web/                    # Next.js 15 app (public site + admin + portal)
│       ├── app/                # App Router
│       ├── components/         # React components
│       ├── lib/                # Utilities
│       ├── middleware.ts       # Auth middleware
│       ├── .env.local          # Local dev overrides (gitignored)
│       └── next.config.js      # CSP, image config, etc.
│
├── packages/
│   ├── db/                     # Prisma + Database
│   │   ├── prisma/
│   │   │   └── schema.prisma   # Domain models (Business, Lead, etc.)
│   │   └── src/
│   │       ├── index.ts        # Exports Prisma client & all types
│   │       └── client-enums.ts # Client-safe enum mirrors
│   │
│   ├── auth/                   # Auth.js + RBAC
│   │   └── src/rbac.ts         # Permission matrix
│   │
│   ├── domain/                 # DDD application layer
│   │   └── src/
│   │       ├── business/       # Business Registry service
│   │       ├── lead/           # Lead capture service
│   │       ├── content/        # Blog/CMS service
│   │       └── schemas.ts      # Client-safe Zod schemas
│   │
│   └── ui/                     # Shared shadcn/ui components
│
├── .env                        # Root secrets (gitignored) — set DATABASE_URL + AUTH_SECRET
├── .env.example                # Template for other developers
├── turbo.json                  # Build orchestration config
├── package.json                # Root workspace scripts
└── SETUP.md                    # This file

```

---

## 🎮 Common Development Tasks

### View Prisma Studio (Database GUI)

```bash
npm run db:studio
```

Opens http://localhost:5555 with a visual database browser.

---

### Run Migrations

```bash
npm run db:migrate
```

Applies pending migrations from `packages/db/prisma/migrations/`.

---

### Type Check (TypeScript compilation)

```bash
npm run type-check
```

Validates TypeScript across all packages without bundling.

---

### Lint & Format

```bash
npm run lint
```

Runs ESLint and Prettier.

---

### Run Tests

```bash
npm run test
```

Runs Jest tests (if configured).

---

## 🚀 Before You Commit

1. **Ensure local `.env` and `.env.local` are NOT committed** (they're in `.gitignore`)
2. **Run type-check:** `npm run type-check`
3. **Verify no lint errors:** `npm run lint`
4. **Test locally:** `npm run dev` and click around the admin panel

---

## 📖 Additional Resources

- **[README.md](./README.md)** — Project overview, architecture, deployment guide
- **[packages/domain/README.md](./packages/domain/README.md)** — DDD domain layer docs
- **[packages/auth/README.md](./packages/auth/README.md)** — RBAC permission matrix
- **[Prisma Docs](https://www.prisma.io/docs/)** — ORM reference
- **[Next.js Docs](https://nextjs.org/docs)** — Framework reference

---

## ❓ Need Help?

If you're stuck:

1. Check the **Troubleshooting** section above
2. Ask your team lead for a `.env` snapshot (DATABASE_URL + AUTH_SECRET)
3. Ensure Node.js version matches: `node --version` should be >= 20.0.0
4. Try a fresh install:
   ```bash
   rm -rf node_modules
   npm run setup
   ```

---

**Happy developing! 🎉**
