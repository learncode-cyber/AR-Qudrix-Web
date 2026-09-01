import { getServerSession } from "@/lib/auth-server";
import { assertPermission } from "@arqudrix/auth";
import { ProductForm } from "../product-form";

export const metadata = {
  title: "New Product",
  description: "Create a new product",
};

/**
 * Create New Product Page
 * Route: /admin/products/new
 */
export default async function NewProductPage() {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return <div className="text-red-400">Unauthorized</div>;
  }

  try {
    await assertPermission(session.user.id, "product:create");
  } catch {
    return <div className="text-red-400">You don't have permission to create products</div>;
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Create New Product</h1>
          <p className="mt-2 text-gray-400">Add a new product to your catalog</p>
        </div>

        <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-8">
          <ProductForm />
        </div>
      </div>
    </div>
  );
}
