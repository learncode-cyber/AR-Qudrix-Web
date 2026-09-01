import NextAuth from "next-auth";
// Imported from the "./edge-config" SUBPATH, not the package root
// ("@arqudrix/auth"). The root barrel (src/index.ts) also re-exports
// authConfig from ./config.ts, which imports bcryptjs — a Node.js-only
// package incompatible with the Edge runtime. Even though this file only
// ever USES edgeAuthConfig, importing from the barrel forces the Edge
// bundler to evaluate the whole barrel module graph, pulling bcrypt in
// anyway and producing warnings/failures like:
//   "process.nextTick/setImmediate is not supported in Edge Runtime"
// Importing directly from the subpath sidesteps config.ts entirely.
import { edgeAuthConfig } from "@arqudrix/auth/edge-config";

// Used exclusively by middleware.ts. Do NOT import this from route handlers
// or Server Components — it has no providers configured, so signIn() would
// fail. Use "@/lib/auth" (the full config) everywhere except middleware.
export const { auth } = NextAuth(edgeAuthConfig);
