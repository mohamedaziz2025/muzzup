import { cn } from "@/lib/utils";

/**
 * Generative background trellis of 8-point (khatam) stars — a restrained, non-literal nod to
 * Islamic geometric motifs. Kept at 3–5% opacity: felt as depth, not read as decoration.
 */
export function GeometricPattern({ className }: { className?: string }) {
  return (
    <svg
      className={cn("pointer-events-none absolute inset-0 h-full w-full opacity-[0.04]", className)}
      aria-hidden="true"
    >
      <defs>
        <pattern id="khatam" width="80" height="80" patternUnits="userSpaceOnUse">
          <g stroke="var(--accent-cyan)" strokeWidth="1" fill="none">
            <path d="M40 4 L52 16 L68 16 L68 32 L76 40 L68 48 L68 64 L52 64 L40 76 L28 64 L12 64 L12 48 L4 40 L12 32 L12 16 L28 16 Z" />
            <path d="M40 4 L40 76 M4 40 L76 40 M12 16 L68 64 M68 16 L12 64" opacity="0.5" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#khatam)" />
    </svg>
  );
}
