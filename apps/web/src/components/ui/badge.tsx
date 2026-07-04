import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
  {
    variants: {
      variant: {
        neutral: "bg-elevated text-secondary",
        royal: "bg-royal/15 text-royal border border-royal/30",
        cyan: "bg-cyan/15 text-cyan border border-cyan/30",
        success: "bg-success/15 text-success border border-success/30",
        warning: "bg-warning/15 text-warning border border-warning/30",
        danger: "bg-danger/15 text-danger border border-danger/30",
      },
    },
    defaultVariants: { variant: "neutral" },
  },
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

/**
 * The single gold element in the interface. Reserved exclusively for the human-verified
 * halal audit outcome — it must feel earned, so the shimmer plays once on mount, never loops.
 */
export function ShariaVerifiedBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "glow-gold relative inline-flex items-center gap-1.5 overflow-hidden rounded-full border border-gold/40 bg-gold/10 px-3 py-1.5 text-xs font-semibold text-gold",
        className,
      )}
    >
      <span className="shimmer-once pointer-events-none absolute inset-0" aria-hidden="true" />
      <svg viewBox="0 0 20 20" fill="currentColor" className="size-3.5" aria-hidden="true">
        <path
          fillRule="evenodd"
          d="M10 1.5l2.163 4.382 4.837.703-3.5 3.412.826 4.816L10 12.6l-4.326 2.213.826-4.816-3.5-3.412 4.837-.703L10 1.5z"
          clipRule="evenodd"
        />
      </svg>
      Sharia Vérifié
    </span>
  );
}
