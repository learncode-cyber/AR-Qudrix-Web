import { unstable_setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl";
import { Suspense } from "react";
import { listPublicProducts } from "@arqudrix/domain";
import { ProductCardGrid } from "@/components/product-card";

interface ProductsPageProps {
  params: {
    locale: "en" | "ar";
  };
  searchParams: {
    category?: string;
    page?: string;
  };
}

/**
 * Products Listing Page — Public
 *
 * Route: GET /{locale}/products
 * Displays all ACTIVE products in a responsive grid.
 *
 * Features:
 *   - Category filtering (via ?category=SOFTWARE, etc.)
 *   - Pagination (?page=2)
 *   - Sorted by featured first, then displayOrder
 *   - SEO-friendly (title, description, Open Graph)
 *   - i18n support (EN/AR)
 *   - Fully clickable product cards
 */
export async function generateMetadata({ params }: ProductsPageProps) {
  const t = await getTranslations({ locale: params.locale, namespace: "products" });

  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("title"),
      description: t("description"),
      type: "website" as const,
    },
  };
}

export default async function ProductsPage({
  params,
  searchParams,
}: ProductsPageProps) {
  unstable_setRequestLocale(params.locale);
  const t = await getTranslations({ locale: params.locale, namespace: "products" });

  const page = parseInt(searchParams.page || "1", 10);
  const category = searchParams.category;

  // Fetch products (server-side)
  const { products, total, pageSize } = await listPublicProducts(
    params.locale,
    page,
    12,
    category
  );

  const totalPages = Math.ceil(total / pageSize);

  return (
    <main className="min-h-screen bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white sm:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-4 text-xl text-gray-300">{t("description")}</p>
        </div>

        {/* Category Filter (optional) */}
        {/* Future enhancement: add category toggle buttons here */}

        {/* Products Grid */}
        <Suspense fallback={<div className="text-center text-gray-400">Loading products...</div>}>
          <ProductCardGrid products={products} />
        </Suspense>

        {/* Pagination Info */}
        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-between border-t border-gray-800 pt-8">
            <p className="text-sm text-gray-400">
              {t("showing", {
                start: (page - 1) * pageSize + 1,
                end: Math.min(page * pageSize, total),
                total,
              })}
            </p>

            {/* Pagination Links */}
            <div className="flex gap-2">
              {page > 1 && (
                <a
                  href={`/${params.locale}/products?page=${page - 1}${
                    category ? `&category=${category}` : ""
                  }`}
                  className="px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700 transition-colors"
                >
                  {t("previous")}
                </a>
              )}

              <span className="px-4 py-2 text-gray-300">
                {t("page", { current: page, total: totalPages })}
              </span>

              {page < totalPages && (
                <a
                  href={`/${params.locale}/products?page=${page + 1}${
                    category ? `&category=${category}` : ""
                  }`}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition-colors"
                >
                  {t("next")}
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
