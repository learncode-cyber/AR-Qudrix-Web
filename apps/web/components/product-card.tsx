"use client";

import Link from "next/link";
import Image from "next/image";
import { useLocale } from "next-intl";
import { type ProductCard } from "@arqudrix/domain/schemas";
import { Star } from "lucide-react";

interface ProductCardProps {
  product: ProductCard;
}

/**
 * Product Card Component
 *
 * Displays a single product as a card in the grid (/products).
 * Design inspired by modern e-commerce cards (see design images):
 *   - Color-coded accent bar (category-specific)
 *   - Product logo/image
 *   - Product name + tagline
 *   - Pricing (if available)
 *   - Featured badge
 *   - CTA button
 *
 * IMPORTANT: Entire card is clickable via a Link wrapper.
 * Event handlers do NOT stop propagation — any click anywhere on
 * the card navigates to the landing page.
 *
 * Translations: Uses the i18n locale from next-intl's useLocale().
 * Falls back to EN if the requested locale isn't available.
 */
export function ProductCard({ product }: ProductCardProps) {
  const locale = useLocale() as "en" | "ar";

  // Get translation for current locale, fallback to EN
  const translation = product.translations.find((t) => t.locale === locale) ||
    product.translations.find((t) => t.locale === "en") || {
      locale: "en",
      name: "Product",
      tagline: "Untranslated",
    };

  // Default accent color (teal) if not specified
  const accentColor = product.accentColor || "#00BCD4";

  return (
    <Link href={`/${locale}/products/${product.slug}`} className="group block">
      <div
        className="relative overflow-hidden rounded-2xl bg-gray-900 shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-105"
        style={{
          borderTop: `4px solid ${accentColor}`,
        }}
      >
        {/* Featured Badge */}
        {product.isFeatured && (
          <div
            className="absolute top-3 right-3 z-10 px-3 py-1 rounded-full text-xs font-semibold text-white"
            style={{ backgroundColor: accentColor }}
          >
            Featured
          </div>
        )}

        {/* Image Container */}
        <div className="relative h-64 w-full bg-gray-800 overflow-hidden flex items-center justify-center">
          {product.logoUrl ? (
            <Image
              src={product.logoUrl}
              alt={translation.name}
              width={200}
              height={200}
              className="object-contain p-8"
              priority={false}
            />
          ) : (
            <div
              className="w-40 h-40 rounded-full opacity-10"
              style={{ backgroundColor: accentColor }}
            />
          )}

          {/* Accent gradient overlay */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300"
            style={{
              background: `linear-gradient(135deg, ${accentColor}40, transparent)`,
            }}
          />
        </div>

        {/* Content Area */}
        <div className="p-6 space-y-4">
          {/* Name & Tagline */}
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white group-hover:text-opacity-90 transition-colors">
              {translation.name}
            </h3>
            <p className="text-sm text-gray-300 line-clamp-2">
              {translation.tagline}
            </p>
          </div>

          {/* Price Label */}
          {product.priceLabel && (
            <div
              className="inline-block px-3 py-1 rounded-lg text-sm font-semibold text-white"
              style={{ backgroundColor: accentColor, opacity: 0.9 }}
            >
              {product.priceLabel}
            </div>
          )}

          {/* CTA Button */}
          <button
            onClick={(e) => {
              // Ensure link still works if button is clicked
              e.preventDefault();
              window.location.href = `/${locale}/products/${product.slug}`;
            }}
            className="w-full mt-4 px-4 py-2 rounded-lg font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2"
            style={{
              backgroundColor: accentColor,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "0.9";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "1";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            View Details
            <Star className="w-4 h-4" />
          </button>
        </div>

        {/* Hover accent effect (subtle animated border) */}
        <div
          className="absolute bottom-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: `linear-gradient(90deg, ${accentColor}00, ${accentColor}ff, ${accentColor}00)`,
          }}
        />
      </div>
    </Link>
  );
}

/**
 * Product Card Grid Layout
 *
 * Renders multiple product cards in a responsive grid.
 * Typical usage: <ProductCardGrid products={products} />
 */
interface ProductCardGridProps {
  products: ProductCard[];
}

export function ProductCardGrid({ products }: ProductCardGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
        <p className="text-lg">No products available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
