#!/usr/bin/env node
/**
 * Prepare a Hostinger-ready deployment folder.
 *
 * Why this exists: this project is a monorepo (npm workspaces + Turborepo).
 * Next.js's `output: "standalone"` build produces a self-contained bundle,
 * but because of the monorepo layout it lands nested at
 * `apps/web/.next/standalone/apps/web/...` with shared dependencies at
 * `apps/web/.next/standalone/node_modules`. Uploading the raw source repo
 * (or the nested standalone folder as-is) to a simple Node.js hosting
 * panel like Hostinger's is a common source of confusing failures —
 * Hostinger has no awareness of npm workspaces, so `npm install` run
 * against a zip of just `apps/web` (without its sibling `packages/*`)
 * cannot resolve the `@arqudrix/*` dependencies at all.
 *
 * This script flattens the already-built standalone output into a single
 * `deploy-ready/` folder containing:
 *   server.js       — the entry point (Hostinger's "Startup file" = this)
 *   node_modules/    — every dependency the server needs, already resolved
 *   .next/           — build output, including static assets
 *   public/          — static public assets
 *   package.json     — minimal, just for reference (not required to run)
 *
 * Nothing in this folder references npm workspaces or the monorepo at
 * all — it is what you zip and upload. No `npm install` or `npm run
 * build` needs to run on Hostinger's side; the app is already built.
 *
 * Usage: run from the monorepo root, AFTER `npm run build` has completed:
 *   npm run build
 *   npm run deploy:prepare
 * Then zip the contents of `deploy-ready/` (not the folder itself) and
 * upload that zip to Hostinger.
 */

const fs = require("fs");
const path = require("path");

const ROOT = __dirname + "/..";
const STANDALONE_ROOT = path.join(ROOT, "apps/web/.next/standalone");
const NESTED_APP_DIR = path.join(STANDALONE_ROOT, "apps/web");
const DEPLOY_DIR = path.join(ROOT, "deploy-ready");

function fail(message) {
  console.error(`\n❌ ${message}\n`);
  process.exit(1);
}

function copy(src, dest) {
  if (!fs.existsSync(src)) return false;
  fs.cpSync(src, dest, { recursive: true, force: true });
  return true;
}

console.log("Preparing Hostinger deployment folder...\n");

if (!fs.existsSync(STANDALONE_ROOT)) {
  fail(
    "No standalone build found at apps/web/.next/standalone.\n" +
      "   Run `npm run build` first (from the monorepo root), then re-run `npm run deploy:prepare`."
  );
}

if (!fs.existsSync(NESTED_APP_DIR)) {
  fail(
    "Expected apps/web/.next/standalone/apps/web to exist but it doesn't.\n" +
      "   This usually means outputFileTracingRoot in apps/web/next.config.js is misconfigured, or the build\n" +
      "   didn't complete. Check the build log for errors and try `npm run build` again."
  );
}

// Start clean every time so stale files from a previous build never linger.
if (fs.existsSync(DEPLOY_DIR)) {
  fs.rmSync(DEPLOY_DIR, { recursive: true, force: true });
}
fs.mkdirSync(DEPLOY_DIR, { recursive: true });

// 1. Server entry point + app-specific files (from the nested app folder)
const nestedFiles = fs.readdirSync(NESTED_APP_DIR);
for (const file of nestedFiles) {
  copy(path.join(NESTED_APP_DIR, file), path.join(DEPLOY_DIR, file));
}

// 2. Shared node_modules (hoisted to the standalone root, not nested)
const copiedNodeModules = copy(path.join(STANDALONE_ROOT, "node_modules"), path.join(DEPLOY_DIR, "node_modules"));
if (!copiedNodeModules) {
  console.warn("⚠️  No node_modules found in the standalone output — this can be normal if every dependency was already bundled elsewhere, but double-check the app actually starts locally with `node deploy-ready/server.js` before uploading.");
}

// 3. Static assets — NOT included in the standalone trace by design (Next.js
//    expects you to copy these two directories in yourself, every time).
const staticCopied = copy(path.join(ROOT, "apps/web/.next/static"), path.join(DEPLOY_DIR, ".next/static"));
const publicCopied = copy(path.join(ROOT, "apps/web/public"), path.join(DEPLOY_DIR, "public"));

if (!staticCopied) fail("apps/web/.next/static not found — the build may not have completed successfully.");
if (!publicCopied) console.warn("⚠️  No apps/web/public directory found — skipped (fine if you don't have one).");

console.log("✅ Done. Your deployable app is ready at: deploy-ready/\n");
console.log("Next steps:");
console.log("  1. Zip the CONTENTS of deploy-ready/ (not the folder itself as a subfolder)");
console.log("  2. Upload that zip to Hostinger");
console.log("  3. Set the Startup file to: server.js");
console.log("  4. Add your environment variables in Hostinger's panel (DATABASE_URL, AUTH_SECRET, etc.)");
console.log("  5. Start the app\n");
console.log("To test it locally first (recommended):");
console.log("  cd deploy-ready && PORT=3000 node server.js\n");
