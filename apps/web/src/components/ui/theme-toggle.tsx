"use client";

import { useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { useThemeStore } from "@/stores/theme-store";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, hydrate, toggleTheme } = useThemeStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Activer le thème clair" : "Activer le thème sombre"}
      aria-pressed={isDark}
      className={cn(
        "flex size-9 items-center justify-center rounded-full text-secondary transition-colors hover:bg-elevated hover:text-primary",
        className,
      )}
    >
      {isDark ? <Sun className="size-[18px]" strokeWidth={1.7} /> : <Moon className="size-[18px]" strokeWidth={1.7} />}
    </button>
  );
}
