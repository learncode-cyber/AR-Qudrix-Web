/**
 * Client-safe entry point for @arqudrix/domain — import this from any
 * "use client" component instead of the package root ("@arqudrix/domain").
 *
 * WHY THIS FILE EXISTS: the main entry (./index.ts) re-exports everything,
 * including *Service classes that import Prisma (`prisma` client) and
 * Node.js core modules (`node:crypto` for IP hashing in LeadService).
 * Because `export *` barrels are resolved as a single module graph by
 * webpack/Next's bundler, importing even ONE pure Zod schema from the main
 * entry — e.g. `import { createLeadSchema } from "@arqudrix/domain"` —
 * pulls that entire graph into the client bundle, and the build fails with
 * errors like `UnhandledSchemeError: Reading from "node:crypto" is not
 * handled by plugins` (this exact bug hit contact-form.tsx, business-form.tsx,
 * content-form.tsx, the inquiry form, and the integrations form).
 *
 * Every schema re-exported here is verified to depend on nothing but `zod`
 * and the equally side-effect-free `@arqudrix/db/client-enums` — safe to
 * bundle for the browser. The *same* schema objects are used server-side
 * too (imported from "@arqudrix/domain" there, or from these same files
 * directly), so client and server validation can never drift apart.
 */

export * from "./business/dto";
export * from "./content/dto";
export * from "./lead/dto";
export * from "./inquiry/dto";
export * from "./products/dto";
export * from "./careers/dto";
export * from "./affiliate/dto";
export * from "./settings/dto";
