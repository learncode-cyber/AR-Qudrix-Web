import { z } from "zod";
import { InquiryType, InquiryStatus } from "@arqudrix/db/client-enums";

export const createInquirySchema = z.object({
  type: z.nativeEnum(InquiryType),
  subject: z.string().min(5, "Subject must be at least 5 characters").max(200),
  body: z.string().min(10, "Please provide more detail (at least 10 characters)").max(5000),
});

export const listInquiriesQuerySchema = z.object({
  status: z.nativeEnum(InquiryStatus).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
});

export type CreateInquiryInput = z.infer<typeof createInquirySchema>;
export type ListInquiriesQuery = z.infer<typeof listInquiriesQuerySchema>;
