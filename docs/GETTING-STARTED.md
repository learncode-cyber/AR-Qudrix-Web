# 🚀 Getting Started with Fixed AR Qudrix Platform

**TL;DR:** Your monorepo is now fixed. Run these 3 commands and you're done:

```bash
npm run setup      # Installs everything + generates Prisma client
npm run dev        # Starts development server on http://localhost:3000
# Open http://localhost:3000 in your browser
```

---

## ✨ What Was Fixed

This version includes fixes for **all 5 development blockers**:

1. ✅ **Prisma Client Auto-Generation** — `npm install` now auto-generates Prisma client
2. ✅ **Type Exports** — All Prisma types/enums properly exported
3. ✅ **Environment Variables** — `.env` and `.env.local` pre-configured for local dev
4. ✅ **CSP in Dev Mode** — Fast Refresh works without CSP violations
5. ✅ **Fresh Clone Setup** — `npm run setup` handles everything

See **[FIXES-SUMMARY.md](./FIXES-SUMMARY.md)** for detailed explanation of each fix.

---

## 📋 Before You Start

You need:
- **Node.js 20+** (check: `node --version`)
- **npm 10.9+** (check: `npm --version`)
- **PostgreSQL** (local OR Neon)

### Database Setup (Choose One)

**Option A: Local PostgreSQL** (simplest for local dev)
```bash
# If you have Docker:
docker run -d --name postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:16
```

**Option B: Neon** (free managed database)
1. Go to https://neon.tech
2. Create a free project
3. Copy the connection string (it looks like `postgresql://user:password@host/database?sslmode=require`)
4. You'll paste this into `.env` in Step 2 below

---

## 🎯 Step-by-Step Setup (2 minutes)

### Step 1: Clone or Extract This Repository

```bash
# If you cloned from git:
git clone https://github.com/your-org/arqudrix-platform.git
cd arqudrix-platform

# If you extracted a ZIP:
unzip arqudrix-platform-fixed.zip
cd arqudrix-platform
```

### Step 2: Update `.env` with Your Database Connection

Open `.env` in the root folder and find this line:

```env
DATABASE_URL="postgresql://user:password@ep-example.neon.tech/arqudrix?sslmode=require"
```

**Replace with:**

- **Local PostgreSQL:** `postgresql://postgres:postgres@localhost:5432/arqudrix_dev?sslmode=disable`
- **Neon:** Your connection string from Step 1 above

**That's it.** All other env vars are pre-filled.

### Step 3: Install & Generate

```bash
npm run setup
```

This automatically:
- Installs all npm packages
- Generates Prisma client to `packages/db/src/generated/prisma`
- Handles all workspace package linking

**You should see no errors.**

### Step 4: Start the Dev Server

```bash
npm run dev
```

You should see Turbo output indicating the server is running.

### Step 5: Open in Browser

- **Public site:** http://localhost:3000/en/
- **Admin panel:** http://localhost:3000/panel-b9cd8251
- **Businesses:** http://localhost:3000/en/businesses
- **Blog:** http://localhost:3000/en/blog

---

## ⚡ Common Commands

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run type-check       # Check TypeScript
npm run lint             # Run ESLint + Prettier
npm run db:migrate       # Run pending database migrations
npm run db:studio        # Open Prisma Studio (visual DB browser)
npm run db:generate      # Manually regenerate Prisma client
```

---

## 🐛 Troubleshooting

### ❌ "Module not found: ./generated/prisma"
```bash
npm run db:generate
npm run dev
```

### ❌ "DATABASE_URL not found" or auth errors
Check that `.env` has the correct `DATABASE_URL`:
```bash
grep DATABASE_URL .env
```

### ❌ Blank white screen at http://localhost:3000
1. Open browser DevTools (F12)
2. Check Console tab for errors
3. If CSP error, restart the dev server: `npm run dev`
4. Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows/Linux)

### ❌ Port 3000 already in use
```bash
# Kill the process using port 3000:
lsof -i :3000          # macOS/Linux
netstat -ano | findstr :3000  # Windows
# Then kill the process or use a different port
```

### ❌ Still stuck?
See the full troubleshooting guide in **[SETUP.md](./SETUP.md)** (Advanced).

---

## 📚 Documentation

- **[SETUP.md](./SETUP.md)** — Comprehensive setup guide with troubleshooting
- **[FIXES-SUMMARY.md](./FIXES-SUMMARY.md)** — Detailed explanation of all 5 fixes
- **[README.md](./README.md)** — Project overview & architecture
- **[packages/domain/README.md](./packages/domain/README.md)** — DDD layer docs
- **[SERVER_SIDE_TRACKING.md](./SERVER_SIDE_TRACKING.md)** — Analytics integration

---

## ✅ You're Done!

You now have a fully functional local development environment. Start building! 🎉

### Next Steps:
1. Explore the admin panel at http://localhost:3000/panel-b9cd8251
2. Check out the businesses list at http://localhost:3000/en/businesses
3. Review the architecture in [README.md](./README.md)
4. Start coding! 💻

---

**Questions?** Check the documentation files above or reach out to your team lead.
