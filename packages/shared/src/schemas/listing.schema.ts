import { z } from "zod";
import { LISTING_TYPES, LISTING_STATUSES, ACQUISITION_CHANNELS } from "../constants/listings.js";

export const listingFinancialsSchema = z.object({
  monthlyRevenue: z.number().nonnegative(),
  monthlyProfit: z.number(),
  annualRevenue: z.number().nonnegative(),
  annualProfit: z.number(),
  askingPrice: z.number().positive(),
  valuationMultiple: z.number().positive().optional(),
});
export type ListingFinancials = z.infer<typeof listingFinancialsSchema>;

export const listingDraftSchema = z.object({
  type: z.enum(LISTING_TYPES),
  title: z.string().trim().min(10).max(140),
  summary: z.string().trim().min(50).max(1000),
  sector: z.string().trim().min(2).max(80),
  foundedAt: z.coerce.date(),
  acquisitionChannels: z.array(z.enum(ACQUISITION_CHANNELS)).min(1),
  financials: listingFinancialsSchema,
  halalSelfChecklist: z.record(z.string(), z.boolean()),
});
export type ListingDraftInput = z.infer<typeof listingDraftSchema>;

export const listingSearchQuerySchema = z.object({
  q: z.string().trim().max(140).optional(),
  type: z.enum(LISTING_TYPES).optional(),
  sector: z.string().trim().max(80).optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  minProfit: z.coerce.number().optional(),
  halalVerifiedOnly: z.coerce.boolean().optional(),
  sortBy: z.enum(["recent", "price_asc", "price_desc", "profit_desc"]).default("recent"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
});
export type ListingSearchQuery = z.infer<typeof listingSearchQuerySchema>;

export const listingUpdateSchema = listingDraftSchema.partial();
export type ListingUpdateInput = z.infer<typeof listingUpdateSchema>;

export const listingReviewSchema = z.object({
  decision: z.enum(["approve", "reject"]),
  rejectionReason: z.string().trim().max(500).optional(),
});
export type ListingReviewInput = z.infer<typeof listingReviewSchema>;

/** Public card shown in search results — financials are always masked in list views. */
export const listingCardSchema = z.object({
  id: z.string(),
  type: z.enum(LISTING_TYPES),
  title: z.string(),
  summary: z.string(),
  sector: z.string(),
  askingPriceRange: z.string(),
  halalVerified: z.boolean(),
  isFeatured: z.boolean(),
  publishedAt: z.coerce.date().nullable(),
});
export type ListingCard = z.infer<typeof listingCardSchema>;

/** Full detail view: financials are only present when the requester is entitled to see them. */
export const listingDetailSchema = z.object({
  id: z.string(),
  sellerId: z.string(),
  type: z.enum(LISTING_TYPES),
  status: z.enum(LISTING_STATUSES),
  title: z.string(),
  summary: z.string(),
  sector: z.string(),
  foundedAt: z.coerce.date(),
  acquisitionChannels: z.array(z.enum(ACQUISITION_CHANNELS)),
  halalVerified: z.boolean(),
  isFeatured: z.boolean(),
  financialsLocked: z.boolean(),
  financials: listingFinancialsSchema.nullable(),
  viewsCount: z.number(),
  publishedAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
});
export type ListingDetail = z.infer<typeof listingDetailSchema>;
