/**
 * Career Recruitment Domain — DTOs & Schemas
 *
 * Handles:
 * - Job postings (Career model)
 * - Job applications (CareerApplication model)
 * - Application status tracking
 */

import { z } from "zod";

// =============================================================================
// ENUMS
// =============================================================================

export const JobTypeEnum = z.enum([
  "FULL_TIME",
  "PART_TIME",
  "CONTRACT",
  "INTERNSHIP",
  "FREELANCE",
]);

export type JobType = z.infer<typeof JobTypeEnum>;

export const JobLevelEnum = z.enum(["ENTRY", "MID", "SENIOR", "LEAD", "MANAGER"]);

export type JobLevel = z.infer<typeof JobLevelEnum>;

export const ApplicationStatusEnum = z.enum([
  "SUBMITTED",
  "REVIEWING",
  "SHORTLISTED",
  "REJECTED",
  "ACCEPTED",
]);

export type ApplicationStatus = z.infer<typeof ApplicationStatusEnum>;

// =============================================================================
// CAREER (PUBLIC)
// =============================================================================

export const careerPublicSchema = z.object({
  id: z.string().cuid(),
  slug: z.string(),
  title: z.string(),
  department: z.string(),
  location: z.string(),
  jobType: JobTypeEnum,
  level: JobLevelEnum,
  minSalary: z.number().nullable(),
  maxSalary: z.number().nullable(),
  description: z.string(),
  requirements: z.string(),
  benefits: z.string().nullable(),
  isActive: z.boolean(),
});

export type CareerPublic = z.infer<typeof careerPublicSchema>;

// =============================================================================
// CAREER APPLICATION (USER INPUT)
// =============================================================================

export const careerApplicationInputSchema = z.object({
  careerId: z.string().cuid(),
  fullName: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().min(10).max(20),
  resume: z.string().min(100), // CV text or URL
  coverLetter: z.string().max(2000).optional(),
  currentPosition: z.string().max(100).optional(),
  experience: z.number().int().min(0).max(60).optional(),
});

export type CareerApplicationInput = z.infer<typeof careerApplicationInputSchema>;

export const careerApplicationPublicSchema = z.object({
  id: z.string().cuid(),
  careerId: z.string().cuid(),
  fullName: z.string(),
  email: z.string(),
  phone: z.string(),
  currentPosition: z.string().nullable(),
  experience: z.number().nullable(),
  status: ApplicationStatusEnum,
  createdAt: z.date(),
});

export type CareerApplicationPublic = z.infer<typeof careerApplicationPublicSchema>;

// =============================================================================
// CAREER (ADMIN)
// =============================================================================

export const careerAdminInputSchema = z.object({
  slug: z.string().toLowerCase().regex(/^[a-z0-9-]+$/),
  title: z.string().min(5).max(100),
  department: z.string().min(3).max(50),
  location: z.string().min(2).max(100),
  jobType: JobTypeEnum,
  level: JobLevelEnum,
  minSalary: z.number().positive().nullable(),
  maxSalary: z.number().positive().nullable(),
  description: z.string().min(50),
  requirements: z.string().min(50),
  benefits: z.string().max(1000).nullable(),
  isActive: z.boolean().default(true),
});

export type CareerAdminInput = z.infer<typeof careerAdminInputSchema>;

export const careerFullSchema = careerPublicSchema.extend({
  tenantId: z.string(),
  createdById: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type CareerFull = z.infer<typeof careerFullSchema>;

// =============================================================================
// LISTS
// =============================================================================

export const careerListResponseSchema = z.object({
  careers: z.array(careerPublicSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
});

export type CareerListResponse = z.infer<typeof careerListResponseSchema>;

export const applicationListResponseSchema = z.object({
  applications: z.array(careerApplicationPublicSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
});

export type ApplicationListResponse = z.infer<typeof applicationListResponseSchema>;
