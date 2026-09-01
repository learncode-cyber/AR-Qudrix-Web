import { unstable_setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getProductBySlug } from "@arqudrix/domain";
import { Button } from "@/components/ui/button";

interface ProductDetailPageProps {
  params: {
    locale: "en" | "ar";
    slug: string;
  };
}

/**
 * Product Landing Page — Detail View
 *
 * Route: GET /{locale}/products/{slug}
 * Displays full product details with description, pricing, CTA button.
 *
 * Features:
 *   - Full product description (from ProductTranslation.description)
 *   - Product image/logo
 *   - Pricing (if available)
 *   - Related business info (if product belongs to a business)
 *   - External link (if provided, "Learn More" CTA)
 *   - SEO-friendly metadata
 *   - Breadcrumb navigation
 *   - 404 if product doesn't exist or is not ACTIVE
 */
export async function generateMetadata({ params }: ProductDetailPageProps) {
  const product = await getProductBySlug(params.slug, params.locale);

  if (!product) {
    return { title: "Product Not Found" };
  }

  const translation = product.translations[0];

  return {
    title: translation?.metaTitle || translation?.name,
    description: translation?.metaDescription || translation?.tagline,
    openGraph: {
      title: translation?.metaTitle || translation?.name,
      description: translation?.metaDescription || translation?.tagline,
      type: "product" as const,
      ...(product.coverImageUrl && { images: [{ url: product.coverImageUrl }] }),
    },
  };
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  unstable_setRequestLocale(params.locale);
  const t = await getTranslations({ locale: params.locale });

  const product = await getProductBySlug(params.slug, params.locale);

  if (!product) {
    notFound();
  }

  const translation = product.translations[0];
  const accentColor = product.accentColor || "#00BCD4";

  return (
    <main className="min-h-screen bg-gray-950">
      {/* Breadcrumb */}
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <nav className="text-sm text-gray-400">
          <a href={`/${params.locale}`} className="hover:text-white">
            {t("common.home")}
          </a>
          <span className="mx-2">/</span>
          <a href={`/${params.locale}/products`} className="hover:text-white">
            {t("products.title")}
          </a>
          <span className="mx-2">/</span>
          <span className="text-white">{translation.name}</span>
        </nav>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Left: Product Image */}
          <div className="flex items-center justify-center">
            <div
              className="w-full max-w-sm rounded-2xl p-8 flex items-center justify-center bg-gray-900"
              style={{ borderTop: `4px solid ${accentColor}` }}
            >
              {product.coverImageUrl ? (
                <Image
                  src={product.coverImageUrl}
                  alt={translation.name}
                  width={400}
                  height={400}
                  className="object-contain"
                  priority
                />
              ) : (
                <div className="text-gray-600 text-center">
                  <p>No image available</p>
                </div>
              )}
            </div>
          </div>

          {/* Right: Product Details */}
          <div className="flex flex-col justify-center space-y-8">
            {/* Metadata Badge */}
            <div className="flex items-center gap-2">
              <span
                className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                style={{ backgroundColor: accentColor }}
              >
                {product.category}
              </span>
              {product.isFeatured && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold text-white bg-amber-600">
                  Featured
                </span>
              )}
            </div>

            {/* Title & Tagline */}
            <div>
              <h1 className="text-5xl font-bold text-white">
                {translation.name}
              </h1>
              <p className="mt-4 text-xl text-gray-300">
                {translation.tagline}
              </p>
            </div>

            {/* Price */}
            {product.priceLabel && (
              <div
                className="inline-block px-4 py-2 rounded-lg font-bold text-lg text-white w-fit"
                style={{ backgroundColor: accentColor }}
              >
                {product.priceLabel}
              </div>
            )}

            {/* Description */}
            <div className="space-y-4 text-gray-300">
              <p className="leading-relaxed whitespace-pre-wrap">
                {translation.description}
              </p>
            </div>

            {/* Related Business (if applicable) */}
            {/* Future: add business card here if product.businessId is set */}

            {/* CTA Buttons */}
            <div className="flex gap-4 pt-6">
              <button
                onClick={() => {
                  if (product.externalUrl) {
                    window.open(product.externalUrl, "_blank");
                  }
                }}
                className="flex-1 px-6 py-3 rounded-lg font-semibold text-white transition-all duration-200 hover:opacity-90 hover:scale-105"
                style={{ backgroundColor: accentColor }}
                disabled={!product.externalUrl}
              >
                {product.externalUrl ? "Get Started" : "Coming Soon"}
              </button>

              <a
                href={`/${params.locale}/products`}
                className="flex-1 px-6 py-3 rounded-lg font-semibold text-white bg-gray-800 hover:bg-gray-700 transition-colors"
              >
                Back to Products
              </a>
            </div>
          </div>
        </div>

        {/* Related Products Section (optional) */}
        {/* Future enhancement: fetch and display related products */}
      </div>
    </main>
  );
}
