import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";

export interface ServiceProvider {
  _id: string;
  userId: string;
  tagline: string;
  bio: string;
  specialties: string[];
  pricingIndication: string;
  portfolio: { title: string; url?: string; description?: string }[];
  ratingAverage: number;
  ratingCount: number;
  isSponsored: boolean;
}

export interface Review {
  _id: string;
  authorId: string;
  rating: number;
  comment: string;
  missionContext: string;
  createdAt: string;
}

export function useProviderSearch(q: string, specialty: string) {
  return useQuery({
    queryKey: ["providers", "search", q, specialty],
    queryFn: () => {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (specialty) params.set("specialty", specialty);
      return apiFetch<{ providers: ServiceProvider[] }>(`/providers?${params.toString()}`);
    },
  });
}

export function useProvider(id: string) {
  return useQuery({
    queryKey: ["providers", id],
    queryFn: () => apiFetch<{ provider: ServiceProvider }>(`/providers/${id}`),
    enabled: !!id,
  });
}

export function useProviderReviews(id: string) {
  return useQuery({
    queryKey: ["providers", id, "reviews"],
    queryFn: () => apiFetch<{ reviews: Review[] }>(`/providers/${id}/reviews`),
    enabled: !!id,
  });
}

export function useCreateReview(providerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { rating: number; comment: string; missionContext?: string }) =>
      apiFetch(`/providers/${providerId}/reviews`, { method: "POST", body: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["providers", providerId] });
      queryClient.invalidateQueries({ queryKey: ["providers", providerId, "reviews"] });
    },
  });
}

export function useMyProviderProfile() {
  return useQuery({
    queryKey: ["providers", "me"],
    queryFn: () => apiFetch<{ provider: ServiceProvider | null }>("/providers/me"),
  });
}

export function useUpsertProviderProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      tagline: string;
      bio: string;
      specialties: string[];
      pricingIndication?: string;
      portfolio: { title: string; url?: string; description?: string }[];
    }) => apiFetch<{ provider: ServiceProvider }>("/providers/me", { method: "PUT", body: input }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["providers", "me"] }),
  });
}

export function useSponsorProvider(id: string) {
  return useMutation({
    mutationFn: () => apiFetch<{ url: string | null }>(`/providers/${id}/sponsor`, { method: "POST" }),
    onSuccess: (data) => {
      if (data.url) window.location.href = data.url;
    },
  });
}

export function useContactProvider() {
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/providers/${id}/contact`, { method: "POST" }),
  });
}
