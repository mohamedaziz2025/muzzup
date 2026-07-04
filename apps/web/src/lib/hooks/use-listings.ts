import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  ListingCard,
  ListingDetail,
  ListingSearchQuery,
  ListingDraftInput,
  ListingUpdateInput,
} from "@muzzap/shared";
import { apiFetch } from "@/lib/api-client";

function toQueryString(query: Partial<ListingSearchQuery>): string {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== "") params.set(key, String(value));
  });
  return params.toString();
}

export function useListingsSearch(query: Partial<ListingSearchQuery>) {
  return useQuery({
    queryKey: ["listings", "search", query],
    queryFn: () =>
      apiFetch<{ listings: ListingCard[] }>(`/listings?${toQueryString(query)}`, {
        skipAuth: true,
      }),
  });
}

export function useListing(id: string) {
  return useQuery({
    queryKey: ["listings", id],
    queryFn: () => apiFetch<{ listing: ListingDetail }>(`/listings/${id}`, { skipAuth: true }),
    enabled: !!id,
  });
}

export function useMyListings() {
  return useQuery({
    queryKey: ["listings", "mine"],
    queryFn: () => apiFetch<{ listings: ListingDetail[] }>("/listings/mine"),
  });
}

export function useCreateListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ListingDraftInput) =>
      apiFetch<{ listing: ListingDetail }>("/listings", { method: "POST", body: input }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["listings", "mine"] }),
  });
}

export function useUpdateListing(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ListingUpdateInput) =>
      apiFetch<{ listing: ListingDetail }>(`/listings/${id}`, { method: "PATCH", body: input }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["listings", "mine"] }),
  });
}

export function useSubmitListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ listing: ListingDetail }>(`/listings/${id}/submit`, { method: "POST" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["listings", "mine"] }),
  });
}
