import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { DealPipelineStage } from "@muzzap/shared";
import { apiFetch } from "@/lib/api-client";

export interface DealPipeline {
  _id: string;
  listingId: { _id: string; title: string; type: string } | string;
  buyerId: string;
  sellerId: string;
  stage: DealPipelineStage;
  status: "active" | "frozen" | "completed" | "cancelled";
  frozenReason: string | null;
  stageHistory: { stage: DealPipelineStage; enteredAt: string; notes: string }[];
  updatedAt: string;
}

export function useMyDeals() {
  return useQuery({
    queryKey: ["deal-pipelines", "mine"],
    queryFn: () => apiFetch<{ deals: DealPipeline[] }>("/deal-pipelines/mine"),
  });
}

export function useAllDeals(enabled: boolean) {
  return useQuery({
    queryKey: ["deal-pipelines", "all"],
    queryFn: () => apiFetch<{ deals: DealPipeline[] }>("/deal-pipelines/all"),
    enabled,
  });
}

export function useDeal(id: string) {
  return useQuery({
    queryKey: ["deal-pipelines", id],
    queryFn: () => apiFetch<{ deal: DealPipeline }>(`/deal-pipelines/${id}`),
    enabled: !!id,
  });
}

export function useAdvanceStage(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (stage: DealPipelineStage) =>
      apiFetch<{ deal: DealPipeline }>(`/deal-pipelines/${id}/advance`, {
        method: "POST",
        body: { stage },
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["deal-pipelines"] }),
  });
}

export function useRaiseDispute(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reason: string) =>
      apiFetch(`/deal-pipelines/${id}/disputes`, { method: "POST", body: { reason } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["deal-pipelines"] }),
  });
}
