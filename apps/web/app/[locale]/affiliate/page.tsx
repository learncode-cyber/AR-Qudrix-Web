import { unstable_setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl";
import { AffiliateSignupForm } from "./affiliate-signup-form";

interface AffiliatePageProps {
  params: {
    locale: "en" | "ar";
  };
}

export async function generateMetadata({ params }: AffiliatePageProps) {
  const t = await getTranslations({ locale: params.locale, namespace: "affiliate" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function AffiliateProgramPage({ params }: AffiliatePageProps) {
  unstable_setRequestLocale(params.locale);
  const t = await getTranslations({ locale: params.locale, namespace: "affiliate" });

  return (
    <main className="min-h-screen bg-gray-950">
      <div className="mx-auto max-w-6xl px-4 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-white">{t("title")}</h1>
          <p className="mt-4 text-xl text-gray-300">{t("description")}</p>
        </div>

        <div className="grid gap-12 lg:grid-cols-2">
          {/* Benefits */}
          <div>
            <h2 className="mb-6 text-2xl font-bold text-white">Why Join?</h2>

            <div className="space-y-4">
              <div className="rounded-lg border border-gray-800 bg-gray-900 p-6">
                <h3 className="mb-2 font-bold text-white">💰 Earn 10% Commission</h3>
                <p className="text-gray-400">
                  Get 10% commission on every product sale or client referral
                </p>
              </div>

              <div className="rounded-lg border border-gray-800 bg-gray-900 p-6">
                <h3 className="mb-2 font-bold text-white">🔗 Unique Referral Code</h3>
                <p className="text-gray-400">
                  Share your unique code and track all your referrals in real-time
                </p>
              </div>

              <div className="rounded-lg border border-gray-800 bg-gray-900 p-6">
                <h3 className="mb-2 font-bold text-white">📊 Dashboard</h3>
                <p className="text-gray-400">
                  View earnings, pending commissions, and detailed reports
                </p>
              </div>

              <div className="rounded-lg border border-gray-800 bg-gray-900 p-6">
                <h3 className="mb-2 font-bold text-white">💳 Multiple Payment Options</h3>
                <p className="text-gray-400">
                  Bank transfer, PayPal, or Stripe - choose your preferred method
                </p>
              </div>

              <div className="rounded-lg border border-gray-800 bg-gray-900 p-6">
                <h3 className="mb-2 font-bold text-white">🏆 No Limits</h3>
                <p className="text-gray-400">
                  No caps on earnings - the more you refer, the more you earn
                </p>
              </div>

              <div className="rounded-lg border border-gray-800 bg-gray-900 p-6">
                <h3 className="mb-2 font-bold text-white">📞 Dedicated Support</h3>
                <p className="text-gray-400">
                  Get help from our affiliate team whenever you need it
                </p>
              </div>
            </div>
          </div>

          {/* Signup Form */}
          <div>
            <div className="rounded-lg border border-gray-800 bg-gray-900 p-8">
              <h2 className="mb-6 text-2xl font-bold text-white">Join Now - 10% Commission</h2>
              <AffiliateSignupForm />
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-16">
          <h2 className="mb-8 text-center text-2xl font-bold text-white">How It Works</h2>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-xl font-bold text-white">
                1
              </div>
              <h3 className="mb-2 font-bold text-white">Sign Up</h3>
              <p className="text-gray-400">
                Fill the form and join our affiliate program - it's free!
              </p>
            </div>

            <div className="text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-xl font-bold text-white">
                2
              </div>
              <h3 className="mb-2 font-bold text-white">Get Your Code</h3>
              <p className="text-gray-400">
                Receive your unique referral code to share with others
              </p>
            </div>

            <div className="text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-xl font-bold text-white">
                3
              </div>
              <h3 className="mb-2 font-bold text-white">Earn Commissions</h3>
              <p className="text-gray-400">
                Get 10% on every sale/referral from your code
              </p>
            </div>
          </div>
        </div>

        {/* Commission Examples */}
        <div className="mt-16">
          <h2 className="mb-8 text-center text-2xl font-bold text-white">Commission Examples</h2>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-lg border border-gray-800 bg-gray-900 p-6">
              <h3 className="mb-2 text-lg font-bold text-white">Product Sale</h3>
              <p className="text-sm text-gray-400 mb-4">
                ARQ OS Enterprise ($99/mo subscription)
              </p>
              <div className="rounded bg-blue-600/20 p-3">
                <p className="text-xs text-gray-400">Sale Amount</p>
                <p className="text-xl font-bold text-blue-400">$99</p>
                <p className="mt-2 text-xs text-gray-400">Your Commission (10%)</p>
                <p className="text-2xl font-bold text-green-400">$9.90</p>
              </div>
            </div>

            <div className="rounded-lg border border-gray-800 bg-gray-900 p-6">
              <h3 className="mb-2 text-lg font-bold text-white">Client Referral</h3>
              <p className="text-sm text-gray-400 mb-4">
                Software development project ($5,000)
              </p>
              <div className="rounded bg-blue-600/20 p-3">
                <p className="text-xs text-gray-400">Sale Amount</p>
                <p className="text-xl font-bold text-blue-400">$5,000</p>
                <p className="mt-2 text-xs text-gray-400">Your Commission (10%)</p>
                <p className="text-2xl font-bold text-green-400">$500</p>
              </div>
            </div>

            <div className="rounded-lg border border-gray-800 bg-gray-900 p-6">
              <h3 className="mb-2 text-lg font-bold text-white">Consulting Service</h3>
              <p className="text-sm text-gray-400 mb-4">
                3-month consulting engagement ($10,000)
              </p>
              <div className="rounded bg-blue-600/20 p-3">
                <p className="text-xs text-gray-400">Sale Amount</p>
                <p className="text-xl font-bold text-blue-400">$10,000</p>
                <p className="mt-2 text-xs text-gray-400">Your Commission (10%)</p>
                <p className="text-2xl font-bold text-green-400">$1,000</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
