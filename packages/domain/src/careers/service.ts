/**
 * Career Service — Job Recruitment & Applications
 *
 * Operations:
 * - Post job openings
 * - List available jobs
 * - Accept applications
 * - Track application status
 */

import { prisma } from "@arqudrix/db";
import {
  careerAdminInputSchema,
  careerPublicSchema,
  careerApplicationInputSchema,
  careerApplicationPublicSchema,
  careerListResponseSchema,
  applicationListResponseSchema,
  type CareerAdminInput,
  type CareerApplicationInput,
} from "./dto";

/**
 * List all ACTIVE job openings (public)
 */
export async function listActiveJobs(
  page: number = 1,
  pageSize: number = 10,
  department?: string,
  level?: string
): Promise<typeof careerListResponseSchema._type> {
  const skip = (page - 1) * pageSize;

  const where: Parameters<typeof prisma.career.findMany>[0]["where"] = {
    isActive: true,
    ...(department && { department }),
    ...(level && { level }),
  };

  const [careers, total] = await Promise.all([
    prisma.career.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.career.count({ where }),
  ]);

  const validated = careerListResponseSchema.parse({
    careers: careers.map((c) => careerPublicSchema.parse(c)),
    total,
    page,
    pageSize,
  });

  return validated;
}

/**
 * Get single job posting by slug (public)
 */
export async function getJobBySlug(slug: string) {
  const career = await prisma.career.findUnique({
    where: { slug },
  });

  if (!career || !career.isActive) {
    return null;
  }

  return careerPublicSchema.parse(career);
}

/**
 * Submit job application (public)
 */
export async function submitJobApplication(
  input: unknown
): Promise<typeof careerApplicationPublicSchema._type> {
  const validated = careerApplicationInputSchema.parse(input);

  // Verify job exists and is active
  const career = await prisma.career.findUniqueOrThrow({
    where: { id: validated.careerId },
  });

  if (!career.isActive) {
    throw new Error("This job posting is no longer active");
  }

  const application = await prisma.careerApplication.create({
    data: {
      careerId: validated.careerId,
      fullName: validated.fullName,
      email: validated.email,
      phone: validated.phone,
      resume: validated.resume,
      coverLetter: validated.coverLetter,
      currentPosition: validated.currentPosition,
      experience: validated.experience,
      status: "SUBMITTED",
    },
  });

  return careerApplicationPublicSchema.parse(application);
}

/**
 * Get applications for a job (admin)
 */
export async function getJobApplications(
  careerId: string,
  page: number = 1,
  pageSize: number = 20,
  status?: string
): Promise<typeof applicationListResponseSchema._type> {
  const skip = (page - 1) * pageSize;

  const where: Parameters<typeof prisma.careerApplication.findMany>[0]["where"] =
    {
      careerId,
      ...(status && { status }),
    };

  const [applications, total] = await Promise.all([
    prisma.careerApplication.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.careerApplication.count({ where }),
  ]);

  return applicationListResponseSchema.parse({
    applications: applications.map((a) => careerApplicationPublicSchema.parse(a)),
    total,
    page,
    pageSize,
  });
}

/**
 * Update application status (admin)
 */
export async function updateApplicationStatus(
  applicationId: string,
  newStatus: string
) {
  const application = await prisma.careerApplication.update({
    where: { id: applicationId },
    data: { status: newStatus as any },
  });

  return careerApplicationPublicSchema.parse(application);
}

/**
 * Create job posting (admin)
 */
export async function createJobPosting(
  input: unknown,
  createdById: string
) {
  const validated = careerAdminInputSchema.parse(input);

  const career = await prisma.career.create({
    data: {
      ...validated,
      createdById,
    },
  });

  return careerPublicSchema.parse(career);
}

/**
 * Update job posting (admin)
 */
export async function updateJobPosting(id: string, input: unknown) {
  const validated = careerAdminInputSchema.parse(input);

  const career = await prisma.career.update({
    where: { id },
    data: validated,
  });

  return careerPublicSchema.parse(career);
}

/**
 * Close job posting (admin)
 */
export async function closeJobPosting(id: string) {
  const career = await prisma.career.update({
    where: { id },
    data: { isActive: false },
  });

  return careerPublicSchema.parse(career);
}
