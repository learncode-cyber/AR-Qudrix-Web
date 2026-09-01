import { PrismaClient } from "./generated/prisma";

/**
 * Prisma Client singleton.
 *
 * Imported from the package-local `./generated/prisma` folder (see the
 * `output` path in prisma/schema.prisma) rather than the bare
 * `@prisma/client` package specifier — this sidesteps npm workspace
 * hoisting ambiguity that otherwise causes "Could not resolve
 * @prisma/client despite the installation that we just tried" in this
 * monorepo. Run `npm run db:generate` (or just `npm install`, which does
 * this automatically via the root `postinstall` script) before this file
 * will resolve — the `./generated/prisma` folder does not exist until then
 * and is intentionally gitignored.
 *
 * In Next.js dev mode, modules are hot-reloaded on every file change, which
 * would normally create a brand-new PrismaClient (and a brand-new DB
 * connection pool) on every save — quickly exhausting Neon's connection
 * limit. Caching the instance on `globalThis` in non-production
 * environments avoids that.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export * from "./generated/prisma";
