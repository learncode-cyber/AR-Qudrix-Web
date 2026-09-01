import { getServerSession } from "@/lib/auth-server";
import { assertPermission } from "@arqudrix/auth";
import { getProductById } from "@arqudrix/domain";
import { ProductForm } from "../../product-form";
import { notFound } from "next/navigation";

interface EditProductPageProps {
  params: {
    id: string;
  };
}

export const metadata = {
  title: "Edit Product",
  description: "Edit product details",
};

/**
 * Edit Product Page
 * Route: /admin/products/[id]/edit
 */
export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return <div className="text-red-400">Unauthorized</div>;
  }

  try {
    await assertPermission(session.user.id, "product:update");
  } catch {
    return <div className="text-red-400">You don't have permission to edit products</div>;
  }

  const product = await getProductById(params.id);

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Edit Product</h1>
          <p className="mt-2 text-gray-400">{product.slug}</p>
        </div>

        <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-8">
          <ProductForm product={product} />
        </div>
      </div>
    </div>
  );
}
