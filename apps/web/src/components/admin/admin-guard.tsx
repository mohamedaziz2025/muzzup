"use client";

import type { ReactNode } from "react";
import { useAuthStore } from "@/stores/auth-store";

/** Gate for every admin sub-page: mirrors the guard already used on /admin. */
export function AdminGuard({ children }: { children: ReactNode }) {
  const { user, isHydrated } = useAuthStore();

  if (!isHydrated) return null;

  if (!user?.roles.includes("admin")) {
    return <p className="mx-auto max-w-2xl px-6 py-16 text-secondary">Accès réservé aux administrateurs.</p>;
  }

  return <>{children}</>;
}
