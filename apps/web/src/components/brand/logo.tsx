import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

/** Text-only wordmark — no icon mark, "muzzup" set in Baloo 2. */
export function Logo({ className }: LogoProps) {
  return (
    <span className={cn("font-logo text-2xl font-bold tracking-wide text-primary", className)}>
      muzzup
    </span>
  );
}
