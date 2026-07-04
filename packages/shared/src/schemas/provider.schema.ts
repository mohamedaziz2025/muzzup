import { z } from "zod";

export const portfolioItemSchema = z.object({
  title: z.string().trim().min(1).max(140),
  url: z.string().url().optional(),
  description: z.string().trim().max(500).optional(),
});
export type PortfolioItem = z.infer<typeof portfolioItemSchema>;

export const upsertProviderProfileSchema = z.object({
  tagline: z.string().trim().min(10).max(140),
  bio: z.string().trim().min(30).max(2000),
  specialties: z.array(z.string().trim().min(2).max(60)).min(1).max(10),
  pricingIndication: z.string().trim().max(140).optional(),
  portfolio: z.array(portfolioItemSchema).max(20).default([]),
});
export type UpsertProviderProfileInput = z.infer<typeof upsertProviderProfileSchema>;

export const providerSearchQuerySchema = z.object({
  q: z.string().trim().max(200).optional(),
  specialty: z.string().trim().max(60).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
});
export type ProviderSearchQuery = z.infer<typeof providerSearchQuerySchema>;

export const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(10).max(1000),
  missionContext: z.string().trim().max(300).optional(),
});
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
