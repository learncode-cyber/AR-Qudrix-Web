/**
 * Product Catalog Domain — Data Transfer Objects
 *
 * Mirrors the Business Registry DTO pattern (see business/dto.ts).
 * Strictly separates:
 *   - Public DTOs (for API responses, client consumption) — pure data, no secrets
 *   - Server DTOs (internal use) — can include sensitive fields
 *
 * Client components import from this file via the @arqudrix/domain/schemas
 * subpath export (see packages/domain/src/schemas.ts).
 */

import { z } from "zod";

// =============================================================================
// PUBLIC SCHEMAS (safe for client exposure)
// =============================================================================

/**
 * Zod schema for public product info (API responses, client consumption).
 * Excludes: internal flags, created/updated timestamps, createdById, etc.
 */
export const productPublicSchema = z.object({
  id: z.string().cuid(),
  slug: z.string(),
  category: z.enum([
    "SOFTWARE",
    "SERVICE",
    "SUBSCRIPTION",
    "PHYSICAL_GOOD",
    "BUNDLE",
    "OTHER",
  ]),
  status: z.enum(["PLANNED", "IN_DEVELOPMENT", "ACTIVE", "DISCONTINUED", "ARCHIVED"]),
  logoUrl: z.string().url().nullable(),
  coverImageUrl: z.string().url().nullable(),
  accentColor: z.string().regex(/^#[0-9A-F]{6}$/i).nullable(), // hex color
  externalUrl: z.string().url().nullable(),
  priceLabel: z.string().nullable(),
  isFeatured: z.boolean(),
  launchedAt: z.date().nullable(),
  businessId: z.string().cuid().nullable(), // owning sub-company, if any
});

export type ProductPublic = z.infer<typeof productPublicSchema>;

/**
 * Zod schema for product with translations (i18n).
 * Used when fetching full product details for landing page / detail view.
 */
export const productTranslationSchema = z.object({
  locale: z.enum(["en", "ar"]),
  name: z.string().min(1).max(120),
  tagline: z.string().min(1).max(200), // one-line for the card
  description: z.string().min(10), // full landing-page body
  metaTitle: z.string().max(60).nullable(),
  metaDescription: z.string().max(160).nullable(),
});

export type ProductTranslation = z.infer<typeof productTranslationSchema>;

/**
 * Full product with translations (for landing page / detail view).
 */
export const productWithTranslationsSchema = productPublicSchema.extend({
  translations: z.array(productTranslationSchema),
});

export type ProductWithTranslations = z.infer<
  typeof productWithTranslationsSchema
>;

/**
 * Simplified product card DTO (for grid display).
 * Contains only fields needed for rendering the product card component.
 */
export const productCardSchema = z.object({
  id: z.string().cuid(),
  slug: z.string(),
  logoUrl: z.string().url().nullable(),
  accentColor: z.string().regex(/^#[0-9A-F]{6}$/i).nullable(),
  priceLabel: z.string().nullable(),
  isFeatured: z.boolean(),
  // Translations (at least one locale)
  translations: z.array(
    z.object({
      locale: z.enum(["en", "ar"]),
      name: z.string(),
      tagline: z.string(),
    })
  ),
});

export type ProductCard = z.infer<typeof productCardSchema>;

// =============================================================================
// SERVER SCHEMAS (internal use only, not exposed to client)
// =============================================================================

/**
 * Product admin input (create/update).
 * Includes all editable fields, used in forms and API endpoints.
 */
export const productAdminInputSchema = z.object({
  slug: z.string().toLowerCase().regex(/^[a-z0-9-]+$/),
  category: z.enum([
    "SOFTWARE",
    "SERVICE",
    "SUBSCRIPTION",
    "PHYSICAL_GOOD",
    "BUNDLE",
    "OTHER",
  ]),
  status: z.enum(["PLANNED", "IN_DEVELOPMENT", "ACTIVE", "DISCONTINUED", "ARCHIVED"]),
  businessId: z.string().cuid().nullable().default(null),
  logoUrl: z.string().url().nullable(),
  coverImageUrl: z.string().url().nullable(),
  accentColor: z.string().regex(/^#[0-9A-F]{6}$/i).nullable(),
  externalUrl: z.string().url().nullable(),
  priceLabel: z.string().max(100).nullable(),
  displayOrder: z.number().int().default(0),
  isFeatured: z.boolean().default(false),
  // Translations (at least EN)
  translations: z.array(
    z.object({
      locale: z.enum(["en", "ar"]),
      name: z.string().min(1).max(120),
      tagline: z.string().min(1).max(200),
      description: z.string().min(10),
      metaTitle: z.string().max(60).nullable(),
      metaDescription: z.string().max(160).nullable(),
    })
  ),
});

export type ProductAdminInput = z.infer<typeof productAdminInputSchema>;

/**
 * Product with all fields (for admin, server-side operations).
 */
export const productFullSchema = productPublicSchema.extend({
  tenantId: z.string(),
  displayOrder: z.number(),
  businessId: z.string().cuid().nullable(),
  createdById: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  translations: z.array(productTranslationSchema),
});

export type ProductFull = z.infer<typeof productFullSchema>;

/**
 * Product status change input (admin only).
 */
export const productStatusChangeSchema = z.object({
  toStatus: z.enum(["PLANNED", "IN_DEVELOPMENT", "ACTIVE", "DISCONTINUED", "ARCHIVED"]),
  reason: z.string().max(500).optional(),
});

export type ProductStatusChange = z.infer<typeof productStatusChangeSchema>;

// =============================================================================
// LIST/SEARCH SCHEMAS
// =============================================================================

/**
 * Product list filter options (admin or public).
 */
export const productFilterSchema = z.object({
  status: z.enum(["PLANNED", "IN_DEVELOPMENT", "ACTIVE", "DISCONTINUED", "ARCHIVED"]).optional(),
  category: z.enum([
    "SOFTWARE",
    "SERVICE",
    "SUBSCRIPTION",
    "PHYSICAL_GOOD",
    "BUNDLE",
    "OTHER",
  ]).optional(),
  businessId: z.string().cuid().optional(),
  isFeatured: z.boolean().optional(),
  search: z.string().optional(),
});

export type ProductFilter = z.infer<typeof productFilterSchema>;

/**
 * Paginated product list response.
 */
export const productListResponseSchema = z.object({
  products: z.array(productCardSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
});

export type ProductListResponse = z.infer<typeof productListResponseSchema>;
