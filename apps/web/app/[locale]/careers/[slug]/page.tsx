import { unstable_setRequestLocale } from "next-intl/server";
import { getJobBySlug } from "@arqudrix/domain";
import { notFound } from "next/navigation";
import { JobApplicationForm } from "./job-application-form";

interface JobDetailPageProps {
  params: {
    locale: "en" | "ar";
    slug: string;
  };
}

export async function generateMetadata({ params }: JobDetailPageProps) {
  const job = await getJobBySlug(params.slug);
  if (!job) return { title: "Job Not Found" };

  return {
    title: job.title,
    description: job.description.substring(0, 160),
  };
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  unstable_setRequestLocale(params.locale);

  const job = await getJobBySlug(params.slug);
  if (!job) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-950">
      <div className="mx-auto max-w-4xl px-4 py-12">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm text-gray-400">
          <a href={`/${params.locale}/careers`} className="hover:text-white">
            Careers
          </a>
          <span className="mx-2">/</span>
          <span className="text-white">{job.title}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Job Details */}
          <div className="lg:col-span-2">
            {/* Header */}
            <div className="mb-8">
              <h1 className="mb-4 text-4xl font-bold text-white">{job.title}</h1>
              <div className="flex flex-wrap gap-3">
                <span className="rounded bg-blue-600/20 px-3 py-1 text-sm font-semibold text-blue-400">
                  {job.jobType}
                </span>
                <span className="rounded bg-purple-600/20 px-3 py-1 text-sm font-semibold text-purple-400">
                  {job.level}
                </span>
                <span className="rounded bg-green-600/20 px-3 py-1 text-sm font-semibold text-green-400">
                  {job.location}
                </span>
              </div>
            </div>

            {/* Salary */}
            {(job.minSalary || job.maxSalary) && (
              <div className="mb-8 rounded-lg border border-gray-800 bg-gray-900/50 p-6">
                <p className="mb-2 text-sm text-gray-400">Salary Range</p>
                <p className="text-2xl font-bold text-white">
                  {job.minSalary && `$${job.minSalary.toLocaleString()}`}
                  {job.minSalary && job.maxSalary && " - "}
                  {job.maxSalary && `$${job.maxSalary.toLocaleString()}`}
                </p>
              </div>
            )}

            {/* Description */}
            <div className="mb-8">
              <h2 className="mb-4 text-xl font-bold text-white">About This Role</h2>
              <p className="whitespace-pre-wrap text-gray-300">{job.description}</p>
            </div>

            {/* Requirements */}
            <div className="mb-8">
              <h2 className="mb-4 text-xl font-bold text-white">Requirements</h2>
              <p className="whitespace-pre-wrap text-gray-300">{job.requirements}</p>
            </div>

            {/* Benefits */}
            {job.benefits && (
              <div className="mb-8">
                <h2 className="mb-4 text-xl font-bold text-white">Benefits</h2>
                <p className="whitespace-pre-wrap text-gray-300">{job.benefits}</p>
              </div>
            )}
          </div>

          {/* Application Form Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 rounded-lg border border-gray-800 bg-gray-900 p-8">
              <h3 className="mb-6 text-xl font-bold text-white">Apply Now</h3>
              <JobApplicationForm careerId={job.id} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
