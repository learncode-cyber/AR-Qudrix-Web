import Link from "next/link";
import { getServerSession } from "@/lib/auth-server";
import { assertPermission } from "@arqudrix/auth";
import { listAdminProducts } from "@arqudrix/domain";
import { ProductTable } from "./product-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface AdminProductsPageProps {
  searchParams: {
    page?: string;
    status?: string;
  };
}

/**
 * Admin Products Page
 *
 * Route: /admin/products
 * Lists all products with admin actions (create, edit, delete).
 */
export const metadata = {
  title: "Products",
  description: "Manage product catalog",
};

export default async function AdminProductsPage({
  searchParams,
}: AdminProductsPageProps) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return <div className="text-red-400">Unauthorized</div>;
  }

  // Check permission
  try {
    await assertPermission(session.user.id, "product:read");
  } catch {
    return <div className="text-red-400">You don't have permission to access this page</div>;
  }

  const page = parseInt(searchParams.page || "1", 10);
  const status = searchParams.status || undefined;

  const { products, total, pageSize } = await listAdminProducts(
    page,
    20,
    status
  );

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Products</h1>
            <p className="mt-2 text-gray-400">Manage your product catalog</p>
          </div>
          <Link href="/panel-b9cd8251/products/new">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New Product
            </Button>
          </Link>
        </div>

        {/* Product List */}
        <ProductTable
          products={products}
          currentPage={page}
          totalPages={totalPages}
          totalCount={total}
        />
      </div>
    </div>
  );
}
