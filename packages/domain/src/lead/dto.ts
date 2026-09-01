import { z } from "zod";

export const createLeadSchema = z.object({
  fullName: z.string().min(2, "Please enter your full name").max(120),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().max(30).optional(),
  company: z.string().max(120).optional(),
  message: z.string().min(10, "Message must be at least 10 characters").max(5000),
  businessId: z.string().cuid().optional(),
  locale: z.enum(["en", "ar"]).default("en"),
  // Google Click ID — captured client-side from ?gclid= on landing (see
  // apps/web/lib/analytics/gclid.ts), required for server-side Google Ads
  // conversion upload. Absent for non-Google-Ads traffic, which is normal.
  gclid: z.string().max(200).optional().nullable(),
  // Honeypot field — real users never fill this; bots frequently do.
  website: z.string().max(0, "Spam detected").optional(),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;
