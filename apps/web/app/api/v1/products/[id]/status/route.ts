import { NextRequest, NextResponse } from "next/server";
import { assertPermission } from "@arqudrix/auth";
import { getServerSession } from "@/lib/auth-server";
import { changeProductStatus } from "@arqudrix/domain";
import { apiError, validateRequest } from "@/lib/api-errors";

/**
 * POST /api/v1/products/[id]/status
 *
 * Change product status (admin only).
 * Creates an audit log entry for the status change.
 *
 * Body: { toStatus: ProductStatus, reason?: string }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return apiError(401, "Unauthorized");
    }

    await assertPermission(session.user.id, "product:update");

    const body = await validateRequest(request);

    const product = await changeProductStatus(
      params.id,
      body,
      session.user.id
    );

    return NextResponse.json(product);
  } catch (error) {
    console.error("[POST /api/v1/products/:id/status]", error);
    return apiError(500, "Failed to change product status");
  }
}
