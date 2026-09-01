import { NextRequest, NextResponse } from "next/server";
import { submitJobApplication } from "@arqudrix/domain";
import { apiError, validateRequest } from "@/lib/api-errors";

/**
 * POST /api/v1/careers/applications
 * Submit a job application
 */
export async function POST(request: NextRequest) {
  try {
    const body = await validateRequest(request);
    const application = await submitJobApplication(body);

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    console.error("[POST /api/v1/careers/applications]", error);

    if (error instanceof Error && error.message.includes("active")) {
      return apiError(400, error.message);
    }

    return apiError(500, "Failed to submit application");
  }
}
