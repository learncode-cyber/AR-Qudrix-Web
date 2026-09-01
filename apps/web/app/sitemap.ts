import type { MetadataRoute } from "next";
import { businessService, contentService, listBusinessesQuerySchema, listBlogPostsQuerySchema, listPublicProducts } from "@arqudrix/domain";

// Forces this route to render per-request instead of being statically
// generated at build time — the data (businesses, content, settings) is
// admin-editable and DB-backed, and the build environment (e.g. Hostinger's
// build step) should never be a hard dependency for a successful deploy.
export const dynamic = "force-dynamic";

const LOCALES = ["en", "ar"] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://arqudrix.com";

  const staticRoutes = [
    "",
    "/businesses",
    "/products",
    "/careers",
    "/affiliate",
    "/blog",
    "/contact",
    "/about",
    "/careers",
    "/partners",
    "/investors",
    "/privacy",
    "/terms",
  ];

  const staticEntries: MetadataRoute.Sitemap = LOCALES.flatMap((locale) =>
    staticRoutes.map((route) => ({
      url: `${siteUrl}/${locale}${route}`,
      lastModified: new Date(),
      changeFrequency: route === "" ? "weekly" : "monthly",
      priority: route === "" ? 1 : 0.7,
    }))
  );

  const businessEntries: MetadataRoute.Sitemap = [];
  const productEntries: MetadataRoute.Sitemap = [];
  const blogEntries: MetadataRoute.Sitemap = [];

  for (const locale of LOCALES) {
    const businessQuery = listBusinessesQuerySchema.parse({ locale, pageSize: 100 });
    const { items: businesses } = await businessService.listPublished(businessQuery);

    for (const business of businesses) {
      if (business.status === "ARCHIVED") continue;
      businessEntries.push({
        url: `${siteUrl}/${locale}/businesses/${business.slug}`,
        lastModified: business.updatedAt,
        changeFrequency: "monthly",
        priority: 0.8,
      });
    }

    // Product entries — all public ACTIVE products
    const { products } = await listPublicProducts(locale, 1, 100);

    for (const product of products) {
      productEntries.push({
        url: `${siteUrl}/${locale}/products/${product.slug}`,
        lastModified: new Date(), // Products don't have updatedAt in the DTO
        changeFrequency: "monthly",
        priority: 0.75,
      });
    }

    const blogQuery = listBlogPostsQuerySchema.parse({ locale, pageSize: 100 });
    const { items: posts } = await contentService.listPublished(blogQuery);

    for (const post of posts) {
      blogEntries.push({
        url: `${siteUrl}/${locale}/blog/${post.slug}`,
        lastModified: post.updatedAt,
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  }

  return [...staticEntries, ...businessEntries, ...productEntries, ...blogEntries];
}
