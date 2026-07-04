import { useMutation } from "@tanstack/react-query";
import type { UpdateProfileInput, UserPublic } from "@muzzap/shared";
import { apiFetch } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";

export function useUpdateProfile() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation({
    mutationFn: (input: UpdateProfileInput) =>
      apiFetch<{ user: UserPublic }>("/users/me", { method: "PATCH", body: input }),
    onSuccess: (data) => {
      if (accessToken) setSession({ user: data.user, accessToken });
    },
  });
}
