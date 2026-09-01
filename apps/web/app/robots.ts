import type { MetadataRoute } from "next";
import { IS_USING_DEFAULT_ADMIN_PATH } from "@/lib/admin-path";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://arqudrix.com";

  // Deliberately does NOT list the custom admin path here when one is
  // configured — robots.txt is public, so adding a disallow rule for a
  // secret path would announce its existence to anyone (bot or human) who
  // simply reads this file, defeating the entire point of hiding it. When
  // no custom path is set (the panel really is at the guessable "/admin"),
  // there's nothing to lose by disallowing it as usual.
  const disallow = IS_USING_DEFAULT_ADMIN_PATH ? ["/api/", "/admin/"] : ["/api/"];

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow,
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
