/**
 * Affiliate Program Service — Referral & Commission Management
 *
 * Operations:
 * - Sign up as affiliate (10% commission rate)
 * - Track commissions (product sales + client referrals)
 * - Generate referral codes
 * - Admin manage payouts
 */

import { prisma } from "@arqudrix/db";
import {
  affiliateSignupSchema,
  affiliatePublicSchema,
  affiliateCommissionSchema,
  affiliateReportSchema,
  commissionClaimSchema,
  affiliateListResponseSchema,
  commissionListResponseSchema,
  type AffiliateSignup,
  type AffiliateCommission,
} from "./dto";

/**
 * Generate unique referral code
 * Format: AFF-XXXXXX (6 random alphanumeric)
 */
function generateReferralCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "AFF-";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Sign up as affiliate (public)
 * Automatically gets 10% commission rate
 */
export async function signupAffiliate(
  input: unknown
): Promise<typeof affiliatePublicSchema._type> {
  const validated = affiliateSignupSchema.parse(input);

  // Check if email already exists
  const existing = await prisma.affiliate.findUnique({
    where: { email: validated.email },
  });

  if (existing) {
    throw new Error("This email is already registered as an affiliate");
  }

  // Generate unique referral code
  let referralCode = generateReferralCode();
  let attempts = 0;
  while (attempts < 10) {
    const codeExists = await prisma.affiliate.findUnique({
      where: { referralCode },
    });
    if (!codeExists) break;
    referralCode = generateReferralCode();
    attempts++;
  }

  // Create slug from email or name
  const slug =
    validated.fullName
      .toLowerCase()
      .replace(/\s+/g, "-")
      .substring(0, 30) +
    "-" +
    Math.random().toString(36).substring(7);

  const affiliate = await prisma.affiliate.create({
    data: {
      ...validated,
      slug,
      referralCode,
      commissionRate: 10.0, // ডিফল্ট ১০%
      status: "ACTIVE",
    },
  });

  return affiliatePublicSchema.parse(affiliate);
}

/**
 * Get affiliate by referral code
 * Used when tracking conversions
 */
export async function getAffiliateByCode(code: string) {
  const affiliate = await prisma.affiliate.findUnique({
    where: { referralCode: code },
  });

  if (!affiliate || affiliate.status !== "ACTIVE") {
    return null;
  }

  return affiliatePublicSchema.parse(affiliate);
}

/**
 * Claim commission (affiliate submits proof of sale)
 * Admin reviews and approves
 */
export async function claimCommission(
  input: unknown
): Promise<typeof affiliateCommissionSchema._type> {
  const validated = commissionClaimSchema.parse(input);

  // Get affiliate to verify commission rate
  const affiliate = await prisma.affiliate.findUniqueOrThrow({
    where: { id: validated.affiliateId },
  });

  if (affiliate.status !== "ACTIVE") {
    throw new Error("This affiliate account is not active");
  }

  // Calculate commission (default 10%)
  const commissionAmount = (validated.amount * affiliate.commissionRate) / 100;

  const commission = await prisma.affiliateCommission.create({
    data: {
      affiliateId: validated.affiliateId,
      type: validated.type,
      referenceId: validated.referenceId,
      referenceName: "Pending Review", // Admin fills this
      amount: commissionAmount,
      proofUrl: validated.proofUrl,
      notes: validated.notes,
      status: "PENDING",
    },
  });

  return affiliateCommissionSchema.parse(commission);
}

/**
 * Get affiliate dashboard/report (their own data)
 */
export async function getAffiliateReport(
  affiliateId: string
): Promise<typeof affiliateReportSchema._type> {
  const affiliate = await prisma.affiliate.findUniqueOrThrow({
    where: { id: affiliateId },
  });

  const commissions = await prisma.affiliateCommission.findMany({
    where: { affiliateId },
    orderBy: { createdAt: "desc" },
  });

  const totalEarnings = commissions
    .filter((c) => c.status === "PAID")
    .reduce((sum, c) => sum + c.amount, 0);

  const pendingEarnings = commissions
    .filter((c) => c.status === "PENDING" || c.status === "APPROVED")
    .reduce((sum, c) => sum + c.amount, 0);

  return affiliateReportSchema.parse({
    affiliate: affiliatePublicSchema.parse(affiliate),
    totalEarnings,
    pendingEarnings,
    paidEarnings: totalEarnings,
    commissions: commissions.map((c) => affiliateCommissionSchema.parse(c)),
    totalCommissions: commissions.length,
  });
}

/**
 * List all affiliates (admin)
 */
export async function listAffiliates(
  page: number = 1,
  pageSize: number = 20,
  status?: string
): Promise<typeof affiliateListResponseSchema._type> {
  const skip = (page - 1) * pageSize;

  const where: Parameters<typeof prisma.affiliate.findMany>[0]["where"] = {
    ...(status && { status }),
  };

  const [affiliates, total] = await Promise.all([
    prisma.affiliate.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.affiliate.count({ where }),
  ]);

  return affiliateListResponseSchema.parse({
    affiliates: affiliates.map((a) => affiliatePublicSchema.parse(a)),
    total,
    page,
    pageSize,
  });
}

/**
 * List commissions (admin) - with filtering
 */
export async function listCommissions(
  page: number = 1,
  pageSize: number = 20,
  affiliateId?: string,
  status?: string,
  type?: string
): Promise<typeof commissionListResponseSchema._type> {
  const skip = (page - 1) * pageSize;

  const where: Parameters<typeof prisma.affiliateCommission.findMany>[0]["where"] =
    {
      ...(affiliateId && { affiliateId }),
      ...(status && { status }),
      ...(type && { type }),
    };

  const [commissions, total] = await Promise.all([
    prisma.affiliateCommission.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.affiliateCommission.count({ where }),
  ]);

  const totalAmount = commissions.reduce((sum, c) => sum + c.amount, 0);

  return commissionListResponseSchema.parse({
    commissions: commissions.map((c) => affiliateCommissionSchema.parse(c)),
    total,
    page,
    pageSize,
    totalAmount,
  });
}

/**
 * Approve commission (admin)
 */
export async function approveCommission(
  commissionId: string,
  referenceName: string
) {
  const commission = await prisma.affiliateCommission.update({
    where: { id: commissionId },
    data: {
      status: "APPROVED",
      referenceName,
    },
  });

  return affiliateCommissionSchema.parse(commission);
}

/**
 * Reject commission (admin)
 */
export async function rejectCommission(
  commissionId: string,
  reason: string
) {
  const commission = await prisma.affiliateCommission.update({
    where: { id: commissionId },
    data: {
      status: "REJECTED",
      notes: reason,
    },
  });

  return affiliateCommissionSchema.parse(commission);
}

/**
 * Mark commission as paid (admin)
 */
export async function markCommissionAsPaid(commissionId: string) {
  const commission = await prisma.affiliateCommission.update({
    where: { id: commissionId },
    data: {
      status: "PAID",
      paidAt: new Date(),
    },
  });

  return affiliateCommissionSchema.parse(commission);
}

/**
 * Suspend affiliate account (admin)
 */
export async function suspendAffiliate(affiliateId: string) {
  const affiliate = await prisma.affiliate.update({
    where: { id: affiliateId },
    data: { status: "SUSPENDED" },
  });

  return affiliatePublicSchema.parse(affiliate);
}
