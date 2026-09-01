import { NextRequest, NextResponse } from "next/server";
import { signupAffiliate, getAffiliateReport } from "@arqudrix/domain";
import { getServerSession } from "@/lib/auth-server";
import { apiError, validateRequest } from "@/lib/api-errors";

/**
 * POST /api/v1/affiliate/signup
 * Sign up as affiliate (public)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await validateRequest(request);
    const affiliate = await signupAffiliate(body);

    return NextResponse.json(affiliate, { status: 201 });
  } catch (error) {
    console.error("[POST /api/v1/affiliate/signup]", error);

    if (error instanceof Error && error.message.includes("already")) {
      return apiError(409, error.message);
    }

    return apiError(500, "Failed to create affiliate account");
  }
}

/**
 * GET /api/v1/affiliate/me
 * Get current affiliate's report (dashboard)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    // In a real scenario, you'd map user to affiliate
    // For now, this is a placeholder that would require affiliate auth
    if (!session?.user?.id) {
      return apiError(401, "Unauthorized");
    }

    // TODO: Find affiliate by user ID
    // const report = await getAffiliateReport(affiliateId);
    // return NextResponse.json(report);

    return apiError(500, "Affiliate feature requires additional setup");
  } catch (error) {
    console.error("[GET /api/v1/affiliate/me]", error);
    return apiError(500, "Failed to fetch affiliate data");
  }
}
