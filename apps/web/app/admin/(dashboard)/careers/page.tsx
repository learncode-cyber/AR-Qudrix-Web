import { getServerSession } from "@/lib/auth-server";
import { assertPermission } from "@arqudrix/auth";

export const metadata = {
  title: "Careers Management",
  description: "Manage job postings and applications",
};

export default async function AdminCareersPage() {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return <div className="text-red-400">Unauthorized</div>;
  }

  // TODO: Verify user has admin access
  // For now, this is a placeholder

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Careers Management</h1>
          <p className="mt-2 text-gray-400">Manage job postings, applications, and track candidates</p>
        </div>

        {/* TODO: Implement careers admin features */}
        <div className="rounded-lg border border-gray-800 bg-gray-900 p-8 text-center">
          <p className="text-gray-400">
            Careers admin panel coming soon...
          </p>
        </div>
      </div>
    </div>
  );
}
