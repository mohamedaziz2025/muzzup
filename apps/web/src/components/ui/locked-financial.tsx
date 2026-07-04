import { Lock } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface LockedFinancialProps {
  label: string;
  previewValue: string;
  className?: string;
}

/**
 * Freemium teaser for P&L figures: shows a real-shaped (fake) value, blurred, so the layout
 * reads as data rather than a placeholder skeleton. Never use grey bars here — the blur has
 * to look like something worth unlocking.
 */
export function LockedFinancial({ label, previewValue, className }: LockedFinancialProps) {
  return (
    <div className={cn("glass rounded-[var(--radius-md)] p-5", className)}>
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <div className="relative mt-2 flex items-center gap-3">
        <span className="financial-blur font-mono text-2xl text-primary" aria-hidden="true">
          {previewValue}
        </span>
        <Lock className="size-5 shrink-0 text-gold" strokeWidth={1.5} aria-hidden="true" />
      </div>
      <Button variant="gold" size="sm" className="mt-4">
        Débloquer avec l&apos;abonnement
      </Button>
      <span className="sr-only">Valeur masquée, réservée aux abonnés</span>
    </div>
  );
}
