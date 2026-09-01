/**
 * Client-safe mirrors of the enums defined in prisma/schema.prisma.
 *
 * WHY THIS FILE EXISTS: Prisma's generated client (`@prisma/client`) bundles
 * Node.js-only engine-loading code in its module scope — even importing
 * just an enum from it pulls that in. Any "use client" component that
 * imports an enum as a VALUE (not `import type`) from the main `@arqudrix/db`
 * entry point will break the browser/edge bundle with errors like
 * `UnhandledSchemeError: Reading from "node:crypto" is not handled`.
 *
 * These are plain, side-effect-free objects with the exact same runtime
 * shape as the real Prisma enums, safe to import from anywhere — client
 * components, Zod schemas shared between client and server, etc.
 *
 * ⚠️ MAINTENANCE: if you add/rename/remove a value in an enum block in
 * prisma/schema.prisma, mirror the same change here. There is no automated
 * sync — this is a deliberate, explicit trade-off to keep the client
 * bundle completely free of Prisma's Node-only runtime.
 */

export const BusinessCategory = {
  ECOMMERCE: "ECOMMERCE",
  AGENCY: "AGENCY",
  AGRICULTURE: "AGRICULTURE",
  AI_TECHNOLOGY: "AI_TECHNOLOGY",
  ENTERPRISE_PLATFORM: "ENTERPRISE_PLATFORM",
  TRAVEL: "TRAVEL",
  REAL_ESTATE: "REAL_ESTATE",
  MEDIA: "MEDIA",
  OTHER: "OTHER",
} as const;
export type BusinessCategory = (typeof BusinessCategory)[keyof typeof BusinessCategory];

export const BusinessStatus = {
  ACTIVE: "ACTIVE",
  IN_DEVELOPMENT: "IN_DEVELOPMENT",
  PLANNED: "PLANNED",
  ARCHIVED: "ARCHIVED",
} as const;
export type BusinessStatus = (typeof BusinessStatus)[keyof typeof BusinessStatus];

export const ContentStatus = {
  DRAFT: "DRAFT",
  IN_REVIEW: "IN_REVIEW",
  PUBLISHED: "PUBLISHED",
  UNPUBLISHED: "UNPUBLISHED",
} as const;
export type ContentStatus = (typeof ContentStatus)[keyof typeof ContentStatus];

export const LeadStatus = {
  NEW: "NEW",
  CONTACTED: "CONTACTED",
  QUALIFIED: "QUALIFIED",
  CONVERTED: "CONVERTED",
  ARCHIVED: "ARCHIVED",
  SPAM: "SPAM",
} as const;
export type LeadStatus = (typeof LeadStatus)[keyof typeof LeadStatus];

export const InquiryType = {
  SUPPORT: "SUPPORT",
  PROJECT: "PROJECT",
  PARTNERSHIP: "PARTNERSHIP",
  GENERAL: "GENERAL",
} as const;
export type InquiryType = (typeof InquiryType)[keyof typeof InquiryType];

export const InquiryStatus = {
  OPEN: "OPEN",
  IN_PROGRESS: "IN_PROGRESS",
  RESOLVED: "RESOLVED",
  CLOSED: "CLOSED",
} as const;
export type InquiryStatus = (typeof InquiryStatus)[keyof typeof InquiryStatus];

export const UserRole = {
  PUBLIC_USER: "PUBLIC_USER",
  CUSTOMER: "CUSTOMER",
  CLIENT: "CLIENT",
  PARTNER: "PARTNER",
  SUPPLIER: "SUPPLIER",
  INVESTOR: "INVESTOR",
  EMPLOYEE: "EMPLOYEE",
  MANAGER: "MANAGER",
  ADMIN: "ADMIN",
  SUPER_ADMIN: "SUPER_ADMIN",
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const UserStatus = {
  PENDING_VERIFICATION: "PENDING_VERIFICATION",
  ACTIVE: "ACTIVE",
  SUSPENDED: "SUSPENDED",
  DEACTIVATED: "DEACTIVATED",
} as const;
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];
