import { getServerSession } from "@/lib/auth-server";

export const metadata = {
  title: "Affiliate Program",
  description: "Manage affiliate accounts and commissions",
};

export default async function AdminAffiliateProgram() {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return <div className="text-red-400">Unauthorized</div>;
  }

  // TODO: Verify user has admin access

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Affiliate Program</h1>
          <p className="mt-2 text-gray-400">
            Manage affiliates, track commissions, and process payouts (10% commission system)
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-4 mb-8">
          {/* Stats Cards */}
          <div className="rounded-lg border border-gray-800 bg-gray-900 p-6">
            <p className="text-sm text-gray-400">Total Affiliates</p>
            <p className="mt-2 text-3xl font-bold text-white">0</p>
          </div>

          <div className="rounded-lg border border-gray-800 bg-gray-900 p-6">
            <p className="text-sm text-gray-400">Pending Commissions</p>
            <p className="mt-2 text-3xl font-bold text-yellow-400">$0</p>
          </div>

          <div className="rounded-lg border border-gray-800 bg-gray-900 p-6">
            <p className="text-sm text-gray-400">Paid Out</p>
            <p className="mt-2 text-3xl font-bold text-green-400">$0</p>
          </div>

          <div className="rounded-lg border border-gray-800 bg-gray-900 p-6">
            <p className="text-sm text-gray-400">Commission Rate</p>
            <p className="mt-2 text-3xl font-bold text-blue-400">10%</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="space-y-6">
          {/* Affiliates List */}
          <div className="rounded-lg border border-gray-800 bg-gray-900">
            <div className="border-b border-gray-800 p-6">
              <h2 className="text-lg font-bold text-white">Affiliates</h2>
            </div>
            <div className="p-6 text-center text-gray-400">
              No affiliates yet. Share the /affiliate page to get started!
            </div>
          </div>

          {/* Commissions */}
          <div className="rounded-lg border border-gray-800 bg-gray-900">
            <div className="border-b border-gray-800 p-6">
              <h2 className="text-lg font-bold text-white">Commissions</h2>
            </div>
            <div className="p-6 text-center text-gray-400">
              No commissions to review yet.
            </div>
          </div>
        </div>

        {/* TODO: Implement affiliate admin features */}
        <div className="mt-8 rounded-lg bg-blue-900/20 p-4 text-blue-300">
          <p className="text-sm">
            ℹ️ Affiliate program management interface coming soon. Affiliates can already sign up at /affiliate!
          </p>
        </div>
      </div>
    </div>
  );
}
