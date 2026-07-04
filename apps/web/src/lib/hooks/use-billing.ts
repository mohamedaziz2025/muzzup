import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";

export function useCreateCheckoutSession() {
  return useMutation({
    mutationFn: () => apiFetch<{ url: string | null }>("/billing/checkout-session", { method: "POST" }),
    onSuccess: (data) => {
      if (data.url) window.location.href = data.url;
    },
  });
}

export function useCreatePortalSession() {
  return useMutation({
    mutationFn: () => apiFetch<{ url: string | null }>("/billing/portal-session", { method: "POST" }),
    onSuccess: (data) => {
      if (data.url) window.location.href = data.url;
    },
  });
}
