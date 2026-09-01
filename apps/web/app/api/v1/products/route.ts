import { NextRequest, NextResponse } from "next/server";
import { assertPermission } from "@arqudrix/auth";
import { getServerSession } from "@/lib/auth-server";
import { listAdminProducts, createProduct } from "@arqudrix/domain";
import { apiError, validateRequest } from "@/lib/api-errors";

/**
 * GET /api/v1/products
 *
 * List products (admin only, all statuses).
 * Query params:
 *   - page: number (default 1)
 *   - pageSize: number (default 20)
 *   - status: filter by status
 *   - businessId: filter by business owner
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return apiError(401, "Unauthorized");
    }

    // Require admin permission
    await assertPermission(session.user.id, "product:read");

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);
    const status = searchParams.get("status") || undefined;
    const businessId = searchParams.get("businessId") || undefined;

    const result = await listAdminProducts(page, pageSize, status, businessId);

    return NextResponse.json(result);
  } catch (error) {
    console.error("[GET /api/v1/products]", error);
    return apiError(500, "Failed to fetch products");
  }
}

/**
 * POST /api/v1/products
 *
 * Create a new product (admin only).
 * Body: ProductAdminInput schema
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return apiError(401, "Unauthorized");
    }

    // Require admin permission
    await assertPermission(session.user.id, "product:create");

    const body = await validateRequest(request);

    const product = await createProduct(body, session.user.id);

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("[POST /api/v1/products]", error);
    if (error instanceof SyntaxError) {
      return apiError(400, "Invalid request body");
    }
    return apiError(500, "Failed to create product");
  }
}
