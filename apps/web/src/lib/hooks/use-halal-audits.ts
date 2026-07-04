import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";

interface AuditItem {
  key: string;
  label: string;
  passed: boolean | null;
  note: string;
}

export interface HalalAudit {
  _id: string;
  listingId: { _id: string; title: string; type: string; sector: string } | string;
  status: "queued" | "in_progress" | "completed";
  items: AuditItem[];
  vigilancePoints: string[];
  reportSummary: string;
  createdAt: string;
}

export function useAuditQueue() {
  return useQuery({
    queryKey: ["halal-audits", "queue"],
    queryFn: () => apiFetch<{ audits: HalalAudit[] }>("/halal-audits/queue"),
  });
}

export function useMyAudits() {
  return useQuery({
    queryKey: ["halal-audits", "mine"],
    queryFn: () => apiFetch<{ audits: HalalAudit[] }>("/halal-audits/mine"),
  });
}

export function useClaimAudit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch<{ audit: HalalAudit }>(`/halal-audits/${id}/claim`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["halal-audits"] });
    },
  });
}

export function useUpdateAuditItems(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (items: { key: string; passed: boolean; note?: string }[]) =>
      apiFetch<{ audit: HalalAudit }>(`/halal-audits/${id}/items`, { method: "PATCH", body: { items } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["halal-audits"] }),
  });
}

export function useCompleteAudit(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { decision: "approved" | "rejected"; vigilancePoints: string[]; reportSummary: string }) =>
      apiFetch<{ audit: HalalAudit }>(`/halal-audits/${id}/complete`, { method: "POST", body: input }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["halal-audits"] }),
  });
}
