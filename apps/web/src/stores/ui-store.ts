import { create } from "zustand";

interface UiState {
  isMobileNavOpen: boolean;
  openMobileNav: () => void;
  closeMobileNav: () => void;
  consent: { analytics: boolean; ads: boolean } | null;
  setConsent: (consent: { analytics: boolean; ads: boolean }) => void;
}

/** Light client-side UI state (nav, RGPD consent banner). Server state stays in TanStack Query. */
export const useUiStore = create<UiState>((set) => ({
  isMobileNavOpen: false,
  openMobileNav: () => set({ isMobileNavOpen: true }),
  closeMobileNav: () => set({ isMobileNavOpen: false }),
  consent: null,
  setConsent: (consent) => set({ consent }),
}));
