import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";

interface AuditPosition {
  status: "queued" | "in_progress";
  position: number;
  estimatedDays: number;
}

export function useAuditStatus(listingId: string, enabled: boolean) {
  return useQuery({
    queryKey: ["listings", listingId, "audit-status"],
    queryFn: () =>
      apiFetch<{ position: AuditPosition | null }>(`/listings/${listingId}/audit-status`),
    enabled,
  });
}
