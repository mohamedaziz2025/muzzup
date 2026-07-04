import { create } from "zustand";
import type { UserPublic } from "@muzzap/shared";

interface AuthState {
  user: UserPublic | null;
  accessToken: string | null;
  isHydrated: boolean;
  setSession: (session: { user: UserPublic; accessToken: string }) => void;
  clearSession: () => void;
  setHydrated: () => void;
}

/**
 * Access token lives in memory only (never localStorage) to limit XSS blast radius; the refresh
 * token is an httpOnly cookie the browser sends automatically. On load, api-client silently
 * calls /auth/refresh once to restore the session before isHydrated flips true.
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isHydrated: false,
  setSession: ({ user, accessToken }) => set({ user, accessToken }),
  clearSession: () => set({ user: null, accessToken: null }),
  setHydrated: () => set({ isHydrated: true }),
}));
