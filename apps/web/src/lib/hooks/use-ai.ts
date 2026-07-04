import { useMutation, useQuery } from "@tanstack/react-query";
import type { QuickEstimateInput, QuickEstimateResult } from "@muzzap/shared";
import { apiFetch } from "@/lib/api-client";

export function useQuickEstimate() {
  return useMutation({
    mutationFn: (input: QuickEstimateInput) =>
      apiFetch<QuickEstimateResult>("/estimate/quick", {
        method: "POST",
        body: input,
        skipAuth: true,
      }),
  });
}

export function useDeepEstimate() {
  return useMutation({
    mutationFn: (listingId: string) =>
      apiFetch<{
        analysisId: string;
        rangeLow: number;
        rangeHigh: number;
        justification: string;
        keyFactors: string[];
        confidenceNote: string;
      }>("/estimate/deep", { method: "POST", body: { listingId } }),
  });
}

interface AiAnalysis {
  _id: string;
  type: "deep_valuation" | "listing_coherence";
  output: Record<string, unknown>;
  humanVerdict: "confirmed" | "overridden" | null;
  createdAt: string;
}

export function useListingAiAnalyses(listingId: string, enabled: boolean) {
  return useQuery({
    queryKey: ["ai-analyses", listingId],
    queryFn: () => apiFetch<{ analyses: AiAnalysis[] }>(`/listings/${listingId}/ai-analyses`),
    enabled,
  });
}
