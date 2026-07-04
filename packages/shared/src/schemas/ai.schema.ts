import { z } from "zod";
import { LISTING_TYPES } from "../constants/listings.js";

export const quickEstimateInputSchema = z.object({
  type: z.enum(LISTING_TYPES),
  annualRevenue: z.number().nonnegative(),
  annualProfit: z.number(),
  ageYears: z.number().min(0).max(50),
  email: z.string().trim().toLowerCase().email().optional(),
});
export type QuickEstimateInput = z.infer<typeof quickEstimateInputSchema>;

export const quickEstimateResultSchema = z.object({
  rangeLow: z.number(),
  rangeHigh: z.number(),
  multipleLow: z.number(),
  multipleHigh: z.number(),
});
export type QuickEstimateResult = z.infer<typeof quickEstimateResultSchema>;

/** Structured output the LLM must return for the deep (subscriber) valuation tool. */
export const deepValuationOutputSchema = z.object({
  rangeLow: z.number(),
  rangeHigh: z.number(),
  justification: z.string(),
  keyFactors: z.array(z.string()).max(8),
  confidenceNote: z.string(),
});
export type DeepValuationOutput = z.infer<typeof deepValuationOutputSchema>;

/** Structured output for the listing coherence pre-analysis surfaced to the halal auditor. */
export const listingCoherenceOutputSchema = z.object({
  coherenceScore: z.number().min(0).max(100),
  concerns: z.array(z.string()).max(10),
  summary: z.string(),
});
export type ListingCoherenceOutput = z.infer<typeof listingCoherenceOutputSchema>;

export const upsertValuationMultipleSchema = z.object({
  type: z.enum(LISTING_TYPES),
  profitMultipleLow: z.number().positive(),
  profitMultipleHigh: z.number().positive(),
});
export type UpsertValuationMultipleInput = z.infer<typeof upsertValuationMultipleSchema>;

export const humanVerdictSchema = z.object({
  verdict: z.enum(["confirmed", "overridden"]),
  note: z.string().trim().max(1000).optional(),
});
export type HumanVerdictInput = z.infer<typeof humanVerdictSchema>;

/**
 * Structured output for the pre-upload halal content check run on seller-submitted documents
 * and screenshots (PDF/CSV/Excel/images) in the `/vendre` flow — "clear"/"flagged" are stored
 * and kept for the human auditor, "rejected" blocks the upload outright.
 */
export const documentHalalCheckOutputSchema = z.object({
  verdict: z.enum(["clear", "flagged", "rejected"]),
  concerns: z.array(z.string()).max(10),
  summary: z.string(),
});
export type DocumentHalalCheckOutput = z.infer<typeof documentHalalCheckOutputSchema>;
