import { z } from "zod";
import { DEAL_PIPELINE_STAGES } from "../constants/listings.js";

export const declareProofOfFundsSchema = z.object({
  storageKey: z.string().min(1),
  amountDeclared: z.number().positive(),
});
export type DeclareProofOfFundsInput = z.infer<typeof declareProofOfFundsSchema>;

export const reviewProofOfFundsSchema = z.object({
  decision: z.enum(["approve", "reject"]),
  rejectionReason: z.string().trim().max(500).optional(),
});
export type ReviewProofOfFundsInput = z.infer<typeof reviewProofOfFundsSchema>;

export const createDealPipelineSchema = z.object({
  listingId: z.string().regex(/^[a-f\d]{24}$/i),
  buyerId: z.string().regex(/^[a-f\d]{24}$/i),
});
export type CreateDealPipelineInput = z.infer<typeof createDealPipelineSchema>;

export const advanceStageSchema = z.object({
  stage: z.enum(DEAL_PIPELINE_STAGES),
  notes: z.string().trim().max(1000).optional(),
});
export type AdvanceStageInput = z.infer<typeof advanceStageSchema>;

export const freezeDealSchema = z.object({
  reason: z.string().trim().min(5).max(1000),
});
export type FreezeDealInput = z.infer<typeof freezeDealSchema>;

export const raiseDisputeSchema = z.object({
  reason: z.string().trim().min(10).max(2000),
});
export type RaiseDisputeInput = z.infer<typeof raiseDisputeSchema>;

export const resolveDisputeSchema = z.object({
  decision: z.enum(["resolved", "dismissed"]),
  resolution: z.string().trim().min(5).max(2000),
});
export type ResolveDisputeInput = z.infer<typeof resolveDisputeSchema>;
