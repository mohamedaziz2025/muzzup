import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ListingCard } from "@muzzap/shared";
import { apiFetch } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";

export function useFavoriteIds() {
  const user = useAuthStore((s) => s.user);
  return useQuery({
    queryKey: ["favorites", "ids"],
    queryFn: () => apiFetch<{ listingIds: string[] }>("/favorites/mine/ids"),
    enabled: !!user,
  });
}

export function useMyFavorites() {
  return useQuery({
    queryKey: ["favorites", "mine"],
    queryFn: () => apiFetch<{ listings: ListingCard[] }>("/favorites/mine"),
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (listingId: string) =>
      apiFetch<{ favorited: boolean }>(`/favorites/${listingId}/toggle`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });
}
