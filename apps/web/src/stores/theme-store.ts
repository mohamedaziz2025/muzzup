import { create } from "zustand";

export type Theme = "light" | "dark";

/** Must match the literal used by the blocking inline script in app/[locale]/layout.tsx. */
export const THEME_STORAGE_KEY = "muzzup-theme";

interface ThemeState {
  theme: Theme;
  /** Syncs the store with the theme the blocking inline script already applied to <html> on mount. */
  hydrate: () => void;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  window.localStorage.setItem(THEME_STORAGE_KEY, theme);
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: "light",
  hydrate: () => {
    const current = document.documentElement.dataset.theme;
    if (current === "dark" || current === "light") {
      set({ theme: current });
    }
  },
  setTheme: (theme) => {
    applyTheme(theme);
    set({ theme });
  },
  toggleTheme: () => {
    const next = get().theme === "light" ? "dark" : "light";
    applyTheme(next);
    set({ theme: next });
  },
}));
