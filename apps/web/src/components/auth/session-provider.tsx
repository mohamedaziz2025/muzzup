"use client";

import { useEffect } from "react";
import { refreshSession } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";

/** Silently restores the session from the httpOnly refresh cookie on first paint. */
export function SessionProvider({ children }: { children: React.ReactNode }) {
  const setHydrated = useAuthStore((s) => s.setHydrated);

  useEffect(() => {
    refreshSession().finally(() => setHydrated());
  }, [setHydrated]);

  return children;
}
