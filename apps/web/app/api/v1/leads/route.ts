import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { auth } from "@/lib/auth";
import { toErrorResponse } from "@/lib/api-errors";
import { createLeadSchema, leadService, listLeadsQuerySchema, trackServerLeadConversion } from "@arqudrix/domain";

// Simple in-memory sliding-window rate limiter — sufficient for a single
// Node.js process on Hostinger's Business plan. If the app ever needs to
// run multiple instances behind a load balancer, replace this with a
// shared store (e.g. Upstash Redis) so limits apply across instances.
const submissionsByIp = new Map<string, number[]>();
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_SUBMISSIONS_PER_WINDOW = 5;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (submissionsByIp.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  timestamps.push(now);
  submissionsByIp.set(ip, timestamps);
  return timestamps.length > MAX_SUBMISSIONS_PER_WINDOW;
}

// POST — public, anonymous. The contact form on the corporate site submits
// here. Rate-limited by IP; no authentication required or expected.
export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "RATE_LIMITED", message: "Too many submissions. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const input = createLeadSchema.parse(body);

    const lead = await leadService.submit(input, ip);

    // Server-side conversion tracking (Meta Conversions API + Google Ads
    // click-conversion upload). Fired after the lead is durably saved, so a
    // tracking-platform outage can never cost us the lead itself. Awaited
    // here (not "fire and forget") because Hostinger runs a persistent
    // Node.js process — unlike a serverless function, it won't be frozen
    // the instant the response is sent, so there's no risk of the request
    // getting cut off mid-flight either way; awaiting just keeps the
    // control flow simple and errors visible in the same request's logs.
    await trackServerLeadConversion({
      email: input.email,
      phone: input.phone,
      eventSourceUrl: request.headers.get("referer") ?? request.nextUrl.origin,
      clientIpAddress: ip !== "unknown" ? ip : undefined,
      clientUserAgent: request.headers.get("user-agent") ?? undefined,
      gclid: input.gclid,
    });

    return NextResponse.json({ id: lead.id, status: "received" }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "VALIDATION_ERROR", details: error.flatten() },
        { status: 422 }
      );
    }

    console.error("[api/v1/leads] Unhandled error:", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR", message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

// GET — admin-only. Powers the /admin/leads list page. Same URL as the
// public POST above; Next.js Route Handlers can export both methods from
// one file with completely independent auth requirements per method.
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

    const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries());
    const query = listLeadsQuerySchema.parse(searchParams);

    const result = await leadService.listForAdmin(
      { id: session.user.id, role: session.user.role },
      query
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
