/**
 * Product Service — Domain-Driven Design service layer
 *
 * Handles all product-related business logic:
 *   - Create/read/update/delete products
 *   - Status transitions with audit trail
 *   - Search and filtering
 *   - i18n translation management
 *
 * This is a server-side only module. Client components access these
 * operations via API endpoints (app/api/v1/products/...).
 */

import { prisma } from "@arqudrix/db";
import {
  productAdminInputSchema,
  productCardSchema,
  productFullSchema,
  productListResponseSchema,
  productPublicSchema,
  productStatusChangeSchema,
  productWithTranslationsSchema,
  type ProductAdminInput,
  type ProductCard,
  type ProductFull,
  type ProductListResponse,
  type ProductStatusChange,
} from "./dto";

/**
 * Fetch single product by slug (public, for landing page).
 * Returns only ACTIVE products.
 */
export async function getProductBySlug(slug: string, locale: "en" | "ar") {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      translations: true,
      business: { include: { translations: true } },
    },
  });

  if (!product || product.status !== "ACTIVE") {
    return null;
  }

  // Build response with translations for requested locale
  const translation = product.translations.find((t) => t.locale === locale);
  if (!translation) {
    return null; // Fallback to EN if requested locale not found
  }

  return productWithTranslationsSchema.parse({
    ...product,
    translations: product.translations.filter(
      (t) => t.locale === locale || t.locale === "en"
    ),
  });
}

/**
 * Fetch product card for grid display (minimal fields).
 */
export async function getProductCard(
  slug: string,
  locale: "en" | "ar"
): Promise<ProductCard | null> {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { translations: true },
  });

  if (!product) {
    return null;
  }

  // Prefer requested locale, fallback to EN
  const translations = product.translations.filter(
    (t) => t.locale === locale || t.locale === "en"
  );

  if (translations.length === 0) {
    return null;
  }

  return productCardSchema.parse({
    id: product.id,
    slug: product.slug,
    logoUrl: product.logoUrl,
    accentColor: product.accentColor,
    priceLabel: product.priceLabel,
    isFeatured: product.isFeatured,
    translations,
  });
}

/**
 * List products with pagination and filtering (public).
 * Returns only ACTIVE products, ordered by displayOrder and isFeatured.
 */
export async function listPublicProducts(
  locale: "en" | "ar",
  page: number = 1,
  pageSize: number = 12,
  category?: string
): Promise<ProductListResponse> {
  const skip = (page - 1) * pageSize;

  const where: Parameters<typeof prisma.product.findMany>[0]["where"] = {
    status: "ACTIVE",
    ...(category && { category }),
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { translations: true },
      orderBy: [{ isFeatured: "desc" }, { displayOrder: "asc" }],
      skip,
      take: pageSize,
    }),
    prisma.product.count({ where }),
  ]);

  const cards = products
    .map((p) => {
      const translations = p.translations.filter(
        (t) => t.locale === locale || t.locale === "en"
      );
      if (translations.length === 0) return null;

      return productCardSchema.parse({
        id: p.id,
        slug: p.slug,
        logoUrl: p.logoUrl,
        accentColor: p.accentColor,
        priceLabel: p.priceLabel,
        isFeatured: p.isFeatured,
        translations,
      });
    })
    .filter((p): p is ProductCard => p !== null);

  return productListResponseSchema.parse({
    products: cards,
    total,
    page,
    pageSize,
  });
}

/**
 * List products for admin (all statuses).
 */
export async function listAdminProducts(
  page: number = 1,
  pageSize: number = 20,
  status?: string,
  businessId?: string
): Promise<ProductListResponse> {
  const skip = (page - 1) * pageSize;

  const where: Parameters<typeof prisma.product.findMany>[0]["where"] = {
    ...(status && { status }),
    ...(businessId && { businessId }),
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { translations: true },
      orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
      skip,
      take: pageSize,
    }),
    prisma.product.count({ where }),
  ]);

  const cards = products
    .map((p) => {
      const translations = p.translations.filter(
        (t) => t.locale === "en" || t.locale === "ar"
      );
      return productCardSchema.parse({
        id: p.id,
        slug: p.slug,
        logoUrl: p.logoUrl,
        accentColor: p.accentColor,
        priceLabel: p.priceLabel,
        isFeatured: p.isFeatured,
        translations,
      });
    })
    .filter((p): p is ProductCard => p !== null);

  return productListResponseSchema.parse({
    products: cards,
    total,
    page,
    pageSize,
  });
}

