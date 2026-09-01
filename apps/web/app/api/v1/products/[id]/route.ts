import { NextRequest, NextResponse } from "next/server";
import { assertPermission } from "@arqudrix/auth";
import { getServerSession } from "@/lib/auth-server";
import {
  getProductById,
  updateProduct,
  deleteProduct,
} from "@arqudrix/domain";
import { apiError, validateRequest } from "@/lib/api-errors";

/**
 * GET /api/v1/products/[id]
 *
 * Get product by ID (admin only).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return apiError(401, "Unauthorized");
    }

    await assertPermission(session.user.id, "product:read");

    const product = await getProductById(params.id);

    if (!product) {
      return apiError(404, "Product not found");
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("[GET /api/v1/products/:id]", error);
    return apiError(500, "Failed to fetch product");
  }
}

/**
 * PUT /api/v1/products/[id]
 *
 * Update product (admin only).
 * Body: ProductAdminInput schema
 */
export async function PUT(
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

    const product = await updateProduct(params.id, body, session.user.id);

    return NextResponse.json(product);
  } catch (error) {
    console.error("[PUT /api/v1/products/:id]", error);
    return apiError(500, "Failed to update product");
  }
}

/**
 * DELETE /api/v1/products/[id]
 *
 * Delete product by setting status to ARCHIVED (admin only).
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return apiError(401, "Unauthorized");
    }

    await assertPermission(session.user.id, "product:delete");

    await deleteProduct(params.id, session.user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/v1/products/:id]", error);
    return apiError(500, "Failed to delete product");
  }
}
