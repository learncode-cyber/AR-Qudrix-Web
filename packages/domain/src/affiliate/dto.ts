/**
 * Affiliate Program Domain — DTOs & Schemas
 *
 * Handles:
 * - Affiliate signup and management
 * - Commission tracking (product sales + client referrals)
 * - 10% commission system
 */

import { z } from "zod";

// =============================================================================
// ENUMS
// =============================================================================

export const CommissionTypeEnum = z.enum(["PRODUCT_SALE", "CLIENT_REFERRAL"]);

export type CommissionType = z.infer<typeof CommissionTypeEnum>;

export const CommissionStatusEnum = z.enum([
  "PENDING",
  "APPROVED",
  "REJECTED",
  "PAID",
]);

export type CommissionStatus = z.infer<typeof CommissionStatusEnum>;

// =============================================================================
// AFFILIATE SIGNUP (PUBLIC)
// =============================================================================

export const affiliateSignupSchema = z.object({
  email: z.string().email().toLowerCase(),
  fullName: z.string().min(2).max(100),
  company: z.string().max(100).nullable(),
  website: z.string().url().nullable(),
  phone: z.string().min(10).max(20).nullable(),
  bio: z.string().max(500).nullable(),
  bankAccount: z.string().max(100).nullable(), // Payment এর জন্য
  paymentMethod: z.enum(["BANK_TRANSFER", "PAYPAL", "STRIPE"]).nullable(),
});

export type AffiliateSignup = z.infer<typeof affiliateSignupSchema>;

// =============================================================================
// AFFILIATE (PUBLIC)
// =============================================================================

export const affiliatePublicSchema = z.object({
  id: z.string().cuid(),
  slug: z.string(),
  email: z.string().email(),
  fullName: z.string(),
  company: z.string().nullable(),
  website: z.string().url().nullable(),
  bio: z.string().nullable(),
  referralCode: z.string(), // Unique tracking code
  status: z.string(), // ACTIVE, SUSPENDED, INACTIVE
  commissionRate: z.number().positive(), // Default: 10%
});

export type AffiliatePublic = z.infer<typeof affiliatePublicSchema>;

// =============================================================================
// AFFILIATE COMMISSION
// =============================================================================

export const affiliateCommissionSchema = z.object({
  id: z.string().cuid(),
  affiliateId: z.string().cuid(),
  type: CommissionTypeEnum, // PRODUCT_SALE or CLIENT_REFERRAL
  referenceId: z.string(), // Product ID or Client ID
  referenceName: z.string(), // Product name or Client name
  amount: z.number().positive(), // Commission amount in currency
  status: CommissionStatusEnum,
  proofUrl: z.string().url().nullable(), // Invoice/screenshot proof
  notes: z.string().nullable(),
  paidAt: z.date().nullable(),
  createdAt: z.date(),
});

export type AffiliateCommission = z.infer<typeof affiliateCommissionSchema>;

// =============================================================================
// COMMISSION REPORT (AFFILIATE DASHBOARD)
// =============================================================================

export const affiliateReportSchema = z.object({
  affiliate: affiliatePublicSchema,
  totalEarnings: z.number(),
  pendingEarnings: z.number(),
  paidEarnings: z.number(),
  commissions: z.array(affiliateCommissionSchema),
  totalCommissions: z.number(),
});

export type AffiliateReport = z.infer<typeof affiliateReportSchema>;

// =============================================================================
// REFERRAL TRACKING
// =============================================================================

export const referralTrackingSchema = z.object({
  referralCode: z.string(), // From URL: ?ref=ABC123
  userId: z.string().cuid().nullable(), // Who clicked the link
  productId: z.string().cuid().nullable(), // What they viewed
  clientId: z.string().cuid().nullable(), // Client they inquired about
  source: z.string(), // Where they came from
  timestamp: z.date(),
  converted: z.boolean().default(false), // Did they make a purchase?
});

export type ReferralTracking = z.infer<typeof referralTrackingSchema>;

// =============================================================================
// COMMISSION CLAIM (AFFILIATE SUBMITS PROOF)
// =============================================================================

export const commissionClaimSchema = z.object({
  affiliateId: z.string().cuid(),
  type: CommissionTypeEnum,
  referenceId: z.string(), // Product or Client being referred
  amount: z.number().positive(), // Sale/subscription amount
  proofUrl: z.string().url(), // Invoice or proof of sale
  notes: z.string().max(500).optional(),
});

export type CommissionClaim = z.infer<typeof commissionClaimSchema>;

// =============================================================================
// LISTS
// =============================================================================

export const affiliateListResponseSchema = z.object({
  affiliates: z.array(affiliatePublicSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
});

export type AffiliateListResponse = z.infer<typeof affiliateListResponseSchema>;

export const commissionListResponseSchema = z.object({
  commissions: z.array(affiliateCommissionSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
  totalAmount: z.number(),
});

export type CommissionListResponse = z.infer<typeof commissionListResponseSchema>;