/**
 * Create product (admin).
 * Validates input and creates product with translations and initial status log.
 */
export async function createProduct(
  input: unknown,
  createdById: string
): Promise<ProductFull> {
  const validated = productAdminInputSchema.parse(input);

  const product = await prisma.product.create({
    data: {
      slug: validated.slug,
      category: validated.category,
      status: "PLANNED", // always start in PLANNED
      businessId: validated.businessId,
      logoUrl: validated.logoUrl,
      coverImageUrl: validated.coverImageUrl,
      accentColor: validated.accentColor,
      externalUrl: validated.externalUrl,
      priceLabel: validated.priceLabel,
      displayOrder: validated.displayOrder,
      isFeatured: validated.isFeatured,
      createdById,
      translations: {
        createMany: {
          data: validated.translations,
        },
      },
      statusLogs: {
        create: {
          fromStatus: null,
          toStatus: "PLANNED",
          changedById: createdById,
          reason: "Product created",
        },
      },
    },
    include: { translations: true, statusLogs: true },
  });

  return productFullSchema.parse(product);
}

/**
 * Update product (admin).
 * Merges input with existing product, updates translations.
 */
export async function updateProduct(
  id: string,
  input: unknown,
  updatedById: string
): Promise<ProductFull> {
  const validated = productAdminInputSchema.parse(input);

  // Delete old translations and create new ones
  await prisma.productTranslation.deleteMany({
    where: { productId: id },
  });

  const product = await prisma.product.update({
    where: { id },
    data: {
      slug: validated.slug,
      category: validated.category,
      businessId: validated.businessId,
      logoUrl: validated.logoUrl,
      coverImageUrl: validated.coverImageUrl,
      accentColor: validated.accentColor,
      externalUrl: validated.externalUrl,
      priceLabel: validated.priceLabel,
      displayOrder: validated.displayOrder,
      isFeatured: validated.isFeatured,
      updatedAt: new Date(),
      translations: {
        createMany: {
          data: validated.translations,
        },
      },
    },
    include: { translations: true, statusLogs: true },
  });

  return productFullSchema.parse(product);
}

/**
 * Change product status (admin).
 * Validates transition and logs the change.
 */
export async function changeProductStatus(
  id: string,
  input: unknown,
  changedById: string
): Promise<ProductFull> {
  const validated = productStatusChangeSchema.parse(input);

  const product = await prisma.product.findUniqueOrThrow({
    where: { id },
    include: { statusLogs: true, translations: true },
  });

  // Create status log (audit trail)
  await prisma.productStatusLog.create({
    data: {
      productId: id,
      fromStatus: product.status,
      toStatus: validated.toStatus,
      changedById,
      reason: validated.reason,
    },
  });

  // Update status
  const updated = await prisma.product.update({
    where: { id },
    data: { status: validated.toStatus, updatedAt: new Date() },
    include: { translations: true, statusLogs: true },
  });

  return productFullSchema.parse(updated);
}

/**
 * Delete product (admin).
 * Soft delete via status change to ARCHIVED.
 */
export async function deleteProduct(
  id: string,
  deletedById: string
): Promise<void> {
  await changeProductStatus(
    id,
    { toStatus: "ARCHIVED", reason: "Product deleted" },
    deletedById
  );
}

/**
 * Get product by ID (admin, includes all fields).
 */
export async function getProductById(id: string): Promise<ProductFull | null> {
  const product = await prisma.product.findUnique({
    where: { id },
    include: { translations: true, statusLogs: true },
  });

  if (!product) {
    return null;
  }

  return productFullSchema.parse(product);
}
