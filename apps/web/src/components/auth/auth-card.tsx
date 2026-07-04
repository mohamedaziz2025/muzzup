import type { ReactNode } from "react";
import { GeometricPattern } from "@/components/ui/geometric-pattern";

export function AuthCard({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden px-6 py-16">
      <GeometricPattern />
      <div className="glass relative w-full max-w-md rounded-[var(--radius-md)] p-8">
        <h1 className="font-display text-2xl font-semibold text-primary">{title}</h1>
        {subtitle && <p className="mt-2 text-sm text-secondary">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
