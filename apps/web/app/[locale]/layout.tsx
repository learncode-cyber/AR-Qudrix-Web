import type { Metadata } from "next";
import "../globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { AnalyticsScripts } from "@/components/analytics-scripts";
import { CookieConsentBanner } from "@/components/cookie-consent-banner";
import { settingsService } from "@arqudrix/domain";

// Forces this route to render per-request instead of being statically
// generated at build time — the data (businesses, content, settings) is
// admin-editable and DB-backed, and the build environment (e.g. Hostinger's
// build step) should never be a hard dependency for a successful deploy.
export const dynamic = "force-dynamic";

const SUPPORTED_LOCALES = ["en", "ar"] as const;
type Locale = (typeof SUPPORTED_LOCALES)[number];

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isArabic = locale === "ar";

  return {
    title: {
      default: isArabic ? "أيه آر قدريكس" : "AR Qudrix",
      template: isArabic ? "%s · أيه آر قدريكس" : "%s · AR Qudrix",
    },
    description: isArabic
      ? "أيه آر قدريكس — مجموعة تقنية وأعمال عالمية."
      : "AR Qudrix — a global technology and business group.",
    alternates: {
      languages: { en: "/en", ar: "/ar" },
    },
  };
}

const ORGANIZATION_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "AR Qudrix",
  url: "https://arqudrix.com",
  sameAs: [] as string[],
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const dir = locale === "ar" ? "rtl" : "ltr";
  const analyticsSettings = await settingsService.getPublicSettings();

  return (
    <html lang={locale} dir={dir}>
      <body className="min-h-screen bg-white text-slate-900 antialiased">
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_JSON_LD) }}
        />
        <Navbar locale={locale} />
        {children}
        <Footer locale={locale} />
        <AnalyticsScripts settings={analyticsSettings} />
        <CookieConsentBanner locale={locale} />
      </body>
    </html>
  );
}
