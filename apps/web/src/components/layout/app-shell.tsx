"use client";

import type { ReactNode } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { BottomNav } from "./bottom-nav";

/** Reserves space for the mobile bottom nav only when it's actually rendered (authenticated members). */
export function AppShell({ children }: { children: ReactNode }) {
  const { user, isHydrated } = useAuthStore();
  const showBottomNav = isHydrated && !!user;

  return (
    <>
      <main className={`min-h-[calc(100vh-4rem)] ${showBottomNav ? "pb-20 md:pb-0" : ""}`}>{children}</main>
      {showBottomNav && <BottomNav />}
    </>
  );
}
